// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Counter
 * @dev 一个简单的计数器合约，演示基本的Solidity功能
 */
contract Counter {
    // 状态变量
    uint256 public count;
    address public owner;
    
    // 事件定义
    event CountIncreased(uint256 newCount);
    event CountDecreased(uint256 newCount);
    event CountReset(uint256 newCount);
    
    // 构造函数
    constructor() {
        count = 0;
        owner = msg.sender;
    }
    
    // 增加计数器
    function increment() public {
        count += 1;
        emit CountIncreased(count);
    }
    
    // 减少计数器
    function decrement() public {
        require(count > 0, "Counter cannot be negative");
        count -= 1;
        emit CountDecreased(count);
    }
    
    // 重置计数器（仅所有者可以调用）
    function reset() public {
        require(msg.sender == owner, "Only owner can reset");
        count = 0;
        emit CountReset(count);
    }
    
    // 获取当前计数值
    function getCount() public view returns (uint256) {
        return count;
    }
    
    // 获取合约所有者
    function getOwner() public view returns (address) {
        return owner;
    }
} 