// 合约配置文件
import Counter from './config/Counter.js'
import Greeting from './config/Greeting.js'
import Lock from './config/Lock.js'
import TodoList from './config/TodoList.js'

export const CONTRACTS = {
    Counter,
    Greeting,
    Lock,
    TodoList
}

// 网络配置
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