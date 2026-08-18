<template>
  <div class="ai-assistant-panel">
    <!-- ========== 面板头 ========== -->
    <div class="panel-head">
      <div class="panel-head-left">
        <h3 class="panel-title">
          <i class="fa-solid fa-robot"></i>
          AI 数据助理
        </h3>
        <p class="panel-sub">用自然语言对数据库进行查询、新增、修改与删除操作，AI 自动生成并执行</p>
      </div>
      <div class="panel-head-right">
        <span class="status-badge"><i class="fa-solid fa-circle"></i> 数据引擎已连接</span>
        <button class="clear-btn" @click="clearChat">
          <i class="fa-solid fa-trash-can"></i> 清空对话
        </button>
      </div>
    </div>

    <!-- ========== 对话区 ========== -->
    <div class="chat-main">
      <div ref="chatBody" class="chat-body">
        <div v-if="messages.length === 0" class="chat-empty">
          <div class="empty-icon"><i class="fa-solid fa-database"></i></div>
          <h4>向 AI 数据助理发出指令</h4>
          <p>例如：<span class="eg" @click="quick('查询全站用户数量')">查询全站用户数量</span>、
            <span class="eg" @click="quick('新增一篇糖尿病科普文章')">新增一篇糖尿病科普文章</span>、
            <span class="eg" @click="quick('删除ID为5的打卡记录')">删除ID为5的打卡记录</span></p>
        </div>

        <div v-for="(msg, i) in messages" :key="i" class="msg-row" :class="msg.role">
          <div class="msg-avatar" :class="msg.role">
            <i :class="msg.role === 'user' ? 'fa-solid fa-user-shield' : 'fa-solid fa-robot'"></i>
          </div>
          <div class="msg-bubble">
            <div class="msg-text">{{ msg.content }}</div>

            <!-- 操作状态徽标 -->
            <div v-if="msg.status" class="msg-status" :class="msg.status">
              <i :class="msg.status === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'"></i>
              {{ msg.message }}
            </div>

            <!-- 数据列表展示 -->
            <div v-if="msg.data && msg.data.list" class="msg-table">
              <table>
                <thead>
                  <tr>
                    <th v-for="(_, key) in msg.data.list[0]" :key="key">{{ key }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, ri) in msg.data.list" :key="ri">
                    <td v-for="(val, key) in row" :key="key">{{ val }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- JSON 展示 -->
            <div v-if="msg.data" class="msg-json">
              <div class="json-label"><i class="fa-solid fa-code"></i> 返回数据 (JSON)</div>
              <pre>{{ JSON.stringify(msg.data, null, 2) }}</pre>
            </div>

            <div class="msg-time">{{ msg.time }}</div>
          </div>
        </div>

        <div v-if="loading" class="msg-row assistant">
          <div class="msg-avatar assistant"><i class="fa-solid fa-robot"></i></div>
          <div class="msg-bubble typing"><span></span><span></span><span></span></div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="chat-input-bar">
        <input
          v-model="inputText"
          class="chat-input"
          placeholder="输入数据操作指令，如：查询用户表全部数据…"
          @keyup.enter="send"
        >
        <button class="send-btn" :disabled="loading || !inputText.trim()" @click="send">
          <i class="fa-solid fa-paper-plane"></i> 执行
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { adminQuery, isMockMode } from '@/api/dify'
import { recordOperation } from '@/utils/operationLog'

const loading = ref(false)
const inputText = ref('')
const chatBody = ref(null)
const messages = ref([])

function formatTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function scrollBottom() {
  await nextTick()
  if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
}

function quick(text) {
  inputText.value = text
  send()
}

function clearChat() {
  messages.value = []
}

async function send() {
  const text = inputText.value.trim()
  if (!text || loading.value) return
  inputText.value = ''
  messages.value.push({ role: 'user', content: text, time: formatTime() })
  await scrollBottom()
  loading.value = true
  try {
    const res = await adminQuery({
      messages: messages.value.filter((m) => m.role === 'user').map((m) => m.content)
    })
    // 需求格式：{ message, status, data }，同时兼容旧格式 { answer }
    const data = isMockMode() ? res : (res.data || res)
    messages.value.push({
      role: 'assistant',
      content: data.answer || data.message || '操作完成。',
      message: data.message || '',
      status: data.status || '',
      data: data.data || (data.json || null),
      time: formatTime()
    })
    recordOperation({
      type: 'AI 咨询',
      action: '管理员 AI 数据运维查询',
      detail: text.length > 40 ? text.slice(0, 40) + '…' : text,
      result: 'success'
    })
  } catch (e) {
    messages.value.push({ role: 'assistant', content: '数据操作失败，请检查权限后重试。', time: formatTime() })
  } finally {
    loading.value = false
    await scrollBottom()
  }
}
</script>

<style scoped>
.ai-assistant-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* ========== 面板头 ========== */
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 14px;
  padding: 18px 22px;
  box-shadow: 0 1px 8px rgba(15, 23, 42, 0.06);
}
.panel-head-left {
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.panel-title {
  margin: 0;
  font-size: 17px;
  color: #1e293b;
}
.panel-title i {
  color: #2563eb;
  margin-right: 4px;
}
.panel-sub {
  margin: 0;
  font-size: 12.5px;
  color: #94a3b8;
}
.panel-head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 20px;
  font-size: 12.5px;
}
.status-badge i {
  font-size: 8px;
}
.clear-btn {
  padding: 7px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s;
}
.clear-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

