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
        <component :is="currentComponent" />
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
import UserPanel from './admin/UserPanel.vue'
import AiDataAssistantPanel from './admin/AiDataAssistantPanel.vue'
import OperationLogPanel from './admin/OperationLogPanel.vue'

const router = useRouter()
const userStore = useUserStore()

const current = ref('dashboard')

// 管理员职责导航
const menuGroups = [
  {
    title: '核心数据运维',
    icon: 'fa-solid fa-database',
    desc: '人员一 · 核心数据运维管理员',
    children: [
      { key: 'doctors', label: '医生团队管理', icon: 'fa-solid fa-user-doctor' },
      { key: 'articles', label: '健康科普文章', icon: 'fa-solid fa-newspaper' }
    ]
  },
  {
    title: '用户与数据',
    icon: 'fa-solid fa-users',
    desc: '人员二 · 用户账号与数据管理员',
    children: [
      { key: 'users', label: '用户账号管理', icon: 'fa-solid fa-address-card' }
    ]
  },
  {
    title: 'AI 智能数据',
    icon: 'fa-solid fa-robot',
    desc: '人员四 · AI 智能数据管理员',
    children: [
      { key: 'aiops', label: 'AI 功能运维', icon: 'fa-solid fa-microchip' },
      { key: 'oplog', label: '操作日志', icon: 'fa-solid fa-list-check' }
    ]
  }
]

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
    case 'users':
      return UserPanel
    case 'aiops':
      return AiDataAssistantPanel
    case 'oplog':
      return OperationLogPanel
    default:
      return DashboardPanel
  }
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

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .admin-aside {
    width: 62px;
  }
  .aside-brand {
    padding: 14px 0;
    justify-content: center;
  }
  .brand-text {
    display: none;
  }
  .nav-item {
    padding: 13px 0;
    justify-content: center;
  }
  .nav-item i {
    font-size: 16px;
  }
  .nav-item span {
    display: none;
  }
  .nav-group-title {
    justify-content: center;
    padding: 10px 0 4px;
  }
  .nav-group-title span {
    display: none;
  }
  .aside-foot {
    justify-content: center;
    padding: 14px 0;
  }
  .aside-foot span {
    display: none;
  }
  .admin-content {
    padding: 14px 12px;
  }
  .admin-topbar {
    padding: 10px 12px;
  }
  .topbar-title {
    font-size: 15px;
  }
  .topbar-user {
    gap: 6px;
  }
  .user-name {
    display: none;
  }
}
</style>
