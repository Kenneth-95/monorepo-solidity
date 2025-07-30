# Monorepo Solidity

一个使用 pnpm workspace 的 monorepo 项目，专为 Solidity 开发设计。

## 🏗️ 项目结构

```
monorepo-solidity/
├── packages/           # 共享包
│   └── shared-utils/   # 共享工具库
├── apps/              # 应用程序
│   └── web-app/       # Web 应用示例
├── tools/             # 构建工具
├── pnpm-workspace.yaml # pnpm 工作区配置
└── package.json       # 根配置
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
# 启动所有应用的开发模式
pnpm dev

# 或单独启动某个应用
pnpm --filter @monorepo/web-app dev
```

### 构建

```bash
# 构建所有包
pnpm build

# 或构建特定包
pnpm --filter @monorepo/shared-utils build
```

## 📦 包管理

### 添加依赖

```bash
# 为根项目添加依赖
pnpm add -w <package>

# 为特定包添加依赖
pnpm --filter @monorepo/web-app add <package>

# 添加内部包依赖
pnpm --filter @monorepo/web-app add @monorepo/shared-utils
```

### 创建新包

1. 在 `packages/` 目录下创建新文件夹
2. 添加 `package.json`，包名使用 `@monorepo/` 前缀
3. 在其他包中使用 `workspace:*` 引用

## 🔄 版本管理

本项目使用 [Changesets](https://github.com/changesets/changesets) 进行版本管理：

```bash
# 创建变更记录
pnpm changeset

# 更新版本
pnpm version-packages

# 发布
pnpm release
```

## 🛠️ 可用脚本

- `pnpm build` - 构建所有包
- `pnpm test` - 运行所有测试
- `pnpm lint` - 检查代码规范
- `pnpm clean` - 清理构建产物
- `pnpm dev` - 启动开发模式
- `pnpm format` - 格式化代码

## 📋 工作区特性

- **依赖提升**: pnpm 自动优化依赖安装
- **类型共享**: TypeScript 配置在包间共享
- **脚本执行**: 支持并行和递归执行
- **版本管理**: 统一的版本发布流程

## 📄 许可证

ISC 