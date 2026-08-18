<template>
  <div class="content-page ai-assistant-page">
    <!-- ========== 页面头部 ========== -->
    <div class="page-head">
      <div class="page-head-left">
        <h2 class="page-title"><i class="fa-solid fa-robot"></i> 智能助手</h2>
        <p class="page-sub">全天候 AI 健康管家 · 随时为您解答糖尿病相关问题</p>
      </div>
      <div class="page-head-right">
        <span class="online-badge"><i class="fa-solid fa-circle"></i> AI 在线</span>
      </div>
    </div>

    <div class="assistant-wrap">
      <!-- ========== 左侧：用户健康信息（变量） ========== -->
      <aside class="profile-panel">
        <div class="profile-head">
          <i class="fa-solid fa-id-card"></i>
          <span>我的健康档案</span>
          <button class="mini-btn" :class="{ collapsed: !showProfile }" @click="showProfile = !showProfile">
            <i class="fa-solid" :class="showProfile ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </button>
        </div>
        <div v-show="showProfile" class="profile-body">
          <div class="form-row">
            <label>性别</label>
            <div class="seg-group">
              <button class="seg" :class="{ on: health.sex === '男' }" @click="health.sex = '男'">男</button>
              <button class="seg" :class="{ on: health.sex === '女' }" @click="health.sex = '女'">女</button>
            </div>
          </div>
          <div class="form-row">
            <label>年龄</label>
            <input v-model.number="health.age" type="number" class="form-input" min="1" max="120" placeholder="请输入年龄">
          </div>
          <div class="form-row two-col">
            <div>
              <label>身高 (cm)</label>
              <input v-model.number="health.height" type="number" class="form-input" placeholder="请输入身高 (cm)" min="0">
            </div>
            <div>
              <label>体重 (kg)</label>
              <input v-model.number="health.weight" type="number" class="form-input" placeholder="请输入体重 (kg)" min="0">
            </div>
          </div>
          <div class="form-row two-col">
            <div>
              <label>腰围 (cm)</label>
              <input v-model.number="health.waistline" type="number" class="form-input" placeholder="请输入腰围 (cm)，选填" min="0">
            </div>
            <div>
              <label>收缩压</label>
              <input v-model.number="health.systolicPressure" type="number" class="form-input" placeholder="请输入收缩压 (mmHg)，选填" min="0">
            </div>
          </div>
          <div class="form-row">
            <label>家族病史</label>
            <div class="seg-group">
              <button class="seg" :class="{ on: health.familyHistory === '是' }" @click="health.familyHistory = '是'">有</button>
              <button class="seg" :class="{ on: health.familyHistory === '否' }" @click="health.familyHistory = '否'">无</button>
            </div>
          </div>
          <div class="form-row">
            <label>是否患病</label>
            <div class="seg-group">
              <button class="seg" :class="{ on: health.disease === '是' }" @click="health.disease = '是'">是</button>
              <button class="seg" :class="{ on: health.disease === '否' }" @click="health.disease = '否'">否</button>
            </div>
          </div>
          <div class="form-row">
            <label>处于妊娠期</label>
            <div class="seg-group">
              <button class="seg" :class="{ on: health.isPregnancy === '是' }" @click="health.isPregnancy = '是'">是</button>
              <button class="seg" :class="{ on: health.isPregnancy === '否' }" @click="health.isPregnancy = '否'">否</button>
            </div>
          </div>
          <button class="save-btn" @click="saveProfile">
            <i class="fa-solid fa-floppy-disk"></i> 保存档案
          </button>
          <p class="save-tip" v-if="savedTip">
            <i class="fa-solid fa-check-circle"></i> {{ savedTip }}
          </p>
        </div>
      </aside>

      <!-- ========== 右侧：聊天区域 ========== -->
      <div class="chat-panel">
        <div ref="chatBody" class="chat-body">
          <div v-if="messages.length === 0" class="chat-empty">
            <div class="empty-icon"><i class="fa-solid fa-comment-dots"></i></div>
            <h3>您好，我是智能健康助手</h3>
            <p>您可以将身体指标填写到左侧健康档案中，然后向我咨询糖尿病相关的任何问题。</p>
            <div class="quick-list">
              <button class="quick-item" @click="quickAsk('糖尿病患者平时饮食应该注意什么？')">
                <i class="fa-solid fa-utensils"></i><span>饮食怎么吃？</span>
              </button>
              <button class="quick-item" @click="quickAsk('每天运动多长时间比较合适？')">
                <i class="fa-solid fa-person-walking"></i><span>运动建议</span>
              </button>
              <button class="quick-item" @click="quickAsk('如何预防低血糖？')">
                <i class="fa-solid fa-heart-pulse"></i><span>低血糖预防</span>
              </button>
            </div>
          </div>

          <div v-for="(msg, i) in messages" :key="i" class="msg-row" :class="msg.role">
            <div class="msg-avatar">
              <i :class="msg.role === 'user' ? 'fa-solid fa-user' : 'fa-solid fa-robot'"></i>
            </div>
            <div class="msg-bubble">
              <div class="msg-text">{{ msg.content }}</div>
              <div class="msg-time">{{ msg.time }}</div>
            </div>
          </div>

          <div v-if="loading" class="msg-row assistant">
            <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="msg-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="chat-input-bar">
          <input
            v-model="inputText"
            class="chat-input"
            placeholder="输入您的问题，例如：血糖偏高怎么办？"
            @keyup.enter="send"
          >
          <button class="send-btn" :disabled="loading || !inputText.trim()" @click="send">
            <i class="fa-solid fa-paper-plane"></i> 发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { assistantChat, isMockMode } from '@/api/dify'
