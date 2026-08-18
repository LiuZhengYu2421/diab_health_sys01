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
        path: 'mine',
        name: 'mine',
        component: () => import('@/views/MineView.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'scheme',
        name: 'scheme',
        component: () => import('@/views/LifeSchemeView.vue'),
        meta: { title: '方案定制' }
      },
      {
        path: 'lifeadvice',
        name: 'lifeadvice',
        component: () => import('@/views/HealthConsultView.vue'),
        meta: { title: '健康咨询' }
      },
      {
        path: 'ai',
        name: 'ai',
        component: () => import('@/views/AiAssistantView.vue'),
        meta: { title: 'AI 智能助手' }
      },
      {
        path: 'consult',
        name: 'consult',
        component: () => import('@/views/DoctorConsultView.vue'),
        meta: { title: '医师在线咨询' }
      },
      {
        path: 'punch-analyze',
        name: 'punch-analyze',
        component: () => import('@/views/PunchAnalyzeView.vue'),
        meta: { title: '智能打卡分析' }
      },
      {
        path: 'risk-predict',
        name: 'risk-predict',
        component: () => import('@/views/RiskPredictView.vue'),
        meta: { title: '糖尿病风险预测' }
      }
    ]
  },
  {
    // 管理后台：独立顶级路由，自带后台布局，与普通用户前台界面区分
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: '管理后台', requiresAdmin: true }
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

// 判断是否为浏览器刷新（刷新时浏览器重新加载，页面内存状态会丢失）
function isPageReload() {
  if (typeof window === 'undefined' || !window.performance) return false
  const entries = window.performance.getEntriesByType('navigation')
  return entries.length > 0 && entries[0].type === 'reload'
}

// 标记是否已处理完“刷新回首页”，navigation.type 在页面加载后不会变化，
// 因此只在应用启动后的首次导航判断一次，避免误伤后续的正常页面跳转
let isFirstNavigation = true

// 全局前置守卫：未登录跳登录页；管理页校验 role=admin；刷新页面时回到首页
router.beforeEach((to, from, next) => {
  const token = getToken()
  const userInfo = getUser() || {}
  if (!to.meta.public && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && token) {
    // 已登录访问登录页：管理员直接进入管理后台，普通用户进入前台首页
    const isAdmin = userInfo.role === 'admin' || getTokenRole(token) === 'admin'
    next({ path: isAdmin ? '/admin' : '/team' })
  } else if (to.meta.requiresAdmin && userInfo.role !== 'admin' && getTokenRole(token) !== 'admin') {
    // 非管理员访问管理后台：跳回首页（userInfo 缺失时从 token 解码 role 兜底）
    next({ path: '/team' })
  } else if (isFirstNavigation && isPageReload() && to.path !== '/team' && to.path !== '/login' && !to.meta.public) {
    // 浏览器刷新：首次导航跳转到首页，避免页面内存状态丢失导致异常
    isFirstNavigation = false
    next({ path: '/team' })
  } else {
    isFirstNavigation = false
    next()
  }
})

// 动态设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 智糖健康管理平台` : '智糖健康管理平台'
})

export default router
