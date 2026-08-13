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
          <a v-for="link in navLinks" :key="link.path" href="javascript:;"
             class="nav-link" :class="{ 'nav-link-active': isNavActive(link) }" @click="go(link)">
            {{ link.title }}
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
            <div class="dropdown-item" @click="goMine('profile')">
              <i class="fa-solid fa-user"></i><span>个人中心</span>
            </div>
            <div class="dropdown-item" @click="goMine('plan')">
              <i class="fa-solid fa-clipboard-list"></i><span>我的方案</span>
            </div>
            <div class="dropdown-item" @click="goMine('check')">
              <i class="fa-solid fa-calendar-check"></i><span>打卡记录</span>
            </div>
            <div class="dropdown-item" @click="goMine('help')">
              <i class="fa-solid fa-circle-question"></i><span>帮助中心</span>
            </div>
            <div class="dropdown-item dropdown-logout" @click="handleLogout">
              <i class="fa-solid fa-right-from-bracket"></i><span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ================= 主体区域 ================= -->
    <div class="main-container">
      <!-- 左侧菜单 -->
      <aside class="side-menu">
        <div class="side-menu-title">功能导航</div>
        <div class="side-menu-list">
          <!-- 分组菜单 -->
          <div v-for="group in menuGroups" :key="group.title" class="menu-group">
            <div class="menu-item" :class="{ open: group.open }" @click="group.open = !group.open">
              <div class="menu-left">
                <i :class="group.icon"></i>
                <span class="menu-title">{{ group.title }}</span>
              </div>
              <i class="fa-solid fa-chevron-down submenu-arrow"></i>
            </div>
            <div class="submenu" :class="{ open: group.open }">
              <div v-for="child in group.children" :key="child.title"
                   class="submenu-item" :class="{ active: isMenuActive(child) }" @click="go(child)">
                <span class="submenu-dot"><i class="fa-solid fa-circle"></i></span>
                <span>{{ child.title }}</span>
              </div>
            </div>
          </div>

          <!-- 一级菜单 -->
          <div v-for="item in singleMenus" :key="item.title"
               class="menu-item" :class="{ active: isMenuActive(item) }" @click="go(item)">
            <div class="menu-left">
              <i :class="item.icon"></i>
              <span class="menu-title">{{ item.title }}</span>
            </div>
            <i class="fa-solid fa-angle-right menu-arrow"></i>
          </div>

          <!-- 管理后台（仅管理员可见） -->
          <div v-if="userStore.isAdmin" class="menu-item menu-admin"
               :class="{ active: isMenuActive(adminMenu) }" @click="go(adminMenu)">
            <div class="menu-left">
              <i :class="adminMenu.icon"></i>
              <span class="menu-title">{{ adminMenu.title }}</span>
            </div>
            <i class="fa-solid fa-angle-right menu-arrow"></i>
          </div>
        </div>
      </aside>

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
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showFloatingAlert } from '@/utils/alert'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const dropdownOpen = ref(false)

const navLinks = [
  { title: '首页', path: '/team' },
  { title: '健康科普', path: '/science' },
  { title: 'AI助手', path: '/ai' }
]

const menuGroups = reactive([
  {
    title: '首页',
    icon: 'fa-solid fa-house',
    open: true,
    children: [
      { title: '专业医师团队', path: '/team' },
      { title: '健康科普', path: '/science' }
    ]
  },
  {
    title: '个人中心',
    icon: 'fa-solid fa-user',
    open: false,
    children: [
      { title: '个人信息', path: '/mine', panel: 'profile' },
      { title: '我的方案', path: '/mine', panel: 'plan' },
      { title: '我的建议', path: '/mine', panel: 'advice' },
      { title: '打卡记录', path: '/mine', panel: 'check' },
      { title: '帮助中心', path: '/mine', panel: 'help' }
    ]
  }
])

const singleMenus = [
  { title: '方案定制', icon: 'fa-solid fa-clipboard-list', path: '/scheme' },
  { title: '生活建议', icon: 'fa-solid fa-heart-pulse', path: '/lifeadvice' },
  { title: 'AI助手', icon: 'fa-solid fa-robot', path: '/ai' }
]

// 管理后台入口（仅 admin 角色可见，模板中用 v-if="userStore.isAdmin" 控制）
const adminMenu = { title: '管理后台', icon: 'fa-solid fa-shield-halved', path: '/admin' }

function go(item) {
  dropdownOpen.value = false
  if (item.panel) {
    router.push({ path: item.path, query: { panel: item.panel } })
  } else {
    router.push(item.path)
  }
}

function goMine(panel) {
  dropdownOpen.value = false
  router.push({ path: '/mine', query: { panel } })
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
