<template>
  <div class="content-page consult-page">
    <!-- ========== 医生信息头 ========== -->
    <div class="doctor-header">
      <div class="doc-avatar">
        <img :src="doctor.avatar" alt="avatar">
        <span class="doc-status"><i class="fa-solid fa-circle"></i></span>
      </div>
      <div class="doc-info">
        <h2 class="doc-name">{{ doctor.name }} <span class="doc-title">{{ doctor.title || '医师' }}</span></h2>
        <p class="doc-meta">
          <i class="fa-solid fa-hospital"></i> {{ doctor.department || '内分泌科' }}
          <span class="dot">·</span>
          <i class="fa-solid fa-star"></i> {{ doctor.stars || '5.0' }} 分
        </p>
        <p class="doc-bio">{{ doctor.bio || '擅长糖尿病及其并发症的诊治与长期管理，为您提供专业的在线健康指导。' }}</p>
      </div>
      <div class="doc-header-right">
        <span class="consult-badge"><i class="fa-solid fa-headset"></i> 在线咨询中</span>
      </div>
    </div>

    <!-- ========== 在线咨询对话 ========== -->
    <div class="chat-card">
      <div class="chat-header">
        <div class="chat-header-left">
          <img :src="doctor.avatar" alt="avatar" class="chat-doc-avatar">
          <div>
            <div class="chat-doc-name">{{ doctor.name }} · {{ doctor.department }}</div>
            <div class="chat-doc-status" :class="{ warn: !hasHealthProfile }">
              <i class="fa-solid fa-circle"></i>
              {{ hasHealthProfile ? '已获取您的健康档案，现在可以开始咨询了' : '未检测到健康档案，建议先到「个人中心」完善' }}
            </div>
          </div>
        </div>
      </div>

      <div ref="chatBody" class="chat-body">
        <div v-for="(msg, i) in messages" :key="i" class="msg-row" :class="msg.role">
          <div class="msg-avatar" :class="msg.role">
            <img v-if="msg.role === 'assistant'" :src="doctor.avatar" alt="avatar">
            <i v-else class="fa-solid fa-user"></i>
          </div>
          <div class="msg-bubble">
            <!-- 医生回答：内容为空（流式生成中）显示打字动画，否则渲染 Markdown -->
            <div v-if="msg.role === 'assistant' && !msg.content" class="typing-inline">
              <span class="typing-label">正在思考您的问题请稍后....</span>
              <i class="fa-solid fa-circle-notch fa-spin"></i>
            </div>
            <div v-else-if="msg.role === 'assistant'" class="msg-text markdown-body" v-html="renderMarkdown(msg.content)"></div>
            <div v-else class="msg-text">{{ msg.content }}</div>
            <div class="msg-time">{{ msg.time }}</div>
          </div>
        </div>
      </div>

      <div class="chat-input-bar">
        <input v-model="inputText" class="chat-input" placeholder="描述您的症状或想咨询的问题…" @keyup.enter="send">
        <button class="send-btn" :disabled="loading || !inputText.trim()" @click="send">
          <i class="fa-solid fa-paper-plane"></i> 发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getCurrentUserId, doctorChatStream } from '@/api/dify'
import { getDoctors } from '@/api/admin'
import { recordOperation } from '@/utils/operationLog'

const route = useRoute()
const userStore = useUserStore()

const doctor = ref({
  name: '',
  department: '',
  title: '',
  avatar: '/img/doctor-default.png',
  bio: ''
})

// 医师部分由对应的医师提供：优先使用路由携带的医师信息；
// 直接进入本页（如通过侧边菜单进入）且无医师参数时，自动从医生列表选取第一位医师
async function loadDoctor() {
  const q = route.query
  if (q.name) {
    doctor.value = {
      name: q.name,
      department: q.department || '内分泌科',
      title: q.title || '医师',
      avatar: q.avatar || '/img/doctor-default.png',
      bio: q.bio || ''
    }
    return
  }
  try {
    const res = await getDoctors({ page: 1, pageSize: 1 })
    const list = (res && res.list) || []
    const d = list[0]
    if (d) {
      doctor.value = {
        name: d.doctorName || d.name || '张医生',
        department: d.department || '内分泌科',
        title: d.title || '医师',
        avatar: d.imageUrl || d.avatar || '/img/doctor-default.png',
        bio: d.introduction || ''
      }
      return
    }
  } catch (e) {
    // 接口不可用时使用默认占位医师
  }
  doctor.value = {
    name: '张医生',
    department: '内分泌科',
    title: '主任医师',
    avatar: '/img/doctor-default.png',
    bio: ''
  }
}

