const Counter = require('./config/Counter.js')
const Greeting = require('./config/Greeting.js')
const Lock = require('./config/Lock.js')
const TodoList = require('./config/TodoList.js')


// 合约配置文件
module.exports = {
  // 网络配置
  network: {
    rpcUrl: "http://127.0.0.1:8545", // Hardhat本地网络
    chainId: 31337
  },
  
  // 合约配置
  contracts: {
    Counter,
    Greeting,
    Lock,
    TodoList
  }
}; 