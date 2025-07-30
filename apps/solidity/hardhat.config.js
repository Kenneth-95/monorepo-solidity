require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      saveDeployments: true,
    },
    // 持久化本地网络配置
    persistent: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
      ]
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // 需要替换为真实的 Infura Key
      accounts: [
        // 在这里添加你的真实私钥（仅用于测试网络）
        // "0x你的私钥"
      ],
      chainId: 11155111
    }
  },
  // 持久化存储配置
  defaultNetwork: "localhost",
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test"
  }
};
