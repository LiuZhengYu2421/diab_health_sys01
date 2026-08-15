<template>
  <div class="admin-root">
    <!-- ================= 左侧导航（深色后台风格，与普通用户前台区分） ================= -->
    <aside class="admin-aside">
      <div class="aside-brand">
        <img src="/img/logo.png" alt="logo" class="brand-logo">
        <div class="brand-text">
          <div class="brand-name">智糖管理后台</div>
          <div class="brand-en">DIABETES ADMIN</div>
        </div>
      </div>

      <nav class="aside-nav">
        <!-- 数据总览 -->
        <div class="nav-item nav-single" :class="{ active: current === 'dashboard' }"
             @click="current = 'dashboard'">
          <i class="fa-solid fa-gauge-high"></i>
          <span>数据总览</span>
        </div>

        <!-- 分组导航 -->
        <div v-for="group in menuGroups" :key="group.title" class="nav-group">
          <div class="nav-group-title">
            <i :class="group.icon"></i>
            <span>{{ group.title }}</span>
          </div>
          <div v-for="child in group.children" :key="child.key"
               class="nav-item" :class="{ active: current === child.key }"
               @click="current = child.key">
            <i :class="child.icon"></i>
            <span>{{ child.label }}</span>
          </div>
        </div>
      </nav>

      <div class="aside-foot">
        <i class="fa-solid fa-user-shield"></i>
        <span>管理员权限</span>
      </div>
    </aside>

    <!-- ================= 主区域 ================= -->
    <div class="admin-main">
      <!-- 顶栏 -->
      <header class="admin-topbar">
        <div class="topbar-left">
          <h2 class="topbar-title">{{ currentTitle }}</h2>
          <span class="topbar-sub">{{ currentDesc }}</span>
        </div>
        <div class="topbar-right">
          <button class="topbar-btn" @click="goFront">
            <i class="fa-solid fa-house"></i>
            <span>返回前台</span>
          </button>
          <div class="topbar-user">
            <img :src="userStore.avatar" alt="avatar" class="user-avatar">
            <span class="user-name">{{ userStore.displayName }}</span>
          </div>
          <button class="topbar-btn topbar-logout" @click="handleLogout">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>退出</span>
          </button>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="admin-content">
        <component :is="currentComponent" v-bind="isPending ? pendingProps : {}" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showFloatingAlert } from '@/utils/alert'

import DashboardPanel from './admin/DashboardPanel.vue'
import DoctorPanel from './admin/DoctorPanel.vue'
import ArticlePanel from './admin/ArticlePanel.vue'
import TypePanel from './admin/TypePanel.vue'
import UserPanel from './admin/UserPanel.vue'
import PendingPanel from './admin/PendingPanel.vue'

const router = useRouter()
const userStore = useUserStore()

const current = ref('dashboard')

// 四大管理员职责导航（与《四人开发文档》第十三章对应）
const menuGroups = [
  {
    title: '核心数据运维',
    icon: 'fa-solid fa-database',
    desc: '人员一 · 核心数据运维管理员',
    children: [
      { key: 'doctors', label: '医生团队管理', icon: 'fa-solid fa-user-doctor' },
      { key: 'articles', label: '健康科普文章', icon: 'fa-solid fa-newspaper' },
      { key: 'types', label: '糖尿病类型', icon: 'fa-solid fa-disease' }
    ]
  },
  {
    title: '用户与数据',
    icon: 'fa-solid fa-users',
    desc: '人员二 · 用户账号与数据管理员',
    children: [
      { key: 'users', label: '用户账号管理', icon: 'fa-solid fa-address-card' },
      { key: 'risks', label: '风险数据管理', icon: 'fa-solid fa-heart-circle-exclamation' },
      { key: 'punches', label: '打卡数据管理', icon: 'fa-solid fa-calendar-check' }
    ]
  },
  {
    title: '个性化资源',
    icon: 'fa-solid fa-heart-pulse',
    desc: '人员三 · 用户个性化资源管理员',
    children: [
      { key: 'plans', label: '生活方案管理', icon: 'fa-solid fa-clipboard-list' },
      { key: 'advice', label: '生活建议管理', icon: 'fa-solid fa-lightbulb' },
      { key: 'favorites', label: '资讯收藏运维', icon: 'fa-solid fa-bookmark' }
    ]
  },
  {
    title: 'AI 智能数据',
    icon: 'fa-solid fa-robot',
    desc: '人员四 · AI 智能数据管理员',
    children: [
      { key: 'aiops', label: 'AI 功能运维', icon: 'fa-solid fa-microchip' },
      { key: 'aigc', label: 'AI 生成数据', icon: 'fa-solid fa-wand-magic-sparkles' },
      { key: 'overview', label: '全局健康数据总览', icon: 'fa-solid fa-chart-pie' }
    ]
  }
]

