<template>
  <div class="counter-contract">
    <!-- 钱包连接组件 -->
    <WalletConnect @wallet-connected="onWalletConnected" @wallet-disconnected="onWalletDisconnected" />
    
    <!-- 合约信息卡片 -->
    <el-card class="contract-info-card">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>Counter 计数器合约</span>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="合约地址">
          <el-text type="primary" truncated>{{ contracts.Counter.address }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="当前计数">
          <el-tag type="primary" size="large">{{ counterData.count }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="合约拥有者">
          <el-text type="info" truncated>{{ counterData.owner }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="数据来源">
          <el-tag :type="isConnected ? 'success' : 'warning'" size="small">
            {{ isConnected ? '🔗 钱包直连' : '📡 后端API服务' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>合约操作</span>
        </div>
      </template>
      
      <div v-if="isConnected" class="wallet-operations">
        <el-space direction="vertical" size="large" style="width: 100%">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-button 
                type="success" 
                @click="incrementCounter" 
                :loading="loading === 'increment'"
                icon="Plus"
                size="large"
                style="width: 100%"
              >
                {{ loading === 'increment' ? '处理中...' : '+1 增加' }}
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button 
                type="warning" 
                @click="decrementCounter" 
                :loading="loading === 'decrement'"
                icon="Minus"
                size="large"
                style="width: 100%"
              >
                {{ loading === 'decrement' ? '处理中...' : '-1 减少' }}
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button 
                type="danger" 
                @click="resetCounter" 
                :loading="loading === 'reset'"
                icon="RefreshLeft"
                size="large"
                style="width: 100%"
              >
                {{ loading === 'reset' ? '处理中...' : '🔄 重置' }}
              </el-button>
            </el-col>
          </el-row>
          
          <el-button 
            type="primary" 
            @click="refreshCounterData" 
            :loading="loading === 'refresh'"
            icon="Refresh"
            size="large"
            style="width: 100%"
            plain
          >
            {{ loading === 'refresh' ? '刷新中...' : '🔄 刷新数据' }}
          </el-button>
        </el-space>
      </div>
      
      <div v-else class="no-wallet-operations">
        <el-alert
          title="未连接钱包"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            连接钱包后可进行交易操作，当前显示的是从后端API获取的数据。
          </template>
        </el-alert>
        
        <el-button 
          type="primary" 
          @click="refreshDataFromBackend" 
          :loading="loading === 'refreshBackend'"
          icon="Refresh"
          size="large"
          style="width: 100%; margin-top: 16px"
          plain
        >
          {{ loading === 'refreshBackend' ? '刷新中...' : '🔄 刷新数据' }}
        </el-button>
      </div>
    </el-card>

    <!-- 事件日志 -->
    <el-card v-if="isConnected || eventLogs.length > 0" class="event-logs-card">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>事件日志</span>
        </div>
      </template>
      
      <div v-if="eventLogs.length === 0" class="no-events">
        <el-empty description="暂无事件记录" />
      </div>
      <div v-else>
        <el-timeline>
          <el-timeline-item
            v-for="(log, index) in eventLogs"
            :key="index"
            :timestamp="log.time"
            :type="getEventType(log.type)"
          >
            {{ log.message }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>


  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { DataAnalysis, Setting, Document, Plus, Minus, RefreshLeft, Refresh } from '@element-plus/icons-vue'
import WalletConnect from '../components/WalletConnect.vue'
import web3Service from '../services/web3Service.js'
import { CONTRACTS } from '../contracts/index.js'

export default {
  name: 'CounterContract',
  components: {
    WalletConnect,
    DataAnalysis,
    Setting,
    Document,
    Plus,
    Minus,
    RefreshLeft,
    Refresh
  },
  setup() {
    const isConnected = ref(false)
    const loading = ref(null)
    const backendUrl = ref('http://localhost:3001')
    
    const contracts = reactive(CONTRACTS)
    const counterData = reactive({
      count: 0,
      owner: ''
    })
    const eventLogs = ref([])

    // 钱包连接事件
    const onWalletConnected = async (account) => {
      isConnected.value = true
      await loadContractDataFromWallet()
      setupEventListeners()
    }

    const onWalletDisconnected = () => {
      isConnected.value = false
      web3Service.removeEventListeners()
      fetchDataFromBackend()
    }

    // 从后端API获取合约数据
    const fetchDataFromBackend = async () => {
      try {
        const response = await fetch(`${backendUrl.value}/api/contracts`)
        const result = await response.json()
        
        if (result.success && result.data && result.data.counter) {
          counterData.count = result.data.counter.count
          counterData.owner = result.data.counter.owner
          return true
        }
        return false
      } catch (err) {
        console.error('从后端获取数据失败:', err)
        return false
      }
    }

    // 刷新后端数据
    const refreshDataFromBackend = async () => {
      loading.value = 'refreshBackend'
      const success = await fetchDataFromBackend()
      if (success) {
        ElMessage.success('数据刷新成功！')
      } else {
        ElMessage.error('数据刷新失败')
      }
      loading.value = null
    }

    // 从钱包加载合约数据
    const loadContractDataFromWallet = async () => {
      await refreshCounterData()
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

    // Counter 操作
    const incrementCounter = async () => {
      loading.value = 'increment'
      
      const result = await web3Service.increment()
      
      if (result.success) {
        ElMessage.success('计数增加成功！')
        addEventLog('增加计数', 'increment')
      } else {
        ElMessage.error(result.error)
      }
      
      loading.value = null
    }

    const decrementCounter = async () => {
      loading.value = 'decrement'
      
      const result = await web3Service.decrement()
      
      if (result.success) {
        ElMessage.success('计数减少成功！')
        addEventLog('减少计数', 'decrement')
      } else {
        ElMessage.error(result.error)
      }
      
      loading.value = null
    }

    const resetCounter = async () => {
      loading.value = 'reset'
      
      const result = await web3Service.resetCount()
      
      if (result.success) {
        ElMessage.success('计数重置成功！')
        addEventLog('重置计数', 'reset')
      } else {
        ElMessage.error(result.error)
      }
      
      loading.value = null
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

    // 获取事件类型
    const getEventType = (type) => {
      const typeMap = {
        increment: 'success',
        decrement: 'warning',
        reset: 'danger',
        increased: 'success',
        decreased: 'warning'
      }
      return typeMap[type] || 'primary'
    }

    // 设置事件监听
    const setupEventListeners = () => {
      web3Service.setupEventListeners({
        onCountChanged: (action, newCount) => {
          counterData.count = newCount
          addEventLog(`计数器${action === 'increased' ? '增加' : action === 'decreased' ? '减少' : '重置'}到: ${newCount}`, action)
        }
      })
    }

    // 组件挂载时初始化
    onMounted(async () => {
      if (web3Service.isConnected()) {
        isConnected.value = true
        await loadContractDataFromWallet()
        setupEventListeners()
      } else {
        await fetchDataFromBackend()
      }
    })

    // 组件卸载时清理事件监听
    onUnmounted(() => {
      web3Service.removeEventListeners()
    })

    return {
      isConnected,
      loading,
      contracts,
      counterData,
      eventLogs,
      onWalletConnected,
      onWalletDisconnected,
      refreshCounterData,
      incrementCounter,
      decrementCounter,
      resetCounter,
      refreshDataFromBackend,
      getEventType
    }
  }
}
</script>

<style scoped>
.counter-contract {
  max-width: 1200px;
  margin: 0 auto;
}

.contract-info-card,
.operation-card,
.event-logs-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.no-events {
  text-align: center;
  padding: 20px;
}
</style> 