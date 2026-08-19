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

    <!-- ========== 步骤一：健康档案表单 ========== -->
    <div v-if="step === 'form'" class="consult-body">
      <div class="form-card">
        <div class="card-title">
          <i class="fa-solid fa-clipboard-user"></i>
          <span>请完善您的健康档案（用于医生了解您的情况）</span>
        </div>

        <div class="form-grid">
          <div class="form-field">
            <label>性别 <em>*</em></label>
            <div class="seg-group">
              <button class="seg" :class="{ on: health.sex === '男' }" @click="health.sex = '男'">男</button>
              <button class="seg" :class="{ on: health.sex === '女' }" @click="health.sex = '女'">女</button>
            </div>
          </div>
          <div class="form-field">
            <label>年龄 <em>*</em></label>
            <input v-model.number="health.age" type="number" class="field-input" min="1" max="120" placeholder="请输入年龄">
          </div>
          <div class="form-field">
            <label>身高 (cm) <em>*</em></label>
            <input v-model.number="health.height" type="number" class="field-input" min="80" max="250" placeholder="e.g. 170">
          </div>
          <div class="form-field">
            <label>体重 (kg) <em>*</em></label>
            <input v-model.number="health.weight" type="number" class="field-input" min="20" max="300" placeholder="e.g. 65">
          </div>
          <div class="form-field">
            <label>家族病史 <em>*</em></label>
            <div class="seg-group">
              <button class="seg" :class="{ on: health.familyHistory === '是' }" @click="health.familyHistory = '是'">有</button>
              <button class="seg" :class="{ on: health.familyHistory === '否' }" @click="health.familyHistory = '否'">无</button>
            </div>
          </div>
          <div class="form-field">
            <label>是否患病 <em>*</em></label>
            <div class="seg-group">
              <button class="seg" :class="{ on: health.disease === '是' }" @click="health.disease = '是'">是</button>
              <button class="seg" :class="{ on: health.disease === '否' }" @click="health.disease = '否'">否</button>
            </div>
          </div>
          <div class="form-field">
            <label>腰围 (cm) <em>选填</em></label>
            <div class="predict-input">
              <input v-model.number="health.waistline" type="number" class="field-input" min="40" max="200" :placeholder="waistPredicted ? '预测约 ' + predictedWaist + ' cm' : '选填'">
              <span v-if="waistPredicted" class="predicted-tag">（预测）</span>
            </div>
          </div>
          <div class="form-field">
            <label>收缩压 (mmHg) <em>选填</em></label>
            <div class="predict-input">
              <input v-model.number="health.systolicPressure" type="number" class="field-input" min="60" max="250" :placeholder="bpPredicted ? '预测约 ' + predictedBp + ' mmHg' : '选填'">
              <span v-if="bpPredicted" class="predicted-tag">（预测）</span>
            </div>
          </div>
          <div class="form-field">
            <label>是否处于妊娠期 <em>选填</em></label>
            <div class="seg-group">
              <button class="seg" :class="{ on: health.isPregnancy === '是' }" @click="health.isPregnancy = '是'">是</button>
              <button class="seg" :class="{ on: health.isPregnancy === '否' }" @click="health.isPregnancy = '否'">否</button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="submit-btn" @click="startConsult">
            <i class="fa-solid fa-comment-medical"></i> 开始咨询
          </button>
          <p class="privacy-tip"><i class="fa-solid fa-shield-halved"></i> 您的健康信息仅用于本次医疗咨询，我们将严格保护您的隐私</p>
        </div>
      </div>
    </div>

    <!-- ========== 步骤二：对话界面 ========== -->
    <div v-else class="chat-card">
      <div class="chat-header">
        <div class="chat-header-left">
          <img :src="doctor.avatar" alt="avatar" class="chat-doc-avatar">
          <div>
            <div class="chat-doc-name">{{ doctor.name }} · {{ doctor.department }}</div>
            <div class="chat-doc-status"><i class="fa-solid fa-circle"></i> 已获取您的健康档案，现在可以开始咨询了</div>
          </div>
        </div>
        <button class="back-btn" @click="step = 'form'">
          <i class="fa-solid fa-rotate-left"></i> 修改档案
        </button>
      </div>

      <div ref="chatBody" class="chat-body">
        <div v-for="(msg, i) in messages" :key="i" class="msg-row" :class="msg.role">
          <div class="msg-avatar" :class="msg.role">
            <img v-if="msg.role === 'assistant'" :src="doctor.avatar" alt="avatar">
            <i v-else class="fa-solid fa-user"></i>
          </div>
          <div class="msg-bubble">
            <div class="msg-text">{{ msg.content }}</div>
            <div class="msg-time">{{ msg.time }}</div>
          </div>
        </div>
        <div v-if="loading" class="msg-row assistant">
          <div class="msg-avatar assistant"><img :src="doctor.avatar" alt="avatar"></div>
          <div class="msg-bubble typing"><span></span><span></span><span></span></div>
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
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getCurrentUserId } from '@/api/dify'
import { doctorChat, isMockMode } from '@/api/dify'
import { recordOperation } from '@/utils/operationLog'
import { predictWaist, predictBp, calcBmi } from '@/utils/diabetesRisk'

