<template>
  <div class="content-page scheme-page">
    <!-- ========== 页面头部 ========== -->
    <div class="page-head">
      <div class="page-head-left">
        <h2 class="page-title"><i class="fa-solid fa-clipboard-list"></i> 方案定制</h2>
        <p class="page-sub">填写健康信息与生活习惯，AI 为您量身定制专属控糖方案</p>
      </div>
      <button v-if="scheme" class="head-btn" :disabled="loading" @click="openDialog">
        <i class="fa-solid fa-rotate"></i> 重新定制
      </button>
    </div>

    <!-- ========== 无方案空状态 ========== -->
    <div v-if="!scheme && !loading" class="empty-wrap">
      <div class="empty-box">
        <div class="empty-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
        <p class="empty-title">暂无方案</p>
        <p class="empty-desc">填写个人信息与生活习惯，为您生成专属健康管理方案</p>
        <button class="custom-btn" @click="openDialog">
          <i class="fa-solid fa-sliders"></i> 去定制
        </button>
      </div>
    </div>

    <!-- ========== 生成中 ========== -->
    <div v-if="loading" class="loading-wrap">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>AI 正在为您生成专属方案…</p>
    </div>

    <!-- ========== 已有方案 ========== -->
    <template v-if="scheme && !loading">
      <div class="scheme-overview">
        <div class="ov-head">
          <div class="ov-title">
            <i class="fa-solid fa-bowl-food"></i>
            <div>
              <h3>{{ scheme.name }}</h3>
              <p>{{ scheme.desc }}</p>
            </div>
          </div>
        </div>
        <div class="progress-wrap">
          <div class="progress-label">
            <span>本周执行进度</span>
            <b>{{ progress }}%</b>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="scheme-list">
        <div v-for="(item, i) in scheme.items" :key="i" class="scheme-item" :class="{ done: item.done }">
          <div class="item-check">
            <i :class="item.done ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'"></i>
          </div>
          <div class="item-time">{{ item.time }}</div>
          <div class="item-content">{{ item.content }}</div>
          <span v-if="item.done" class="item-status">已完成</span>
          <button v-else class="item-btn" @click="markDone(item)">标记完成</button>
        </div>
      </div>
    </template>

    <!-- ========== 定制弹窗 ========== -->
    <div v-if="dialogVisible" class="dialog-mask" @click.self="closeDialog">
      <div class="dialog-panel">
        <div class="dialog-head">
          <h3><i class="fa-solid fa-sliders"></i> 方案定制</h3>
          <button class="dialog-close" @click="closeDialog"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="dialog-body">
          <!-- 1. 个人信息 -->
          <div class="form-section">
            <div class="section-title"><span class="step">1</span>个人信息</div>
            <div class="form-grid">
              <div class="form-item">
                <label>年龄</label>
                <input type="number" v-model="form.age" placeholder="请输入年龄" min="1" max="120">
              </div>
              <div class="form-item">
                <label>性别</label>
                <select v-model="form.sex">
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div class="form-item">
                <label>身高（cm）</label>
                <input type="number" v-model="form.height" placeholder="请输入身高" min="50" max="250">
              </div>
              <div class="form-item">
                <label>体重（kg）</label>
                <input type="number" v-model="form.weight" placeholder="请输入体重" min="20" max="300">
              </div>
              <div class="form-item">
                <label>是否患病</label>
                <select v-model="form.disease">
                  <option value="">请选择</option>
                  <option value="是">是</option>
                  <option value="否">否</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 2. 生活习惯 -->
          <div class="form-section">
            <div class="section-title"><span class="step">2</span>生活习惯</div>
            <div class="form-grid">
              <div class="form-item">
                <label>作息时间</label>
                <select v-model="form.sleepTime">
                  <option value="">请选择</option>
                  <option value="早睡早起">早睡早起</option>
                  <option value="规律作息">规律作息</option>
                  <option value="经常熬夜">经常熬夜</option>
                  <option value="作息不规律">作息不规律</option>
                </select>
              </div>
              <div class="form-item">
                <label>是否经常做饭</label>
                <select v-model="form.cookOften">
                  <option value="">请选择</option>
                  <option value="经常做饭">经常做饭</option>
                  <option value="偶尔做饭">偶尔做饭</option>
                  <option value="很少做饭">很少做饭</option>
                  <option value="从不下厨">从不下厨</option>
                </select>
              </div>
              <div class="form-item">
                <label>饮食口味</label>
                <select v-model="form.taste">
                  <option value="">请选择</option>
                  <option value="清淡">清淡</option>
                  <option value="偏甜">偏甜</option>
                  <option value="偏咸">偏咸</option>
                  <option value="偏油">偏油</option>
                  <option value="偏辣">偏辣</option>
                  <option value="无特殊偏好">无特殊偏好</option>
                </select>
              </div>
              <div class="form-item">
                <label>运动习惯</label>
                <select v-model="form.exercise">
                  <option value="">请选择</option>
                  <option value="几乎不运动">几乎不运动</option>
                  <option value="每周1-2次">每周1-2次</option>
                  <option value="每周3-4次">每周3-4次</option>
                  <option value="每天运动">每天运动</option>
                </select>
              </div>
              <div class="form-item">
                <label>饮酒习惯</label>
                <select v-model="form.alcohol">
                  <option value="">请选择</option>
                  <option value="从不饮酒">从不饮酒</option>
                  <option value="偶尔饮酒">偶尔饮酒</option>
                  <option value="经常饮酒">经常饮酒</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 3. 方案建议 -->
          <div class="form-section">
            <div class="section-title"><span class="step">3</span>方案建议</div>
            <textarea v-model="form.advice" rows="4" class="advice-input"
              placeholder="请输入您对生成方案的建议，例如：希望方案简单易执行，工作日午餐多为外食……"></textarea>
          </div>
        </div>

        <div class="dialog-foot">
          <button class="cancel-btn" @click="closeDialog">取消</button>
          <button class="generate-btn" :disabled="generating" @click="generateScheme">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            {{ generating ? '生成中…' : '生成方案' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { lifeScheme, isMockMode } from '@/api/dify'
import { recordOperation } from '@/utils/operationLog'
import { showFloatingAlert } from '@/utils/alert'

const userStore = useUserStore()

const loading = ref(false)
const generating = ref(false)
const dialogVisible = ref(false)
const scheme = ref(null)

const progress = computed(() => {
  if (!scheme.value || !scheme.value.items || !scheme.value.items.length) return 0
  const done = scheme.value.items.filter((i) => i.done).length
  return Math.round((done / scheme.value.items.length) * 100)
})

/* ========== 定制表单 ========== */
const form = ref(emptyForm())

function emptyForm() {
  return {
    age: userStore.userInfo.age || '',
    sex: userStore.userInfo.sex || '',
    height: userStore.userInfo.height || '',
    weight: userStore.userInfo.weight || '',
    disease: userStore.userInfo.disease || '',
    sleepTime: '',
    cookOften: '',
    taste: '',
    exercise: '',
    alcohol: '',
    advice: ''
  }
}

function openDialog() {
  form.value = emptyForm()
  dialogVisible.value = true
}

function closeDialog() {
  if (generating.value) return
  dialogVisible.value = false
}

/* ========== 表单校验 ========== */
function validateForm() {
  const f = form.value
  const required = [
    ['age', '年龄'],
    ['sex', '性别'],
    ['height', '身高'],
    ['weight', '体重'],
    ['disease', '是否患病'],
    ['sleepTime', '作息时间'],
    ['cookOften', '是否经常做饭'],
    ['taste', '饮食口味'],
    ['exercise', '运动习惯'],
    ['alcohol', '饮酒习惯'],
    ['advice', '方案建议']
  ]
  for (const [key, label] of required) {
    if (f[key] === '' || f[key] === null || f[key] === undefined) {
      showFloatingAlert(`请完善「${label}」后再生成方案`, 'error')
      return false
    }
  }
  return true
}

/* ========== 生成方案 ========== */
async function generateScheme() {
  if (generating.value) return
  if (!validateForm()) return

  generating.value = true
  loading.value = true
  try {
    const res = await lifeScheme({
      userInfo: {
        age: form.value.age,
        sex: form.value.sex,
        height: form.value.height,
        weight: form.value.weight,
        disease: form.value.disease
      },
      habit: {
        sleepTime: form.value.sleepTime,
        cookOften: form.value.cookOften,
        taste: form.value.taste,
        exercise: form.value.exercise,
        alcohol: form.value.alcohol
      },
      advice: form.value.advice
    })
    const data = isMockMode() ? res : (res.data || res)
    const s = data.scheme || data
    scheme.value = {
      name: s.name || '专属健康方案',
      desc: s.desc || '',
      items: (s.items || []).map((i) => ({ ...i }))
    }
    dialogVisible.value = false
    recordOperation({
      type: '方案生成',
      action: 'AI 生成定制方案',
      detail: `方案：${scheme.value.name}`,
      result: 'success'
    })
  } catch (e) {
    showFloatingAlert('方案生成失败，请稍后重试', 'error')
  } finally {
    generating.value = false
    loading.value = false
  }
}

function markDone(item) {
  item.done = true
}
</script>

<style scoped>
.scheme-page {
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
}
.page-sub {
  margin: 0;
  font-size: 13px;
  color: #7d8ba1;
}
.head-btn {
  padding: 8px 18px;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.head-btn:hover {
  background: #dbeafe;
}
.head-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ========== 无方案空状态 ========== */
.empty-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}
.empty-box {
  text-align: center;
  padding: 60px 80px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(31, 45, 61, 0.06);
}
.empty-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 20px;
}
.empty-title {
  margin: 0 0 8px;
  font-size: 19px;
  font-weight: 700;
  color: #1e3a5f;
}
.empty-desc {
  margin: 0 0 24px;
  font-size: 13px;
  color: #7d8ba1;
}
.custom-btn {
  padding: 11px 34px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
  transition: all 0.2s;
}
.custom-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}
.custom-btn i {
  margin-right: 6px;
}

