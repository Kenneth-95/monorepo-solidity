import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { hardhat, sepolia } from 'wagmi/chains'

// 从环境变量获取配置
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'
const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY || 'YOUR_INFURA_KEY'

export const config = getDefaultConfig({
  appName: 'React TodoList DApp',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [hardhat, sepolia],
  ssr: false,
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
    rpcUrl: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
      
  }
}

// 环境变量检查
export const checkEnvironmentVariables = () => {
  const missingVars = []
  
  if (WALLET_CONNECT_PROJECT_ID === 'YOUR_PROJECT_ID') {
    missingVars.push('VITE_WALLET_CONNECT_PROJECT_ID')
  }
  
  if (INFURA_API_KEY === 'YOUR_INFURA_KEY') {
    missingVars.push('VITE_INFURA_API_KEY')
  }
  
  if (missingVars.length > 0) {
    console.warn('⚠️ 缺少环境变量:', missingVars.join(', '))
    console.warn('请在 .env 文件中配置这些变量')
  }
  
  return missingVars.length === 0
}