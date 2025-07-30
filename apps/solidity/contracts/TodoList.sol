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

    // 事件
    event TodoCompleted(uint256 indexed todoId, string content);
    event CounterUpdated(uint256 newCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier notEmpty(string memory _content) {
        require(bytes(_content).length > 0, "Content cannot be empty");
        _;
    }

    // 构造函数 - 设置Counter合约地址并创建默认todo
    constructor(address _counterAddress) {
        owner = msg.sender;
        counterContract = ICounter(_counterAddress);
        
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
   
    // 增加一个Todo
    function addTodo(string memory _content) public {
        todos.push(_createTodo(_content));
    }

    // 完成指定的todo
    function completeTodo(uint256 _index) public {
        require(_index < todos.length, "Todo does not exist");
        require(!todos[_index].isCompleted, "Todo is already completed");
        
        todos[_index].isCompleted = true;
        emit TodoCompleted(todos[_index].id, todos[_index].content);
    }

    // 检查Counter计数并自动完成默认todo
    function checkAndCompleteDefaultTodo() public {
        uint256 currentCount = counterContract.getCount();
        
        // 如果计数增加了且默认todo还未完成
        if (currentCount > lastCheckedCount && !todos[defaultTodoIndex].isCompleted) {
            todos[defaultTodoIndex].isCompleted = true;
            emit TodoCompleted(todos[defaultTodoIndex].id, todos[defaultTodoIndex].content);
        }
        
        lastCheckedCount = currentCount;
        emit CounterUpdated(currentCount);
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
}