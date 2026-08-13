import { createRouter, createWebHistory } from 'vue-router'
import { getToken, getUser } from '@/utils/storage'
import { getTokenRole } from '@/utils/token'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录 · 注册', public: true }
  },
  {
    path: '/',
    component: () => import('@/views/LayoutView.vue'),
    redirect: '/team',
    children: [
      {
        path: 'team',
        name: 'team',
        component: () => import('@/views/TeamView.vue'),
        meta: { title: '专业医师团队' }
      },
      {
        path: 'science',
        name: 'science',
        component: () => import('@/views/ScienceView.vue'),
        meta: { title: '健康科普' }
      },
      {
        path: 'mine',
        name: 'mine',
        component: () => import('@/views/MineView.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'scheme',
        name: 'scheme',
        component: () => import('@/views/PlaceholderView.vue'),
        meta: { title: '方案定制', placeholder: true }
      },
      {
        path: 'lifeadvice',
        name: 'lifeadvice',
        component: () => import('@/views/PlaceholderView.vue'),
        meta: { title: '生活建议', placeholder: true }
      },
      {
        path: 'ai',
        name: 'ai',
        component: () => import('@/views/PlaceholderView.vue'),
        meta: { title: 'AI 助手', placeholder: true }
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/AdminView.vue'),
        meta: { title: '管理后台', requiresAdmin: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/team'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫：未登录跳登录页；管理页校验 role=admin
router.beforeEach((to, from, next) => {
  const token = getToken()
  const userInfo = getUser() || {}
  if (!to.meta.public && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && token) {
    next({ path: '/team' })
  } else if (to.meta.requiresAdmin && userInfo.role !== 'admin' && getTokenRole(token) !== 'admin') {
    // 非管理员访问管理后台：跳回首页（userInfo 缺失时从 token 解码 role 兜底）
    next({ path: '/team' })
  } else {
    next()
  }
})

// 动态设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 智糖健康管理平台` : '智糖健康管理平台'
})

export default router
