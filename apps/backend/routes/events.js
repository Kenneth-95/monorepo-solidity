const Router = require('koa-router');
const dataService = require('../services/dataService');

const router = new Router({ prefix: '/api/events' });

// 获取最近的事件
router.get('/', async (ctx) => {
  try {
    const limit = parseInt(ctx.query.limit) || 50;
    const events = await dataService.getRecentEvents(limit);
    
    ctx.body = {
      success: true,
      message: '获取事件数据成功',
      data: {
        events: events,
        total: events.length,
        limit: limit
      }
    };
  } catch (error) {
    console.error('获取事件数据API错误:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取事件数据失败',
      error: error.message
    };
  }
});

// 按合约获取事件
router.get('/contract/:contractName', async (ctx) => {
  try {
    const contractName = ctx.params.contractName;
    const limit = parseInt(ctx.query.limit) || 50;
    
    if (!['Counter', 'Greeting'].includes(contractName)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '无效的合约名称，支持的合约: Counter, Greeting',
        data: null
      };
      return;
    }
    
    const events = await dataService.getEventsByContract(contractName, limit);
    
    ctx.body = {
      success: true,
      message: `获取${contractName}合约事件成功`,
      data: {
        contract: contractName,
        events: events,
        total: events.length,
        limit: limit
      }
    };
  } catch (error) {
    console.error('按合约获取事件API错误:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '按合约获取事件失败',
      error: error.message
    };
  }
});

// 获取事件统计信息
router.get('/stats', async (ctx) => {
  try {
    const allEvents = await dataService.loadEvents();
    
    // 统计各种事件类型
    const eventStats = {};
    const contractStats = {};
    
    allEvents.forEach(event => {
      // 按事件类型统计
      const eventKey = `${event.contract}.${event.event}`;
      eventStats[eventKey] = (eventStats[eventKey] || 0) + 1;
      
      // 按合约统计
      contractStats[event.contract] = (contractStats[event.contract] || 0) + 1;
    });
    
    // 获取最近24小时的事件
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentEvents = allEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate > yesterday;
    });
    
    ctx.body = {
      success: true,
      message: '获取事件统计成功',
      data: {
        total: allEvents.length,
        recent24h: recentEvents.length,
        byEventType: eventStats,
        byContract: contractStats,
        latestEvent: allEvents[0] || null,
        oldestEvent: allEvents[allEvents.length - 1] || null
      }
    };
  } catch (error) {
    console.error('获取事件统计API错误:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取事件统计失败',
      error: error.message
    };
  }
});

// 清理旧事件
router.delete('/cleanup', async (ctx) => {
  try {
    const days = parseInt(ctx.query.days) || 30;
    const removedCount = await dataService.cleanupOldData(days);
    
    ctx.body = {
      success: true,
      message: '清理旧事件成功',
      data: {
        removedCount: removedCount,
        daysToKeep: days
      }
    };
  } catch (error) {
    console.error('清理旧事件API错误:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '清理旧事件失败',
      error: error.message
    };
  }
});

module.exports = router; 