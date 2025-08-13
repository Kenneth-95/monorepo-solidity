// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TransferContract {
    address public owner;
    
    // 事件记录转账
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    // 修饰符：仅所有者
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    // 接收以太币
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
    
    // 1. 基本转账函数（发送合约中的以太币）
    function transferEther(address payable _to, uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        require(_to != address(0), "Invalid address");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit Transfer(address(this), _to, _amount);
    }
    
    // 2. 批量转账
    function batchTransfer(address payable[] calldata _recipients, uint256[] calldata _amounts) external onlyOwner {
        require(_recipients.length == _amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        require(totalAmount <= address(this).balance, "Insufficient balance");
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_recipients[i] != address(0), "Invalid address");
            (bool success, ) = _recipients[i].call{value: _amounts[i]}("");
            require(success, "Transfer failed");
            emit Transfer(address(this), _recipients[i], _amounts[i]);
        }
    }
    
    // 3. 提取所有余额
    function withdrawAll() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(owner, balance);
    }
    
    // 4. 安全的转账函数（带重入保护）
    bool private locked;
    modifier noReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    function safeTransfer(address payable _to, uint256 _amount) external onlyOwner noReentrant {
        require(_amount <= address(this).balance, "Insufficient balance");
        require(_to != address(0), "Invalid address");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit Transfer(address(this), _to, _amount);
    }
    
    // 查询合约余额
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // 查询指定地址余额
    function getAddressBalance(address _addr) external view returns (uint256) {
        return _addr.balance;
    }
}