const loading = ref(false)
const inputText = ref('')
const chatBody = ref(null)

// 会话 ID：首次为空，后端生成后回传，多轮对话时携带以保持上下文
const sessionId = ref('')

// 是否有健康档案（未获取到时在状态栏提示，但允许直接咨询，后端会按 userId 从 user_risk_info 回退读取）
const hasHealthProfile = ref(false)

// 用户信息：从个人信息中的健康档案（userInfo.healthInfo）自动获取，无需用户填写
const health = ref({
  userId: getCurrentUserId(),
  sex: '',
  age: null,
  height: null,
  weight: null,
  familyHistory: '',
  waistline: null,
  systolicPressure: null,
  isPregnancy: '',
  disease: '',
  diabetesType: null
})

const messages = ref([])

function formatTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 进入对话后的开场白：引用健康档案与当前医师信息
function pushWelcomeMessage() {
  const h = health.value
  const parts = []
  if (h.sex) parts.push(`性别 ${h.sex}`)
  if (h.age) parts.push(`${h.age} 岁`)
  if (h.height) parts.push(`身高 ${h.height}cm`)
  if (h.weight) parts.push(`体重 ${h.weight}kg`)
  if (h.waistline) parts.push(`腰围 ${h.waistline}cm`)
  if (h.systolicPressure) parts.push(`收缩压 ${h.systolicPressure}mmHg`)
  const profileText = parts.length ? `已获取您的健康档案：${parts.join('，')}。` : '暂未检测到健康档案，您可以在「个人中心」中完善后，咨询将更精准。'
  messages.value.push({
    role: 'assistant',
    content: `您好，我是${doctor.value.name}医生（${doctor.value.department}的${doctor.value.title}）。${profileText}\n\n请问有什么可以帮您？`,
    time: formatTime()
  })
  nextTick(scrollBottom)
}

async function scrollBottom() {
  await nextTick()
  if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
}

// ========== Markdown 渲染（安全：先转义 HTML，再解析基础语法） ==========
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInline(s) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
}