// 建设中模块的说明（用于 PendingPanel）
const pendingMap = {
  risks: {
    title: '风险数据管理',
    owner: '人员二 · 用户账号与数据管理员',
    desc: '后台查看、管理全站用户的糖尿病风险评测数据，支持异常数据修正与合规管理。',
    points: ['全站风险评测数据查看', '异常数据修正', '合规审核']
  },
  punches: {
    title: '打卡数据管理',
    owner: '人员二 · 用户账号与数据管理员',
    desc: '统一管理全站用户打卡记录，查看全局打卡统计数据、清理无效打卡数据、维护用户打卡行为数据。',
    points: ['全局打卡统计', '打卡记录清理', '行为数据维护']
  },
  plans: {
    title: '生活方案管理',
    owner: '人员三 · 用户个性化资源管理员',
    desc: '后台查看、管理所有用户创建的饮食、运动、生活习惯方案，处理违规、无效方案数据。',
    points: ['全站方案查看', '违规方案处理', '方案数据维护']
  },
  advice: {
    title: '生活建议管理',
    owner: '人员三 · 用户个性化资源管理员',
    desc: '统一维护系统公共生活建议资源，管理前台展示的生活建议列表与详情数据。',
    points: ['公共建议维护', '建议列表管理', '详情数据管理']
  },
  favorites: {
    title: '资讯收藏运维',
    owner: '人员三 · 用户个性化资源管理员',
    desc: '后台查看全站用户收藏数据，保障收藏功能数据一致性与稳定性。',
    points: ['收藏数据查看', '数据一致性保障', '稳定性运维']
  },
  aiops: {
    title: 'AI 功能运维',
    owner: '人员四 · AI 智能数据管理员',
    desc: '管理 Dify 对接配置、智能对话日志、AI 咨询记录，排查 AI 回复异常、接口调用异常。',
    points: ['Dify 对接配置', '对话日志查看', 'AI 异常排查']
  },
  aigc: {
    title: 'AI 生成数据管理',
    owner: '人员四 · AI 智能数据管理员',
    desc: '后台查看、审核、管理 AI 自动生成的健康方案、AI 风险评估报告、用户生活状态分析报告。',
    points: ['AI 方案审核', '风险评估报告管理', '生活状态分析']
  },
  overview: {
    title: '全局健康数据总览',
    owner: '人员四 · AI 智能数据管理员',
    desc: '后台汇总展示全站用户风险数据、打卡数据、健康方案数据，实现系统健康数据可视化管理与运维。',
    points: ['风险数据汇总', '打卡数据汇总', '健康方案可视化']
  }
}

const currentMeta = computed(() => {
  if (current.value === 'dashboard') {
    return { title: '数据总览', desc: '全站核心数据一览' }
  }
  for (const group of menuGroups) {
    const child = group.children.find((c) => c.key === current.value)
    if (child) return { title: child.label, desc: group.desc }
  }
  return { title: '管理后台', desc: '' }
})

const currentTitle = computed(() => currentMeta.value.title)
const currentDesc = computed(() => currentMeta.value.desc)

const currentComponent = computed(() => {
  switch (current.value) {
    case 'dashboard':
      return DashboardPanel
    case 'doctors':
      return DoctorPanel
    case 'articles':
      return ArticlePanel
    case 'types':
      return TypePanel
    case 'users':
      return UserPanel
    default:
      return PendingPanel
  }
})

// 是否为建设中占位模块
const isPending = computed(() =>
  ['risks', 'punches', 'plans', 'advice', 'favorites', 'aiops', 'aigc', 'overview'].includes(current.value)
)

// 传递给 PendingPanel 的模块信息
const pendingProps = computed(() => {
  const info = pendingMap[current.value] || {
    title: '功能建设中',
    owner: '管理员',
    desc: '该模块正在建设中，敬请期待。',
    points: []
  }
  return info
})

function goFront() {
  router.push('/team')
}

async function handleLogout() {
  await userStore.logout()
  showFloatingAlert('已退出登录', 'info')
  router.replace('/login')
}
</script>

<style scoped>
/* ========== 整体后台布局（与普通用户前台完全区分） ========== */
.admin-root {
  display: flex;
  height: 100vh;
  width: 100%;
  background: #f0f2f7;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

/* ---------- 左侧深色导航 ---------- */
.admin-aside {
  width: 236px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #101a30 0%, #0b1224 100%);
  color: #cbd5e1;
}

.aside-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.brand-logo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
}
.brand-text {
  line-height: 1.2;
}
.brand-name {
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
}
.brand-en {
  color: #64748b;
  font-size: 10px;
  letter-spacing: 1.5px;
  margin-top: 2px;
}

.aside-nav {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0 20px;
}
.nav-single {
  margin-bottom: 4px;
}
.nav-group {
  margin-top: 8px;
}
.nav-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px 6px;
  color: #64748b;
  font-size: 11px;
  letter-spacing: 1px;
}
.nav-group-title i {
  width: 14px;
  text-align: center;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 18px 11px 32px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 13.5px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}
.nav-item i {
  width: 16px;
  text-align: center;
  font-size: 13px;
}
.nav-item:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.04);
}
.nav-item.active {
  color: #fff;
  background: rgba(37, 99, 235, 0.22);
  border-left-color: #3b82f6;
}

.aside-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #64748b;
  font-size: 12px;
}
.aside-foot i {
  color: #3b82f6;
}

/* ---------- 右侧主区域 ---------- */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  height: 62px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  z-index: 5;
}
.topbar-title {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
}
.topbar-sub {
  margin-left: 12px;
  font-size: 12px;
  color: #94a3b8;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.topbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.topbar-btn:hover {
  border-color: #3b82f6;
  color: #2563eb;
  background: #eff6ff;
}
.topbar-logout:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}
.topbar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 20px;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}
.user-name {
  font-size: 13px;
  color: #334155;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 22px 24px;
}
</style>
