// Greeting合约部署脚本
// 使用Hardhat Ignition管理智能合约部署

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("GreetingModule", (m) => {
  // 设置初始问候语参数
  const initialGreeting = m.getParameter("initialGreeting", "World");

  // 部署Greeting合约
  const greeting = m.contract("Greeting", [initialGreeting]);

  return { greeting };
}); 