/* ========== 对话区 ========== */
.chat-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 8px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}
.chat-empty {
  text-align: center;
  padding: 50px 20px;
  color: #64748b;
}
.empty-icon {
  width: 66px;
  height: 66px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 50%;
  font-size: 28px;
  color: #2563eb;
}
.chat-empty h4 {
  margin: 0 0 8px;
  color: #1e293b;
  font-size: 16px;
}
.chat-empty p {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
}
.eg {
  color: #2563eb;
  cursor: pointer;
  border-bottom: 1px dashed #93c5fd;
}
.eg:hover {
  color: #1d4ed8;
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
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 15px;
}
.msg-avatar.assistant {
  background: #eff6ff;
  color: #2563eb;
}
.msg-avatar.user {
  background: #2563eb;
  color: #fff;
}
.msg-bubble {
  max-width: 72%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}
.msg-row.assistant .msg-bubble {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top-left-radius: 4px;
  color: #1e293b;
  max-width: 80%;
}
.msg-row.user .msg-bubble {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  border-top-right-radius: 4px;
}
.msg-time {
  margin-top: 6px;
  font-size: 11px;
  color: #94a3b8;
}

.msg-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 5px 12px;
  border-radius: 14px;
  font-size: 12.5px;
}
.msg-status.success {
  background: #f0fdf4;
  color: #16a34a;
}
.msg-status.error {
  background: #fef2f2;
  color: #ef4444;
}

.msg-table {
  margin-top: 12px;
  overflow-x: auto;
}
.msg-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.msg-table th {
  background: #eff6ff;
  color: #1e3a5f;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 2px solid #dbeafe;
  font-weight: 600;
  white-space: nowrap;
}
.msg-table td {
  padding: 7px 12px;
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  white-space: nowrap;
}
.msg-table tr:hover td {
  background: #f8fafc;
}

.msg-json {
  margin-top: 10px;
}
.json-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}
.json-label i {
  color: #2563eb;
}
.msg-json pre {
  margin: 0;
  padding: 10px 14px;
  background: #0f172a;
  color: #93c5fd;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
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
  outline: none;
  transition: border-color 0.2s;
}
.chat-input:focus {
  border-color: #2563eb;
}
.send-btn {
  padding: 0 26px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
