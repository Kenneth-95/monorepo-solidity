<template>
  <div class="greeting-contract">
    <!-- 钱包连接组件 -->
    <WalletConnect @wallet-connected="onWalletConnected" @wallet-disconnected="onWalletDisconnected" />
    
    <!-- 合约信息卡片 -->
    <el-card class="contract-info-card">
      <template #header>
        <div class="card-header">
          <el-icon><ChatRound /></el-icon>
          <span>Greeting 问候语合约</span>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="合约地址">
          <el-text type="primary" truncated>{{ contracts.Greeting.address }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="当前问候语">
          <el-tag type="primary" size="large">"{{ greetingData.greeting }}"</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="完整问候语" :span="2">
          <el-text type="success" size="large">"{{ greetingData.fullGreeting }}"</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="更改次数">
          <el-tag type="warning" size="large">{{ greetingData.changeCount }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="合约拥有者">
          <el-text type="info" truncated>{{ greetingData.owner }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="数据来源" :span="2">
          <el-tag :type="isConnected ? 'success' : 'warning'" size="small">
            {{ isConnected ? '🔗 钱包直连' : '📡 后端API服务' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 设置问候语 -->
    <el-card v-if="isConnected" class="set-greeting-card">
      <template #header>
        <div class="card-header">
          <el-icon><Edit /></el-icon>
          <span>设置问候语</span>
        </div>
      </template>
      
      <el-space direction="vertical" size="large" style="width: 100%">
        <el-input
          v-model="newGreeting"
          placeholder="输入新的问候语"
          size="large"
          maxlength="50"
          show-word-limit
          @keyup.enter="setGreeting"
        >
          <template #prepend>问候语</template>
        </el-input>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-button 
              type="primary" 
              @click="setGreeting" 
              :loading="loading === 'setGreeting'"
              :disabled="!newGreeting.trim()"
              icon="Check"
              size="large"
              style="width: 100%"
            >
              {{ loading === 'setGreeting' ? '设置中...' : '设置问候语' }}
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-button 
              type="warning" 
              @click="resetGreeting" 
              :loading="loading === 'resetGreeting'"
              icon="RefreshLeft"
              size="large"
              style="width: 100%"
              plain
            >
              {{ loading === 'resetGreeting' ? '重置中...' : '重置问候语' }}
            </el-button>
          </el-col>
        </el-row>
      </el-space>
    </el-card>

    <!-- 预设问候语 -->
    <el-card v-if="isConnected" class="preset-greetings-card">
      <template #header>
        <div class="card-header">
          <el-icon><Star /></el-icon>
          <span>预设问候语</span>
        </div>
      </template>
      
      <el-space wrap>
        <el-tag 
          v-for="preset in presetGreetings"
          :key="preset"
          @click="selectPreset(preset)"
          :class="{ 'preset-selected': newGreeting === preset }"
          class="preset-tag"
          size="large"
          effect="plain"
        >
          {{ preset }}
        </el-tag>
      </el-space>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>操作</span>
        </div>
      </template>
      
      <div v-if="isConnected" class="wallet-operations">
        <el-button 
          type="primary" 
          @click="refreshGreetingData" 
          :loading="loading === 'refreshGreeting'"
          icon="Refresh"
          size="large"
          style="width: 100%"
          plain
        >
          {{ loading === 'refreshGreeting' ? '刷新中...' : '🔄 刷新数据' }}
        </el-button>
      </div>
      
      <div v-else class="no-wallet-operations">
        <el-alert
          title="未连接钱包"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            连接钱包后可设置和重置问候语，当前显示的是从后端API获取的数据。
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

    <!-- 问候语历史 -->
    <el-card v-if="isConnected || eventLogs.length > 0" class="history-card">
      <template #header>
        <div class="card-header">
          <el-icon><Clock /></el-icon>
          <span>变更历史</span>
        </div>
      </template>
      
      <div v-if="eventLogs.length === 0" class="no-history">
        <el-empty description="暂无变更记录" />
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

    <!-- 统计信息 -->
    <el-card v-if="greetingData.changeCount > 0" class="stats-card">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计信息</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-statistic 
            title="总更改次数" 
            :value="greetingData.changeCount" 
            prefix="🔄"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic 
            title="当前问候语长度" 
            :value="greetingData.greeting.length" 
            suffix="字符"
            prefix="📝"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic 
            title="本次会话操作" 
            :value="sessionOperations" 
            prefix="⚡"
            value-style="color: #67c23a"
          />
        </el-col>
      </el-row>
    </el-card>


  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  ChatRound, 
  Edit, 
  Star, 
  Setting, 
  Clock, 
  DataAnalysis,
  Check,
  RefreshLeft,
  Refresh
} from '@element-plus/icons-vue'
import WalletConnect from '../components/WalletConnect.vue'
import web3Service from '../services/web3Service.js'
import { CONTRACTS } from '../contracts/index.js'

export default {
  name: 'GreetingContract',
  components: {
    WalletConnect,
    ChatRound,
    Edit,
    Star,
    Setting,
    Clock,
    DataAnalysis,
    Check,
    RefreshLeft,
    Refresh
  },
  setup() {
    const isConnected = ref(false)
    const loading = ref(null)
    const newGreeting = ref('')
    const sessionOperations = ref(0)
    const backendUrl = ref('http://localhost:3001')
    
    const contracts = reactive(CONTRACTS)
    const greetingData = reactive({
      greeting: '',
      fullGreeting: '',
      changeCount: 0,
      owner: ''
    })
    const eventLogs = ref([])

    // 预设问候语
    const presetGreetings = [
      'Hello World',
      '你好世界',
      'Bonjour le monde',
      'Hola Mundo',
      'こんにちは世界',
      'Hallo Welt',
      'Привет мир',
      'مرحبا بالعالم'
    ]

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

    // 选择预设问候语
    const selectPreset = (preset) => {
      newGreeting.value = preset
    }

    // 从后端API获取合约数据
    const fetchDataFromBackend = async () => {
      try {
        const response = await fetch(`${backendUrl.value}/api/contracts`)
        const result = await response.json()
        
        if (result.success && result.data && result.data.greeting) {
          const data = result.data.greeting
          greetingData.greeting = data.greeting
          greetingData.fullGreeting = data.fullGreeting
          greetingData.changeCount = data.changeCount
          greetingData.owner = data.owner
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
      await refreshGreetingData()
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

    // 设置问候语
    const setGreeting = async () => {
      if (!newGreeting.value.trim()) return
      
      loading.value = 'setGreeting'
      
      const result = await web3Service.setGreeting(newGreeting.value.trim())
      
      if (result.success) {
        ElMessage.success('问候语设置成功！')
        addEventLog(`设置问候语: "${newGreeting.value}"`, 'setGreeting')
        newGreeting.value = ''
        sessionOperations.value++
      } else {
        ElMessage.error(result.error)
      }
      
      loading.value = null
    }

    // 重置问候语
    const resetGreeting = async () => {
      loading.value = 'resetGreeting'
      
      const result = await web3Service.resetGreeting()
      
      if (result.success) {
        ElMessage.success('问候语重置成功！')
        addEventLog('重置问候语', 'resetGreeting')
        sessionOperations.value++
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
        setGreeting: 'primary',
        resetGreeting: 'warning',
        greetingChanged: 'success'
      }
      return typeMap[type] || 'primary'
    }

    // 设置事件监听
    const setupEventListeners = () => {
      web3Service.setupEventListeners({
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
      newGreeting,
      sessionOperations,
      contracts,
      greetingData,
      eventLogs,
      presetGreetings,
      onWalletConnected,
      onWalletDisconnected,
      selectPreset,
      refreshGreetingData,
      setGreeting,
      resetGreeting,
      refreshDataFromBackend,
      getEventType
    }
  }
}
</script>

<style scoped>
.greeting-contract {
  max-width: 1200px;
  margin: 0 auto;
}

.contract-info-card,
.set-greeting-card,
.preset-greetings-card,
.operation-card,
.history-card,
.stats-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.preset-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-tag:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.preset-selected {
  background-color: #409eff !important;
  color: white !important;
  border-color: #409eff !important;
}

.no-history {
  text-align: center;
  padding: 20px;
}
</style> 