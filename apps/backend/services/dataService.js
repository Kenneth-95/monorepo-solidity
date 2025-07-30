const fs = require('fs-extra');
const path = require('path');

class DataService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.contractDataFile = path.join(this.dataDir, 'contracts.json');
    this.eventsFile = path.join(this.dataDir, 'events.json');
    this.init();
  }

  // 初始化数据目录和文件
  async init() {
    try {
      // 确保数据目录存在
      await fs.ensureDir(this.dataDir);
      
      // 初始化合约数据文件
      if (!await fs.pathExists(this.contractDataFile)) {
        await this.saveContractData({
          counter: null,
          greeting: null,
          network: null,
          lastSync: null
        });
      }

      // 初始化事件数据文件
      if (!await fs.pathExists(this.eventsFile)) {
        await this.saveEvents([]);
      }

      console.log('📁 数据服务初始化完成');
    } catch (error) {
      console.error('❌ 数据服务初始化失败:', error.message);
      throw error;
    }
  }

  // 保存合约数据到JSON文件
  async saveContractData(data) {
    try {
      await fs.writeJSON(this.contractDataFile, data, { spaces: 2 });
      console.log('💾 合约数据已保存到文件');
    } catch (error) {
      console.error('保存合约数据失败:', error.message);
      throw error;
    }
  }

  // 从JSON文件读取合约数据
  async loadContractData() {
    try {
      const data = await fs.readJSON(this.contractDataFile);
      return data;
    } catch (error) {
      console.error('读取合约数据失败:', error.message);
      return null;
    }
  }

  // 保存事件数据
  async saveEvents(events) {
    try {
      await fs.writeJSON(this.eventsFile, events, { spaces: 2 });
    } catch (error) {
      console.error('保存事件数据失败:', error.message);
      throw error;
    }
  }

  // 读取事件数据
  async loadEvents() {
    try {
      const events = await fs.readJSON(this.eventsFile);
      return events || [];
    } catch (error) {
      console.error('读取事件数据失败:', error.message);
      return [];
    }
  }

  // 添加新事件
  async addEvent(contractName, eventName, eventData) {
    try {
      const events = await this.loadEvents();
      const newEvent = {
        id: Date.now(),
        contract: contractName,
        event: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        blockNumber: eventData.blockNumber || null
      };
      
      events.unshift(newEvent); // 添加到开头
      
      // 只保留最近1000条事件
      if (events.length > 1000) {
        events.splice(1000);
      }
      
      await this.saveEvents(events);
      console.log(`📝 新事件已记录: ${contractName}.${eventName}`);
      
      return newEvent;
    } catch (error) {
      console.error('添加事件失败:', error.message);
      throw error;
    }
  }

  // 获取最近的事件
  async getRecentEvents(limit = 50) {
    try {
      const events = await this.loadEvents();
      return events.slice(0, limit);
    } catch (error) {
      console.error('获取最近事件失败:', error.message);
      return [];
    }
  }

  // 按合约筛选事件
  async getEventsByContract(contractName, limit = 50) {
    try {
      const events = await this.loadEvents();
      const filteredEvents = events.filter(event => event.contract === contractName);
      return filteredEvents.slice(0, limit);
    } catch (error) {
      console.error('按合约筛选事件失败:', error.message);
      return [];
    }
  }

  // 获取数据统计信息
  async getDataStats() {
    try {
      const [contractData, events] = await Promise.all([
        this.loadContractData(),
        this.loadEvents()
      ]);

      return {
        contractData: {
          exists: !!contractData,
          lastSync: contractData?.lastSync || null,
          counterData: !!contractData?.counter,
          greetingData: !!contractData?.greeting
        },
        events: {
          total: events.length,
          recent: events.slice(0, 10).length,
          contracts: [...new Set(events.map(e => e.contract))]
        },
        files: {
          contractDataFile: await fs.pathExists(this.contractDataFile),
          eventsFile: await fs.pathExists(this.eventsFile)
        }
      };
    } catch (error) {
      console.error('获取数据统计失败:', error.message);
      return null;
    }
  }

  // 清理旧数据
  async cleanupOldData(daysToKeep = 30) {
    try {
      const events = await this.loadEvents();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate > cutoffDate;
      });

      await this.saveEvents(filteredEvents);
      
      const removedCount = events.length - filteredEvents.length;
      console.log(`🧹 清理完成，删除了 ${removedCount} 条旧事件`);
      
      return removedCount;
    } catch (error) {
      console.error('清理旧数据失败:', error.message);
      return 0;
    }
  }
}

module.exports = new DataService(); 