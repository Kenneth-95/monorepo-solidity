<template>
  <el-container class="layout-container">
    <!-- 头部 -->
    <el-header class="layout-header">
      <div class="header-content">
        <h1>智能合约交互Demo</h1>
        <p>使用Vue3 + Element Plus + ethers.js与智能合约交互</p>
      </div>
    </el-header>

    <el-container>
      <!-- 左侧菜单 -->
      <el-aside class="layout-aside" width="300px">
        <el-menu
          :default-active="currentRoute"
          @select="handleMenuSelect"
          class="menu"
        >
          <el-menu-item
            v-for="item in menuConfig"
            :key="item.id"
            :index="item.path"
            class="menu-item"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <div class="menu-content">
              <span class="menu-title">{{ item.title }}</span>
              <span class="menu-desc">{{ item.description }}</span>
            </div>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主要内容区域 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menuConfig } from '../config/menuConfig.js'
import {
  DataAnalysis,
  Document,
  ChatRound
} from '@element-plus/icons-vue'

export default {
  name: 'Layout',
  components: {
    DataAnalysis,
    Document,
    ChatRound
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const currentRoute = computed(() => route.path)

    const handleMenuSelect = (path) => {
      router.push(path)
    }

    onMounted(() => {
      // 如果当前路径是根路径，重定向到第一个菜单项
      if (route.path === '/') {
        router.push(menuConfig[0].path)
      }
    })

    return {
      menuConfig,
      currentRoute,
      handleMenuSelect
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-content {
  text-align: center;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.header-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.layout-aside {
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.menu {
  border-right: none;
  height: 100%;
}

.menu-item {
  height: auto !important;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.menu-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 12px;
}

.menu-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.menu-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.layout-main {
  background: #ffffff;
  padding: 20px;
  overflow-y: auto;
}

.menu-item.is-active {
  background-color: #ecf5ff;
  border-right: 3px solid #409eff;
}

.menu-item.is-active .menu-title {
  color: #409eff;
}
</style> 