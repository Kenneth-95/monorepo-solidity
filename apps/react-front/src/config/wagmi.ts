import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { hardhat } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'React TodoList DApp',
  projectId: 'YOUR_PROJECT_ID', // 从 WalletConnect Cloud 获取
  chains: [hardhat],
  ssr: false, // 如果你的 dApp 使用服务端渲染 (SSR)
})

// 网络配置，对应Vue项目中的NETWORKS
export const NETWORKS = {
  localhost: {
    chainId: 31337,
    name: "Hardhat本地网络",
    rpcUrl: "http://127.0.0.1:8545"
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia测试网",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
  }
}