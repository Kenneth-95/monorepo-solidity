const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TodoListModule", (m) => {
  // 导入Counter模块
  const { counter } = m.useModule(require("./Counter"));
  
  // 使用Counter合约地址部署TodoList
  const todoList = m.contract("TodoList", [counter]);
  
  return { todoList };
});