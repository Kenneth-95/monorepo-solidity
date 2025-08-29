import React, { useState, useRef } from 'react'
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Tag,
  Checkbox,
  Empty,
  Statistic,
  Row,
  Col,
  Alert,
  Spin,
  Descriptions,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  CheckOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import { useAccount } from 'wagmi'
import { CONTRACTS } from '../contracts'
import { useTodoList } from '../hooks/useTodoList'

const { Title, Text } = Typography

const TodoListComponent: React.FC = () => {
  const { isConnected } = useAccount()
  const [newTodo, setNewTodo] = useState('')
  const inputRef = useRef<any>(null)
  
  const {
    todos,
    isLoading,
    completedCount,
    completionRate,
    pendingTasks,
    addTodo,
    completeTodo,
    refreshTodos,
  } = useTodoList()

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return
    
    const success = await addTodo(newTodo)
    if (success) {
      setNewTodo('')
      inputRef.current?.focus()
    }
  }

  const handleToggleTodo = async (id: number, isCompleted: boolean) => {
    if (isCompleted) return // 已完成的不能再改变状态
    await completeTodo(id)
  }

  const getTransactionDescription = (taskKey: string) => {
    if (taskKey.startsWith('addTodo_')) {
      return '正在添加待办事项...'
    } else if (taskKey.startsWith('completeTodo_')) {
      return '正在更新待办事项状态...'
    }
    return '正在处理交易...'
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* 交易状态提示 */}
      {pendingTasks.length > 0 && (
        <Card style={{ marginBottom: 20, borderColor: '#faad14', backgroundColor: '#fefbe6' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
              <Text strong>正在处理交易</Text>
            </Space>
            {pendingTasks.map((task, index) => (
              <Tag key={index} color="processing" icon={<LoadingOutlined />}>
                {getTransactionDescription(task)}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* 合约信息卡片 */}
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            <span>TodoList 待办事项合约</span>
          </Space>
        }
        style={{ marginBottom: 20 }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="合约地址">
            <Text code copyable={{ text: CONTRACTS.TodoList.address }}>
              {`${CONTRACTS.TodoList.address.slice(0, 6)}...${CONTRACTS.TodoList.address.slice(-4)}`}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="待办事项总数">
            <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>
              {todos.length}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="已完成数量">
            <Tag color="green" style={{ fontSize: 14, padding: '4px 8px' }}>
              {completedCount}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="数据来源">
            <Tag color={isConnected ? 'success' : 'warning'}>
              {isConnected ? '🔗 钱包直连' : '📡 链上查询'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 添加待办事项 */}
      {isConnected && (
        <Card
          title={
            <Space>
              <PlusOutlined />
              <span>添加待办事项</span>
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <Row gutter={16}>
            <Col span={18}>
              <Input
                ref={inputRef}
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="输入待办事项内容"
                size="large"
                maxLength={100}
                showCount
                onPressEnter={handleAddTodo}
                disabled={isLoading}
              />
            </Col>
            <Col span={6}>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAddTodo}
                loading={isLoading}
                disabled={!newTodo.trim()}
                style={{ width: '100%' }}
              >
                {isLoading ? '添加中...' : '添加'}
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* 待办事项列表 */}
      <Card
        title={
          <Space>
            <UnorderedListOutlined />
            <span>待办事项列表</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            ghost
            icon={<ReloadOutlined />}
            onClick={refreshTodos}
            loading={isLoading}
            size="small"
          >
            {isLoading ? '刷新中...' : '刷新'}
          </Button>
        }
        style={{ marginBottom: 20 }}
      >
        {todos.length === 0 ? (
          <Empty
            description="暂无待办事项"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {isConnected && (
              <Button 
                type="primary" 
                onClick={() => inputRef.current?.focus()}
              >
                创建第一个待办事项
              </Button>
            )}
          </Empty>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {todos.map((todo) => (
              <Card
                key={todo.id}
                size="small"
                className={`todo-item ${todo.isCompleted ? 'completed' : ''}`}
                style={{
                  backgroundColor: todo.isCompleted ? '#f6ffed' : undefined,
                  borderColor: todo.isCompleted ? '#b7eb8f' : undefined,
                }}
              >
                <div className="todo-content">
                  {isConnected ? (
                    <Checkbox
                      checked={todo.isCompleted}
                      onChange={() => handleToggleTodo(todo.id, todo.isCompleted)}
                      disabled={todo.isCompleted || isLoading}
                    />
                  ) : (
                    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {todo.isCompleted ? (
                        <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                      ) : (
                        <div style={{ width: 16, height: 16, border: '2px solid #d9d9d9', borderRadius: '50%' }} />
                      )}
                    </div>
                  )}
                  
                  <span 
                    className={`todo-text ${todo.isCompleted ? 'completed-text' : ''}`}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      fontSize: 16,
                      textDecoration: todo.isCompleted ? 'line-through' : 'none',
                      color: todo.isCompleted ? '#999' : undefined,
                    }}
                  >
                    {todo.content}
                  </span>
                  
                  <Tag color={todo.isCompleted ? 'success' : 'default'}>
                    {todo.isCompleted ? '已完成' : '未完成'}
                  </Tag>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Card>

      {/* 统计信息 */}
      {todos.length > 0 && (
        <Card
          title={
            <Space>
              <BarChartOutlined />
              <span>统计信息</span>
            </Space>
          }
        >
          <Row gutter={20}>
            <Col span={8}>
              <Statistic
                title="总计"
                value={todos.length}
                prefix="📋"
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="已完成"
                value={completedCount}
                prefix="✅"
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="完成率"
                value={completionRate}
                precision={1}
                suffix="%"
                prefix="📊"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* 未连接钱包提示 */}
      {!isConnected && (
        <Alert
          message="功能受限"
          description="未连接钱包时仅可查看待办事项列表，连接钱包后可添加和修改待办事项。"
          type="warning"
          showIcon
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  )
}

export default TodoListComponent