<template>
  <div class="auth-container">
    <!-- 左侧品牌区 -->
    <div class="brand-panel">
      <div class="brand-top">
        <div class="brand-icon"><i class="fa-solid fa-staff-snake"></i></div>
        <span class="brand-name">智糖健康</span>
      </div>

      <div class="brand-body">
        <h1>科学控糖<br>智慧生活</h1>
        <p class="brand-slogan">您的专属糖尿病健康管理平台</p>
        <ul class="feature-list">
          <li><i class="fa-solid fa-circle-check"></i> 专业医师团队在线服务</li>
          <li><i class="fa-solid fa-circle-check"></i> 个性化饮食运动方案</li>
          <li><i class="fa-solid fa-circle-check"></i> 智能血糖数据管理</li>
          <li><i class="fa-solid fa-circle-check"></i> 每日健康打卡陪伴</li>
        </ul>
      </div>

      <div class="brand-footer">智慧控糖 · 让健康更简单</div>
    </div>

    <!-- 右侧表单区 -->
    <div class="form-panel">
      <div class="auth-card">
        <h2 class="auth-title">{{ activeTab === 'login' ? '欢迎回来' : '创建账号' }}</h2>

        <!-- Tab 切换 -->
        <div class="tab-nav">
          <div class="tab-slider" :class="{ 'to-register': activeTab === 'register' }"></div>
          <button type="button" class="tab-btn" :class="{ active: activeTab === 'login' }" @click="switchTab('login')">登录</button>
          <button type="button" class="tab-btn" :class="{ active: activeTab === 'register' }" @click="switchTab('register')">注册</button>
        </div>

        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" class="auth-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="loginUsername">用户名</label>
            <div class="input-wrap">
              <i class="fa-solid fa-user"></i>
              <input id="loginUsername" v-model.trim="loginForm.username" type="text" placeholder="请输入用户名" autocomplete="username">
            </div>
          </div>

          <div class="form-group">
            <label for="loginPassword">密码</label>
            <div class="input-wrap">
              <i class="fa-solid fa-lock"></i>
              <input id="loginPassword" v-model="loginForm.password" :type="showPwd ? 'text' : 'password'" placeholder="请输入密码" autocomplete="current-password">
              <i class="fa-solid pwd-toggle" :class="showPwd ? 'fa-eye-slash' : 'fa-eye'" @click="showPwd = !showPwd"></i>
            </div>
          </div>

          <div class="form-options">
            <label class="check-label">
              <input v-model="loginForm.remember" type="checkbox" class="check-input">
              <span class="check-box"><i class="fa-solid fa-check"></i></span>
              <span class="check-text">记住密码</span>
            </label>
            <a href="javascript:;" class="forgot-link" @click="handleForgot">忘记密码？</a>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ loading ? '登录中…' : '登 录' }}</span>
          </button>
        </form>

        <!-- 注册表单 -->
        <form v-else class="auth-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="regUsername">用户名</label>
            <div class="input-wrap">
              <i class="fa-solid fa-user"></i>
              <input id="regUsername" v-model.trim="regForm.username" type="text" placeholder="请输入用户名（3~20位）" autocomplete="username">
            </div>
          </div>

          <div class="form-group">
            <label for="regNickname">昵称</label>
            <div class="input-wrap">
              <i class="fa-solid fa-id-badge"></i>
              <input id="regNickname" v-model.trim="regForm.nickname" type="text" placeholder="请输入昵称（选填）" autocomplete="nickname">
            </div>
          </div>

          <div class="form-group">
            <label for="regPassword">密码</label>
            <div class="input-wrap">
              <i class="fa-solid fa-lock"></i>
              <input id="regPassword" v-model="regForm.password" :type="showRegPwd ? 'text' : 'password'" placeholder="请输入密码（6位以上）" autocomplete="new-password">
              <i class="fa-solid pwd-toggle" :class="showRegPwd ? 'fa-eye-slash' : 'fa-eye'" @click="showRegPwd = !showRegPwd"></i>
            </div>
          </div>

          <div class="form-group">
            <label for="regConfirmPassword">确认密码</label>
            <div class="input-wrap">
              <i class="fa-solid fa-lock"></i>
              <input id="regConfirmPassword" v-model="regForm.confirmPassword" :type="showRegConfirm ? 'text' : 'password'" placeholder="请再次输入密码" autocomplete="new-password">
              <i class="fa-solid pwd-toggle" :class="showRegConfirm ? 'fa-eye-slash' : 'fa-eye'" @click="showRegConfirm = !showRegConfirm"></i>
            </div>
          </div>

          <div class="form-options">
            <label class="check-label">
              <input v-model="regForm.agree" type="checkbox" class="check-input">
              <span class="check-box"><i class="fa-solid fa-check"></i></span>
              <span class="check-text">我已阅读并同意《用户服务协议》</span>
            </label>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ loading ? '注册中…' : '注 册' }}</span>
          </button>
        </form>

        <p v-if="isMock" class="agreement" style="margin-top:16px; color:#93a0b8;">
          <i class="fa-solid fa-info-circle"></i> 当前为本地演示模式（Mock），后端对接后自动切换为真实接口
        </p>
        <p class="agreement">
          登录即代表同意 <a href="javascript:;">《用户服务协议》</a> 与 <a href="javascript:;">《隐私政策》</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showFloatingAlert } from '@/utils/alert'