/* ========== 生成中 ========== */
.loading-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #2563eb;
  font-size: 14px;
}
.loading-wrap i {
  font-size: 26px;
}

/* ========== 概览卡片 ========== */
.scheme-overview {
  background: linear-gradient(135deg, #1e3a5f, #2563eb);
  border-radius: 14px;
  padding: 20px 24px;
  color: #fff;
  margin-bottom: 16px;
}
.ov-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ov-title {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ov-title > i {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  font-size: 22px;
}
.ov-title h3 {
  margin: 0 0 3px;
  font-size: 17px;
  font-weight: 700;
}
.ov-title p {
  margin: 0;
  font-size: 12.5px;
  opacity: 0.85;
}
.progress-wrap {
  margin-top: 18px;
}
.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  margin-bottom: 7px;
  opacity: 0.9;
}
.progress-label b {
  font-size: 14px;
}
.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: 6px;
  transition: width 0.5s ease;
}

/* ========== 方案列表 ========== */
.scheme-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.scheme-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 10px;
  box-shadow: 0 1px 6px rgba(31, 45, 61, 0.05);
  transition: all 0.2s;
}
.scheme-item.done {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}
.item-check {
  font-size: 20px;
  color: #94a3b8;
}
.scheme-item.done .item-check {
  color: #16a34a;
}
.item-time {
  width: 96px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 8px;
  padding: 6px 8px;
  text-align: center;
}
.item-content {
  flex: 1;
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
}
.scheme-item.done .item-content {
  color: #16a34a;
  text-decoration: line-through;
}
.item-status {
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
}
.item-btn {
  padding: 6px 14px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.item-btn:hover {
  background: #dbeafe;
}

/* ========== 定制弹窗 ========== */
.dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
}
.dialog-panel {
  width: 560px;
  max-width: 92vw;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.25);
  overflow: hidden;
}
.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #eef2f7;
}
.dialog-head h3 {
  margin: 0;
  font-size: 17px;
  color: #1e3a5f;
}
.dialog-head h3 i {
  color: #2563eb;
  margin-right: 6px;
}
.dialog-close {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.dialog-close:hover {
  background: #e2e8f0;
}
.dialog-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 24px;
}
.form-section {
  margin-bottom: 22px;
}
.form-section:last-child {
  margin-bottom: 0;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14.5px;
  font-weight: 700;
  color: #1e3a5f;
  margin-bottom: 14px;
}
.step {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 50%;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-item label {
  font-size: 12.5px;
  color: #64748b;
}
.form-item input,
.form-item select,
.advice-input {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  background: #f8fafc;
  font-size: 13.5px;
  color: #334155;
  outline: none;
  transition: all 0.2s;
}
.form-item input:focus,
.form-item select:focus,
.advice-input:focus {
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}
.advice-input {
  resize: vertical;
  min-height: 84px;
  font-family: inherit;
  line-height: 1.6;
}
.dialog-foot {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eef2f7;
}
.cancel-btn {
  padding: 9px 26px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  color: #64748b;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s;
}
.cancel-btn:hover {
  background: #f8fafc;
}
.generate-btn {
  padding: 9px 30px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.2s;
}
.generate-btn:hover {
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}
.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
