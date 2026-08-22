<template>
  <div class="layout-root">
    <!-- ================= 顶部导航 ================= -->
    <header class="top-nav">
      <div class="nav-inner">
        <!-- 移动端汉堡按钮 -->
        <button class="nav-hamburger" :class="{ open: mobileOpen }" @click="mobileOpen = !mobileOpen" aria-label="菜单">
          <i class="fa-solid fa-bars"></i>
        </button>

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

    <!-- 移动端遮罩 -->
    <transition name="drawer-fade">
      <div v-if="mobileOpen" class="mobile-mask" @click="mobileOpen = false"></div>
    </transition>

    <!-- 移动端抽屉菜单 -->
    <transition name="drawer-slide">
      <aside v-if="mobileOpen" class="mobile-drawer">
        <div class="drawer-head">
          <div class="drawer-user">
            <div class="avatar-wrap">
              <img :src="userStore.avatar" alt="avatar">
            </div>
            <div>
              <div class="drawer-name">{{ userStore.displayName }}</div>
              <div class="drawer-desc">{{ userStore.displayDesc }}</div>
            </div>
          </div>
          <button class="drawer-close" @click="mobileOpen = false"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <nav class="drawer-nav">
          <a href="javascript:;" class="drawer-link" :class="{ active: isNavActive(navLinks[0]) }" @click="go(navLinks[0])">
            <i class="fa-solid fa-house"></i><span>{{ navLinks[0].title }}</span>
          </a>

          <template v-for="group in menuGroups" :key="group.title">
            <div class="drawer-group-title">
              <i :class="group.icon"></i><span>{{ group.title }}</span>
            </div>
            <a v-for="child in group.children" :key="child.title" href="javascript:;"
               class="drawer-link" :class="{ active: isMenuActive(child) }" @click="go(child)">
              <i class="fa-solid fa-angle-right"></i><span>{{ child.title }}</span>
            </a>
          </template>

          <div class="drawer-group-title"><i class="fa-solid fa-clipboard-list"></i><span>常用功能</span></div>
          <a v-for="item in singleMenus" :key="item.title" href="javascript:;"
             class="drawer-link" :class="{ active: isMenuActive(item) }" @click="go(item)">
            <i :class="item.icon"></i><span>{{ item.title }}</span>
          </a>

          <a v-if="userStore.isAdmin" href="javascript:;" class="drawer-link" :class="{ active: isMenuActive(adminMenu) }" @click="go(adminMenu)">
            <i :class="adminMenu.icon"></i><span>{{ adminMenu.title }}</span>
          </a>
        </nav>

        <div class="drawer-foot" @click="handleLogout">
          <i class="fa-solid fa-right-from-bracket"></i><span>退出登录</span>
        </div>
      </aside>
    </transition>

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
const mobileOpen = ref(false)

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
      { title: '智能风险预测', path: '/risk-predict' }
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
  mobileOpen.value = false
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

/* ================= 移动端汉堡按钮 ================= */
.nav-hamburger {
  display: none;
  width: 40px;
  height: 40px;
  border: 1px solid #e3eaf5;
  border-radius: 10px;
  background: #fff;
  color: #26314a;
  font-size: 16px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.nav-hamburger:active {
  background: #f1f6ff;
}

/* ================= 移动端遮罩与抽屉 ================= */
.mobile-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 999;
  backdrop-filter: blur(2px);
}
.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 82vw;
  background: #fff;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 8px 0 32px rgba(15, 23, 42, 0.15);
}
.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eef2f8;
  background: linear-gradient(135deg, #eff6ff, #f8fbff);
}
.drawer-user {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.drawer-user .avatar-wrap {
  width: 44px;
  height: 44px;
}
.drawer-name {
  font-size: 15px;
  font-weight: 600;
  color: #26314a;
}
.drawer-desc {
  font-size: 12px;
  color: #93a0b8;
}
.drawer-close {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 15px;
  cursor: pointer;
  flex-shrink: 0;
}
.drawer-close:active {
  background: #eef2f8;
}
.drawer-nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
}
.drawer-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 10px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 1px;
}
.drawer-group-title i {
  font-size: 12px;
}
.drawer-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 10px;
  color: #334155;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
}
.drawer-link i {
  width: 16px;
  text-align: center;
  font-size: 13px;
  color: #93a0b8;
  transition: color 0.2s;
}
.drawer-link:active {
  background: #f1f6ff;
}
.drawer-link.active {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  color: #fff;
  font-weight: 600;
}
.drawer-link.active i {
  color: #fff;
}
.drawer-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #eef2f8;
  color: #e34d59;
  font-size: 14px;
  cursor: pointer;
}
.drawer-foot i {
  width: 16px;
  text-align: center;
}
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.28s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}

/* ================= 移动端断点 ================= */
@media (max-width: 768px) {
  .nav-hamburger {
    display: flex;
  }
  .nav-links {
    display: none;
  }
  .nav-inner {
    gap: 12px;
    padding: 0 14px;
    height: 56px;
  }
  .brand-logo {
    height: 32px;
  }
  .brand-name {
    font-size: 15px;
    letter-spacing: 0.5px;
  }
  .avatar-wrap {
    width: 36px;
    height: 36px;
  }
  .main-container {
    padding: 12px;
    margin: 0 auto 24px;
  }
  .page-wrap {
    height: calc(100vh - 84px);
    min-height: 400px;
  }
  .user-dropdown-menu {
    position: fixed;
    right: 12px;
    top: 58px;
  }
}

@media (max-width: 420px) {
  .brand-name {
    font-size: 14px;
  }
}
</style>
