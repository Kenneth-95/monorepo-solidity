# 智能合约数据服务后端

这是一个基于Koa.js的Node.js后端服务，用于连接以太坊智能合约并提供数据API接口。无需前端连接钱包即可获取合约数据。

## 🚀 功能特性

- 🔗 自动连接Hardhat本地网络
- 📊 读取Counter和Greeting合约数据
- 💾 数据持久化存储为JSON文件
- 🎧 实时监听合约事件
- ⏰ 定时同步合约数据
- 🌐 提供RESTful API接口
- 📈 事件统计和管理

## 📋 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 确保Hardhat网络运行

```bash
# 在项目根目录
npx hardhat node
```

### 3. 确保合约已部署

```bash
# 在项目根目录
npx hardhat ignition deploy ./ignition/modules/Counter.js --network localhost
npx hardhat ignition deploy ./ignition/modules/Greeting.js --network localhost
```

### 4. 启动后端服务

```bash
npm start
# 或者开发模式
npm run dev
```

服务将在 `http://localhost:3001` 启动

## 📡 API接口

### 合约数据接口

- `GET /api/contracts` - 获取所有合约数据（缓存）
- `GET /api/contracts/live` - 获取实时合约数据
- `GET /api/contracts/counter` - 获取Counter合约数据
- `GET /api/contracts/greeting` - 获取Greeting合约数据
- `POST /api/contracts/sync` - 强制同步合约数据
- `GET /api/contracts/status` - 获取网络和合约状态

### 事件接口

- `GET /api/events` - 获取最近事件（可指定limit参数）
- `GET /api/events/contract/:contractName` - 获取指定合约的事件
- `GET /api/events/stats` - 获取事件统计信息
- `DELETE /api/events/cleanup?days=30` - 清理旧事件

### 系统接口

- `GET /` - API文档首页
- `GET /health` - 健康检查

## 📊 数据存储

数据存储在 `backend/data/` 目录：

- `contracts.json` - 合约数据缓存
- `events.json` - 事件记录

## 🔧 配置

### 合约配置

编辑 `config/contracts.js` 文件来配置合约地址和ABI：

```javascript
module.exports = {
  network: {
    rpcUrl: "http://127.0.0.1:8545",
    chainId: 31337
  },
  contracts: {
    Counter: {
      address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      abi: [...]
    }
  }
};
```

### 同步设置

数据同步间隔默认为30秒，可在 `sync-contracts.js` 中修改：

```javascript
this.syncInterval = 30000; // 30秒
```

## 🔄 使用场景

### 前端无钱包访问

前端可以直接调用API获取合约数据，无需连接MetaMask：

```javascript
// 获取Counter数据
const response = await fetch('http://localhost:3001/api/contracts/counter');
const data = await response.json();
console.log('当前计数:', data.data.count);
```

### 实时事件监控

后端会自动监听合约事件并记录，前端可以查询：

```javascript
// 获取最近的事件
const events = await fetch('http://localhost:3001/api/events?limit=10');
```

## 🛠️ 开发命令

```bash
# 启动服务
npm start

# 开发模式（自动重启）
npm run dev

# 仅运行同步服务
npm run sync
```

## 📈 监控

访问 `/health` 端点可以查看服务状态：

- 服务器运行状态
- 网络连接状态  
- 数据统计信息
- 同步服务状态

## 🔍 故障排除

### 连接失败

1. 确保Hardhat网络在运行
2. 检查端口8545是否被占用
3. 验证合约地址是否正确

### 数据不同步

1. 检查合约是否正确部署
2. 验证合约地址和ABI
3. 查看控制台错误日志

### 事件监听失败

1. 确保合约事件定义正确
2. 检查网络连接稳定性
3. 重启后端服务

## 🎯 扩展功能

可以轻松添加新的合约支持：

1. 在 `config/contracts.js` 添加新合约配置
2. 在 `contractService.js` 添加读取方法
3. 在路由中添加新的API端点
4. 更新事件监听器

## 📝 日志

服务会输出详细的运行日志：

- ✅ 成功操作
- ❌ 错误信息  
- 🔄 同步状态
- 📡 事件监听
- 🚀 服务状态 