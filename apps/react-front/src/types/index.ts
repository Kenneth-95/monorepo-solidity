export interface Todo {
  id: bigint
  content: string
  isCompleted: boolean
  creator: string
  createdAt: bigint
  completedAt: bigint
}

export interface FormattedTodo {
  id: number
  content: string
  isCompleted: boolean
  creator: string
  createdAt: number
  completedAt: number
}