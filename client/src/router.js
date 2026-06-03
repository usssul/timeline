import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import Login from './views/Login.vue'
import Register from './views/Register.vue'

// 空壳组件，首页渲染由 App.vue 处理
const HomeShell = { template: '<div></div>' }

const routes = [
  {
    path: '/',
    component: HomeShell,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()

  // 验证当前登录状态
  if (auth.token && !auth.user) {
    await auth.checkAuth()
  }

  // 未登录 → 跳转登录页
  if (!auth.isLoggedIn && !to.meta.guest) {
    return '/login'
  }

  // 已登录 → 访问任何游客页面都重定向到首页
  if (auth.isLoggedIn && to.meta.guest) {
    return '/'
  }
})

export default router
