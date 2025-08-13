// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.28;

// 定义Counter合约接口
interface ICounter {
    function getCount() external view returns (uint256);
}

contract TodoList {
    struct Todo {
        uint256 id;
        string content;
        bool isCompleted;
    }
    
    Todo[] public todos;
    address public owner;
    ICounter public counterContract;  // Counter合约实例
    uint256 public defaultTodoIndex;  // 默认todo的索引
    uint256 public lastCheckedCount;  // 上次检查的计数值
    
    // 奖励相关变量
    uint256 public rewardAmount;      // 每个任务的奖励金额 (wei)
    uint256 public specialRewardAmount; // 特殊任务的奖励金额 (wei)
    mapping(address => uint256) public userRewards; // 用户累计奖励

    // 事件
    event TodoCompleted(uint256 indexed todoId, string content, address indexed completer, uint256 reward);
    event CounterUpdated(uint256 newCount);
    event RewardPaid(address indexed recipient, uint256 amount);
    event RewardAmountChanged(uint256 newAmount);
    event SpecialRewardAmountChanged(uint256 newAmount);
    event ContractFunded(address indexed funder, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier notEmpty(string memory _content) {
        require(bytes(_content).length > 0, "Content cannot be empty");
        _;
    }

    // 接收以太币充值
    receive() external payable {
        emit ContractFunded(msg.sender, msg.value);
    }

    // 构造函数 - 设置Counter合约地址、奖励金额并创建默认todo
    constructor(address _counterAddress, uint256 _rewardAmount) {
        owner = msg.sender;
        counterContract = ICounter(_counterAddress);
        rewardAmount = _rewardAmount;
        specialRewardAmount = _rewardAmount * 2; // 特殊任务奖励是普通任务的2倍
        
        // 创建默认todo
        Todo memory defaultTodo = Todo({
            id: block.timestamp,
            content: unicode"点击Counter增加计数以完成此任务",
            isCompleted: false
        });
        todos.push(defaultTodo);
        defaultTodoIndex = 0;  // 默认todo在索引0
        lastCheckedCount = counterContract.getCount();
    }
   
    // 私有辅助函数创建Todo
    function _createTodo(string memory _content) private view returns (Todo memory) {
        require(bytes(_content).length > 0, "Content cannot be empty");
        return Todo({
            id: block.timestamp,
            content: _content,
            isCompleted: false
        });
    }

    // 私有函数：发送奖励
    function _sendReward(address _recipient, uint256 _amount) private {
        require(address(this).balance >= _amount, "Insufficient contract balance for reward");
        require(_recipient != address(0), "Invalid recipient address");
        
        if (_amount > 0) {
            userRewards[_recipient] += _amount;
            (bool success, ) = payable(_recipient).call{value: _amount}("");
            require(success, "Reward transfer failed");
            emit RewardPaid(_recipient, _amount);
        }
    }
   
    // 增加一个Todo
    function addTodo(string memory _content) public {
        todos.push(_createTodo(_content));
    }

    // 完成指定的todo (带奖励)
    function completeTodo(uint256 _index) public {
        require(_index < todos.length, "Todo does not exist");
        require(!todos[_index].isCompleted, "Todo is already completed");
        
        todos[_index].isCompleted = true;
        
        // 发送奖励
        _sendReward(msg.sender, rewardAmount);
        
        emit TodoCompleted(todos[_index].id, todos[_index].content, msg.sender, rewardAmount);
    }

    // 检查Counter计数并自动完成默认todo (带特殊奖励)
    function shouldCompleteDefaultTodo() public view returns (bool) {
        uint256 currentCount = counterContract.getCount();
        return currentCount > lastCheckedCount && !todos[defaultTodoIndex].isCompleted;
    }
    
    function checkAndCompleteDefaultTodo() public {
        // 复用shouldCompleteDefaultTodo进行条件检查
        if (!shouldCompleteDefaultTodo()) {
            return;
        }
        
        uint256 currentCount = counterContract.getCount();
        todos[defaultTodoIndex].isCompleted = true;
        
        // 发送特殊奖励（比普通任务奖励更高）
        _sendReward(msg.sender, specialRewardAmount);
        
        emit TodoCompleted(todos[defaultTodoIndex].id, todos[defaultTodoIndex].content, msg.sender, specialRewardAmount);
        lastCheckedCount = currentCount;
        emit CounterUpdated(currentCount);
    }

    // 所有者设置普通任务奖励金额
    function setRewardAmount(uint256 _newAmount) external onlyOwner {
        rewardAmount = _newAmount;
        emit RewardAmountChanged(_newAmount);
    }

    // 所有者设置特殊任务奖励金额
    function setSpecialRewardAmount(uint256 _newAmount) external onlyOwner {
        specialRewardAmount = _newAmount;
        emit SpecialRewardAmountChanged(_newAmount);
    }

    // 所有者提取合约余额
    function withdrawFunds(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        require(_amount > 0, "Amount must be greater than 0");
        
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Withdrawal failed");
    }

    // 所有者提取所有余额
    function withdrawAllFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // 获取当前Counter计数
    function getCurrentCount() public view returns (uint256) {
        return counterContract.getCount();
    }

    // 获取Todo列表
    function getTodos() public view returns (Todo[] memory) {
        return todos;
    }

    // 获取默认todo状态
    function getDefaultTodoStatus() public view returns (bool) {
        return todos[defaultTodoIndex].isCompleted;
    }

    // 获取合约余额
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // 获取用户累计奖励
    function getUserTotalRewards(address _user) public view returns (uint256) {
        return userRewards[_user];
    }

    // 获取当前奖励设置
    function getRewardSettings() public view returns (uint256 normalReward, uint256 specialReward) {
        return (rewardAmount, specialRewardAmount);
    }

    // 预估完成任务可获得的奖励
    function estimateReward(uint256 _todoIndex) public view returns (uint256) {
        require(_todoIndex < todos.length, "Todo does not exist");
        require(!todos[_todoIndex].isCompleted, "Todo is already completed");
        
        if (_todoIndex == defaultTodoIndex) {
            return specialRewardAmount;
        } else {
            return rewardAmount;
        }
    }
}