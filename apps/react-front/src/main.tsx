import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Wagmi 和 RainbowKit 配置
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { config, checkEnvironmentVariables } from './config/wagmi.ts'

// Ant Design 国际化
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

const queryClient = new QueryClient()

// 检查环境变量配置
checkEnvironmentVariables()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={lightTheme({
            accentColor: '#1890ff',
            accentColorForeground: 'white',
          })}
        >
          <ConfigProvider locale={zhCN}>
            <App />
          </ConfigProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)