# React TodoList DApp

基于 React + RainbowKit + Wagmi + Ant Design 构建的去中心化待办事项应用。

## 技术栈

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **RainbowKit** - 钱包连接UI
- **Wagmi** - React Hooks for Ethereum
- **Ant Design** - UI组件库
- **Vite** - 构建工具

## 功能特性

- ✨ **钱包连接** - 支持多种钱包连接
- 📝 **智能合约交互** - 与 TodoList 智能合约交互
- 🎨 **现代化UI** - 基于 Ant Design 的美观界面
- ⚡ **实时数据同步** - 自动同步区块链数据
- 🔄 **交易状态追踪** - 实时显示交易处理状态
- 📊 **统计信息** - 显示完成率等统计数据

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

应用将在 http://localhost:3001 启动

### 构建生产版本

```bash
pnpm build
```

## 项目结构

```
src/
├── components/          # React组件
│   ├── WalletConnect.tsx   # 钱包连接组件
│   └── TodoList.tsx        # 待办事项列表组件
├── contracts/           # 智能合约配置
│   ├── config/             # 合约ABI和地址
│   └── index.ts           # 合约导出
├── hooks/              # 自定义Hooks
│   └── useTodoList.ts     # TodoList相关逻辑
├── config/             # 配置文件
│   └── wagmi.ts           # Wagmi配置
├── types/              # TypeScript类型定义
├── App.tsx             # 主应用组件
└── main.tsx           # 应用入口
```

## 智能合约

该应用与以下智能合约交互：

- **TodoList**: `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e`

### 主要功能

1. **添加待办事项** - `addTodo(string)`
2. **完成待办事项** - `completeTodo(uint256)`
3. **获取待办事项列表** - `getTodos()`

## 配置说明

### 网络配置

在 `src/config/wagmi.ts` 中配置支持的网络：

```typescript
export const config = getDefaultConfig({
  appName: 'React TodoList DApp',
  projectId: 'YOUR_PROJECT_ID', // 从 WalletConnect Cloud 获取
  chains: [hardhat],
})
```

### 合约地址

在 `src/contracts/config/` 目录下更新合约地址和ABI。

## 使用说明

1. **连接钱包** - 点击"连接钱包"按钮，选择您的钱包
2. **查看待办事项** - 无需连接钱包即可查看现有待办事项
3. **添加待办事项** - 连接钱包后可添加新的待办事项
4. **完成待办事项** - 点击复选框标记待办事项为已完成
5. **查看统计** - 在统计卡片中查看完成情况

## 注意事项

- 确保您的钱包已连接到正确的网络（默认为 Hardhat 本地网络）
- 交易需要支付 Gas 费用
- 待办事项一旦标记为完成就无法撤销

## 开发指南

### 添加新功能

1. 在 `src/hooks/` 中创建新的自定义 Hook
2. 在 `src/components/` 中创建新组件
3. 在主应用中集成新功能

### 调试技巧

- 使用浏览器开发者工具查看控制台日志
- 检查网络请求和区块链交易状态
- 使用 Wagmi DevTools 进行调试

# 环境变量配置说明

## 1. 复制环境变量文件

```bash
cp env.example .env
```

## 2. 配置必要的环境变量

编辑 `.env` 文件，配置以下变量：

### WalletConnect Project ID
1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 注册/登录账户
3. 创建新项目
4. 复制 Project ID
5. 在 `.env` 文件中设置：
```
VITE_WALLET_CONNECT_PROJECT_ID=你的_project_id
```

### RPC 提供商 API Key (选择其中一个)

#### Infura (推荐)
1. 访问 [Infura](https://infura.io/)
2. 注册账户并创建项目
3. 复制 API Key
4. 在 `.env` 文件中设置：
```
VITE_INFURA_API_KEY=你的_infura_api_key
```

## 3. 启动应用

```bash
npm run dev
```

## 4. 验证配置

启动后检查浏览器控制台，如果没有警告信息说明配置正确。

## 注意事项

- `.env` 文件包含敏感信息，不要提交到版本控制
- 确保 `.env` 文件在项目根目录
- 环境变量必须以 `VITE_` 开头才能在客户端使用
- 如果使用 Infura，建议同时配置 Alchemy 作为备用



## 许可证

MIT License