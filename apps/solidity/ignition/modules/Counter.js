// Counter合约部署脚本
// 使用Hardhat Ignition管理智能合约部署

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CounterModule", (m) => {
  // 部署Counter合约
  const counter = m.contract("Counter");

  return { counter };
}); 