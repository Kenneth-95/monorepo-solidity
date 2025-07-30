// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Greeting
 * @dev 一个简单的问候合约，演示字符串处理和访问控制
 */
contract Greeting {
    // 状态变量
    string public greeting;
    address public owner;
    uint256 public changeCount;
    
    // 事件定义
    event GreetingChanged(string newGreeting, address changedBy);
    
    // 构造函数
    constructor(string memory _greeting) {
        greeting = _greeting;
        owner = msg.sender;
        changeCount = 0;
    }
    
    // 设置问候语
    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
        changeCount += 1;
        emit GreetingChanged(_greeting, msg.sender);
    }
    
    // 获取问候语
    function getGreeting() public view returns (string memory) {
        return greeting;
    }
    
    // 获取完整问候信息
    function getFullGreeting() public view returns (string memory) {
        return string(abi.encodePacked("Hello, ", greeting, "!"));
    }
    
    // 获取更改次数
    function getChangeCount() public view returns (uint256) {
        return changeCount;
    }
    
    // 重置问候语（仅所有者可以调用）
    function resetGreeting() public {
        require(msg.sender == owner, "Only owner can reset");
        greeting = "World";
        changeCount = 0;
        emit GreetingChanged("World", msg.sender);
    }
} 