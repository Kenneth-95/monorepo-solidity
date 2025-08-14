import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, Space, Typography, Alert } from 'antd'
import { WalletOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons'
import { useAccount, useBalance } from 'wagmi'

const { Title, Text } = Typography

interface WalletConnectProps {
  onWalletConnected?: (account: string) => void
  onWalletDisconnected?: () => void
}

const WalletConnect: React.FC<WalletConnectProps> = ({ 
  onWalletConnected, 
  onWalletDisconnected 
}) => {
  const { address, isConnected } = useAccount({
    onConnect: ({ address }) => {
      if (address && onWalletConnected) {
        onWalletConnected(address)
      }
    },
    onDisconnect: () => {
      if (onWalletDisconnected) {
        onWalletDisconnected()
      }
    }
  })

  const { data: balance } = useBalance({
    address: address,
  })

  return (
    <Card 
      style={{ marginBottom: 24 }}
      title={
        <Space>
          <WalletOutlined />
          <span>钱包连接</span>
        </Space>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <ConnectButton 
            label="连接钱包"
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
            chainStatus={{
              smallScreen: 'icon',
              largeScreen: 'full',
            }}
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
          />
        </div>

        {isConnected && address ? (
          <Alert
            message={
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  <LinkOutlined style={{ color: '#52c41a' }} />
                  <Text strong>已连接到钱包</Text>
                </Space>
                <div>
                  <Text type="secondary">地址: </Text>
                  <Text code copyable={{ text: address }}>
                    {`${address.slice(0, 6)}...${address.slice(-4)}`}
                  </Text>
                </div>
                {balance && (
                  <div>
                    <Text type="secondary">余额: </Text>
                    <Text strong>{parseFloat(balance.formatted).toFixed(4)} {balance.symbol}</Text>
                  </div>
                )}
              </Space>
            }
            type="success"
            showIcon={false}
          />
        ) : (
          <Alert
            message={
              <Space>
                <DisconnectOutlined style={{ color: '#faad14' }} />
                <span>未连接钱包 - 功能受限，仅可查看数据</span>
              </Space>
            }
            type="warning"
            showIcon={false}
          />
        )}
      </Space>
    </Card>
  )
}

export default WalletConnect