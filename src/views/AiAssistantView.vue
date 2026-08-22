<template>
  <div class="content-page ai-assistant-page">
    <!-- ========== 页面头部 ========== -->
    <div class="page-head">
      <div class="page-head-left">
        <h2 class="page-title"><i class="fa-solid fa-robot"></i> 智能助手</h2>
        <p class="page-sub">全天候 AI 健康管家 · 基于您的健康档案自动分析糖尿病相关问题</p>
      </div>
      <div class="page-head-right">
        <button class="new-chat-btn" :disabled="loading" @click="newChat">
          <i class="fa-solid fa-plus"></i> 开启新对话
        </button>
        <span class="online-badge"><i class="fa-solid fa-circle"></i> AI 在线</span>
      </div>
    </div>

    <div class="assistant-wrap">
      <!-- ========== 聊天区域 ========== -->
      <div class="chat-panel">
        <div ref="chatBody" class="chat-body">
          <div v-if="messages.length === 0" class="chat-empty">
            <div class="empty-icon"><i class="fa-solid fa-comment-dots"></i></div>
            <h3>您好，我是智能健康助手</h3>
            <p>我已自动读取您的个人健康档案，您可以直接向我咨询糖尿病相关的任何问题。</p>
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
              <!-- AI 回答：内容为空（流式生成中）显示打字动画，否则渲染 Markdown -->
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
import { ref, nextTick } from 'vue'
import { getCurrentUserId, assistantChatStream } from '@/api/dify'
import { recordOperation } from '@/utils/operationLog'

const loading = ref(false)
const inputText = ref('')

// 会话 ID：首次为空，后端生成后回传，多轮对话时携带以保持上下文
const sessionId = ref('')

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

// 开启新对话：清空消息并重置会话 ID
function newChat() {
  if (loading.value || messages.value.length === 0) return
  messages.value = []
  sessionId.value = ''
  inputText.value = ''
  scrollBottom()
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

  // 预填 AI 回复气泡（内容为空时显示"思考您的问题"动画，流式填充内容实现打字机效果）
  const aiMsg = { role: 'assistant', content: '', time: formatTime() }
  messages.value.push(aiMsg)
  await scrollBottom()

  // SSE 流式累积内容
  let streamedText = ''

  try {
    // 只传 userId + sessionId + messages：健康档案由后端按 userId 从 user_risk_info 表自动读取
    const payload = {
      userId: getCurrentUserId(),
      sessionId: sessionId.value,
      messages: messages.value.map((m) => ({ role: m.role, content: m.content }))
    }
    await assistantChatStream(payload, {
      // 逐块收到 AI 输出，实时追加渲染（打字机效果）
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
          aiMsg.content = '抱歉，AI 服务暂时不可用，请稍后重试。'
        }
        recordOperation({
          type: 'AI 咨询',
          action: 'AI 智能助手咨询',
          detail: text.length > 40 ? text.slice(0, 40) + '…' : text,
          result: 'success'
        })
      },
      onError: (err) => {
        // 若已输出部分内容则保留，否则显示错误提示
        if (!aiMsg.content.trim()) {
          aiMsg.content = '抱歉，AI 服务暂时不可用，请稍后重试。'
        }
        recordOperation({
          type: 'AI 咨询',
          action: 'AI 智能助手咨询',
          detail: text.length > 40 ? text.slice(0, 40) + '…' : text,
          result: 'fail'
        })
      }
    })
  } catch (e) {
    // assistantChatStream 内部已走 onError，这里兜底
    if (!aiMsg.content.trim()) {
      aiMsg.content = '抱歉，AI 服务暂时不可用，请稍后重试。'
    }
  } finally {
    loading.value = false
    await scrollBottom()
  }
}
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
.page-head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.new-chat-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  background: #fff;
  color: #2563eb;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.new-chat-btn:hover {
  background: #eff6ff;
}
.new-chat-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
}

/* ========== 聊天区域 ========== */
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

/* ========== AI 回答 Markdown 渲染样式 ========== */
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
  white-space: pre-wrap;
  word-break: break-word;
}
.msg-bubble :deep(.md-inline-code) {
  background: #eef2f7;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12.5px;
  color: #b91c1c;
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

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .assistant-card {
    border-radius: 12px;
  }
  .assistant-head {
    padding: 12px 14px;
  }
  .assistant-body {
    padding: 14px;
  }
}

@media (max-width: 480px) {
  .assistant-head {
    padding: 10px 12px;
  }
  .assistant-title {
    font-size: 16px;
  }
  .assistant-body {
    padding: 12px;
    gap: 12px;
  }
  .new-chat-btn {
    padding: 6px 11px;
    font-size: 12px;
  }
  .quick-list {
    flex-wrap: wrap;
    gap: 8px;
  }
  .quick-btn {
    flex: 1 1 auto;
    min-width: calc(50% - 4px);
    padding: 10px 8px;
    font-size: 12px;
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
  .assistant-input-row {
    gap: 8px;
    padding: 8px 12px;
  }
  .assistant-input-row input {
    font-size: 14px;
  }
  .send-btn {
    padding: 9px 14px;
  }
}
</style>