function renderMarkdown(text) {
  if (!text) return ''
  const safe = escapeHtml(text)
  let out = ''
  let listType = null
  let listItems = []
  let para = []
  let inCode = false
  let codeLines = []

  const flushPara = () => {
    if (para.length) {
      out += `<p>${renderInline(para.join('<br>'))}</p>`
      para = []
    }
  }
  const flushList = () => {
    if (listType) {
      const tag = listType === 'ol' ? 'ol' : 'ul'
      out += `<${tag}>${listItems.map((i) => `<li>${renderInline(i)}</li>`).join('')}</${tag}>`
      listType = null
      listItems = []
    }
  }

  safe.split('\n').forEach((raw) => {
    const line = raw.trim()
    // 代码块开关 ```...```
    if (line.startsWith('```')) {
      if (!inCode) {
        flushPara()
        flushList()
        inCode = true
        codeLines = []
      } else {
        inCode = false
        out += `<pre class="md-code"><code>${codeLines.join('\n')}</code></pre>`
      }
      return
    }
    if (inCode) {
      codeLines.push(line)
      return
    }
    if (!line) {
      flushPara()
      flushList()
      return
    }
    // 标题 # ~ ######
    const h = line.match(/^(#{1,6})\s+(.+)$/)
    if (h) {
      flushPara()
      flushList()
      out += `<h${h[1].length}>${renderInline(h[2])}</h${h[1].length}>`
      return
    }
    // 列表 - item / * item / 1. item / 1、item
    const ul = line.match(/^[-*]\s+(.+)$/)
    const ol = line.match(/^\d+[.、]\s+(.+)$/)
    if (ul || ol) {
      flushPara()
      const type = ol ? 'ol' : 'ul'
      if (listType && listType !== type) flushList()
      listType = type
      listItems.push((ul ? ul[1] : ol[1]).trim())
      return
    }
    // 普通行（相邻行合并为一段，单换行转 <br>）
    flushList()
    para.push(line)
  })
  flushPara()
  flushList()
  return out
}

async function send() {
  const text = inputText.value.trim()
  if (!text || loading.value) return
  inputText.value = ''
  messages.value.push({ role: 'user', content: text, time: formatTime() })
  await scrollBottom()
  loading.value = true

  // 预填医生回复气泡（内容为空时显示"思考您的问题"动画，流式填充内容实现打字机效果）
  const aiMsg = { role: 'assistant', content: '', time: formatTime() }
  messages.value.push(aiMsg)
  await scrollBottom()

  // SSE 流式累积内容
  let streamedText = ''

  try {
    // 健康档案（health）+ 医生信息由前端传入：对应「医师咨询助手」yml 的 12 个表单变量
    await doctorChatStream(
      {
        userId: health.value.userId || getCurrentUserId(),
        sessionId: sessionId.value,
        doctorName: doctor.value.name,
        department: doctor.value.department,
        health: health.value,
        messages: messages.value
          .filter((m) => m !== aiMsg && m.content)
          .map((m) => ({ role: m.role, content: m.content }))
      },
      {
        // 逐块收到医生输出，实时追加渲染（打字机效果）
        onChunk: (chunk, isFinal) => {
          if (isFinal) {
            // message_end 事件携带完整回答，整体覆盖更准确
            streamedText = chunk || streamedText
          } else {
            streamedText += chunk || ''
          }
          aiMsg.content = streamedText
          scrollBottom()
        },
        // 多轮对话会话 id（conversation_id），下一轮携带以保持上下文
        onSessionId: (sid) => {
          if (sid) sessionId.value = sid
        },
        onDone: () => {
          // 无内容兜底
          if (!aiMsg.content.trim()) {
            aiMsg.content = '抱歉，咨询通道暂时繁忙，请稍后重试。'
          }
          recordOperation({
            type: 'AI 咨询',
            action: `医生在线咨询（${doctor.value.name || '医生'}）`,
            detail: text.length > 40 ? text.slice(0, 40) + '…' : text,
            result: 'success'
          })
        },
        onError: (e) => {
          aiMsg.content = '抱歉，咨询通道暂时繁忙，请稍后重试。'
          console.error('医生在线咨询失败:', e)
        }
      }
    )
  } catch (e) {
    aiMsg.content = '抱歉，咨询通道暂时繁忙，请稍后重试。'
    console.error('医生在线咨询失败:', e)
  } finally {
    loading.value = false
    await scrollBottom()
  }
}

// 用户信息从个人信息中的健康档案（userInfo.healthInfo）获取
function loadHealthFromProfile() {
  const h = userStore.userInfo.healthInfo || {}
  const hasProfileData = ['disease', 'sex', 'age', 'height', 'weight'].some((k) => h[k] !== undefined && h[k] !== null && h[k] !== '')
  hasHealthProfile.value = hasProfileData
  health.value = {
    userId: getCurrentUserId(),
    sex: h.sex === '男' || h.sex === '女' ? h.sex : '',
    age: h.age != null && h.age !== '' ? Number(h.age) : null,
    height: h.height != null && h.height !== '' ? Number(h.height) : null,
    weight: h.weight != null && h.weight !== '' ? Number(h.weight) : null,
    familyHistory: h.familyHistory === '是' || h.familyHistory === '否' ? h.familyHistory : '',
    waistline: h.waistline != null && h.waistline !== '' ? Number(h.waistline) : null,
    systolicPressure: h.systolicPressure != null && h.systolicPressure !== '' ? Number(h.systolicPressure) : null,
    isPregnancy: h.isPregnancy === '是' || h.isPregnancy === '否' ? h.isPregnancy : '',
    disease: h.disease === '是' || h.disease === '否' ? h.disease : '',
    diabetesType: h.diabetesType || null
  }
}

onMounted(async () => {
  if (userStore.isLoggedIn) {
    // 同步最新个人信息，确保健康档案（userInfo.healthInfo）是最新的
    await userStore.fetchUserInfo()
  }
  await loadDoctor()
  loadHealthFromProfile()
  // 去掉表单步骤，直接进入对话；开场白引用健康档案与医师信息
  pushWelcomeMessage()
})
</script>

<style scoped>
.consult-page {
  display: flex;
  flex-direction: column;
  padding: 24px 26px;
  background: #eef3fa;
  border-radius: 18px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* ========== 医生信息头 ========== */
.doctor-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  border-radius: 14px;
  color: #fff;
  margin-bottom: 16px;
}
.doc-avatar {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}
.doc-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.4);
  object-fit: cover;
}
.doc-status {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 14px;
  height: 14px;
  background: #22c55e;
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6px;
  color: #fff;
}
.doc-info {
  flex: 1;
  min-width: 0;
}
.doc-name {
  margin: 0 0 4px;
  font-size: 19px;
  font-weight: 700;
}
.doc-title {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 10px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  vertical-align: middle;
}
.doc-meta {
  margin: 0 0 5px;
  font-size: 12.5px;
  opacity: 0.9;
}
.doc-meta .dot {
  margin: 0 6px;
}
.doc-bio {
  margin: 0;
  font-size: 12.5px;
  opacity: 0.85;
  line-height: 1.6;
}
.consult-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  font-size: 12.5px;
  white-space: nowrap;
}