import { recordOperation } from '@/utils/operationLog'

const showProfile = ref(true)
const loading = ref(false)
const inputText = ref('')
const savedTip = ref('')

const health = ref({
  userId: 1,
  age: null,
  sex: null,
  height: null,
  weight: null,
  familyHistory: null,
  waistline: null,
  systolicPressure: null,
  isPregnancy: null,
  disease: null
})

const messages = ref([])
const chatBody = ref(null)

function formatTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function scrollBottom() {
  await nextTick()
  if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
}

function saveProfile() {
  savedTip.value = '健康档案已保存'
  setTimeout(() => { savedTip.value = '' }, 2000)
}

function quickAsk(text) {
  inputText.value = text
  send()
}

async function send() {
  const text = inputText.value.trim()
  if (!text || loading.value) return
  inputText.value = ''
  messages.value.push({ role: 'user', content: text, time: formatTime() })
  await scrollBottom()
  loading.value = true
  try {
    const payload = {
      ...health.value,
      messages: messages.value.map((m) => ({ role: m.role, content: m.content }))
    }
    const res = await assistantChat(payload)
    const answer = isMockMode() ? res.answer : (res.data && res.data.answer) || res.answer
    messages.value.push({ role: 'assistant', content: answer, time: formatTime() })
    recordOperation({
      type: 'AI 咨询',
      action: 'AI 智能助手咨询',
      detail: text.length > 40 ? text.slice(0, 40) + '…' : text,
      result: 'success'
    })
  } catch (e) {
    messages.value.push({ role: 'assistant', content: '抱歉，AI 服务暂时不可用，请稍后重试。', time: formatTime() })
  } finally {
    loading.value = false
    await scrollBottom()
  }
}

onMounted(() => {
  // 从本地缓存恢复用户档案
  try {
    const saved = JSON.parse(localStorage.getItem('diabetes_ai_profile') || 'null')
    if (saved) health.value = { ...health.value, ...saved }
  } catch (e) { /* ignore */ }
})
</script>

<style scoped>
.ai-assistant-page {
  display: flex;
  flex-direction: column;
  padding: 24px 26px;
  background: #eef3fa;
  border-radius: 18px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.page-head-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.page-title {
  margin: 0;
  font-size: 20px;
  color: #1e3a5f;
}
.page-title i {
  color: #2563eb;
  margin-right: 4px;
}
.page-sub {
  margin: 0;
  font-size: 13px;
  color: #7d8ba1;
}
.online-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #e6f7ee;
  color: #16a34a;
  border-radius: 20px;
  font-size: 13px;
}
.online-badge i {
  font-size: 8px;
}

.assistant-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 18px;
}

/* ========== 左侧档案面板 ========== */
.profile-panel {
  width: 292px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(31, 45, 61, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.profile-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.profile-head i {
  font-size: 15px;
}
.mini-btn {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  cursor: pointer;
  font-size: 11px;
  font-family: inherit;
}
.profile-body {
  padding: 14px 16px 16px;
  overflow-y: auto;
}
.form-row {
  margin-bottom: 12px;
}
.form-row > label,
.form-row > div > label {
  display: block;
  font-size: 12.5px;
  color: #475569;
  margin-bottom: 6px;
}
.two-col {
  display: flex;
  gap: 10px;
}
.two-col > div {
  flex: 1;
  min-width: 0;
}
.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13.5px;
  line-height: 1.5;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s;
}
.form-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
  font-variant-numeric: tabular-nums;
}
.form-input[type="number"]::-webkit-inner-spin-button,
.form-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.form-input::placeholder {
  color: #94a3b8;
  font-family: inherit;
}
.form-input:focus {
  border-color: #2563eb;
}
.seg-group {
  display: flex;
  gap: 8px;
}
.seg {
  flex: 1;
  padding: 8px 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.seg.on {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
  font-weight: 600;
}
.save-btn {
  width: 100%;
  margin-top: 6px;
  padding: 9px 0;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 13.5px;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s;
}
.save-btn:hover {
  opacity: 0.9;
}
.save-tip {
  margin: 8px 0 0;
  font-size: 12px;
  color: #16a34a;
  text-align: center;
}

/* ========== 右侧聊天区域 ========== */
.chat-panel {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(31, 45, 61, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 24px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.chat-empty {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}
.empty-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 50%;
  font-size: 30px;
  color: #2563eb;
}
.chat-empty h3 {
  margin: 0 0 8px;
  color: #1e3a5f;
  font-size: 17px;
}
.chat-empty p {
  margin: 0 auto 20px;
  max-width: 420px;
  font-size: 13px;
  line-height: 1.7;
}
.quick-list {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.quick-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border: 1px solid #dbeafe;
  border-radius: 20px;
  background: #fff;
  color: #2563eb;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-item:hover {
  background: #eff6ff;
  transform: translateY(-2px);
}

.msg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}
.msg-row.user {
  flex-direction: row-reverse;
}
.msg-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 15px;
}
.msg-row.assistant .msg-avatar {
  background: #eff6ff;
  color: #2563eb;
}
.msg-row.user .msg-avatar {
  background: #2563eb;
  color: #fff;
}
.msg-bubble {
  max-width: 70%;
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

.typing {
  display: flex;
  gap: 5px;
  align-items: center;
}
.typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #93c5fd;
  animation: bounce 1.2s infinite;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-5px); opacity: 1; }
}

.chat-input-bar {
  display: flex;
  gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid #eef2f7;
  background: #fff;
}
.chat-input {
  flex: 1;
  padding: 11px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.chat-input:focus {
  border-color: #2563eb;
}
.send-btn {
  padding: 0 22px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 13.5px;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s;
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
