<template>
  <div class="mine-page">
    <!-- ========== 个人信息面板（默认） ========== -->
    <section v-if="activePanel === 'profile'" class="panel">
      <!-- 数据提示 -->
      <div class="demo-banner">
        <i class="fa-solid fa-circle-info"></i>
        个人资料与后端实时同步，健康档案部分暂为演示数据
      </div>

      <!-- 个人资料卡 -->
      <div class="profile-card">
        <div class="profile-avatar">
          <img :src="userStore.avatar" alt="头像">
          <span class="avatar-badge"><i class="fa-solid fa-crown"></i></span>
        </div>
        <div class="profile-info">
          <div class="profile-name-row">
            <h2 class="profile-name">{{ userStore.displayName }}</h2>
            <span class="vip-tag">健康会员</span>
            <span v-if="userStore.isAdmin" class="admin-tag"><i class="fa-solid fa-shield-halved"></i> 管理员</span>
          </div>
          <p class="profile-desc">{{ userStore.displayDesc }}</p>
          <div class="profile-tags">
            <span class="profile-tag"><i class="fa-solid fa-heart-pulse"></i> 2型糖尿病</span>
            <span class="profile-tag"><i class="fa-solid fa-calendar-days"></i> {{ joinDaysText }}</span>
            <span class="profile-tag"><i class="fa-solid fa-fire"></i> 连续打卡 12 天</span>
          </div>
        </div>
        <div class="profile-level">
          <div class="level-head">
            <span>控糖等级</span>
            <strong>LV.3 稳健控糖</strong>
          </div>
          <div class="level-bar">
            <div class="level-bar-fill"></div>
          </div>
          <p class="level-tip">再积累 260 分即可升级</p>
        </div>
      </div>

      <!-- 基本资料 & 健康档案 -->
      <div class="info-grid">
        <div class="info-card">
          <div class="card-head">
            <h3><i class="fa-solid fa-address-card"></i> 基本资料</h3>
            <button type="button" class="edit-btn" @click="handleEditProfile">
              <i class="fa-solid fa-pen"></i> 编辑
            </button>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-user"></i> 用户名</span>
              <span class="info-value">{{ userStore.userInfo.username || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-id-card"></i> 昵称</span>
              <span class="info-value">{{ userStore.displayName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-note-sticky"></i> 个人简介</span>
              <span class="info-value">{{ userStore.displayDesc }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-calendar-days"></i> 注册时间</span>
              <span class="info-value">{{ userStore.userInfo.createdAt || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-venus-mars"></i> 性别</span>
              <span class="info-value">男</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-venus-mars"></i> 性别</span>
              <span class="info-value">男</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-cake-candles"></i> 年龄</span>
              <span class="info-value">45 岁</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-ruler"></i> 身高 / 体重</span>
              <span class="info-value">172cm / 68kg</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-heart-pulse"></i> 糖尿病类型</span>
              <span class="info-value">2型糖尿病</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-calendar-days"></i> 确诊时间</span>
              <span class="info-value">2025年08月</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="fa-solid fa-phone"></i> 联系电话</span>
              <span class="info-value">138****5678</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <div class="card-head">
            <h3><i class="fa-solid fa-stethoscope"></i> 健康档案</h3>
            <span class="card-sub">最近更新 2026-08-10</span>
          </div>
          <div class="record-grid">
            <div class="record-item">
              <p class="record-label"><i class="fa-solid fa-droplet"></i> 空腹血糖</p>
              <p class="record-value">5.6 <small>mmol/L</small></p>
              <span class="record-status good"><i class="fa-solid fa-circle-check"></i> 良好</span>
            </div>
            <div class="record-item">
              <p class="record-label"><i class="fa-solid fa-utensils"></i> 餐后血糖</p>
              <p class="record-value">8.2 <small>mmol/L</small></p>
              <span class="record-status good"><i class="fa-solid fa-circle-check"></i> 良好</span>
            </div>
            <div class="record-item">
              <p class="record-label"><i class="fa-solid fa-vial"></i> 糖化血红蛋白</p>
              <p class="record-value">6.8 <small>%</small></p>
              <span class="record-status normal"><i class="fa-solid fa-circle-info"></i> 达标</span>
            </div>
            <div class="record-item">
              <p class="record-label"><i class="fa-solid fa-heart-pulse"></i> 血压</p>
              <p class="record-value">120/80 <small>mmHg</small></p>
              <span class="record-status good"><i class="fa-solid fa-circle-check"></i> 正常</span>
            </div>
            <div class="record-item">
              <p class="record-label"><i class="fa-solid fa-weight-scale"></i> BMI</p>
              <p class="record-value">23.0 <small>kg/m²</small></p>
              <span class="record-status good"><i class="fa-solid fa-circle-check"></i> 标准</span>
            </div>
            <div class="record-item">
              <p class="record-label"><i class="fa-solid fa-heart"></i> 静息心率</p>
              <p class="record-value">72 <small>次/分</small></p>
              <span class="record-status good"><i class="fa-solid fa-circle-check"></i> 正常</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 账号与安全 -->
      <div class="account-card">
        <div class="card-head">
          <h3><i class="fa-solid fa-shield-halved"></i> 账号与安全</h3>
        </div>
        <div class="account-list">
          <div v-for="item in accountItems" :key="item.title"
               class="account-item" :class="{ 'account-logout': item.logout }" @click="handleAccountAction(item.title)">
            <div class="account-left">
              <i class="fa-solid account-icon" :class="[item.icon, item.iconColor]"></i>
              <span>{{ item.title }}</span>
            </div>
            <div class="account-right">
              <span class="account-hint" :class="{ 'account-done': item.done }">
                <i v-if="item.done" class="fa-solid fa-circle-check"></i>{{ item.hint }}
              </span>
              <i class="fa-solid fa-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== 我的方案面板 ========== -->
    <section v-else-if="activePanel === 'plan'" class="panel">
      <div class="panel-head">
        <h3><i class="fa-solid fa-clipboard-list"></i> 我的方案</h3>
        <p>根据您的健康状况定制的专属管理方案</p>
      </div>
      <div class="plan-list">
        <div v-for="plan in plans" :key="plan.name" class="plan-card">
          <div class="plan-icon" :class="plan.iconClass"><i :class="plan.icon"></i></div>
          <div class="plan-info">
            <div class="plan-top">
              <h4>{{ plan.name }}</h4>
              <span class="plan-status" :class="plan.statusClass">{{ plan.status }}</span>
            </div>
            <p class="plan-desc">{{ plan.desc }}</p>
            <div class="plan-bar">
              <div class="plan-bar-fill" :class="plan.fillClass" :style="{ width: plan.percent + '%' }"></div>
            </div>
            <div class="plan-meta">
              <span>执行进度 <b>{{ plan.percent }}%</b></span>
              <span>{{ plan.tip }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== 我的建议面板 ========== -->
    <section v-else-if="activePanel === 'advice'" class="panel">
      <div class="panel-head">
        <h3><i class="fa-solid fa-lightbulb"></i> 我的建议</h3>
        <p>为您精选的健康知识与管理建议</p>
      </div>
      <div class="advice-list">
        <div v-for="advice in advices" :key="advice.title" class="advice-card" @click="openAdvice(advice)">
          <div class="advice-img-wrap">
            <img :src="advice.img" alt="建议配图">
          </div>
          <div class="advice-body">
            <span class="advice-cat" :class="advice.catClass">{{ advice.cat }}</span>
            <h4>{{ advice.title }}</h4>
            <p class="advice-summary">{{ advice.summary }}</p>
            <span class="advice-time">{{ advice.time }} 发布</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== 打卡记录面板 ========== -->
    <section v-else-if="activePanel === 'check'" class="panel">
      <div class="panel-head">
        <h3><i class="fa-solid fa-calendar-check"></i> 打卡记录</h3>
        <p>记录每一天的坚持与成长</p>
      </div>
      <div class="check-stats">
        <div class="check-stat check-stat-blue">
          <p class="check-stat-num">12</p>
          <p class="check-stat-label">连续打卡</p>
        </div>
        <div class="check-stat check-stat-green">
          <p class="check-stat-num">26</p>
          <p class="check-stat-label">本月打卡</p>
        </div>
        <div class="check-stat check-stat-orange">
          <p class="check-stat-num">180</p>
          <p class="check-stat-label">累计打卡</p>
        </div>
      </div>
      <div class="check-week-card">
        <h4>本周打卡</h4>
        <div class="week-row">
          <div v-for="(day, idx) in weekDays" :key="day" class="week-item">
            <span class="week-day" :class="{ 'today-text': idx === todayIdx }">{{ day }}</span>
            <span class="week-dot" :class="{ done: idx < todayIdx, today: idx === todayIdx }">
              <i v-if="idx < todayIdx" class="fa-solid fa-check"></i>
              <span v-else>今</span>
            </span>
          </div>
        </div>
      </div>
      <div class="check-list-card">
        <h4>近期记录</h4>
        <ul class="check-list">
          <li v-for="record in checkRecords" :key="record.day" class="check-item">
            <span class="check-date">
              <b>{{ record.day }}</b>08月
            </span>
            <div class="check-info">
              <p>健康指数 <b>{{ record.score }}</b> 分 · 血糖 {{ record.sugar }} mmol/L</p>
              <span class="check-time">{{ record.time }} 完成打卡</span>
            </div>
            <span class="check-badge badge-done">已完成</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- ========== 帮助中心面板 ========== -->
    <section v-else class="panel">
      <div class="panel-head">
        <h3><i class="fa-solid fa-circle-question"></i> 帮助中心</h3>
        <p>常见问题解答，快速上手智糖健康</p>
      </div>
      <div class="faq-card">
        <div v-for="(faq, idx) in faqs" :key="faq.question"
             class="faq-item" :class="{ open: openFaq === idx }" @click="toggleFaq(idx)">
          <div class="faq-question">
            <span><i :class="faq.icon"></i> {{ faq.question }}</span>
            <i class="fa-solid fa-chevron-down faq-arrow"></i>
          </div>
          <div class="faq-answer">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="content-tip">更多功能正在建设中，敬请期待</div>

    <!-- ========== 编辑个人资料弹窗 ========== -->
    <div v-if="editModalOpen" class="modal-mask" @click.self="closeEditModal">
      <div class="modal-box">
        <div class="modal-head">
          <h3><i class="fa-solid fa-address-card"></i> 编辑个人资料</h3>
          <i class="fa-solid fa-xmark modal-close" @click="closeEditModal"></i>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="form-label">头像</label>
            <div class="avatar-picker">
              <img v-for="a in avatarOptions" :key="a"
                   :src="a" :class="{ selected: editForm.avatar === a }"
                   @click="editForm.avatar = a">
              <img :src="editForm.avatar" class="avatar-current" alt="当前头像">
            </div>
            <input v-model="editForm.avatar" class="form-input" placeholder="或粘贴头像图片地址">
          </div>
          <div class="form-row">
            <label class="form-label">昵称</label>
            <input v-model="editForm.nickname" class="form-input" placeholder="请输入昵称">
          </div>
          <div class="form-row">
            <label class="form-label">个人简介</label>
            <textarea v-model="editForm.desc" class="form-textarea" rows="3"
                      placeholder="一句话介绍自己"></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-cancel" @click="closeEditModal">取消</button>
          <button class="btn btn-primary" :disabled="editSaving" @click="onSaveProfile">
            {{ editSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 修改密码弹窗 ========== -->
    <div v-if="pwdModalOpen" class="modal-mask" @click.self="closePwdModal">
      <div class="modal-box">
        <div class="modal-head">
          <h3><i class="fa-solid fa-key"></i> 修改登录密码</h3>
          <i class="fa-solid fa-xmark modal-close" @click="closePwdModal"></i>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="form-label required">原密码</label>
            <input v-model="pwdForm.oldPassword" type="password" class="form-input" placeholder="请输入原密码">
          </div>
          <div class="form-row">
            <label class="form-label required">新密码</label>
            <input v-model="pwdForm.newPassword" type="password" class="form-input"
                   placeholder="6-32 位，建议字母+数字组合">
          </div>
          <div class="form-row">
            <label class="form-label required">确认新密码</label>
            <input v-model="pwdForm.confirmPassword" type="password" class="form-input" placeholder="请再次输入新密码">
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-cancel" @click="closePwdModal">取消</button>
          <button class="btn btn-primary" :disabled="pwdSaving" @click="onChangePassword">
            {{ pwdSaving ? '提交中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showFloatingAlert } from '@/utils/alert'

const route = useRoute()
const userStore = useUserStore()

const openFaq = ref(0)

const activePanel = computed(() => {
  const panel = route.query.panel || 'profile'
  return ['profile', 'plan', 'advice', 'check', 'help'].includes(panel) ? panel : 'profile'
})

const accountItems = [
  { title: '登录密码', icon: 'fa-key', iconColor: 'icon-blue', hint: '定期修改更安全' },
  { title: '绑定手机号', icon: 'fa-mobile-screen', iconColor: 'icon-green', hint: '138****5678' },
  { title: '绑定邮箱', icon: 'fa-envelope', iconColor: 'icon-orange', hint: '未绑定' },
  { title: '实名认证', icon: 'fa-id-card', iconColor: 'icon-purple', hint: '已认证', done: true },
  { title: '退出登录', icon: 'fa-right-from-bracket', iconColor: 'icon-red', hint: '', logout: true }
]

const plans = [
  { name: '饮食管理方案', iconClass: 'plan-icon-green', icon: 'fa-solid fa-utensils', status: '执行中', statusClass: 'status-active', desc: '低GI饮食 · 定时定量 · 均衡营养搭配', percent: 85, fillClass: 'plan-fill-green', tip: '剩余 15 天' },
  { name: '运动管理方案', iconClass: 'plan-icon-blue', icon: 'fa-solid fa-person-walking', status: '执行中', statusClass: 'status-active', desc: '每周 5 次有氧运动 · 每次 40 分钟', percent: 70, fillClass: 'plan-fill-blue', tip: '剩余 22 天' },
  { name: '血糖监测方案', iconClass: 'plan-icon-orange', icon: 'fa-solid fa-droplet', status: '执行中', statusClass: 'status-active', desc: '每日 4 次血糖监测 · 自动生成趋势报告', percent: 90, fillClass: 'plan-fill-orange', tip: '剩余 8 天' },
  { name: '用药提醒方案', iconClass: 'plan-icon-purple', icon: 'fa-solid fa-pills', status: '待启动', statusClass: 'status-pending', desc: '按时服药智能提醒 · 依从性追踪', percent: 0, fillClass: 'plan-fill-purple', tip: '等待启动' }
]

const advices = [
  { img: '/img/a1.jpg', cat: '饮食建议', catClass: 'cat-green', title: '糖尿病患者秋季饮食指南', summary: '秋季气温变化大，控糖饮食需注意补水、保暖与血糖监测频率调整……', time: '08-10' },
  { img: '/img/a2.jpg', cat: '运动建议', catClass: 'cat-blue', title: '科学运动，平稳控糖', summary: '有氧运动与力量训练结合，每周 150 分钟中强度运动有助血糖平稳……', time: '08-08' },
  { img: '/img/a3.jpg', cat: '监测建议', catClass: 'cat-orange', title: '血糖监测的正确打开方式', summary: '掌握空腹、餐后、睡前等关键时点的监测方法，让数据更有参考价值……', time: '08-05' }
]

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 今天在一周中的索引（周一=0 ... 周日=6），getDay() 返回 0=周日
const todayIdx = (new Date().getDay() + 6) % 7

const checkRecords = [
  { day: '11', score: 90, sugar: '5.6', time: '08:30' },
  { day: '10', score: 88, sugar: '5.9', time: '08:25' },
  { day: '09', score: 85, sugar: '6.1', time: '08:40' },
  { day: '08', score: 92, sugar: '5.4', time: '08:20' }
]

const faqs = [
  { icon: 'fa-solid fa-user-gear', question: '如何修改个人信息？', answer: '进入「个人信息」页面，点击头像或用户名即可编辑头像、昵称等资料，保存后自动生效。' },
  { icon: 'fa-solid fa-key', question: '忘记登录密码怎么办？', answer: '可在登录页点击「忘记密码」找回，或联系平台客服热线申请重置。' },
  { icon: 'fa-solid fa-calendar-check', question: '每日打卡有什么作用？', answer: '坚持打卡可记录每日血糖、饮食与运动情况，帮助系统生成更精准的健康建议，连续打卡还可获得积分奖励。' },
  { icon: 'fa-solid fa-arrows-rotate', question: '我的控糖方案多久更新一次？', answer: '系统会根据您的打卡与健康数据变化，定期自动优化方案，通常每 1~2 周评估一次。' },
  { icon: 'fa-solid fa-headset', question: '如何联系健康管理师？', answer: '可在平台「AI智能管理平台」发起在线咨询，或拨打客服热线 400-000-0000 获取人工服务。' }
]

// ---------- 编辑资料弹窗 ----------
const editModalOpen = ref(false)
const editSaving = ref(false)
const editForm = ref({ avatar: '', nickname: '', desc: '' })

const avatarOptions = [
  '/img/user_icon.png',
  '/img/user.jpg',
  '/img/user1.png',
  '/img/user2.png',
  '/img/logo.png'
]

function openEditModal() {
  editForm.value = {
    avatar: userStore.avatar,
    nickname: userStore.userInfo.nickname || '',
    desc: userStore.userInfo.desc || ''
  }
  editModalOpen.value = true
}

function closeEditModal() {
  if (editSaving.value) return
  editModalOpen.value = false
}

async function onSaveProfile() {
  const nickname = editForm.value.nickname?.trim()
  if (!nickname) {
    showFloatingAlert('昵称不能为空', 'warning')
    return
  }
  editSaving.value = true
  try {
    await userStore.updateProfile({
      nickname,
      avatar: editForm.value.avatar,
      desc: editForm.value.desc?.trim()
    })
    showFloatingAlert('个人资料已更新', 'success')
    editModalOpen.value = false
  } catch (e) {
    showFloatingAlert(e.message || '保存失败，请稍后再试', 'error')
  } finally {
    editSaving.value = false
  }
}

// ---------- 修改密码弹窗 ----------
const pwdModalOpen = ref(false)
const pwdSaving = ref(false)
const pwdForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })

function openPwdModal() {
  pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  pwdModalOpen.value = true
}

function closePwdModal() {
  if (pwdSaving.value) return
  pwdModalOpen.value = false
}

async function onChangePassword() {
  const { oldPassword, newPassword, confirmPassword } = pwdForm.value
  if (!oldPassword) {
    showFloatingAlert('请输入原密码', 'warning')
    return
  }
  if (!newPassword || newPassword.length < 6 || newPassword.length > 32) {
    showFloatingAlert('新密码长度需为 6-32 位', 'warning')
    return
  }
  if (newPassword !== confirmPassword) {
    showFloatingAlert('两次输入的新密码不一致', 'warning')
    return
  }
  if (newPassword === oldPassword) {
    showFloatingAlert('新密码不能与原密码相同', 'warning')
    return
  }
  pwdSaving.value = true
  try {
    await userStore.changePassword({ oldPassword, newPassword })
    showFloatingAlert('密码修改成功，下次登录请使用新密码', 'success')
    pwdModalOpen.value = false
  } catch (e) {
    showFloatingAlert(e.message || '修改失败，请稍后再试', 'error')
  } finally {
    pwdSaving.value = false
  }
}

function handleEditProfile() {
  openEditModal()
}

function handleAccountAction(title) {
  if (title === '登录密码') {
    openPwdModal()
    return
  }
  if (title === '退出登录') {
    showFloatingAlert('请在右上角点击头像，选择退出登录', 'info')
    return
  }
  showFloatingAlert(title + '设置功能建设中，敬请期待~', 'info')
}

// 加入天数（基于注册时间，无数据时回退到默认文案）
const joinDaysText = computed(() => {
  const created = userStore.userInfo.createdAt
  if (!created) return '加入平台'
  const start = new Date(created.replace(/-/g, '/')).getTime()
  if (Number.isNaN(start)) return '加入平台'
  const days = Math.max(0, Math.floor((Date.now() - start) / 86400000))
  return `加入 ${days + 1} 天`
})

function openAdvice(advice) {
  showFloatingAlert('正在打开《' + advice.title + '》…', 'info')
}

function toggleFaq(idx) {
  openFaq.value = openFaq.value === idx ? -1 : idx
}
</script>

<style scoped>
.mine-page {
  background: #eef3fa;
  min-height: 100%;
  border-radius: 18px;
}

/* 演示数据提示条 */
.demo-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 16px 0;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fcd34d;
}
.demo-banner i {
  font-size: 14px;
}

/* 本周打卡 - 今天高亮文字 */
.today-text {
  color: #2563eb;
  font-weight: 600;
}

/* 管理员角色标识 */
.admin-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.35);
}

/* ========== 弹窗 ========== */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}
.modal-box {
  width: 480px;
  max-width: 92vw;
  max-height: 88vh;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.3);
  display: flex;
  flex-direction: column;
  animation: modalIn 0.2s ease;
  overflow: hidden;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eef2f7;
}
.modal-head h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
}
.modal-close {
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  transition: color 0.2s;
}
.modal-close:hover {
  color: #ef4444;
}
.modal-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-label {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}
.form-label.required::before {
  content: '* ';
  color: #ef4444;
}
.form-input,
.form-textarea {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  color: #334155;
  transition: border-color 0.2s;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus,
.form-textarea:focus {
  border-color: #2563eb;
}
.form-textarea {
  resize: vertical;
  min-height: 72px;
}
.avatar-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.avatar-picker img {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.avatar-picker img:hover {
  transform: scale(1.06);
}
.avatar-picker img.selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
.avatar-picker .avatar-current {
  margin-left: auto;
  border: 2px dashed #cbd5e1;
  cursor: default;
}
.avatar-picker .avatar-current:hover {
  transform: none;
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #eef2f7;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 18px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
}
.btn-primary:hover {
  background: #1d4ed8;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}
.btn-cancel:hover {
  background: #e2e8f0;
}
</style>