/* ========== 对话卡片 ========== */
.chat-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(31, 45, 61, 0.06);
  overflow: hidden;
}
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 18px;
  border-bottom: 1px solid #eef2f7;
  background: #fbfdff;
}
.chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chat-doc-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}
.chat-doc-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.chat-doc-status {
  font-size: 12px;
  color: #16a34a;
  margin-top: 2px;
}
.chat-doc-status.warn {
  color: #d97706;
}
.chat-doc-status i {
  font-size: 8px;
  margin-right: 3px;
}
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}
.msg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.msg-row.user {
  flex-direction: row-reverse;
}
.msg-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.msg-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.msg-avatar.user {
  background: #2563eb;
  color: #fff;
  font-size: 15px;
}
.msg-bubble {
  max-width: 72%;
  padding: 11px 15px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}
.msg-row.assistant .msg-bubble {
  background: #fff;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-top-left-radius: 4px;
}
.msg-row.user .msg-bubble {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  border-top-right-radius: 4px;
}
.msg-time {
  margin-top: 5px;
  font-size: 11px;
  color: #94a3b8;
}
.typing-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7d8ba1;
  font-size: 13px;
  min-height: 22px;
}
.typing-label {
  color: #64748b;
}
.typing-inline i {
  color: #2563eb;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.msg-bubble :deep(.markdown-body p) {
  margin: 4px 0;
}
.msg-bubble :deep(.markdown-body h3),
.msg-bubble :deep(.markdown-body h4) {
  margin: 8px 0 4px;
  font-size: 15px;
  color: #1e3a5f;
}
.msg-bubble :deep(.markdown-body h5),
.msg-bubble :deep(.markdown-body h6) {
  margin: 6px 0 3px;
  font-size: 14px;
  color: #1e3a5f;
}
.msg-bubble :deep(.markdown-body ul),
.msg-bubble :deep(.markdown-body ol) {
  margin: 4px 0;
  padding-left: 20px;
}
.msg-bubble :deep(.markdown-body li) {
  margin: 2px 0;
}
.msg-bubble :deep(.markdown-body strong) {
  color: #1e3a5f;
}
.msg-bubble :deep(.markdown-body a) {
  color: #2563eb;
}
.msg-bubble :deep(.md-code) {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  margin: 6px 0;
}
.msg-bubble :deep(.md-inline-code) {
  background: #eef2f7;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12.5px;
  color: #b91c1c;
}
.chat-input-bar {
  display: flex;
  gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid #eef2f7;
}
.chat-input {
  flex: 1;
  padding: 11px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.chat-input:focus {
  border-color: #2563eb;
}
.send-btn {
  padding: 0 24px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 13.5px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .chat-card {
    border-radius: 12px;
  }
  .chat-head {
    padding: 12px 14px;
  }
  .chat-body {
    padding: 14px;
  }
}

@media (max-width: 480px) {
  .chat-head {
    padding: 10px 12px;
  }
  .chat-title {
    font-size: 16px;
  }
  .chat-body {
    padding: 12px;
    gap: 14px;
  }
  .msg-bubble {
    max-width: 86%;
  }
  .msg-bubble.user .msg-bubble-inner {
    padding: 9px 12px;
  }
  .msg-bubble.ai .msg-bubble-inner {
    padding: 9px 12px;
  }
  .chat-input-row {
    gap: 8px;
    padding: 8px 12px;
  }
  .chat-input-row input {
    font-size: 14px;
  }
  .send-btn {
    padding: 9px 14px;
  }
  .doctor-pick-bar {
    padding: 10px 12px;
    gap: 8px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .doctor-pick-bar button {
    flex-shrink: 0;
  }
  .quick-tips {
    flex-wrap: wrap;
  }
}
</style>
