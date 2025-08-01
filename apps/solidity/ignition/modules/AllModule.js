const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AllModule", (m) => {
  // 部署 Counter
  const counter = m.contract("Counter");
  
  // 部署 Greeting  
  const greeting = m.contract("Greeting", ["Hello, World!"]);
  
  // 部署 TodoList，使用 Counter 地址
  const todoList = m.contract("TodoList", [counter]);
  
  return { 
    counter, 
    greeting, 
    todoList 
  };
});