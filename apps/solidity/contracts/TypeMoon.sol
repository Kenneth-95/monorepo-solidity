// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title TypeMoon - 类型月亮合约
 * @dev 一个全面展示Solidity所有数据类型、事件和功能的教学合约
 * @author 学习者
 */

// 引入接口示例
interface IExternalContract {
    function externalFunction() external view returns (uint256);
}

// 库的定义示例
library MathLibrary {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }
    
    function multiply(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }
}

// 抽象合约示例
abstract contract AbstractBase {
    function abstractFunction() public virtual view returns (string memory);
}

// 主合约 - 继承抽象合约
contract TypeMoon is AbstractBase {
    using MathLibrary for uint256;  // 使用库
    
    // ======================== 基本数据类型 ========================
    
    // 1. 布尔类型
    bool public booleanValue = true;
    bool public falseValue = false;
    
    // 2. 整数类型
    // 无符号整数 (uint8 到 uint256)
    uint8 public smallUint = 255;           // 最大值 2^8-1
    uint16 public mediumUint = 65535;       // 最大值 2^16-1
    uint32 public largeUint = 4294967295;   // 最大值 2^32-1
    uint256 public maxUint = type(uint256).max;  // 最大值
    uint public defaultUint = 42;           // uint 等同于 uint256
    
    // 有符号整数 (int8 到 int256)
    int8 public smallInt = -128;            // 范围 -128 到 127
    int16 public mediumInt = -32768;        // 范围 -32768 到 32767
    int256 public largeInt = -1000000;      // 大范围有符号整数
    int public defaultInt = -42;            // int 等同于 int256
    
    // 3. 地址类型
    address public ownerAddress;                    // 普通地址
    address payable public payableAddress;         // 可接收以太币的地址
    
    // 4. 字节类型
    bytes1 public singleByte = 0x41;               // 单字节 'A'
    bytes4 public fourBytes = 0x12345678;          // 4字节
    bytes32 public thirtyTwoBytes = keccak256("TypeMoon");  // 32字节哈希
    
    // 5. 字符串和动态字节
    string public greeting = unicode"欢迎来到TypeMoon学习合约！";
    bytes public dynamicBytes = unicode"动态字节数据";
    
    // ======================== 复杂数据类型 ========================
    
    // 6. 数组类型
    uint256[] public dynamicArray;                 // 动态数组
    uint256[5] public fixedArray;                  // 固定长度数组
    string[] public stringArray;                   // 字符串数组
    address[] public addressList;                  // 地址数组
    
    // 7. 映射类型
    mapping(address => uint256) public balances;           // 地址到余额的映射
    mapping(uint256 => string) public idToName;            // ID到名称的映射
    mapping(address => mapping(uint256 => bool)) public nestedMapping;  // 嵌套映射
    
    // 8. 结构体类型
    struct User {
        uint256 id;
        string name;
        address userAddress;
        bool isActive;
        uint256[] scores;
    }
    
    struct Product {
        uint256 productId;
        string productName;
        uint256 price;
        address seller;
        bool isAvailable;
        bytes32 category;
    }
    
    // 结构体数组和映射
    User[] public users;
    mapping(uint256 => User) public userById;
    mapping(address => Product[]) public userProducts;
    
    // 9. 枚举类型
    enum Status { Pending, Active, Inactive, Suspended }
    enum Priority { Low, Medium, High, Critical }
    
    Status public currentStatus = Status.Pending;
    Priority public taskPriority = Priority.Medium;
    
    // ======================== 事件定义 ========================
    
    // 基本事件
    event BasicEvent(string message);
    
    // 带索引参数的事件 (indexed 参数可以被过滤)
    event UserRegistered(
        uint256 indexed userId,
        address indexed userAddress,
        string name,
        uint256 timestamp
    );
    
    // 复杂数据类型事件
    event ProductAdded(
        uint256 indexed productId,
        string indexed category,
        address indexed seller,
        string productName,
        uint256 price
    );
    
    // 数组数据事件
    event ScoresUpdated(
        address indexed user,
        uint256[] oldScores,
        uint256[] newScores
    );
    
    // 状态变更事件
    event StatusChanged(
        Status indexed oldStatus,
        Status indexed newStatus,
        address indexed changedBy,
        uint256 timestamp
    );
    
    // 资金相关事件
    event FundsReceived(
        address indexed sender,
        uint256 amount,
        bytes data
    );
    
    event FundsWithdrawn(
        address indexed recipient,
        uint256 amount,
        string reason
    );
    
    // 错误事件
    event ErrorOccurred(
        string indexed errorType,
        string message,
        address indexed user
    );
    
    // ======================== 修饰符 ========================
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, unicode"只有所有者可以调用此功能");
        _;
    }
    
    modifier validAddress(address _addr) {
        require(_addr != address(0), unicode"地址不能为零地址");
        _;
    }
    
    modifier onlyActiveUser(uint256 _userId) {
        require(_userId < users.length, unicode"用户不存在");
        require(users[_userId].isActive, unicode"用户未激活");
        _;
    }
    
    modifier costs(uint256 _amount) {
        require(msg.value >= _amount, unicode"发送的以太币不足");
        _;
        if (msg.value > _amount) {
            payable(msg.sender).transfer(msg.value - _amount);
        }
    }
    
    // ======================== 自定义错误 ========================
    
    error InsufficientFunds(uint256 requested, uint256 available);
    error UserNotFound(uint256 userId);
    error InvalidInput(string reason);
    
    // ======================== 构造函数 ========================
    
    constructor(address _payableAddress) {
        owner = msg.sender;
        ownerAddress = msg.sender;
        payableAddress = payable(_payableAddress);
        
        // 初始化固定数组
        fixedArray[0] = 1;
        fixedArray[1] = 2;
        fixedArray[2] = 3;
        fixedArray[3] = 4;
        fixedArray[4] = 5;
        
        // 初始化字符串数组
        stringArray.push(unicode"第一个元素");
        stringArray.push(unicode"第二个元素");
        
        // 触发初始化事件
        emit BasicEvent(unicode"TypeMoon合约已部署");
        emit StatusChanged(Status.Pending, Status.Active, msg.sender, block.timestamp);
        currentStatus = Status.Active;
    }
    
    // ======================== 接收以太币函数 ========================
    
    // receive函数：接收纯以太币转账
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value, "");
    }
    
    // fallback函数：接收带数据的调用
    fallback() external payable {
        emit FundsReceived(msg.sender, msg.value, msg.data);
    }
    
    // ======================== 基本类型操作函数 ========================
    
    /**
     * @dev 演示布尔类型操作
     */
    function toggleBoolean() public {
        booleanValue = !booleanValue;
        emit BasicEvent(booleanValue ? unicode"布尔值设为true" : unicode"布尔值设为false");
    }
    
    /**
     * @dev 演示整数类型操作和库使用
     */
    function mathOperations(uint256 a, uint256 b) public pure returns (uint256 sum, uint256 product) {
        sum = a.add(b);        // 使用库函数
        product = a.multiply(b); // 使用库函数
        return (sum, product);
    }
    
    /**
     * @dev 演示字符串操作
     */
    function updateGreeting(string memory _newGreeting) public onlyOwner {
        string memory oldGreeting = greeting;
        greeting = _newGreeting;
        emit BasicEvent(string(abi.encodePacked(unicode"问候语从 '", oldGreeting, unicode"' 更新为 '", _newGreeting, unicode"'")));
    }
    
    // ======================== 数组操作函数 ========================
    
    /**
     * @dev 添加动态数组元素
     */
    function addToDynamicArray(uint256 _value) public {
        dynamicArray.push(_value);
        emit BasicEvent(unicode"向动态数组添加了新元素");
    }
    
    /**
     * @dev 获取动态数组
     */
    function getDynamicArray() public view returns (uint256[] memory) {
        return dynamicArray;
    }
    
    /**
     * @dev 更新固定数组元素
     */
    function updateFixedArray(uint8 _index, uint256 _value) public {
        require(_index < 5, unicode"索引超出范围");
        fixedArray[_index] = _value;
        emit BasicEvent(unicode"更新了固定数组元素");
    }
    
    // ======================== 映射操作函数 ========================
    
    /**
     * @dev 设置余额
     */
    function setBalance(address _user, uint256 _amount) public onlyOwner validAddress(_user) {
        uint256 oldBalance = balances[_user];
        balances[_user] = _amount;
        emit BasicEvent(string(abi.encodePacked(unicode"用户余额从 ", uint2str(oldBalance), unicode" 更新为 ", uint2str(_amount))));
    }
    
    /**
     * @dev 获取余额
     */
    function getBalance(address _user) public view returns (uint256) {
        return balances[_user];
    }
    
    /**
     * @dev 设置嵌套映射
     */
    function setNestedMapping(address _user, uint256 _id, bool _value) public {
        nestedMapping[_user][_id] = _value;
        emit BasicEvent(unicode"更新了嵌套映射值");
    }
    
    // ======================== 结构体操作函数 ========================
    
    /**
     * @dev 注册用户
     */
    function registerUser(string memory _name, address _userAddress) 
        public 
        validAddress(_userAddress) 
        returns (uint256 userId) 
    {
        userId = users.length;
        
        User memory newUser = User({
            id: userId,
            name: _name,
            userAddress: _userAddress,
            isActive: true,
            scores: new uint256[](0)
        });
        
        users.push(newUser);
        userById[userId] = newUser;
        
        emit UserRegistered(userId, _userAddress, _name, block.timestamp);
        return userId;
    }
    
    /**
     * @dev 添加用户分数
     */
    function addUserScore(uint256 _userId, uint256 _score) public onlyActiveUser(_userId) {
        uint256[] memory oldScores = users[_userId].scores;
        users[_userId].scores.push(_score);
        userById[_userId].scores.push(_score);
        
        emit ScoresUpdated(users[_userId].userAddress, oldScores, users[_userId].scores);
    }
    
    /**
     * @dev 添加产品
     */
    function addProduct(
        string memory _name, 
        uint256 _price, 
        string memory _category
    ) public returns (uint256 productId) {
        productId = block.timestamp; // 简单的ID生成
        
        Product memory newProduct = Product({
            productId: productId,
            productName: _name,
            price: _price,
            seller: msg.sender,
            isAvailable: true,
            category: keccak256(abi.encodePacked(_category))
        });
        
        userProducts[msg.sender].push(newProduct);
        
        emit ProductAdded(productId, _category, msg.sender, _name, _price);
        return productId;
    }
    
    // ======================== 枚举操作函数 ========================
    
    /**
     * @dev 更改状态
     */
    function changeStatus(Status _newStatus) public onlyOwner {
        Status oldStatus = currentStatus;
        currentStatus = _newStatus;
        emit StatusChanged(oldStatus, _newStatus, msg.sender, block.timestamp);
    }
    
    /**
     * @dev 设置任务优先级
     */
    function setPriority(Priority _priority) public {
        taskPriority = _priority;
        emit BasicEvent(unicode"任务优先级已更新");
    }
    
    // ======================== 高级功能函数 ========================
    
    /**
     * @dev 批量操作示例
     */
    function batchAddUsers(string[] memory _names, address[] memory _addresses) 
        public 
        onlyOwner 
    {
        require(_names.length == _addresses.length, unicode"数组长度不匹配");
        
        for (uint256 i = 0; i < _names.length; i++) {
            registerUser(_names[i], _addresses[i]);
        }
        
        emit BasicEvent(unicode"批量添加用户完成");
    }
    
    /**
     * @dev 条件转账示例
     */
    function conditionalTransfer(address _to, uint256 _amount) 
        public 
        payable 
        validAddress(_to) 
        costs(_amount)
    {
        if (balances[msg.sender] >= _amount) {
            balances[msg.sender] -= _amount;
            balances[_to] += _amount;
            
            emit FundsWithdrawn(msg.sender, _amount, unicode"条件转账");
            emit FundsReceived(_to, _amount, unicode"条件转账接收");
        } else {
            revert InsufficientFunds(_amount, balances[msg.sender]);
        }
    }
    
    /**
     * @dev 错误处理示例
     */
    function demonstrateErrorHandling(uint256 _userId) public view returns (User memory) {
        if (_userId >= users.length) {
            revert UserNotFound(_userId);
        }
        
        if (!users[_userId].isActive) {
            revert InvalidInput(unicode"用户未激活");
        }
        
        return users[_userId];
    }
    
    // ======================== 视图和纯函数 ========================
    
    /**
     * @dev 获取合约信息
     */
    function getContractInfo() public view returns (
        address contractOwner,
        uint256 totalUsers,
        uint256 contractBalance,
        Status status
    ) {
        return (owner, users.length, address(this).balance, currentStatus);
    }
    
    /**
     * @dev 计算哈希值
     */
    function calculateHash(string memory _input) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_input));
    }
    
    /**
     * @dev 验证签名示例
     */
    function verifySignature(
        bytes32 _messageHash,
        bytes memory _signature
    ) public pure returns (address) {
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
        );
        
        return recoverSigner(ethSignedMessageHash, _signature);
    }
    
    /**
     * @dev 恢复签名者地址
     */
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        internal
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }
    
    /**
     * @dev 分解签名
     */
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, unicode"无效的签名长度");
        
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
    
    // ======================== 实现抽象函数 ========================
    
    /**
     * @dev 实现抽象合约的函数
     */
    function abstractFunction() public pure override returns (string memory) {
        return unicode"这是抽象函数的具体实现";
    }
    
    // ======================== 工具函数 ========================
    
    /**
     * @dev 数字转字符串工具函数
     */
    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        str = string(bstr);
    }
    
    // ======================== 合约控制函数 ========================
    
    bool public contractActive = true;
    
    modifier whenActive() {
        require(contractActive, unicode"合约已被暂停");
        _;
    }
    
    /**
     * @dev 暂停合约（现代化替代销毁合约的方法）
     */
    function pauseContract() public onlyOwner {
        contractActive = false;
        emit BasicEvent(unicode"合约已被暂停");
    }
    
    /**
     * @dev 恢复合约
     */
    function resumeContract() public onlyOwner {
        contractActive = true;
        emit BasicEvent(unicode"合约已恢复运行");
    }
    
    /**
     * @dev 提取所有资金（替代selfdestruct的资金转移功能）
     */
    function emergencyWithdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, unicode"没有可提取的资金");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, unicode"提取失败");
        
        emit BasicEvent(unicode"紧急提取了所有资金");
    }
    
    /**
     * @dev 展示过时的selfdestruct（仅用于教学，不推荐使用）
     * 注意：此函数展示了被弃用的selfdestruct，实际项目中应避免使用
     */
    function deprecatedSelfDestruct() public onlyOwner {
        // ⚠️ 警告：selfdestruct已被弃用
        // 在Cancun硬分叉后，这只会转移以太币，不会删除合约
        // 推荐使用上面的pauseContract()和emergencyWithdraw()替代
        
        emit BasicEvent(unicode"警告：使用了被弃用的selfdestruct");
        // selfdestruct(payable(owner)); // 已注释，不推荐使用
        
        // 推荐的替代方案：
        pauseContract();
        emergencyWithdraw();
    }
}