const route = useRoute()
const userStore = useUserStore()

const doctor = ref({
  name: '',
  department: '',
  title: '',
  avatar: '/img/doctor-default.png',
  bio: ''
})

// 从路由参数获取医生信息
function loadDoctor() {
  const q = route.query
  doctor.value = {
    name: q.name || q.doctorName || '张医生',
    department: q.department || '内分泌科',
    title: q.title || '主任医师',
    avatar: q.avatar || '/img/doctor-default.png',
    bio: q.bio || ''
  }
}

const step = ref('form')
const loading = ref(false)
const inputText = ref('')
const chatBody = ref(null)

const health = ref({
  userId: getCurrentUserId(),
  sex: '男',
  age: 45,
  height: 170,
  weight: 65,
  familyHistory: '否',
  waistline: null,
  systolicPressure: null,
  isPregnancy: '否',
  disease: '否',
  diabetesType: null
})

const messages = ref([])

// 腰围/收缩压预测值（未填写时按身高体重性别推断，用于回显标注）
const predictedWaist = computed(() => {
  const h = health.value
  if (!h.sex || !h.height) return null
  return predictWaist(h.sex, h.height, calcBmi(h.height, h.weight))
})
const predictedBp = computed(() => {
  const h = health.value
  if (!h.sex || !h.height || !h.weight) return null
  return predictBp(h.sex, calcBmi(h.height, h.weight))
})
const waistPredicted = computed(() => !health.value.waistline && predictedWaist.value !== null)
const bpPredicted = computed(() => !health.value.systolicPressure && predictedBp.value !== null)

function formatTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function validateForm() {
  if (!health.value.age || health.value.age < 1) return '请填写正确的年龄'
  if (!health.value.height || health.value.height < 80 || health.value.height > 250) return '请填写正确的身高'
  if (!health.value.weight || health.value.weight < 20 || health.value.weight > 300) return '请填写正确的体重'
  if (health.value.waistline && (health.value.waistline < 40 || health.value.waistline > 200)) return '请填写正确的腰围'
  if (health.value.systolicPressure && (health.value.systolicPressure < 60 || health.value.systolicPressure > 250)) return '请填写正确的收缩压'
  return ''
}

function startConsult() {
  const err = validateForm()
  if (err) {
    alert(err)
    return
  }
  step.value = 'chat'
  messages.value.push({
    role: 'assistant',
    content: `您好，我是${doctor.value.name}医生（${doctor.value.department}）。已收到您的健康档案：${health.value.sex}，${health.value.age}岁，身高${health.value.height}cm，体重${health.value.weight}kg${health.value.waistline ? '，腰围' + health.value.waistline + 'cm' : ''}${health.value.systolicPressure ? '，收缩压' + health.value.systolicPressure + 'mmHg' : ''}。请问有什么可以帮您？`,
    time: formatTime()
  })
  nextTick(scrollBottom)
}

