const contractService = require('./services/contractService');
const dataService = require('./services/dataService');

class ContractSync {
  constructor() {
    this.isRunning = false;
    this.syncInterval = 30000; // 30秒同步一次
    this.intervalId = null;
  }

  // 开始定时同步
  start() {
    if (this.isRunning) {
      console.log('🔄 合约同步服务已在运行中');
      return;
    }

    console.log('🚀 启动合约数据同步服务...');
    this.isRunning = true;

    // 立即执行一次同步
    this.syncData();

    // 设置定时同步
    this.intervalId = setInterval(() => {
      this.syncData();
    }, this.syncInterval);

    // 设置事件监听器
    this.setupEventListeners();

    console.log(`⏰ 定时同步已设置，间隔: ${this.syncInterval / 1000}秒`);
  }

  // 停止定时同步
  stop() {
    if (!this.isRunning) {
      console.log('⏹️ 合约同步服务未在运行');
      return;
    }

    console.log('⏹️ 停止合约数据同步服务...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // 移除事件监听器
    contractService.removeEventListeners();

    console.log('✅ 合约同步服务已停止');
  }

  // 同步合约数据
  async syncData() {
    try {
      console.log('🔄 开始同步合约数据...');
      
      const startTime = Date.now();
      const data = await contractService.getAllContractData();
      
      await dataService.saveContractData(data);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ 合约数据同步完成 (耗时: ${duration}ms)`);
      console.log(`📊 Counter计数: ${data.counter.count}, Greeting: "${data.greeting.greeting}"`);
      
    } catch (error) {
      console.error('❌ 合约数据同步失败:', error.message);
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    contractService.setupEventListeners(async (contractName, eventName, eventData) => {
      try {
        console.log(`📡 检测到事件: ${contractName}.${eventName}`, eventData);
        
        // 记录事件
        await dataService.addEvent(contractName, eventName, eventData);
        
        // 立即同步最新数据
        await this.syncData();
        
      } catch (error) {
        console.error('处理事件失败:', error.message);
      }
    });
  }

  // 手动触发同步
  async manualSync() {
    console.log('🔧 手动触发合约数据同步...');
    await this.syncData();
  }

  // 获取同步状态
  getStatus() {
    return {
      isRunning: this.isRunning,
      syncInterval: this.syncInterval,
      lastSync: new Date().toISOString()
    };
  }
}

// 创建全局同步实例
const contractSync = new ContractSync();

// 如果直接运行此文件，启动同步服务
if (require.main === module) {
  console.log('🎯 独立运行合约同步服务');
  
  // 启动同步
  contractSync.start();
  
  // 优雅停止处理
  process.on('SIGINT', () => {
    console.log('\n🛑 接收到停止信号...');
    contractSync.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 接收到终止信号...');
    contractSync.stop();
    process.exit(0);
  });
  
  // 保持进程运行
  console.log('🔄 合约同步服务运行中，按 Ctrl+C 停止...');
}

module.exports = contractSync; 