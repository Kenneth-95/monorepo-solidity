import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Empty,
  Statistic,
  Row,
  Col,
  Alert,
  Descriptions,
  Timeline,
} from 'antd'
import {
  PlusOutlined,
  MinusOutlined,
  ReloadOutlined,
  BarChartOutlined,
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from '../contracts'

const { Title, Text } = Typography

interface EventLog {
  time: string
  message: string
  type: 'success' | 'warning' | 'danger' | 'primary'
}

const CounterComponent: React.FC = () => {
  const { isConnected } = useAccount()
  const [eventLogs, setEventLogs] = useState<EventLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 合约读取 - wagmi v2 使用 useReadContract
  const { data: count, refetch: refetchCount } = useReadContract({
    address: CONTRACTS.Counter.address as `0x${string}`,
    abi: CONTRACTS.Counter.abi,
    functionName: 'getCount',
  })

  const { data: owner, refetch: refetchOwner } = useReadContract({
    address: CONTRACTS.Counter.address as `0x${string}`,
    abi: CONTRACTS.Counter.abi,
    functionName: 'getOwner',
  })

  // 合约写入 - wagmi v2 使用 useWriteContract
  const { writeContract: increment, data: incrementData } = useWriteContract()

  const { writeContract: decrement, data: decrementData } = useWriteContract()

  const { writeContract: reset, data: resetData } = useWriteContract()

  // 等待交易完成 - wagmi v2 使用 useWaitForTransactionReceipt
  const { isLoading: isIncrementLoading, isSuccess: isIncrementSuccess, isError: isIncrementError } = useWaitForTransactionReceipt({
    hash: incrementData || undefined,
  })

  const { isLoading: isDecrementLoading, isSuccess: isDecrementSuccess, isError: isDecrementError } = useWaitForTransactionReceipt({
    hash: decrementData || undefined,
  })

  const { isLoading: isResetLoading, isSuccess: isResetSuccess, isError: isResetError } = useWaitForTransactionReceipt({
    hash: resetData || undefined,
  })

  // 监听交易状态变化
  useEffect(() => {
    if (isIncrementSuccess) {
      addEventLog('计数增加成功', 'success')
      refetchCount()
    }
  }, [isIncrementSuccess])

  useEffect(() => {
    if (isIncrementError) {
      addEventLog('计数增加失败', 'danger')
    }
  }, [isIncrementError])

  useEffect(() => {
    if (isDecrementSuccess) {
      addEventLog('计数减少成功', 'success')
      refetchCount()
    }
  }, [isDecrementSuccess])

  useEffect(() => {
    if (isDecrementError) {
      addEventLog('计数减少失败', 'danger')
    }
  }, [isDecrementError])

  useEffect(() => {
    if (isResetSuccess) {
      addEventLog('计数重置成功', 'success')
      refetchCount()
    }
  }, [isResetSuccess])

  useEffect(() => {
    if (isResetError) {
      addEventLog('计数重置失败', 'danger')
    }
  }, [isResetError])

  // 添加事件日志
  const addEventLog = (message: string, type: EventLog['type']) => {
    const newLog: EventLog = {
      time: new Date().toLocaleTimeString(),
      message,
      type,
    }
    setEventLogs(prev => [newLog, ...prev.slice(0, 19)]) // 只保留最近20条
  }

  // 获取事件类型对应的图标
  const getEventIcon = (type: EventLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckOutlined style={{ color: '#52c41a' }} />
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />
      case 'danger':
        return <CloseOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <FileTextOutlined style={{ color: '#1890ff' }} />
    }
  }

  // 刷新数据
  const refreshData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([refetchCount(), refetchOwner()])
      addEventLog('数据刷新成功', 'success')
    } catch (error) {
      addEventLog('数据刷新失败', 'danger')
    }
    setIsLoading(false)
  }

  // 操作函数
  const handleIncrement = () => {
    if (!isConnected) return
    increment({
      address: CONTRACTS.Counter.address as `0x${string}`,
      abi: CONTRACTS.Counter.abi,
      functionName: 'increment',
    })
    addEventLog('正在增加计数...', 'primary')
  }

  const handleDecrement = () => {
    if (!isConnected) return
    decrement({
      address: CONTRACTS.Counter.address as `0x${string}`,
      abi: CONTRACTS.Counter.abi,
      functionName: 'decrement',
    })
    addEventLog('正在减少计数...', 'primary')
  }

  const handleReset = () => {
    if (!isConnected) return
    reset({
      address: CONTRACTS.Counter.address as `0x${string}`,
      abi: CONTRACTS.Counter.abi,
      functionName: 'reset',
    })
    addEventLog('正在重置计数...', 'primary')
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* 合约信息卡片 */}
      <Card
        title={
          <Space>
            <BarChartOutlined />
            <span>Counter 计数器合约</span>
          </Space>
        }
        style={{ marginBottom: 20 }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="合约地址">
            <Text code copyable={{ text: CONTRACTS.Counter.address }}>
              {`${CONTRACTS.Counter.address.slice(0, 6)}...${CONTRACTS.Counter.address.slice(-4)}`}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="当前计数">
            <Tag color="blue" style={{ fontSize: 16, padding: '6px 12px' }}>
              {count?.toString() || 0}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="合约拥有者">
            <Text code>
              {owner ? `${(owner as string).slice(0, 6)}...${(owner as string).slice(-4)}` : '加载中...'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="数据来源">
            <Tag color={isConnected ? 'success' : 'warning'}>
              {isConnected ? '🔗 钱包直连' : '📡 链上查询'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 操作区域 */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>合约操作</span>
          </Space>
        }
        style={{ marginBottom: 20 }}
      >
        {isConnected ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={20}>
              <Col span={8}>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={handleIncrement}
                  loading={isIncrementLoading}
                  style={{ width: '100%' }}
                >
                  {isIncrementLoading ? '处理中...' : '+1 增加'}
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  type="default"
                  size="large"
                  icon={<MinusOutlined />}
                  onClick={handleDecrement}
                  loading={isDecrementLoading}
                  style={{ width: '100%' }}
                >
                  {isDecrementLoading ? '处理中...' : '-1 减少'}
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  danger
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  loading={isResetLoading}
                  style={{ width: '100%' }}
                >
                  {isResetLoading ? '处理中...' : '🔄 重置'}
                </Button>
              </Col>
            </Row>
            
            <Button
              type="primary"
              ghost
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={isLoading}
              size="large"
              style={{ width: '100%' }}
            >
              {isLoading ? '刷新中...' : '🔄 刷新数据'}
            </Button>
          </Space>
        ) : (
          <div>
            <Alert
              message="未连接钱包"
              description="连接钱包后可进行交易操作，当前显示的是链上查询的数据。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Button
              type="primary"
              ghost
              icon={<ReloadOutlined />}
              onClick={refreshData}
              loading={isLoading}
              size="large"
              style={{ width: '100%' }}
            >
              {isLoading ? '刷新中...' : '🔄 刷新数据'}
            </Button>
          </div>
        )}
      </Card>

      {/* 统计信息 */}
      <Card
        title={
          <Space>
            <BarChartOutlined />
            <span>统计信息</span>
          </Space>
        }
        style={{ marginBottom: 20 }}
      >
        <Row gutter={20}>
          <Col span={8}>
            <Statistic
              title="当前计数"
              value={count?.toString() || 0}
              prefix="🔢"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="事件记录"
              value={eventLogs.length}
              prefix="📝"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="连接状态"
              value={isConnected ? '已连接' : '未连接'}
              prefix={isConnected ? '✅' : '❌'}
              valueStyle={{ color: isConnected ? '#52c41a' : '#ff4d4f' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 事件日志 */}
      {(isConnected || eventLogs.length > 0) && (
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>事件日志</span>
            </Space>
          }
        >
          {eventLogs.length === 0 ? (
            <Empty description="暂无事件记录" />
          ) : (
            <Timeline>
              {eventLogs.map((log, index) => (
                <Timeline.Item
                  key={index}
                  dot={getEventIcon(log.type)}
                  color={
                    log.type === 'success' ? 'green' :
                    log.type === 'warning' ? 'orange' :
                    log.type === 'danger' ? 'red' : 'blue'
                  }
                >
                  <Text>{log.message}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {log.time}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Card>
      )}

      {/* 未连接钱包提示 */}
      {!isConnected && (
        <Alert
          message="功能受限"
          description="未连接钱包时仅可查看合约数据，连接钱包后可进行计数操作。"
          type="warning"
          showIcon
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  )
}

export default CounterComponent
