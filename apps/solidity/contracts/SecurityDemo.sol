// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SecurityDemo - 安全模式演示合约
 * @dev 展示各种高级安全模式的使用
 */

// ============== 1. 重入攻击防护模式 ==============

/**
 * @dev 重入锁修饰符 - 防止重入攻击
 */
contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, unicode"重入攻击被阻止");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

// ============== 2. 访问控制模式 ==============

/**
 * @dev 基于角色的访问控制
 */
contract AccessControl {
    mapping(bytes32 => mapping(address => bool)) private _roles;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), unicode"访问权限不足");
        _;
    }
    
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }
    
    function grantRole(bytes32 role, address account) public onlyRole(ADMIN_ROLE) {
        _grantRole(role, account);
    }
    
    function revokeRole(bytes32 role, address account) public onlyRole(ADMIN_ROLE) {
        _revokeRole(role, account);
    }
    
    function _grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }
    
    function _revokeRole(bytes32 role, address account) internal {
        if (hasRole(role, account)) {
            _roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }
}

// ============== 3. 暂停机制模式 ==============

/**
 * @dev 暂停功能 - 紧急情况下暂停合约操作
 */
contract Pausable {
    bool private _paused;
    
    event Paused(address account);
    event Unpaused(address account);
    
    constructor() {
        _paused = false;
    }
    
    modifier whenNotPaused() {
        require(!_paused, unicode"合约已暂停");
        _;
    }
    
    modifier whenPaused() {
        require(_paused, unicode"合约未暂停");
        _;
    }
    
    function paused() public view returns (bool) {
        return _paused;
    }
    
    function _pause() internal whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }
    
    function _unpause() internal whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}

// ============== 4. 主合约 - 集成所有安全模式 ==============

contract SecurityDemo is ReentrancyGuard, AccessControl, Pausable {
    mapping(address => uint256) public balances;
    uint256 public totalSupply;
    
    // 自定义错误 - Gas效率更高
    error InsufficientBalance(address account, uint256 requested, uint256 available);
    error InvalidAmount(uint256 amount);
    error ZeroAddress();
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    
    constructor() {
        // 设置初始角色
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }
    
    // ============== CEI模式演示 (检查-效果-交互) ==============
    
    /**
     * @dev 存款功能 - 演示基本安全检查
     */
    function deposit() external payable whenNotPaused nonReentrant {
        // 检查 (Checks)
        if (msg.value == 0) revert InvalidAmount(msg.value);
        
        // 效果 (Effects) - 修改状态
        balances[msg.sender] += msg.value;
        totalSupply += msg.value;
        
        // 交互 (Interactions) - 发出事件
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev 提款功能 - 演示重入防护和CEI模式
     */
    function withdraw(uint256 amount) external whenNotPaused nonReentrant {
        // 检查 (Checks)
        if (amount == 0) revert InvalidAmount(amount);
        if (balances[msg.sender] < amount) {
            revert InsufficientBalance(msg.sender, amount, balances[msg.sender]);
        }
        
        // 效果 (Effects) - 先修改状态
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        
        // 交互 (Interactions) - 最后进行外部调用
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, unicode"转账失败");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev 转账功能 - 演示地址验证和权限控制
     */
    function transfer(address to, uint256 amount) external whenNotPaused {
        // 检查
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount(amount);
        if (balances[msg.sender] < amount) {
            revert InsufficientBalance(msg.sender, amount, balances[msg.sender]);
        }
        
        // 效果
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        // 交互
        emit Transfer(msg.sender, to, amount);
    }
    
    // ============== 管理员功能 ==============
    
    /**
     * @dev 铸造代币 - 需要MINTER角色
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount(amount);
        
        balances[to] += amount;
        totalSupply += amount;
        
        emit Transfer(address(0), to, amount);
    }
    
    /**
     * @dev 销毁代币 - 需要BURNER角色
     */
    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) whenNotPaused {
        if (from == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount(amount);
        if (balances[from] < amount) {
            revert InsufficientBalance(from, amount, balances[from]);
        }
        
        balances[from] -= amount;
        totalSupply -= amount;
        
        emit Transfer(from, address(0), amount);
    }
    
    /**
     * @dev 暂停合约 - 需要ADMIN角色
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev 恢复合约 - 需要ADMIN角色
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    // ============== 安全的紧急功能 ==============
    
    /**
     * @dev 紧急提取 - 只能在暂停状态下使用
     */
    function emergencyWithdraw() external whenPaused onlyRole(ADMIN_ROLE) {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, unicode"合约无余额");
        
        (bool success, ) = payable(msg.sender).call{value: contractBalance}("");
        require(success, unicode"紧急提取失败");
    }
    
    // ============== 只读函数 ==============
    
    function getBalance(address account) external view returns (uint256) {
        return balances[account];
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ============== 数学安全 ==============
    
    /**
     * @dev 安全的数学运算示例
     */
    function safeMath(uint256 a, uint256 b) external pure returns (uint256 sum, uint256 product) {
        // Solidity 0.8+ 自动检查溢出，但展示概念
        unchecked {
            // 检查加法溢出
            sum = a + b;
            require(sum >= a, unicode"加法溢出");
            
            // 检查乘法溢出
            if (a != 0) {
                product = a * b;
                require(product / a == b, unicode"乘法溢出");
            }
        }
        
        return (sum, product);
    }
    
    // ============== 时间锁功能 ==============
    
    mapping(bytes32 => uint256) public timelock;
    uint256 public constant TIMELOCK_DURATION = 2 days;
    
    event TimelockStarted(bytes32 indexed operationId, uint256 executeTime);
    event TimelockExecuted(bytes32 indexed operationId);
    
    modifier withTimelock(bytes32 operationId) {
        require(
            timelock[operationId] != 0 && 
            block.timestamp >= timelock[operationId],
            unicode"时间锁未到期"
        );
        _;
        delete timelock[operationId];
        emit TimelockExecuted(operationId);
    }
    
    function startTimelock(bytes32 operationId) external onlyRole(ADMIN_ROLE) {
        timelock[operationId] = block.timestamp + TIMELOCK_DURATION;
        emit TimelockStarted(operationId, timelock[operationId]);
    }
    
    /**
     * @dev 重要操作需要时间锁
     */
    function criticalOperation(bytes32 operationId) 
        external 
        onlyRole(ADMIN_ROLE) 
        withTimelock(operationId) 
    {
        // 执行重要操作
        emit TimelockExecuted(operationId);
    }
}

// ============== 5. 恶意合约攻击演示 ==============

/**
 * @dev 模拟恶意合约 - 用于测试重入攻击防护
 */
contract MaliciousContract {
    SecurityDemo public target;
    uint256 public attackCount;
    
    constructor(address _target) {
        target = SecurityDemo(_target);
    }
    
    // 尝试重入攻击
    function attack() external payable {
        target.deposit{value: msg.value}();
        target.withdraw(msg.value);
    }
    
    // 接收以太币时尝试重入
    receive() external payable {
        if (attackCount < 3 && address(target).balance >= msg.value) {
            attackCount++;
            target.withdraw(msg.value);
        }
    }
}
