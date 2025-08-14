import React, { useState } from 'react'
import { Layout, Typography, Space, Divider, Card } from 'antd'
import { GithubOutlined, TwitterOutlined, GlobalOutlined } from '@ant-design/icons'
import WalletConnect from './components/WalletConnect'
import TodoListComponent from './components/TodoList'

const { Header, Content, Footer } = Layout
const { Title, Text, Link } = Typography

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const handleWalletConnected = (account: string) => {
    setIsWalletConnected(true)
    console.log('钱包已连接:', account)
  }

  const handleWalletDisconnected = () => {
    setIsWalletConnected(false)
    console.log('钱包已断开连接')
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header style={{ 
        backgroundColor: '#fff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'fixed',
        zIndex: 1000,
        width: '100%',
        top: 0
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          height: '100%'
        }}>
          <Space align="center">
            <div style={{ 
              width: 40, 
              height: 40, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              T
            </div>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              React TodoList DApp
            </Title>
          </Space>

        </div>
      </Header>

      <Content style={{ 
        marginTop: 64, 
        padding: '24px',
        minHeight: 'calc(100vh - 64px - 70px)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* 项目介绍 */}
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <Space direction="vertical" size="middle">
              <Title level={2} style={{ margin: 0 }}>
                🚀 去中心化待办事项应用
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                这是一个基于区块链的待办事项管理应用，使用 React + RainbowKit + Wagmi + Ant Design 构建
              </Text>
              <Space split={<Divider type="vertical" />}>
                <Text>✨ 钱包连接</Text>
                <Text>📝 智能合约交互</Text>
                <Text>🎨 现代化UI</Text>
                <Text>⚡ 实时数据同步</Text>
              </Space>
            </Space>
          </Card>

          {/* 钱包连接组件 */}
          <WalletConnect 
            onWalletConnected={handleWalletConnected}
            onWalletDisconnected={handleWalletDisconnected}
          />

          {/* TodoList组件 */}
          <TodoListComponent />
        </div>
      </Content>

    </Layout>
  )
}

export default App