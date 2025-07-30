<template>
  <div class="contract-demo">
    <!-- 头部 -->
    <div class="header">
      <h1>智能合约交互Demo</h1>
      <p class="subtitle">使用Vue3 + ethers.js与智能合约交互</p>
    </div>

    <!-- 钱包连接状态 -->
    <div class="wallet-section">
      <div v-if="!isConnected" class="connect-wallet">
        <h2>🔗 连接钱包</h2>
        <button @click="connectWallet" class="connect-btn" :disabled="connecting">
          {{ connecting ? '连接中...' : '连接MetaMask钱包' }}
        </button>
        <p class="tip">请确保已安装MetaMask并切换到正确的网络</p>
        <p class="tip">💡 不连接钱包也可以查看合约数据</p>
      </div>
      
      <div v-else class="wallet-info">
        <h2>✅ 钱包已连接</h2>
        <p><strong>账户地址:</strong> {{ currentAccount }}</p>
        <button @click="disconnectWallet" class="disconnect-btn">断开连接</button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      ❌ {{ error }}
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-message">
      ✅ {{ successMessage }}
    </div>

    <!-- 无钱包数据展示区域 -->
    <div v-if="!isConnected" class="no-wallet-section">
      <div class="info-banner">
        <h2>📊 合约数据预览（无需钱包）</h2>
        <p>以下数据来自后端服务，实时同步区块链状态</p>
        <p class="tip">💡 连接钱包后可进行交易操作</p>
      </div>
    </div>

    <!-- 合约数据展示区域（始终显示） -->
    <div class="contracts-section">
      
      <!-- Counter 合约 -->
      <div class="contract-card">
        <h2>🔢 Counter 计数器合约</h2>
        <div class="contract-info">
          <p><strong>合约地址:</strong> {{ contracts.Counter.address }}</p>
          <p><strong>当前计数:</strong> {{ counterData.count }}</p>
          <p><strong>合约拥有者:</strong> {{ counterData.owner }}</p>
          <p v-if="!isConnected" class="data-source">📡 数据来源: 后端API服务</p>
          <p v-else class="data-source">🔗 数据来源: 钱包直连</p>
        </div>
        
        <div class="contract-actions">
          <!-- 钱包连接时显示操作按钮 -->
          <div v-if="isConnected" class="wallet-actions">
            <button @click="incrementCounter" :disabled="loading" class="action-btn increment">
              {{ loading === 'increment' ? '处理中...' : '+1 增加' }}
            </button>
            
            <button @click="decrementCounter" :disabled="loading" class="action-btn decrement">
              {{ loading === 'decrement' ? '处理中...' : '-1 减少' }}
            </button>
            
            <button @click="resetCounter" :disabled="loading" class="action-btn reset">
              {{ loading === 'reset' ? '处理中...' : '🔄 重置' }}
            </button>
            
            <button @click="refreshCounterData" :disabled="loading" class="action-btn refresh">
              {{ loading === 'refresh' ? '刷新中...' : '🔄 刷新数据' }}
            </button>
          </div>
          
          <!-- 未连接钱包时显示提示和刷新按钮 -->
          <div v-else class="no-wallet-actions">
            <p class="wallet-tip">🔗 连接钱包后可进行交易操作</p>
            <button @click="refreshDataFromBackend" :disabled="loading" class="action-btn refresh">
              {{ loading === 'refreshBackend' ? '刷新中...' : '🔄 刷新数据' }}
            </button>
          </div>
        </div>
      </div>
      <!-- TodoList 合约 -->
      <div class="contract-card">
        <h2>🔢 TodoList 待办事项合约</h2>
        <div class="contract-info">
          <p><strong>合约地址:</strong> {{ contracts.TodoList.address }}</p>
        </div>
        <div>
          <button @click="getTodoList">获取列表</button>

          <div>
            <input 
                v-model="newTodo" 
                type="text" 
                placeholder="输入todo"
              />
              <button @click="addTodo">添加</button>
          </div>
        </div>
      </div>

      <!-- Greeting 合约 -->
      <div class="contract-card">
        <h2>👋 Greeting 问候语合约</h2>
        <div class="contract-info">
          <p><strong>合约地址:</strong> {{ contracts.Greeting.address }}</p>
          <p><strong>当前问候语:</strong> "{{ greetingData.greeting }}"</p>
          <p><strong>完整问候语:</strong> "{{ greetingData.fullGreeting }}"</p>
          <p><strong>更改次数:</strong> {{ greetingData.changeCount }}</p>
          <p><strong>合约拥有者:</strong> {{ greetingData.owner }}</p>
          <p v-if="!isConnected" class="data-source">📡 数据来源: 后端API服务</p>
          <p v-else class="data-source">🔗 数据来源: 钱包直连</p>
        </div>
        
        <div class="contract-actions">
          <!-- 钱包连接时显示操作按钮 -->
          <div v-if="isConnected" class="wallet-actions">
            <div class="input-group">
              <input 
                v-model="newGreeting" 
                type="text" 
                placeholder="输入新的问候语"
                class="greeting-input"
              />
              <button @click="setGreeting" :disabled="loading || !newGreeting" class="action-btn set">
                {{ loading === 'setGreeting' ? '设置中...' : '设置问候语' }}
              </button>
            </div>
            
            <button @click="resetGreeting" :disabled="loading" class="action-btn reset">
              {{ loading === 'resetGreeting' ? '重置中...' : '🔄 重置问候语' }}
            </button>
            
            <button @click="refreshGreetingData" :disabled="loading" class="action-btn refresh">
              {{ loading === 'refreshGreeting' ? '刷新中...' : '🔄 刷新数据' }}
            </button>
          </div>
          
          <!-- 未连接钱包时显示提示和刷新按钮 -->
          <div v-else class="no-wallet-actions">
            <p class="wallet-tip">🔗 连接钱包后可进行交易操作</p>
            <button @click="refreshDataFromBackend" :disabled="loading" class="action-btn refresh">
              {{ loading === 'refreshBackend' ? '刷新中...' : '🔄 刷新数据' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 事件日志 -->
      <div v-if="isConnected || eventLogs.length > 0" class="contract-card">
        <h2>📜 事件日志</h2>
        <div class="event-logs">
          <div v-if="eventLogs.length === 0" class="no-events">
            暂无事件记录
          </div>
          <div v-else>
            <div v-for="(log, index) in eventLogs" :key="index" class="event-item">
              <span class="event-time">{{ log.time }}</span>
              <span class="event-type" :class="log.type">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 后端服务状态（未连接钱包时显示） -->
      <div v-if="!isConnected" class="contract-card">
        <h2>🌐 后端服务状态</h2>
        <div class="contract-info">
          <p><strong>服务地址:</strong> {{ backendUrl }}</p>
          <p><strong>连接状态:</strong> 
            <span :class="backendStatus.connected ? 'status-success' : 'status-error'">
              {{ backendStatus.connected ? '✅ 已连接' : '❌ 连接失败' }}
            </span>
          </p>
          <p v-if="backendStatus.lastSync"><strong>最后同步:</strong> {{ formatTime(backendStatus.lastSync) }}</p>
          <p v-if="backendStatus.error" class="error-text">错误: {{ backendStatus.error }}</p>
        </div>
        
        <div class="contract-actions">
          <button @click="checkBackendStatus" :disabled="loading" class="action-btn refresh">
            {{ loading === 'checkStatus' ? '检查中...' : '🔍 检查状态' }}
          </button>
          <button @click="forceSyncBackend" :disabled="loading" class="action-btn sync">
            {{ loading === 'forceSync' ? '同步中...' : '⚡ 强制同步' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import web3Service from '../services/web3Service.js'
import { CONTRACTS } from '../contracts/index.js'

export default {
  name: 'ContractDemo',
  setup() {
    // 响应式数据
    const isConnected = ref(false)
    const connecting = ref(false)
    const currentAccount = ref('')
    const loading = ref(null)
    const error = ref('')
    const successMessage = ref('')
    const newGreeting = ref('')
    const newTodo = ref('')
    const todoList = ref([])
    
    // 后端服务相关
    const backendUrl = ref('http://localhost:3001')
    const backendStatus = reactive({
      connected: false,
      lastSync: null,
      error: null
    })
    
    const contracts = reactive(CONTRACTS)
    
    const counterData = reactive({
      count: 0,
      owner: ''
    })
    
    const greetingData = reactive({
      greeting: '',
      fullGreeting: '',
      changeCount: 0,
      owner: ''
    })
    
    const eventLogs = ref([])

    const getTodoList = async () => {
      const result = await web3Service.getTodoList()
      console.log(result)
      if (result.success) {
        todoList.value = result.todoList.map(item => {
          console.log(typeof item,item[0],'dsad')
          return {
            content: item.content,
            isCompleted: item.isCompleted
          }
        })
        console.log(todoList.value)
      }
    }
    const addTodo = async () => {
      console.log(newTodo.value)
      const result = await web3Service.addTodo(newTodo.value)
      console.log(result)
      if (result.success) {
        newTodo.value = ''
        getTodoList()
      }
    }

    // 从后端API获取合约数据
    const fetchDataFromBackend = async () => {
      try {
        const response = await fetch(`${backendUrl.value}/api/contracts`)
        const result = await response.json()
        
        if (result.success && result.data) {
          // 更新Counter数据
          if (result.data.counter) {
            counterData.count = result.data.counter.count
            counterData.owner = result.data.counter.owner
          }
          
          // 更新Greeting数据
          if (result.data.greeting) {
            greetingData.greeting = result.data.greeting.greeting
            greetingData.fullGreeting = result.data.greeting.fullGreeting
            greetingData.changeCount = result.data.greeting.changeCount
            greetingData.owner = result.data.greeting.owner
          }
          
          // 更新后端状态
          backendStatus.connected = true
          backendStatus.lastSync = result.data.lastSync
          backendStatus.error = null
          
          return true
        } else {
          backendStatus.connected = false
          backendStatus.error = result.message || '获取数据失败'
          return false
        }
      } catch (err) {
        backendStatus.connected = false
        backendStatus.error = err.message
        console.error('从后端获取数据失败:', err)
        return false
      }
    }

    // 刷新后端数据
    const refreshDataFromBackend = async () => {
      loading.value = 'refreshBackend'
      const success = await fetchDataFromBackend()
      if (success) {
        successMessage.value = '数据刷新成功！'
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } else {
        error.value = '数据刷新失败：' + backendStatus.error
        setTimeout(() => {
          error.value = ''
        }, 5000)
      }
      loading.value = null
    }

    // 检查后端服务状态
    const checkBackendStatus = async () => {
      loading.value = 'checkStatus'
      try {
        const response = await fetch(`${backendUrl.value}/health`)
        const result = await response.json()
        
        if (result.success) {
          backendStatus.connected = true
          backendStatus.error = null
          successMessage.value = '后端服务运行正常！'
        } else {
          backendStatus.connected = false
          backendStatus.error = '服务异常'
          error.value = '后端服务异常'
        }
      } catch (err) {
        backendStatus.connected = false
        backendStatus.error = err.message
        error.value = '无法连接到后端服务'
      }
      
      setTimeout(() => {
        successMessage.value = ''
        error.value = ''
      }, 3000)
      loading.value = null
    }

    // 强制同步后端数据
    const forceSyncBackend = async () => {
      loading.value = 'forceSync'
      try {
        const response = await fetch(`${backendUrl.value}/api/contracts/sync`, {
          method: 'POST'
        })
        const result = await response.json()
        
        if (result.success) {
          // 更新本地数据
          if (result.data.counter) {
            counterData.count = result.data.counter.count
            counterData.owner = result.data.counter.owner
          }
          if (result.data.greeting) {
            greetingData.greeting = result.data.greeting.greeting
            greetingData.fullGreeting = result.data.greeting.fullGreeting
            greetingData.changeCount = result.data.greeting.changeCount
            greetingData.owner = result.data.greeting.owner
          }
          
          backendStatus.connected = true
          backendStatus.lastSync = result.data.lastSync
          backendStatus.error = null
          
          successMessage.value = '强制同步成功！'
        } else {
          error.value = '同步失败：' + result.message
        }
      } catch (err) {
        error.value = '同步请求失败：' + err.message
      }
      
      setTimeout(() => {
        successMessage.value = ''
        error.value = ''
      }, 3000)
      loading.value = null
    }

    // 连接钱包
    const connectWallet = async () => {
      connecting.value = true
      error.value = ''
      
      const result = await web3Service.connectWallet()
      
      if (result.success) {
        isConnected.value = true
        currentAccount.value = result.account
        successMessage.value = '钱包连接成功！'
        
        // 加载合约数据（从区块链直接读取）
        await loadContractDataFromWallet()
        
        // 设置事件监听
        setupEventListeners()
        
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } else {
        error.value = result.error
        setTimeout(() => {
          error.value = ''
        }, 5000)
      }
      
      connecting.value = false
    }

    // 断开钱包连接
    const disconnectWallet = () => {
      isConnected.value = false
      currentAccount.value = ''
      web3Service.removeEventListeners()
      successMessage.value = '已断开钱包连接'
      
      // 切换回后端数据
      fetchDataFromBackend()
      
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }

    // 从钱包加载合约数据
    const loadContractDataFromWallet = async () => {
      await Promise.all([
        refreshCounterData(),
        refreshGreetingData()
      ])
    }

    // 刷新Counter数据（从钱包）
    const refreshCounterData = async () => {
      loading.value = 'refresh'
      
      const [countResult, ownerResult] = await Promise.all([
        web3Service.getCount(),
        web3Service.getCounterOwner()
      ])
      
      if (countResult.success) {
        counterData.count = countResult.count
      }
      if (ownerResult.success) {
        counterData.owner = ownerResult.owner
      }
      
      loading.value = null
    }

    // 刷新Greeting数据（从钱包）
    const refreshGreetingData = async () => {
      loading.value = 'refreshGreeting'
      
      const [greetingResult, fullGreetingResult, changeCountResult, ownerResult] = await Promise.all([
        web3Service.getGreeting(),
        web3Service.getFullGreeting(),
        web3Service.getChangeCount(),
        web3Service.getGreetingOwner()
      ])
      
      if (greetingResult.success) {
        greetingData.greeting = greetingResult.greeting
      }
      if (fullGreetingResult.success) {
        greetingData.fullGreeting = fullGreetingResult.fullGreeting
      }
      if (changeCountResult.success) {
        greetingData.changeCount = changeCountResult.changeCount
      }
      if (ownerResult.success) {
        greetingData.owner = ownerResult.owner
      }
      
      loading.value = null
    }

    // Counter 操作
    const incrementCounter = async () => {
      loading.value = 'increment'
      error.value = ''
      
      const result = await web3Service.increment()
      
      if (result.success) {
        successMessage.value = '计数增加成功！'
        addEventLog('增加计数', 'increment')
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } else {
        error.value = result.error
        setTimeout(() => {
          error.value = ''
        }, 5000)
      }
      
      loading.value = null
    }

    const decrementCounter = async () => {
      loading.value = 'decrement'
      error.value = ''
      
      const result = await web3Service.decrement()
      
      if (result.success) {
        successMessage.value = '计数减少成功！'
        addEventLog('减少计数', 'decrement')
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } else {
        error.value = result.error
        setTimeout(() => {
          error.value = ''
        }, 5000)
      }
      
      loading.value = null
    }

    const resetCounter = async () => {
      loading.value = 'reset'
      error.value = ''
      
      const result = await web3Service.resetCount()
      
      if (result.success) {
        successMessage.value = '计数重置成功！'
        addEventLog('重置计数', 'reset')
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } else {
        error.value = result.error
        setTimeout(() => {
          error.value = ''
        }, 5000)
      }
      
      loading.value = null
    }

    // Greeting 操作
    const setGreeting = async () => {
      if (!newGreeting.value.trim()) return
      
      loading.value = 'setGreeting'
      error.value = ''
      
      const result = await web3Service.setGreeting(newGreeting.value.trim())
      
      if (result.success) {
        successMessage.value = '问候语设置成功！'
        addEventLog(`设置问候语: "${newGreeting.value}"`, 'setGreeting')
        newGreeting.value = ''
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } else {
        error.value = result.error
        setTimeout(() => {
          error.value = ''
        }, 5000)
      }
      
      loading.value = null
    }

    const resetGreeting = async () => {
      loading.value = 'resetGreeting'
      error.value = ''
      
      const result = await web3Service.resetGreeting()
      
      if (result.success) {
        successMessage.value = '问候语重置成功！'
        addEventLog('重置问候语', 'resetGreeting')
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } else {
        error.value = result.error
        setTimeout(() => {
          error.value = ''
        }, 5000)
      }
      
      loading.value = null
    }

    // 格式化时间
    const formatTime = (timeString) => {
      return new Date(timeString).toLocaleString()
    }

    // 添加事件日志
    const addEventLog = (message, type) => {
      eventLogs.value.unshift({
        time: new Date().toLocaleTimeString(),
        message,
        type
      })
      
      // 只保留最近20条记录
      if (eventLogs.value.length > 20) {
        eventLogs.value = eventLogs.value.slice(0, 20)
      }
    }

    // 设置事件监听
    const setupEventListeners = () => {
      web3Service.setupEventListeners({
        onCountChanged: (action, newCount) => {
          counterData.count = newCount
          addEventLog(`计数器${action === 'increased' ? '增加' : action === 'decreased' ? '减少' : '重置'}到: ${newCount}`, action)
        },
        onGreetingChanged: (newGreeting, changedBy) => {
          greetingData.greeting = newGreeting
          addEventLog(`问候语已更改为: "${newGreeting}"`, 'greetingChanged')
          // 同时更新其他相关数据
          setTimeout(() => {
            refreshGreetingData()
          }, 1000)
        }
      })
    }

    // 组件挂载时初始化
    onMounted(async () => {
      // 检查钱包连接状态
      if (web3Service.isConnected()) {
        isConnected.value = true
        currentAccount.value = web3Service.getAccount()
        await loadContractDataFromWallet()
        setupEventListeners()
      } else {
        // 未连接钱包时从后端获取数据
        await fetchDataFromBackend()
        
        // 设置定时刷新（未连接钱包时）
        const refreshInterval = setInterval(async () => {
          if (!isConnected.value) {
            await fetchDataFromBackend()
          }
        }, 30000) // 30秒刷新一次
        
        // 组件卸载时清理定时器
        onUnmounted(() => {
          clearInterval(refreshInterval)
        })
      }
    })

    // 组件卸载时清理事件监听
    onUnmounted(() => {
      web3Service.removeEventListeners()
    })

    return {
      // 状态
      isConnected,
      connecting,
      currentAccount,
      loading,
      error,
      successMessage,
      newGreeting,
      contracts,
      counterData,
      greetingData,
      eventLogs,
      backendUrl,
      backendStatus,
      todoList,
      newTodo,
      
      // 方法
      connectWallet,
      disconnectWallet,
      refreshCounterData,
      refreshGreetingData,
      incrementCounter,
      decrementCounter,
      resetCounter,
      setGreeting,
      resetGreeting,
      refreshDataFromBackend,
      checkBackendStatus,
      forceSyncBackend,
      formatTime,
      getTodoList,
      addTodo
    }
  }
}
</script>

<style scoped>
.contract-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

.wallet-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
}

.connect-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.disconnect-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.wallet-info p {
  margin: 10px 0;
  word-break: break-all;
}

.tip {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
}

.no-wallet-section {
  margin-bottom: 30px;
}

.info-banner {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 1px solid #2196f3;
  border-radius: 12px;
  padding: 25px;
  text-align: center;
}

.info-banner h2 {
  color: #1976d2;
  margin-bottom: 15px;
}

.info-banner p {
  color: #666;
  margin: 8px 0;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.success-message {
  background: #efe;
  border: 1px solid #cfc;
  color: #3c3;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.contracts-section {
  display: grid;
  gap: 30px;
}

.contract-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.contract-card h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 24px;
}

.contract-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.contract-info p {
  margin: 8px 0;
  word-break: break-all;
}

.data-source {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.contract-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.wallet-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.no-wallet-actions {
  width: 100%;
  text-align: center;
}

.wallet-tip {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 120px;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.increment {
  background: #28a745;
  color: white;
}

.decrement {
  background: #ffc107;
  color: #212529;
}

.reset {
  background: #dc3545;
  color: white;
}

.refresh {
  background: #17a2b8;
  color: white;
}

.set {
  background: #007bff;
  color: white;
}

.sync {
  background: #6f42c1;
  color: white;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.input-group {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.greeting-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
  flex: 1;
}

.event-logs {
  max-height: 300px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.no-events {
  text-align: center;
  color: #666;
  font-style: italic;
}

.event-item {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  color: #666;
  font-size: 12px;
  min-width: 80px;
}

.event-type {
  font-size: 14px;
}

.event-type.increment {
  color: #28a745;
}

.event-type.decrement {
  color: #ffc107;
}

.event-type.reset {
  color: #dc3545;
}

.event-type.setGreeting,
.event-type.greetingChanged {
  color: #007bff;
}

.event-type.resetGreeting {
  color: #6f42c1;
}

.status-success {
  color: #28a745;
  font-weight: bold;
}

.status-error {
  color: #dc3545;
  font-weight: bold;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
}

@media (max-width: 768px) {
  .contract-demo {
    padding: 15px;
  }
  
  .contract-actions,
  .wallet-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .greeting-input {
    width: 100%;
  }
}
</style> 