@echo off
chcp 65001 > nul
echo 🛠️  启动开发模式后端服务
echo.

echo 📦 检查依赖...
if not exist node_modules (
    echo 🔄 安装依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

echo 🚀 启动开发模式（自动重启）...
echo 📡 服务地址: http://localhost:3001
echo 🔄 文件变更时会自动重启
echo.
echo 按 Ctrl+C 停止服务
echo.

npm run dev

echo.
echo 🛑 开发服务已停止
pause 