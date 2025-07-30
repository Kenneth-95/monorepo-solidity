# Vue3 智能合约交互Demo

这是一个使用Vue3 + ethers.js构建的智能合约交互前端应用。

## 功能特性

- 🔗 MetaMask钱包连接
- 🔢 Counter计数器合约交互
- 👋 Greeting问候语合约交互
- 📜 实时事件监听
- 📱 响应式UI设计

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 配置合约地址
在使用前请确保：
1. 在 `src/contracts/index.js` 中更新正确的合约地址
2. 启动Hardhat本地网络
3. 部署合约到本地网络

### 4. 准备MetaMask
1. 安装MetaMask浏览器插件
2. 添加本地网络配置：
   - 网络名称: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - 链ID: 31337
   - 货币符号: ETH

## 项目结构

```
src/
├── contracts/          # 合约配置和ABI
│   └── index.js
├── services/           # Web3服务
│   └── web3Service.js
├── views/              # 页面组件
│   └── ContractDemo.vue
└── router/             # 路由配置
    └── index.js
```

## 合约功能

### Counter合约
- ✅ 查看当前计数
- ✅ 增加计数 (+1)
- ✅ 减少计数 (-1)
- ✅ 重置计数 (仅owner)
- ✅ 查看合约拥有者

### Greeting合约
- ✅ 查看当前问候语
- ✅ 设置新问候语
- ✅ 查看完整问候语
- ✅ 查看更改次数
- ✅ 重置问候语 (仅owner)
- ✅ 查看合约拥有者

## 事件监听

应用会实时监听以下合约事件：
- CountIncreased - 计数增加
- CountDecreased - 计数减少  
- CountReset - 计数重置
- GreetingChanged - 问候语更改

## 使用步骤

1. 访问 http://localhost:5173
2. 点击"合约Demo"导航
3. 连接MetaMask钱包
4. 开始与合约交互

## 技术栈

- Vue 3 (Composition API)
- ethers.js 6.x
- Vue Router 4
- Vite

## 注意事项

- 确保MetaMask已连接到正确的网络
- 确保钱包有足够的ETH支付gas费用
- 合约地址需要在代码中正确配置
- 部分功能（如重置）仅合约拥有者可操作