import { isMockMode } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isMock = isMockMode()
const activeTab = ref('login')
const loading = ref(false)
const showPwd = ref(false)
const showRegPwd = ref(false)
const showRegConfirm = ref(false)

const REMEMBER_KEY = 'zhitang_remembered'

const loginForm = reactive({
  username: '',
  password: '',
  remember: true
})

// 页面加载时回填「记住密码」的账号信息
try {
  const saved = JSON.parse(localStorage.getItem(REMEMBER_KEY))
  if (saved && typeof saved === 'object') {
    loginForm.username = saved.username || ''
    // 兼容旧版明文存储；新写入的密码为 base64 编码
    loginForm.password = saved.password
      ? (() => { try { return decodeURIComponent(escape(atob(saved.password))) } catch (e) { return saved.password } })()
      : ''
    loginForm.remember = !!saved.password
  }
} catch (e) {
  /* 忽略损坏的本地缓存 */
}

const regForm = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  agree: false
})

function switchTab(tab) {
  activeTab.value = tab
}

async function handleLogin() {
  if (!loginForm.username) return showFloatingAlert('请输入用户名', 'warning')
  if (!loginForm.password) return showFloatingAlert('请输入密码', 'warning')
  loading.value = true
  try {
    await userStore.login({ username: loginForm.username, password: loginForm.password })
    rememberCredentials()
    showFloatingAlert('登录成功，欢迎回来！', 'success')
    const redirect = route.query.redirect
    router.replace(typeof redirect === 'string' ? redirect : '/team')
  } catch (err) {
    showFloatingAlert(err.message || '登录失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  if (!regForm.username) return showFloatingAlert('请输入用户名', 'warning')
  if (regForm.username.length < 3) return showFloatingAlert('用户名至少 3 个字符', 'warning')
  if (!regForm.password) return showFloatingAlert('请输入密码', 'warning')
  if (regForm.password.length < 6) return showFloatingAlert('密码至少 6 位', 'warning')
  if (regForm.password !== regForm.confirmPassword) return showFloatingAlert('两次输入的密码不一致', 'error')
  if (!regForm.agree) return showFloatingAlert('请先阅读并同意用户服务协议', 'warning')

  loading.value = true
  try {
    await userStore.register({
      username: regForm.username,
      nickname: regForm.nickname || regForm.username,
      password: regForm.password
    })
    showFloatingAlert('注册成功，欢迎加入智糖健康！', 'success')
    router.replace('/team')
  } catch (err) {
    showFloatingAlert(err.message || '注册失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

function handleForgot() {
  showFloatingAlert('请联系管理员重置密码', 'info')
}

// 勾选「记住密码」时保存账号信息，否则清除
// 密码做简单编码，避免明文落盘（仅降低直接读取风险）
function rememberCredentials() {
  if (loginForm.remember) {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify({
      username: loginForm.username,
      password: btoa(unescape(encodeURIComponent(loginForm.password)))
    }))
  } else {
    localStorage.removeItem(REMEMBER_KEY)
  }
}

// 登录页独占全屏样式：切换 body 类名
onMounted(() => {
  document.body.classList.add('login-page')
})
onUnmounted(() => {
  document.body.classList.remove('login-page')
})
</script>

<style>
/* 登录页专用样式已在 index.html 全局引入（login.css），此处仅处理容器高度 */
.auth-container {
  min-height: 80vh;
}
</style>
