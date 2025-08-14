// 合约配置文件
import Counter from './config/Counter'
import Greeting from './config/Greeting'
import TodoList from './config/TodoList'

export const CONTRACTS = {
    Counter,
    Greeting,
    TodoList
}

export type ContractName = keyof typeof CONTRACTS