const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa-cors');
const { koaBody } = require('koa-body');
const contractsRouter = require('./routes/contracts');
const eventsRouter = require('./routes/events');
const contractSync = require('./sync-contracts');

const app = new Koa();
const router = new Router();

// 中间件配置
app.use(cors({
  origin: '*', // 生产环境中应该设置为具体的前端域名
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(koaBody({
  jsonLimit: '10mb',
  textLimit: '10mb'
}));

// 全局错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('服务器错误:', err);
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };
  }
});

// 请求日志中间件
app.use(async (ctx, next) => {
  const startTime = Date.now();
  await next();
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`${ctx.method} ${ctx.url} - ${ctx.status} (${duration}ms)`);
});

// 基础路由
router.get('/', async (ctx) => {
  ctx.body = {
    success: true,
    message: '智能合约数据服务 API',
    version: '1.0.0',
    endpoints: {
      contracts: '/api/contracts',
      events: '/api/events',
      health: '/health',
      sync: '/api/contracts/sync'
    },
    timestamp: new Date().toISOString()
  };
});

// 健康检查
router.get('/health', async (ctx) => {
  try {
    const contractService = require('./services/contractService');
    const dataService = require('./services/dataService');
    
    const [networkStatus, dataStats] = await Promise.all([
      contractService.checkConnection(),
      dataService.getDataStats()
    ]);
    
    ctx.body = {
      success: true,
      message: '服务健康',
      data: {
        server: {
          status: 'running',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        },
        network: networkStatus,
        data: dataStats,
        sync: contractSync.getStatus()
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '健康检查失败',
      error: error.message
    };
  }
});

// 注册路由
app.use(router.routes());
app.use(router.allowedMethods());
app.use(contractsRouter.routes());
app.use(contractsRouter.allowedMethods());
app.use(eventsRouter.routes());
app.use(eventsRouter.allowedMethods());

// 404处理
app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = {
    success: false,
    message: '接口不存在',
    path: ctx.url
  };
});

// 服务器配置
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// 启动服务器
const server = app.listen(PORT, HOST, () => {
  console.log('🚀 智能合约数据服务启动成功!');
  console.log(`📡 服务地址: http://${HOST}:${PORT}`);
  console.log(`📊 API文档: http://${HOST}:${PORT}/`);
  console.log(`❤️  健康检查: http://${HOST}:${PORT}/health`);
  console.log('🔄 启动合约数据同步...');
  
  // 启动合约数据同步
  contractSync.start();
});

// 优雅停止处理
process.on('SIGINT', () => {
  console.log('\n🛑 接收到停止信号，正在关闭服务器...');
  
  contractSync.stop();
  
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 接收到终止信号，正在关闭服务器...');
  
  contractSync.stop();
  
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

// 未捕获的异常处理
process.on('uncaughtException', (err) => {
  console.error('❌ 未捕获的异常:', err);
  contractSync.stop();
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ 未处理的Promise拒绝:', err);
});

module.exports = app; 