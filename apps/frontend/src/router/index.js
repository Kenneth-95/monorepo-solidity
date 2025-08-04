import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/counter'
    },
    {
      path: '/counter',
      name: 'counter',
      component: () => import('../views/CounterContract.vue'),
    },
    {
      path: '/todolist',
      name: 'todolist',
      component: () => import('../views/TodoListContract.vue'),
    },
    {
      path: '/greeting',
      name: 'greeting',
      component: () => import('../views/GreetingContract.vue'),
    },
  ],
})

export default router
