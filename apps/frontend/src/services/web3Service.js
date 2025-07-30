import { ethers } from 'ethers'
import { CONTRACTS, NETWORKS } from '../contracts/index.js'

class Web3Service {
  constructor() {
    this.provider = null
    this.signer = null
    this.account = null
    this.counterContract = null
    this.greetingContract = null
    this.todoListContract = null 
  }

  // 连接钱包
  async connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error('请安装MetaMask钱包')
      }

      // 请求账户连接
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      // 创建provider和signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum)
      this.signer = this.provider.getSigner()
      this.account = accounts[0]

      // 初始化合约实例
      this.initContracts()

      return {
        success: true,
        account: this.account
      }
    } catch (error) {
      console.error('连接钱包失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 初始化合约实例
  initContracts() {
    this.counterContract = new ethers.Contract(
      CONTRACTS.Counter.address,
      CONTRACTS.Counter.abi,
      this.signer
    )

    this.greetingContract = new ethers.Contract(
      CONTRACTS.Greeting.address,
      CONTRACTS.Greeting.abi,
      this.signer
    )
    this.todoListContract = new ethers.Contract(
      CONTRACTS.TodoList.address,
      CONTRACTS.TodoList.abi,
      this.signer
    )
  }

  // 检查是否已连接
  isConnected() {
    return this.account !== null && this.signer !== null
  }

  // 获取账户地址
  getAccount() {
    return this.account
  }

  // ======= TodoList 合约方法 =======
  // 获取所有待办事项
  async getTodoList() {
    try {
      if (!this.todoListContract) throw new Error('合约未初始化')
      const todoList = await this.todoListContract.getTodos()
      return {
        success: true,
        todoList: todoList
      }
    } catch (error) {
      console.error('获取待办事项失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 添加待办事项
  async addTodo(task) {
    try {
      if (!this.todoListContract) throw new Error('合约未初始化')
      const tx = await this.todoListContract.addTodo(task)
      await tx.wait()
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('添加待办事项失败:', error)
      return {  
        success: false,
        error: error.message
      }
    }
  }

  // 完成待办事项
  async completeTodo(index) {
    try {
      if (!this.todoListContract) throw new Error('合约未初始化')
      const tx = await this.todoListContract.completeTodo(index)
      await tx.wait()
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('完成待办事项失败:', error)
      return {  
        success: false,
        error: error.message
      }
    }
  }

  // 切换待办事项状态（实际上只能从未完成变为完成）
  async toggleTodo(index) {
    return await this.completeTodo(index)
  }
  

  // ======= Counter 合约方法 =======
  
  // 获取当前计数
  async getCount() {
    try {
      if (!this.counterContract) throw new Error('合约未初始化')
      const count = await this.counterContract.getCount()
      return {
        success: true,
        count: Number(count)
      }
    } catch (error) {
      console.error('获取计数失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 增加计数
  async increment() {
    try {
      if (!this.counterContract) throw new Error('合约未初始化')
      const tx = await this.counterContract.increment()
      await tx.wait()
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('增加计数失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 减少计数
  async decrement() {
    try {
      if (!this.counterContract) throw new Error('合约未初始化')
      const tx = await this.counterContract.decrement()
      await tx.wait()
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('减少计数失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 重置计数
  async resetCount() {
    try {
      if (!this.counterContract) throw new Error('合约未初始化')
      const tx = await this.counterContract.reset()
      await tx.wait()
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('重置计数失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取合约拥有者
  async getCounterOwner() {
    try {
      if (!this.counterContract) throw new Error('合约未初始化')
      const owner = await this.counterContract.getOwner()
      return {
        success: true,
        owner: owner
      }
    } catch (error) {
      console.error('获取拥有者失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ======= Greeting 合约方法 =======

  // 获取问候语
  async getGreeting() {
    try {
      if (!this.greetingContract) throw new Error('合约未初始化')
      const greeting = await this.greetingContract.getGreeting()
      return {
        success: true,
        greeting: greeting
      }
    } catch (error) {
      console.error('获取问候语失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取完整问候语
  async getFullGreeting() {
    try {
      if (!this.greetingContract) throw new Error('合约未初始化')
      const fullGreeting = await this.greetingContract.getFullGreeting()
      return {
        success: true,
        fullGreeting: fullGreeting
      }
    } catch (error) {
      console.error('获取完整问候语失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 设置问候语
  async setGreeting(newGreeting) {
    try {
      if (!this.greetingContract) throw new Error('合约未初始化')
      const tx = await this.greetingContract.setGreeting(newGreeting)
      await tx.wait()
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('设置问候语失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取更改次数
  async getChangeCount() {
    try {
      if (!this.greetingContract) throw new Error('合约未初始化')
      const changeCount = await this.greetingContract.getChangeCount()
      return {
        success: true,
        changeCount: Number(changeCount)
      }
    } catch (error) {
      console.error('获取更改次数失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 重置问候语
  async resetGreeting() {
    try {
      if (!this.greetingContract) throw new Error('合约未初始化')
      const tx = await this.greetingContract.resetGreeting()
      await tx.wait()
      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error) {
      console.error('重置问候语失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 获取Greeting合约拥有者
  async getGreetingOwner() {
    try {
      if (!this.greetingContract) throw new Error('合约未初始化')
      const owner = await this.greetingContract.owner()
      return {
        success: true,
        owner: owner
      }
    } catch (error) {
      console.error('获取拥有者失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 监听事件
  setupEventListeners(callbacks) {
    if (this.counterContract && callbacks.onCountChanged) {
      this.counterContract.on('CountIncreased', (newCount) => {
        callbacks.onCountChanged('increased', Number(newCount))
      })
      this.counterContract.on('CountDecreased', (newCount) => {
        callbacks.onCountChanged('decreased', Number(newCount))
      })
      this.counterContract.on('CountReset', (newCount) => {
        callbacks.onCountChanged('reset', Number(newCount))
      })
    }

    if (this.greetingContract && callbacks.onGreetingChanged) {
      this.greetingContract.on('GreetingChanged', (newGreeting, changedBy) => {
        callbacks.onGreetingChanged(newGreeting, changedBy)
      })
    }
  }

  // 移除事件监听
  removeEventListeners() {
    if (this.counterContract) {
      this.counterContract.removeAllListeners()
    }
    if (this.greetingContract) {
      this.greetingContract.removeAllListeners()
    }
  }
}

// 导出单例实例
export default new Web3Service() 