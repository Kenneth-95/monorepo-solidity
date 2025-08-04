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
    // 添加交易锁机制
    this.pendingTransactions = new Map()
    this.pendingReads = new Map()
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
      
      // 防止重复读取
      const readKey = 'getTodoList'
      if (this.pendingReads.has(readKey)) {
        console.log('正在获取待办事项列表，请等待...')
        return await this.pendingReads.get(readKey)
      }

      // 创建读取Promise
      const readPromise = this._executeTodoListRead()
      this.pendingReads.set(readKey, readPromise)
      
      try {
        const result = await readPromise
        return result
      } finally {
        this.pendingReads.delete(readKey)
      }
    } catch (error) {
      console.error('获取待办事项失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 内部执行读取逻辑
  async _executeTodoListRead() {
    // 检查是否需要完成默认待办事项
    if (await this.todoListContract.shouldCompleteDefaultTodo()) {
      const txKey = 'checkAndCompleteDefaultTodo'
      
      // 如果已有相同交易正在进行，等待它完成
      if (this.pendingTransactions.has(txKey)) {
        console.log('正在等待完成默认待办事项交易...')
        await this.pendingTransactions.get(txKey)
      } else {
        // 发起新的交易
        const txPromise = this._executeDefaultTodoCompletion()
        this.pendingTransactions.set(txKey, txPromise)
        
        try {
          await txPromise
        } catch (error) {
          console.error('完成默认待办事项失败:', error)
        } finally {
          this.pendingTransactions.delete(txKey)
        }
      }
    }
    
    const todoList = await this.todoListContract.getTodos()
    return {
      success: true,
      todoList: todoList
    }
  }

  // 执行默认待办事项完成交易
  async _executeDefaultTodoCompletion() {
    const tx = await this.todoListContract.checkAndCompleteDefaultTodo()
    await tx.wait()
    console.log('默认待办事项已完成')
    return tx
  }

  // 添加待办事项
  async addTodo(task) {
    try {
      if (!this.todoListContract) throw new Error('合约未初始化')
      
      const txKey = `addTodo_${task}`
      
      // 检查是否已有相同的添加操作正在进行
      if (this.pendingTransactions.has(txKey)) {
        console.log('相同的添加操作正在进行中，请等待...')
        return {
          success: false,
          error: '相同的添加操作正在进行中，请等待完成'
        }
      }

      const txPromise = this._executeAddTodo(task)
      this.pendingTransactions.set(txKey, txPromise)
      
      try {
        const result = await txPromise
        return result
      } finally {
        this.pendingTransactions.delete(txKey)
      }
    } catch (error) {
      console.error('添加待办事项失败:', error)
      return {  
        success: false,
        error: error.message
      }
    }
  }

  // 内部执行添加待办事项
  async _executeAddTodo(task) {
    const tx = await this.todoListContract.addTodo(task)
    await tx.wait()
    return {
      success: true,
      txHash: tx.hash
    }
  }

  // 完成待办事项
  async completeTodo(index) {
    try {
      if (!this.todoListContract) throw new Error('合约未初始化')
      
      const txKey = `completeTodo_${index}`
      
      // 检查是否已有相同的完成操作正在进行
      if (this.pendingTransactions.has(txKey)) {
        console.log('相同的完成操作正在进行中，请等待...')
        return {
          success: false,
          error: '相同的完成操作正在进行中，请等待完成'
        }
      }

      const txPromise = this._executeCompleteTodo(index)
      this.pendingTransactions.set(txKey, txPromise)
      
      try {
        const result = await txPromise
        return result
      } finally {
        this.pendingTransactions.delete(txKey)
      }
    } catch (error) {
      console.error('完成待办事项失败:', error)
      return {  
        success: false,
        error: error.message
      }
    }
  }

  // 内部执行完成待办事项
  async _executeCompleteTodo(index) {
    const tx = await this.todoListContract.completeTodo(index)
    await tx.wait()
    return {
      success: true,
      txHash: tx.hash
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
    console.log(count,'conunee')
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

  // ======= 交易状态管理方法 =======
  
  // 检查特定交易是否正在进行
  isTransactionPending(txKey) {
    return this.pendingTransactions.has(txKey)
  }

  // 检查是否有任何交易正在进行
  hasAnyPendingTransaction() {
    return this.pendingTransactions.size > 0
  }

  // 检查读取操作是否正在进行
  isReadPending(readKey) {
    return this.pendingReads.has(readKey)
  }

  // 获取所有正在进行的交易键名
  getPendingTransactionKeys() {
    return Array.from(this.pendingTransactions.keys())
  }

  // 等待特定交易完成
  async waitForTransaction(txKey) {
    if (this.pendingTransactions.has(txKey)) {
      await this.pendingTransactions.get(txKey)
    }
  }

  // 清除所有待处理状态（用于错误恢复）
  clearAllPendingStates() {
    this.pendingTransactions.clear()
    this.pendingReads.clear()
  }
}

// 导出单例实例
export default new Web3Service() 