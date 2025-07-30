<template>
  <el-card class="wallet-connect-card">
    <template #header>
      <div class="card-header">
        <span>钱包连接</span>
      </div>
    </template>
    
    <div v-if="!isConnected" class="connect-section">
      <el-alert
        title="未连接钱包"
        type="warning"
        :closable="false"
        show-icon
        class="mb-4"
      >
        <template #default>
          请连接MetaMask钱包以进行交易操作。不连接钱包也可以查看合约数据。
        </template>
      </el-alert>
      
      <el-button 
        type="primary" 
        @click="connectWallet" 
        :loading="connecting"
        icon="Connection"
        size="large"
        class="connect-btn"
      >
        {{ connecting ? '连接中...' : '连接MetaMask钱包' }}
      </el-button>
    </div>
    
    <div v-else class="connected-section">
      <el-alert
        title="钱包已连接"
        type="success"
        :closable="false"
        show-icon
        class="mb-4"
      />
      
      <el-descriptions :column="1" border>
        <el-descriptions-item label="账户地址">
          <el-text type="primary" truncated>{{ currentAccount }}</el-text>
        </el-descriptions-item>
      </el-descriptions>
      
      <el-button 
        type="danger" 
        @click="disconnectWallet"
        icon="SwitchButton"
        class="disconnect-btn"
        plain
      >
        断开连接
      </el-button>
    </div>

    <!-- 状态提示 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
      class="mt-4"
    />
    
    <el-alert
      v-if="successMessage"
      :title="successMessage"
      type="success"
      :closable="false"
      show-icon
      class="mt-4"
    />
  </el-card>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import web3Service from '../services/web3Service.js'

export default {
  name: 'WalletConnect',
  emits: ['wallet-connected', 'wallet-disconnected'],
  setup(props, { emit }) {
    const isConnected = ref(false)
    const connecting = ref(false)
    const currentAccount = ref('')
    const error = ref('')
    const successMessage = ref('')

    // 连接钱包
    const connectWallet = async () => {
      connecting.value = true
      error.value = ''
      
      const result = await web3Service.connectWallet()
      
      if (result.success) {
        isConnected.value = true
        currentAccount.value = result.account
        successMessage.value = '钱包连接成功！'
        
        emit('wallet-connected', result.account)
        
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
      
      emit('wallet-disconnected')
      
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }

    // 初始化钱包状态
    const initWalletStatus = () => {
      if (web3Service.isConnected()) {
        isConnected.value = true
        currentAccount.value = web3Service.getAccount()
        emit('wallet-connected', currentAccount.value)
      }
    }

    onMounted(() => {
      initWalletStatus()
    })

    return {
      isConnected,
      connecting,
      currentAccount,
      error,
      successMessage,
      connectWallet,
      disconnectWallet
    }
  }
}
</script>

<style scoped>
.wallet-connect-card {
  margin-bottom: 20px;
}

.connect-section {
  text-align: center;
}

.connect-btn {
  width: 100%;
  margin-top: 16px;
}

.disconnect-btn {
  margin-top: 16px;
  width: 100%;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style> 