async function scrollBottom() {
  await nextTick()
  if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
}

async function send() {
  const text = inputText.value.trim()
  if (!text || loading.value) return
  inputText.value = ''
  messages.value.push({ role: 'user', content: text, time: formatTime() })
  await scrollBottom()
  loading.value = true
  try {
    const res = await doctorChat({
      doctorName: doctor.value.name,
      department: doctor.value.department,
      health: health.value,
      messages: messages.value.map((m) => ({ role: m.role, content: m.content }))
    })
    const answer = isMockMode() ? res.answer : (res.data && res.data.answer) || res.answer
    messages.value.push({ role: 'assistant', content: answer, time: formatTime() })
    recordOperation({
      type: 'AI 咨询',
      action: `医生在线咨询（${doctor.value.name || '医生'}）`,
      detail: text.length > 40 ? text.slice(0, 40) + '…' : text,
      result: 'success'
    })
  } catch (e) {
    messages.value.push({ role: 'assistant', content: '抱歉，咨询通道暂时繁忙，请稍后重试。', time: formatTime() })
  } finally {
    loading.value = false
    await scrollBottom()
  }
}

// 从个人信息 healthInfo 自动填充健康档案表单
function loadHealthFromProfile() {
  const h = userStore.userInfo.healthInfo || {}
  const hasProfileData = ['disease', 'sex', 'age', 'height', 'weight'].some((k) => h[k] !== undefined && h[k] !== null && h[k] !== '')
  if (hasProfileData) {
    health.value = {
      userId: getCurrentUserId(),
      sex: h.sex === '男' || h.sex === '女' ? h.sex : '男',
      age: h.age != null && h.age !== '' ? Number(h.age) : 45,
      height: h.height != null && h.height !== '' ? Number(h.height) : 170,
      weight: h.weight != null && h.weight !== '' ? Number(h.weight) : 65,
      familyHistory: h.familyHistory === '是' || h.familyHistory === '否' ? h.familyHistory : '否',
      waistline: h.waistline != null && h.waistline !== '' ? Number(h.waistline) : null,
      systolicPressure: h.systolicPressure != null && h.systolicPressure !== '' ? Number(h.systolicPressure) : null,
      isPregnancy: h.isPregnancy === '是' || h.isPregnancy === '否' ? h.isPregnancy : '否',
      disease: h.disease === '是' || h.disease === '否' ? h.disease : '否',
      diabetesType: h.diabetesType || null
    }
  }
}

onMounted(() => {
  loadDoctor()
  loadHealthFromProfile()
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

/* ========== 表单卡片 ========== */
.consult-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.form-card {
  background: #fff;
  border-radius: 14px;
  padding: 22px 24px;
  box-shadow: 0 2px 12px rgba(31, 45, 61, 0.06);
}
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 18px;
}
.card-title i {
  color: #2563eb;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.form-field label {
  display: block;
  font-size: 12.5px;
  color: #475569;
  margin-bottom: 6px;
}
.form-field em {
  font-style: normal;
  color: #ef4444;
  font-size: 11px;
}
.field-input {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13.5px;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s;
}
.field-input:focus {
  border-color: #2563eb;
}
.predict-input {
  display: flex;
  align-items: center;
  gap: 6px;
}
.predict-input .field-input {
  flex: 1;
  min-width: 0;
}
.predicted-tag {
  flex-shrink: 0;
  font-style: normal;
  font-size: 11px;
  color: #7c3aed;
  background: #ede9fe;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
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
  cursor: pointer;
  transition: all 0.2s;
}
.seg.on {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
  font-weight: 600;
}
.form-actions {
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.submit-btn {
  padding: 12px 48px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
  transition: transform 0.2s, opacity 0.2s;
}
.submit-btn:hover {
  transform: translateY(-2px);
  opacity: 0.95;
}
.privacy-tip {
  margin: 12px 0 0;
  font-size: 12px;
  color: #94a3b8;
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
.chat-doc-status i {
  font-size: 8px;
  margin-right: 3px;
}
.back-btn {
  padding: 7px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
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
</style>
