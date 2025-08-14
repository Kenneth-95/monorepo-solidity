import { useState, useCallback } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { message } from 'antd'
import { CONTRACTS } from '../contracts'
import type { Todo, FormattedTodo } from '../types'

export const useTodoList = () => {
  const [pendingTx, setPendingTx] = useState<string | null>(null)
  const [pendingTasks, setPendingTasks] = useState<Set<string>>(new Set())

  // 读取合约数据
  const { 
    data: todos, 
    isLoading: isLoadingTodos, 
    refetch: refetchTodos 
  } = useReadContract({
    address: CONTRACTS.TodoList.address,
    abi: CONTRACTS.TodoList.abi,
    functionName: 'getTodos',
  })

  // 写入合约
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  // 监听交易状态
  const { isLoading: isTxLoading } = useWaitForTransactionReceipt({
    hash: pendingTx as `0x${string}`,
  })

  // 格式化待办事项数据
  const formattedTodos: FormattedTodo[] = todos ? (todos as Todo[]).map(todo => ({
    id: Number(todo.id),
    content: todo.content,
    isCompleted: todo.isCompleted,
    creator: todo.creator,
    createdAt: Number(todo.createdAt),
    completedAt: Number(todo.completedAt)
  })) : []

  // 计算统计数据
  const completedCount = formattedTodos.filter(todo => todo.isCompleted).length
  const completionRate = formattedTodos.length > 0 ? (completedCount / formattedTodos.length) * 100 : 0

  // 添加待办事项
  const addTodo = useCallback(async (content: string) => {
    if (!content.trim()) {
      message.error('请输入待办事项内容')
      return false
    }

    const taskKey = `addTodo_${content}`
    if (pendingTasks.has(taskKey)) {
      message.warning('相同的添加操作正在进行中，请等待完成')
      return false
    }

    try {
      setPendingTasks(prev => new Set([...prev, taskKey]))
      
      const hash = await writeContractAsync({
        address: CONTRACTS.TodoList.address,
        abi: CONTRACTS.TodoList.abi,
        functionName: 'addTodo',
        args: [content],
      })
      console.log(hash,'sss')

      if (hash) {
        setPendingTx(hash)
        message.success('待办事项添加成功！')
        
        // 刷新数据
        setTimeout(() => {
          refetchTodos()
        }, 2000)
        
        return true
      }
      return false
    } catch (error: any) {
      console.error('添加待办事项失败:', error)
      message.error(error.message || '添加待办事项失败')
      return false
    } finally {
      setPendingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskKey)
        return newSet
      })
    }
  }, [writeContractAsync, refetchTodos, pendingTasks])

  // 完成待办事项
  const completeTodo = useCallback(async (id: number) => {
    const taskKey = `completeTodo_${id}`
    if (pendingTasks.has(taskKey)) {
      message.warning('该待办事项正在处理中，请等待完成')
      return false
    }

    try {
      setPendingTasks(prev => new Set([...prev, taskKey]))
      
      // 找到对应ID的todo在数组中的索引
      const todoIndex = formattedTodos.findIndex(todo => todo.id === id)
      if (todoIndex === -1) {
        message.error('未找到指定的待办事项')
        return false
      }
      
      const hash = await writeContractAsync({
        address: CONTRACTS.TodoList.address,
        abi: CONTRACTS.TodoList.abi,
        functionName: 'completeTodo',
        args: [BigInt(todoIndex)], // 使用索引，不是ID
      })

      if (hash) {
        setPendingTx(hash)
        message.success('待办事项状态更新成功！')
        
        // 刷新数据
        setTimeout(() => {
          refetchTodos()
        }, 2000)
        
        return true
      }
      return false
    } catch (error: any) {
      console.error('完成待办事项失败:', error)
      message.error(error.message || '更新待办事项状态失败')
      return false
    } finally {
      setPendingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskKey)
        return newSet
      })
    }
  }, [writeContractAsync, refetchTodos, pendingTasks, formattedTodos])

  // 刷新待办事项列表
  const refreshTodos = useCallback(async () => {
    try {
      await refetchTodos()
      message.success('待办事项列表刷新成功！')
    } catch (error) {
      message.error('刷新待办事项列表失败')
    }
  }, [refetchTodos])

  return {
    todos: formattedTodos,
    isLoading: isLoadingTodos || isWritePending || isTxLoading,
    completedCount,
    completionRate,
    pendingTasks: Array.from(pendingTasks),
    addTodo,
    completeTodo,
    refreshTodos,
  }
}