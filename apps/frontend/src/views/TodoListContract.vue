<template>
  <div class="todolist-contract">
    <!-- 钱包连接组件 -->
    <WalletConnect @wallet-connected="onWalletConnected" @wallet-disconnected="onWalletDisconnected" />
    
    <!-- 交易状态提示 -->
    <el-card v-if="isConnected && pendingTransactions.length > 0" class="transaction-status-card">
      <template #header>
        <div class="card-header">
          <el-icon class="rotating"><Loading /></el-icon>
          <span>正在处理交易</span>
        </div>
      </template>
      <el-space direction="vertical" size="small" style="width: 100%">
        <div v-for="tx in pendingTransactions" :key="tx" class="transaction-item">
          <el-tag type="warning" size="small">
            <el-icon><Loading /></el-icon>
            {{ getTransactionDescription(tx) }}
          </el-tag>
        </div>
      </el-space>
    </el-card>
    
    <!-- 合约信息卡片 -->
    <el-card class="contract-info-card">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>TodoList 待办事项合约</span>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="合约地址">
          <el-text type="primary" truncated>{{ contracts.TodoList.address }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="待办事项总数">
          <el-tag type="primary" size="large">{{ todoList.length }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="已完成数量">
          <el-tag type="success" size="large">{{ completedCount }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="数据来源">
          <el-tag :type="isConnected ? 'success' : 'warning'" size="small">
            {{ isConnected ? '🔗 钱包直连' : '📡 后端API服务' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 添加待办事项 -->
    <el-card v-if="isConnected" class="add-todo-card">
      <template #header>
        <div class="card-header">
          <el-icon><Plus /></el-icon>
          <span>添加待办事项</span>
        </div>
      </template>
      
      <el-row :gutter="16">
        <el-col :span="18">
          <el-input
            ref="newTodoInput"
            v-model="newTodo"
            placeholder="输入待办事项内容"
            size="large"
            maxlength="100"
            show-word-limit
            @keyup.enter="addTodo"
          />
        </el-col>
        <el-col :span="6">
          <el-button 
            type="primary" 
            @click="addTodo" 
            :loading="loading === 'addTodo'"
            :disabled="!newTodo.trim()"
            icon="Plus"
            size="large"
            style="width: 100%"
          >
            {{ loading === 'addTodo' ? '添加中...' : '添加' }}
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 待办事项列表 -->
    <el-card class="todolist-card">
      <template #header>
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>待办事项列表</span>
          <el-button 
            type="primary" 
            @click="getTodoList" 
            :loading="loading === 'getTodoList'"
            icon="Refresh"
            size="small"
            plain
            style="margin-left: auto"
          >
            {{ loading === 'getTodoList' ? '刷新中...' : '刷新' }}
          </el-button>
        </div>
      </template>
      
      <div v-if="todoList.length === 0" class="no-todos">
        <el-empty description="暂无待办事项">
          <el-button v-if="isConnected" type="primary" @click="focusNewTodoInput">
            创建第一个待办事项
          </el-button>
        </el-empty>
      </div>
      <div v-else>
        <el-space direction="vertical" size="large" style="width: 100%">
          <div
            v-for="(todo, index) in todoList"
            :key="index"
            class="todo-item"
          >
            <el-card :class="{ 'completed': todo.isCompleted }" shadow="hover">
              <div class="todo-content">
                <el-checkbox 
                  v-if="isConnected"
                  v-model="todo.isCompleted"
                  @change="toggleTodo(index)"
                  :disabled="loading === `toggle-${index}`"
                  size="large"
                />
                <span v-else class="todo-checkbox-placeholder">
                  <el-icon v-if="todo.isCompleted" color="#67c23a"><Check /></el-icon>
                  <el-icon v-else color="#e4e7ed"><CircleCheck /></el-icon>
                </span>
                
                <span 
                  class="todo-text"
                  :class="{ 'completed-text': todo.isCompleted }"
                >
                  {{ todo.content }}
                </span>
                
                <el-tag 
                  :type="todo.isCompleted ? 'success' : 'info'" 
                  size="small"
                  class="todo-status"
                >
                  {{ todo.isCompleted ? '已完成' : '未完成' }}
                </el-tag>
              </div>
            </el-card>
          </div>
        </el-space>
      </div>
    </el-card>

    <!-- 统计信息 -->
    <el-card v-if="todoList.length > 0" class="stats-card">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计信息</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-statistic 
            title="总计" 
            :value="todoList.length" 
            prefix="📋"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic 
            title="已完成" 
            :value="completedCount" 
            prefix="✅"
            value-style="color: #67c23a"
          />
        </el-col>
        <el-col :span="8">
          <el-statistic 
            title="完成率" 
            :value="completionRate" 
            suffix="%" 
            prefix="📊"
            :precision="1"
            value-style="color: #409eff"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- 未连接钱包提示 -->
    <el-card v-if="!isConnected" class="no-wallet-card">
      <el-alert
        title="功能受限"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          未连接钱包时仅可查看待办事项列表，连接钱包后可添加和修改待办事项。
        </template>
      </el-alert>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>事件日志</span>
        </div>
      </template>
      <el-button type="primary" @click="getTodoListLogs">获取事件日志</el-button>
    </el-card>


  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Document, 
  Plus, 
  List, 
  DataAnalysis, 
  Refresh, 
  Check, 
  CircleCheck,
  Loading 
} from '@element-plus/icons-vue'
import WalletConnect from '../components/WalletConnect.vue'
import web3Service from '../services/web3Service.js'
import { CONTRACTS } from '../contracts/index.js'

export default {
  name: 'TodoListContract',
  components: {
    WalletConnect,
    Document,
    Plus,
    List,
    DataAnalysis,
    Refresh,
    Check,
    CircleCheck,
    Loading
  },
  setup() {
    const isConnected = ref(false)
    const loading = ref(null)
    const newTodo = ref('')
    const newTodoInput = ref(null)
    
    const contracts = reactive(CONTRACTS)
    const todoList = ref([])

    // 计算属性
    const completedCount = computed(() => {
      return todoList.value.filter(todo => todo.isCompleted).length
    })

    const completionRate = computed(() => {
      if (todoList.value.length === 0) return 0
      return (completedCount.value / todoList.value.length) * 100
    })

    // 监控正在进行的交易
    const pendingTransactions = ref([])
    
    // 定期更新交易状态
    const updateTransactionStatus = () => {
      pendingTransactions.value = web3Service.getPendingTransactionKeys()
    }
    
    // 获取交易描述
    const getTransactionDescription = (txKey) => {
      if (txKey.startsWith('addTodo_')) {
        return '正在添加待办事项...'
      } else if (txKey.startsWith('completeTodo_')) {
        return '正在更新待办事项状态...'
      } else if (txKey === 'checkAndCompleteDefaultTodo') {
        return '正在完成默认待办事项...'
      }
      return '正在处理交易...'
    }

    // 钱包连接事件
    const onWalletConnected = async (account) => {
      isConnected.value = true
      // 如果还没有初始化，才调用 getTodoList
        await getTodoList()
    }

    const onWalletDisconnected = () => {
      isConnected.value = false
      // 可以选择清空列表或保持显示
    }

    // 获取待办事项列表
    const getTodoList = async () => {
      // 检查是否已有读取操作正在进行
      if (web3Service.isReadPending('getTodoList')) {
        ElMessage.warning('正在获取待办事项列表，请稍等...')
        return
      }

      loading.value = 'getTodoList'
      
      try {
        const result = await web3Service.getTodoList()
        console.log(result,'获取待办事项结果')
        if (result.success) {
          todoList.value = result.todoList.map(item => ({
            id: item.id,
            content: item.content,
            isCompleted: item.isCompleted
          }))
          
          ElMessage.success('待办事项列表刷新成功！')
        } else {
          ElMessage.error(result.error || '获取待办事项失败')
        }
      } catch (err) {
        ElMessage.error('获取待办事项时发生错误')
      }
      
      loading.value = null
    }

    // 添加待办事项
    const addTodo = async () => {
      if (!newTodo.value.trim()) return
      
      const task = newTodo.value.trim()
      
      // 检查是否已有相同的添加操作正在进行
      if (web3Service.isTransactionPending(`addTodo_${task}`)) {
        ElMessage.warning('相同的添加操作正在进行中，请等待完成')
        return
      }
      
      loading.value = 'addTodo'
      
      try {
        const result = await web3Service.addTodo(task)
        if (result.success) {
          newTodo.value = ''
          ElMessage.success('待办事项添加成功！')
          
          // 刷新列表
          await getTodoList()
        } else {
          ElMessage.error(result.error || '添加待办事项失败')
        }
      } catch (err) {
        ElMessage.error('添加待办事项时发生错误')
      }
      
      loading.value = null
    }

    // 切换待办事项状态
    const toggleTodo = async (index) => {
      // 检查是否已有相同的完成操作正在进行
      if (web3Service.isTransactionPending(`completeTodo_${index}`)) {
        ElMessage.warning('该待办事项正在处理中，请等待完成')
        // 恢复原状态
        todoList.value[index].isCompleted = !todoList.value[index].isCompleted
        return
      }

      loading.value = `toggle-${index}`
      
      try {
        // 这里需要根据你的智能合约实现来调用相应的方法
        // 假设有一个 toggleTodo 方法
        const result = await web3Service.toggleTodo(index)
        if (result.success) {
          ElMessage.success('待办事项状态更新成功！')
          
          // 刷新列表
          await getTodoList()
        } else {
          // 如果失败，恢复原状态
          todoList.value[index].isCompleted = !todoList.value[index].isCompleted
          ElMessage.error(result.error || '更新待办事项状态失败')
        }
      } catch (err) {
        // 如果出错，恢复原状态
        todoList.value[index].isCompleted = !todoList.value[index].isCompleted
        ElMessage.error('更新待办事项状态时发生错误')
      }
      
      loading.value = null
    }

    // 聚焦到新建待办事项输入框
    const focusNewTodoInput = async () => {
      await nextTick()
      if (newTodoInput.value) {
        newTodoInput.value.focus()
      }
    }

    // 交易状态更新定时器
    let statusUpdateTimer = null

    const getTodoListLogs =async ()=>{
      const result = await web3Service.queryTodoListLogs('RewardPaid')
      console.log(result,'获取事件日志结果')
    }

    // 组件挂载时初始化
    onMounted(async () => {
      if (web3Service.isConnected()) {
        isConnected.value = true
          await getTodoList()
      }
      
      // 开始监控交易状态
      statusUpdateTimer = setInterval(updateTransactionStatus, 1000)
    })

    // 组件卸载时清理
    onUnmounted(() => {
      if (statusUpdateTimer) {
        clearInterval(statusUpdateTimer)
      }
    })

    return {
      isConnected,
      loading,
      newTodo,
      newTodoInput,
      contracts,
      todoList,
      completedCount,
      completionRate,
      pendingTransactions,
      onWalletConnected,
      onWalletDisconnected,
      getTodoList,
      addTodo,
      toggleTodo,
      focusNewTodoInput,
      getTransactionDescription,
      getTodoListLogs
    }
  }
}
</script>

<style scoped>
.todolist-contract {
  max-width: 1200px;
  margin: 0 auto;
}

.contract-info-card,
.add-todo-card,
.todolist-card,
.stats-card,
.no-wallet-card,
.transaction-status-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.no-todos {
  text-align: center;
  padding: 40px 20px;
}

.todo-item {
  width: 100%;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.todo-checkbox-placeholder {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.todo-text {
  flex: 1;
  font-size: 16px;
  transition: all 0.3s ease;
}

.completed-text {
  text-decoration: line-through;
  color: #909399;
}

.todo-status {
  margin-left: auto;
}

.completed {
  background-color: #f0f9ff;
  border-color: #67c23a;
}

.transaction-status-card {
  border-color: #e6a23c;
  background-color: #fdf6ec;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 