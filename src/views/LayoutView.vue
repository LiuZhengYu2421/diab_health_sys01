<template>
  <div class="layout-root">
    <!-- ================= 顶部导航 ================= -->
    <header class="top-nav">
      <div class="nav-inner">
        <div class="brand">
          <img class="brand-logo" src="/img/logo.png" alt="logo">
          <span class="brand-name">智糖健康管理平台</span>
        </div>

        <nav class="nav-links">
          <!-- 首页 -->
          <a v-for="link in navLinks" :key="link.path" href="javascript:;"
             class="nav-link" :class="{ 'nav-link-active': isNavActive(link) }" @click="go(link)">
            {{ link.title }}
          </a>

          <!-- 分组下拉菜单 -->
          <div v-for="group in menuGroups" :key="group.title" class="nav-drop"
               :class="{ open: openDropKey === group.title }">
            <a href="javascript:;" class="nav-link nav-drop-toggle"
               :class="{ 'nav-link-active': isGroupActive(group) }" @click="toggleDrop(group)">
              <i :class="group.icon"></i>
              <span>{{ group.title }}</span>
              <i class="fa-solid fa-chevron-down nav-drop-arrow"></i>
            </a>
            <div class="nav-drop-menu">
              <a v-for="child in group.children" :key="child.title" href="javascript:;"
                 class="nav-drop-item" :class="{ active: isMenuActive(child) }" @click="go(child)">
                {{ child.title }}
              </a>
            </div>
          </div>

          <!-- 一级菜单 -->
          <a v-for="item in singleMenus" :key="item.title" href="javascript:;"
             class="nav-link" :class="{ 'nav-link-active': isMenuActive(item) }" @click="go(item)">
            {{ item.title }}
          </a>

          <!-- 管理后台（仅管理员可见） -->
          <a v-if="userStore.isAdmin" href="javascript:;"
             class="nav-link" :class="{ 'nav-link-active': isMenuActive(adminMenu) }" @click="go(adminMenu)">
            {{ adminMenu.title }}
          </a>
        </nav>

        <!-- 用户下拉 -->
        <div class="user-dropdown" :class="{ open: dropdownOpen }">
          <div class="user-box" @click="toggleDropdown">
            <div class="avatar-wrap">
              <img :src="userStore.avatar" alt="avatar">
            </div>
            <div class="user-meta">
              <span class="user-name">{{ userStore.displayName }}</span>
              <span class="user-desc">{{ userStore.displayDesc }}</span>
            </div>
            <i class="fa-solid fa-angle-down user-arrow"></i>
          </div>

          <div class="user-dropdown-menu">
            <div class="dropdown-item dropdown-logout" @click="handleLogout">
              <i class="fa-solid fa-right-from-bracket"></i><span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ================= 主体区域 ================= -->
    <div class="main-container">
      <!-- 右侧内容区 -->
      <main class="content">
        <div class="page-wrap">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showFloatingAlert } from '@/utils/alert'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const dropdownOpen = ref(false)
const openDropKey = ref('')

const navLinks = [
  { title: '首页', path: '/team' }
]

const menuGroups = [
  {
    title: '个人中心',
    icon: 'fa-solid fa-user',
    children: [
      { title: '个人信息', path: '/mine', panel: 'profile' },
      { title: '我的方案', path: '/mine', panel: 'plan' },
      { title: '我的建议', path: '/mine', panel: 'advice' },
      { title: '打卡记录', path: '/mine', panel: 'check' },
      { title: '我的咨询', path: '/mine', panel: 'consult' },
      { title: '帮助中心', path: '/mine', panel: 'help' }
    ]
  },
  {
    title: 'AI 智能服务',
    icon: 'fa-solid fa-robot',
    children: [
      { title: 'AI智能助手', path: '/ai' },
      { title: '医师在线咨询', path: '/consult' },
      { title: '智能打卡分析', path: '/punch-analyze' },
      { title: '糖尿病风险预测', path: '/risk-predict' }
    ]
  }
]

const singleMenus = [
  { title: '方案定制', icon: 'fa-solid fa-clipboard-list', path: '/scheme' },
  { title: '健康咨询', icon: 'fa-solid fa-newspaper', path: '/lifeadvice' }
]

// 管理后台入口（仅 admin 角色可见，模板中用 v-if="userStore.isAdmin" 控制）
const adminMenu = { title: '管理后台', icon: 'fa-solid fa-shield-halved', path: '/admin' }

function toggleDrop(group) {
  openDropKey.value = openDropKey.value === group.title ? '' : group.title
}

function isGroupActive(group) {
  return group.children.some((child) => isMenuActive(child))
}

function go(item) {
  dropdownOpen.value = false
  openDropKey.value = ''
  if (item.panel) {
    router.push({ path: item.path, query: { panel: item.panel } })
  } else {
    router.push(item.path)
  }
}

function isMenuActive(item) {
  if (route.path !== item.path) return false
  if (item.panel) return route.query.panel === item.panel
  return true
}

function isNavActive(link) {
  return route.path === link.path
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

async function handleLogout() {
  dropdownOpen.value = false
  await userStore.logout()
  showFloatingAlert('已退出登录', 'info')
  router.replace('/login')
}

// 点击页面其他区域关闭下拉
function onDocClick(e) {
  if (!e.target.closest('.user-dropdown')) {
    dropdownOpen.value = false
  }
  if (!e.target.closest('.nav-drop')) {
    openDropKey.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<style>
/* 主框架布局样式（index.css 已在 index.html 全局引入） */
.page-wrap {
  overflow-y: auto;
  height: calc(100vh - 132px);
  min-height: 600px;
}

/* 顶栏激活态 */
.nav-link-active {
  color: #2563eb;
}
.nav-link-active::after {
  width: 100% !important;
}
</style>
