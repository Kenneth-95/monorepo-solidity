const { ethers } = require('ethers');
const config = require('../config/contracts');

class ContractService {
  constructor() {
    this.provider = null;
    this.contracts = {};
    this.init();
  }

  // 初始化服务
  async init() {
    try {
      // 连接到本地Hardhat网络
      this.provider = new ethers.JsonRpcProvider(config.network.rpcUrl);
      
      // 测试连接
      const network = await this.provider.getNetwork();
      console.log(`✅ 成功连接到网络: ${network.name} (Chain ID: ${network.chainId})`);
      
      // 初始化合约实例
      this.initContracts();
      
      console.log('🚀 合约服务初始化完成');
    } catch (error) {
      console.error('❌ 合约服务初始化失败:', error.message);
      throw error;
    }
  }

  // 初始化合约实例
  initContracts() {
    for (const [name, contractConfig] of Object.entries(config.contracts)) {
      try {
        this.contracts[name] = new ethers.Contract(
          contractConfig.address,
          contractConfig.abi,
          this.provider
        );
        console.log(`📄 ${name} 合约实例创建成功: ${contractConfig.address}`);
      } catch (error) {
        console.error(`❌ ${name} 合约实例创建失败:`, error.message);
      }
    }
  }

  // 获取Counter合约数据
  async getCounterData() {
    try {
      const counter = this.contracts.Counter;
      if (!counter) {
        throw new Error('Counter合约未初始化');
      }

      const [count, owner] = await Promise.all([
        counter.getCount(),
        counter.getOwner()
      ]);

      return {
        count: Number(count),
        owner: owner,
        contractAddress: config.contracts.Counter.address,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('获取Counter数据失败:', error.message);
      throw error;
    }
  }

  // 获取Greeting合约数据
  async getGreetingData() {
    try {
      const greeting = this.contracts.Greeting;
      if (!greeting) {
        throw new Error('Greeting合约未初始化');
      }

      const [greetingText, fullGreeting, changeCount, owner] = await Promise.all([
        greeting.getGreeting(),
        greeting.getFullGreeting(),
        greeting.getChangeCount(),
        greeting.owner()
      ]);

      return {
        greeting: greetingText,
        fullGreeting: fullGreeting,
        changeCount: Number(changeCount),
        owner: owner,
        contractAddress: config.contracts.Greeting.address,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('获取Greeting数据失败:', error.message);
      throw error;
    }
  }

  // 获取所有合约数据
  async getAllContractData() {
    try {
      const [counterData, greetingData] = await Promise.all([
        this.getCounterData(),
        this.getGreetingData()
      ]);

      return {
        counter: counterData,
        greeting: greetingData,
        network: {
          rpcUrl: config.network.rpcUrl,
          chainId: config.network.chainId
        },
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('获取所有合约数据失败:', error.message);
      throw error;
    }
  }

  // 检查网络连接
  async checkConnection() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return {
        connected: true,
        blockNumber: blockNumber,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 监听合约事件
  setupEventListeners(onEventCallback) {
    try {
      // Counter事件监听
      if (this.contracts.Counter) {
        this.contracts.Counter.on('CountIncreased', (newCount) => {
          onEventCallback('Counter', 'CountIncreased', { newCount: Number(newCount) });
        });

        this.contracts.Counter.on('CountDecreased', (newCount) => {
          onEventCallback('Counter', 'CountDecreased', { newCount: Number(newCount) });
        });

        this.contracts.Counter.on('CountReset', (newCount) => {
          onEventCallback('Counter', 'CountReset', { newCount: Number(newCount) });
        });
      }

      // Greeting事件监听
      if (this.contracts.Greeting) {
        this.contracts.Greeting.on('GreetingChanged', (newGreeting, changedBy) => {
          onEventCallback('Greeting', 'GreetingChanged', { 
            newGreeting: newGreeting, 
            changedBy: changedBy 
          });
        });
      }

      console.log('🎧 事件监听器设置完成');
    } catch (error) {
      console.error('设置事件监听器失败:', error.message);
    }
  }

  // 移除事件监听器
  removeEventListeners() {
    try {
      Object.values(this.contracts).forEach(contract => {
        contract.removeAllListeners();
      });
      console.log('🔇 所有事件监听器已移除');
    } catch (error) {
      console.error('移除事件监听器失败:', error.message);
    }
  }
}

module.exports = new ContractService(); 