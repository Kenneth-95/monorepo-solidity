const Router = require('koa-router');
const contractService = require('../services/contractService');
const dataService = require('../services/dataService');

const router = new Router({ prefix: '/api/contracts' });

// 获取所有合约数据（从缓存的JSON文件读取）
router.get('/', async (ctx) => {
  try {
    const data = await dataService.loadContractData();
    
    if (!data || !data.lastSync) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '暂无合约数据，请等待数据同步',
        data: null
      };
      return;
    }

    ctx.body = {
      success: true,
      message: '获取合约数据成功',
      data: data
    };
  } catch (error) {
    console.error('获取合约数据API错误:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取合约数据失败',
      error: error.message
    };
  }
});

// 实时获取合约数据（直接从区块链读取）
router.get('/live', async (ctx) => {
  try {
    const data = await contractService.getAllContractData();
    
    // 同时更新缓存
    await dataService.saveContractData(data);
    
    ctx.body = {
      success: true,
      message: '获取实时合约数据成功',
      data: data
    };
  } catch (error) {
    console.error('获取实时合约数据API错误:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取实时合约数据失败',
      error: error.message
    };
  }
});

// 获取Counter合约数据
router.get('/counter', async (ctx) => {
  try {
    const data = await dataService.loadContractData();
    
    if (!data || !data.counter) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '暂无Counter合约数据',
        data: null
      };
      return;
    }

    ctx.body = {
      success: true,
      message: '获取Counter合约数据成功',
      data: data.counter
    };
  } catch (error) {
    console.error('获取Counter合约数据API错误:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取Counter合约数据失败',
      error: error.message
    };
  }
});

// 获取Greeting合约数据
router.get('/greeting', async (ctx) => {
  try {
    const data = await dataService.loadContractData();
    
    if (!data || !data.greeting) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '暂无Greeting合约数据',
        data: null
      };
      return;
    }

    ctx.body = {
      success: true,
      message: '获取Greeting合约数据成功',
      data: data.greeting
    };
  } catch (error) {
    console.error('获取Greeting合约数据API错误:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取Greeting合约数据失败',
      error: error.message
    };
  }
});

// 强制同步合约数据
router.post('/sync', async (ctx) => {
  try {
    const data = await contractService.getAllContractData();
    await dataService.saveContractData(data);
    
    ctx.body = {
      success: true,
      message: '合约数据同步成功',
      data: data
    };
  } catch (error) {
    console.error('同步合约数据API错误:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '同步合约数据失败',
      error: error.message
    };
  }
});

// 检查网络连接状态
router.get('/status', async (ctx) => {
  try {
    const connection = await contractService.checkConnection();
    const stats = await dataService.getDataStats();
    
    ctx.body = {
      success: true,
      message: '获取状态成功',
      data: {
        network: connection,
        dataStats: stats,
        contracts: {
          Counter: !!contractService.contracts.Counter,
          Greeting: !!contractService.contracts.Greeting
        }
      }
    };
  } catch (error) {
    console.error('获取状态API错误:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取状态失败',
      error: error.message
    };
  }
});

module.exports = router; 