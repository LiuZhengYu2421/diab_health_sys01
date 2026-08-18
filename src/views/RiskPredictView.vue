<template>
  <div class="content-page risk-page">
    <!-- ========== 页面头部 ========== -->
    <div class="page-head">
      <div class="page-head-left">
        <h2 class="page-title"><i class="fa-solid fa-heart-pulse"></i> 糖尿病风险预测</h2>
        <p class="page-sub">基于 AI 模型评估您的糖尿病患病风险，提供个性化健康建议</p>
      </div>
    </div>

    <div class="risk-wrap">
      <!-- ========== 左侧：预测表单 ========== -->
      <section class="risk-form-panel">
        <div class="panel-title">
          <i class="fa-solid fa-clipboard-user"></i>
          <span>请填写预测参数</span>
        </div>

        <div class="form-grid">
          <div class="form-field">
            <label>性别 <em>*</em></label>
            <div class="seg-group">
              <button class="seg" :class="{ on: form.sex === '男' }" @click="form.sex = '男'">男</button>
              <button class="seg" :class="{ on: form.sex === '女' }" @click="form.sex = '女'">女</button>
            </div>
          </div>
          <div class="form-field">
            <label>年龄 <em>*</em></label>
            <input v-model.number="form.age" type="number" class="field-input" min="1" max="120" placeholder="请输入年龄">
          </div>
          <div class="form-field">
            <label>身高 (cm) <em>*</em></label>
            <input v-model.number="form.height" type="number" class="field-input" placeholder="e.g. 170">
          </div>
          <div class="form-field">
            <label>体重 (kg) <em>*</em></label>
            <input v-model.number="form.weight" type="number" class="field-input" placeholder="e.g. 65">
          </div>
          <div class="form-field">
            <label>家族病史 <em>*</em></label>
            <div class="seg-group">
              <button class="seg" :class="{ on: form.familyHistory === '是' }" @click="form.familyHistory = '是'">有</button>
              <button class="seg" :class="{ on: form.familyHistory === '否' }" @click="form.familyHistory = '否'">无</button>
            </div>
          </div>
          <div class="form-field">
            <label>是否患病 <em>*</em></label>
            <div class="seg-group">
              <button class="seg" :class="{ on: form.disease === '是' }" @click="form.disease = '是'">是</button>
              <button class="seg" :class="{ on: form.disease === '否' }" @click="form.disease = '否'">否</button>
            </div>
          </div>
          <div class="form-field">
            <label>
              腰围 (cm) <em>选填</em>
              <span v-if="waistPredicted" class="ai-tag"><i class="fa-solid fa-wand-magic-sparkles"></i> AI预测</span>
            </label>
            <input v-model.number="form.waistline" type="number" class="field-input" placeholder="留空则自动预测">
          </div>
          <div class="form-field">
            <label>
              收缩压 (mmHg) <em>选填</em>
              <span v-if="bpPredicted" class="ai-tag"><i class="fa-solid fa-wand-magic-sparkles"></i> AI预测</span>
            </label>
            <input v-model.number="form.systolicPressure" type="number" class="field-input" placeholder="留空则自动预测">
          </div>
          <div class="form-field">
            <label>是否处于妊娠期 <em>选填</em></label>
            <div class="seg-group">
              <button class="seg" :class="{ on: form.isPregnancy === '是' }" @click="form.isPregnancy = '是'">是</button>
              <button class="seg" :class="{ on: form.isPregnancy === '否' }" @click="form.isPregnancy = '否'">否</button>
            </div>
          </div>
        </div>

        <!-- 预测值提示 -->
        <div v-if="waistPredicted || bpPredicted" class="predict-tip">
          <i class="fa-solid fa-circle-info"></i>
          <span>此为AI预测信息，请以实际测量为准</span>
        </div>

        <!-- 用户 id -->
        <div class="form-field user-id-row">
          <label>用户 ID</label>
          <input v-model.number="form.userId" type="number" class="field-input" placeholder="当前登录用户">
        </div>

        <div class="form-actions">
          <button class="predict-btn" :disabled="loading" @click="submitPredict">
            <i class="fa-solid fa-magnifying-glass-chart"></i>
            {{ loading ? 'AI 预测中…' : '开始预测' }}
          </button>
        </div>
      </section>

      <!-- ========== 右侧：预测结果 ========== -->
      <section class="risk-result-panel">
        <div v-if="!loading && !result" class="result-empty">
          <div class="empty-icon"><i class="fa-solid fa-chart-simple"></i></div>
          <h3>等待预测结果</h3>
          <p>填写左侧参数后点击「开始预测」，AI 将基于综合指标评估您的糖尿病风险。</p>
        </div>

        <div v-if="loading" class="loading-view">
          <div class="loader"><span></span><span></span><span></span></div>
          <p>AI 正在评估您的健康风险，请稍候…</p>
        </div>

        <template v-if="!loading && result">
          <!-- 风险等级 -->
          <div class="level-card" :class="levelClass">
            <div class="level-icon"><i :class="levelIcon"></i></div>
            <div class="level-info">
              <div class="level-label">糖尿病风险等级</div>
              <div class="level-value">{{ result.riskLevel }}</div>
            </div>
            <div class="score-ring">
              <div class="score-num">{{ result.riskScore }}</div>
              <div class="score-label">风险评分</div>
            </div>
          </div>

          <!-- 参数明细 -->
          <div class="detail-card">
            <div class="detail-title"><i class="fa-solid fa-list-check"></i> 评估参数明细</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="d-label">性别</span>
                <span class="d-value">{{ form.sex }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">年龄</span>
                <span class="d-value">{{ form.age }} 岁</span>
              </div>
              <div class="detail-item">
                <span class="d-label">BMI</span>
                <span class="d-value">{{ bmi }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">腰围</span>
                <span class="d-value">{{ form.waistline || '—' }} cm <em v-if="waistPredicted">AI</em></span>
              </div>
              <div class="detail-item">
                <span class="d-label">收缩压</span>
                <span class="d-value">{{ form.systolicPressure || '—' }} mmHg <em v-if="bpPredicted">AI</em></span>
              </div>
              <div class="detail-item">
                <span class="d-label">家族病史</span>
                <span class="d-value">{{ form.familyHistory }}</span>
              </div>
            </div>
          </div>

          <!-- 健康建议 -->
          <div class="advice-card">
            <div class="advice-title"><i class="fa-solid fa-lightbulb"></i> AI 健康建议</div>
            <p class="advice-text">{{ result.advice }}</p>
          </div>

          <button class="again-btn" @click="resetPredict">
            <i class="fa-solid fa-rotate-left"></i> 重新预测
          </button>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { riskPredict, isMockMode, getCurrentUserId } from '@/api/dify'
import { recordOperation } from '@/utils/operationLog'

const loading = ref(false)
const result = ref(null)
const waistPredicted = ref(false)
const bpPredicted = ref(false)

const form = ref({
  userId: getCurrentUserId(),
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

const bmi = computed(() => {
  if (!form.value.height || !form.value.weight) return '—'
  return (form.value.weight / Math.pow(form.value.height / 100, 2)).toFixed(1)
})

const levelClass = computed(() => {
  if (!result.value) return ''
  if (result.value.riskLevel === '高风险') return 'high'
  if (result.value.riskLevel === '中风险') return 'mid'
  return 'low'
})

const levelIcon = computed(() => {
  if (!result.value) return ''
  if (result.value.riskLevel === '高风险') return 'fa-solid fa-triangle-exclamation'
  if (result.value.riskLevel === '中风险') return 'fa-solid fa-circle-exclamation'
  return 'fa-solid fa-circle-check'
})

/**
 * 需求文档公式：
 *  1) 基础腰围：男 baseWaist = 0.47 * height；女 baseWaist = 0.45 * height
 *     BMI > 24 时进行上调修正：adjustedWaist = baseWaist * (1 + (BMI - 24) * 0.02)
 *  2) 收缩压预测（mmHg）：
 *     男：BMI<24 → 115；24≤BMI<28 → 125；BMI≥28 → 135
 *     女：BMI<24 → 110；24≤BMI<28 → 120；BMI≥28 → 130
 */
function calcPredictValues() {
  const h = form.value.height
  const w = form.value.weight
  if (!h || !w) return { waist: null, bp: null }
  const bmiVal = w / Math.pow(h / 100, 2)

  // 1) 腰围预测
  let waist = null
  if (!form.value.waistline) {
    const baseWaist = form.value.sex === '男' ? 0.47 * h : 0.45 * h
    waist = bmiVal > 24 ? baseWaist * (1 + (bmiVal - 24) * 0.02) : baseWaist
    waist = Math.round(waist)
  }

  // 2) 收缩压预测
  let bp = null
  if (!form.value.systolicPressure) {
    if (form.value.sex === '男') {
      bp = bmiVal < 24 ? 115 : bmiVal < 28 ? 125 : 135
    } else {
      bp = bmiVal < 24 ? 110 : bmiVal < 28 ? 120 : 130
    }
  }
  return { waist, bp }
}

function validateForm() {
  if (!form.value.sex) return '请选择性别'
  if (!form.value.age || form.value.age < 1) return '请填写正确的年龄'
  if (!form.value.height || form.value.height < 80) return '请填写正确的身高'
  if (!form.value.weight || form.value.weight < 20) return '请填写正确的体重'
  return ''
}

function applyPredicted() {
  const { waist, bp } = calcPredictValues()
  waistPredicted.value = false
  bpPredicted.value = false
  if (waist !== null) {
    form.value.waistline = waist
    waistPredicted.value = true
  }
  if (bp !== null) {
    form.value.systolicPressure = bp
    bpPredicted.value = true
  }
}

function resetPredict() {
  result.value = null
  waistPredicted.value = false
  bpPredicted.value = false
  form.value.waistline = null
  form.value.systolicPressure = null
}

async function submitPredict() {
  const err = validateForm()
  if (err) {
    alert(err)
    return
  }
  // 未填腰围/收缩压时，先用公式预测并回显
  applyPredicted()
  loading.value = true
  try {
    const res = await riskPredict({ ...form.value })
    const data = isMockMode() ? res : (res.data || res)
    result.value = {
      riskLevel: data.riskLevel || '低风险',
      riskScore: data.riskScore || 0,
      advice: data.advice || ''
    }
    recordOperation({
      type: '风险评测',
      action: '糖尿病风险评测',
      detail: `评测结果：${result.value.riskLevel}（风险分 ${result.value.riskScore}）`,
      result: 'success'
    })
  } catch (e) {
    alert('预测失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.risk-page {
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

.risk-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 18px;
  overflow: hidden;
}

/* ========== 左：表单 ========== */
.risk-form-panel {
  width: 460px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 14px;
  padding: 20px 22px;
  box-shadow: 0 2px 12px rgba(31, 45, 61, 0.06);
  overflow-y: auto;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 16px;
}
.panel-title i {
  color: #2563eb;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.form-field label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: #475569;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.form-field em {
  font-style: normal;
  color: #94a3b8;
  font-size: 11px;
}
.ai-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 4px;
  padding: 1px 7px;
  font-size: 10px;
  background: #ede9fe;
  color: #7c3aed;
  border-radius: 8px;
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
.user-id-row {
  margin-top: 12px;
}

.predict-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 14px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  font-size: 12.5px;
  color: #b45309;
}
.predict-tip i {
  color: #f59e0b;
}

.form-actions {
  margin-top: 16px;
}
.predict-btn {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
  transition: transform 0.2s, opacity 0.2s;
}
.predict-btn:hover {
  transform: translateY(-2px);
  opacity: 0.95;
}
.predict-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ========== 右：结果 ========== */
.risk-result-panel {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(31, 45, 61, 0.06);
  overflow-y: auto;
}
.result-empty {
  text-align: center;
  padding: 80px 30px;
  color: #64748b;
}
.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 50%;
  font-size: 34px;
  color: #2563eb;
}
.result-empty h3 {
  margin: 0 0 8px;
  color: #1e3a5f;
  font-size: 17px;
}
.result-empty p {
  margin: 0 auto;
  max-width: 380px;
  font-size: 13px;
  line-height: 1.7;
}

.loading-view {
  text-align: center;
  padding: 100px 30px;
  color: #64748b;
}
.loader {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 18px;
}
.loader span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #2563eb;
  animation: loader-bounce 1.2s infinite;
}
.loader span:nth-child(2) { animation-delay: 0.15s; }
.loader span:nth-child(3) { animation-delay: 0.3s; }
@keyframes loader-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.level-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px;
  border-radius: 14px;
  color: #fff;
  margin-bottom: 16px;
}
.level-card.high {
  background: linear-gradient(135deg, #ef4444, #f97316);
}
.level-card.mid {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}
.level-card.low {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.level-icon {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 24px;
}
.level-info {
  flex: 1;
}
.level-label {
  font-size: 13px;
  opacity: 0.9;
}
.level-value {
  font-size: 24px;
  font-weight: 700;
  margin-top: 2px;
}
.score-ring {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.6);
}
.score-num {
  font-size: 22px;
  font-weight: 700;
}
.score-label {
  font-size: 10px;
  opacity: 0.9;
}

.detail-card {
  padding: 16px 18px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #eef2f7;
  margin-bottom: 14px;
}
.detail-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 12px;
}
.detail-title i {
  color: #2563eb;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.detail-item {
  padding: 8px 10px;
  background: #fff;
  border-radius: 8px;
}
.d-label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 3px;
}
.d-value {
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
}
.d-value em {
  font-style: normal;
  font-size: 10px;
  color: #7c3aed;
  background: #ede9fe;
  padding: 1px 5px;
  border-radius: 6px;
  margin-left: 3px;
}

.advice-card {
  padding: 16px 18px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 12px;
  margin-bottom: 16px;
}
.advice-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
}
.advice-title i {
  color: #f59e0b;
}
.advice-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.8;
  color: #78350f;
}

.again-btn {
  padding: 9px 26px;
  border: 1px solid #dbeafe;
  border-radius: 20px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.again-btn:hover {
  background: #dbeafe;
}
</style>
