# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

## 网络配置

### 测试环境配置
根目录建立 `.env` 文件，存入以下变量：
- `INFURA_API_KEY`: Infura API 密钥
- `PRIVATE_KEY`: 钱包私钥（不包含 0x 前缀）

### 支持的网络
- **localhost**: 本地开发网络 (Chain ID: 31337)
- **sepolia**: 以太坊 Sepolia 测试网 (Chain ID: 11155111)
- **lineaSepolia**: Linea Sepolia 测试网 (Chain ID: 59141)

### 部署到不同网络

```shell
# 部署到本地网络
npx hardhat ignition deploy ./ignition/modules/Lock.js --network localhost

# 部署到 Sepolia 测试网
npx hardhat ignition deploy ./ignition/modules/Lock.js --network sepolia

# 部署到 Linea Sepolia 测试网
npx hardhat ignition deploy ./ignition/modules/Lock.js --network lineaSepolia
```

### Linea Sepolia 测试网特点
- **低手续费**: 比以太坊主网便宜很多
- **快速确认**: 交易确认速度更快
- **EVM 兼容**: 与以太坊完全兼容
- **获取测试币**: 可通过 [Linea Faucet](https://faucet.goerli.linea.build/) 获取测试 ETH