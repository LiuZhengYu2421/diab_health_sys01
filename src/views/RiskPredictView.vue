<template>
  <div class="content-page risk-page">
    <!-- ========== 页面头部 ========== -->
    <div class="page-head">
      <div class="page-head-left">
        <h2 class="page-title"><i class="fa-solid fa-wand-magic-sparkles"></i> 智能风险预测</h2>
        <p class="page-sub">基于您的健康档案，AI 自动评估糖尿病风险并给出个性化建议</p>
      </div>
      <div class="page-head-right">
        <span class="ai-badge"><i class="fa-solid fa-circle"></i> AI 智能评估</span>
      </div>
    </div>

    <!-- ========== 健康档案提示 ========== -->
    <div v-if="loadedCount" class="profile-tip loaded">
      <i class="fa-solid fa-circle-check"></i>
      <div class="tip-text">
        <strong>健康档案已自动载入</strong>
        <span>已带入 {{ loadedCount }} 项信息（{{ loadedFields }}），点击下方按钮即可开始评估</span>
      </div>
    </div>
    <div v-else class="profile-tip empty">
      <i class="fa-solid fa-circle-info"></i>
      <div class="tip-text">
        <strong>未检测到健康档案</strong>
        <span>可先前往「我的 - 个人信息」完善糖尿病预测信息，再回来进行评估</span>
      </div>
    </div>

    <!-- ========== 预测主体 ========== -->
    <div class="predict-area">
      <!-- 未开始：档案摘要 + 开始按钮 -->
      <div v-if="!predicting && !resultData" class="predict-empty">
        <div class="empty-icon"><i class="fa-solid fa-file-medical"></i></div>
        <h3>准备就绪，开始智能评估</h3>
        <p>将基于您的健康档案，综合年龄、体质指数、腰围、收缩压、家族史等指标评估糖尿病风险。</p>

        <div class="profile-summary">
          <div class="summary-head">
            <i class="fa-solid fa-address-card"></i> 当前健康档案
            <span class="summary-count">{{ profileFields.length }} 项</span>
          </div>
          <div class="summary-grid">
            <div v-for="f in profileFields" :key="f.key" class="summary-item">
              <span class="s-label">{{ f.label }}</span>
              <span class="s-value">{{ f.value }}</span>
            </div>
          </div>
        </div>

        <button class="start-btn" @click="doPredict">
          <i class="fa-solid fa-play"></i> 开始预测
        </button>
      </div>

      <!-- 加载中 -->
      <div v-else-if="predicting" class="loading-view">
        <div class="loader">
          <span></span><span></span><span></span>
        </div>
        <p>AI 正在结合您的健康档案评估糖尿病风险，请稍候…</p>
      </div>

      <!-- 评估结果 -->
      <template v-else>
        <div class="result-head">
          <div class="result-head-left">
            <h3 class="result-title"><i class="fa-solid fa-shield-heart"></i> 糖尿病风险评估报告</h3>
            <p class="result-time">基于您当前的健康档案生成 · {{ resultTime }}</p>
          </div>
          <button class="restart-btn" @click="resetPredict">
            <i class="fa-solid fa-rotate"></i> 重新预测
          </button>
        </div>

        <!-- 未确诊：评分 + 等级 -->
        <template v-if="!detail.diabetesType">
          <div class="risk-overview">
            <div class="level-badge" :class="levelClass">
              <i :class="levelIcon"></i>{{ resultData.riskLevel }}
            </div>
            <div class="score-box">
              <div class="score-num">{{ resultData.riskScore }}<span>分</span></div>
              <div class="score-label">风险评分（满分 51）</div>
            </div>
          </div>
          <div class="score-tip"><i class="fa-solid fa-circle-info"></i>{{ scoreTip }}</div>

          <div v-if="detailItems.length" class="result-card">
            <div class="card-title"><i class="fa-solid fa-table-cells-large"></i> 风险评分明细</div>
            <div class="detail-list">
              <div v-for="it in detailItems" :key="it.key" class="detail-row">
                <span class="d-label">{{ it.label }}</span>
                <span class="d-value">{{ it.value }}</span>
                <span class="d-score" :class="{ danger: it.score > 0 }">+{{ it.score }}</span>
              </div>
              <div class="detail-row total">
                <span class="d-label">总分</span>
                <span class="d-value">{{ detail.total }} 分</span>
                <span class="d-score">{{ resultData.riskLevel }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- 已确诊：类型 + 管理建议 -->
        <div v-else class="risk-overview">
          <div class="level-badge purple">
            <i class="fa-solid fa-stethoscope"></i>{{ resultData.riskLevel }}
          </div>
          <div class="score-tip">
            <i class="fa-solid fa-circle-info"></i>您已确诊{{ resultData.riskLevel }}，以下为针对性管理建议
          </div>
        </div>

        <!-- AI 建议 -->
        <div class="result-card suggestion">
          <div class="card-title"><i class="fa-solid fa-lightbulb"></i> AI 个性化建议</div>
          <p class="advice-text">{{ resultData.advice }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { getCurrentUserId, isMockMode, riskPredict } from '@/api/dify'
import { HIGH_RISK_THRESHOLD, MID_RISK_THRESHOLD, predictWaist, predictBp, calcBmi } from '@/utils/diabetesRisk'
import { recordOperation } from '@/utils/operationLog'

const userStore = useUserStore()

const predicting = ref(false)
const resultData = ref(null)
const resultTime = ref('')
const loadedCount = ref(0)
const loadedFields = ref('')

/** 页面展示用的中文字段名 */
const FIELD_LABELS = {
  age: '年龄',
  sex: '性别',
  height: '身高',
  weight: '体重',
  familyHistory: '家族史',
  waistline: '腰围',
  systolicPressure: '收缩压',
  isPregnancy: '是否怀孕',
  disease: '是否患病',
  diabetesType: '糖尿病类型'
}

const healthInfo = computed(() => userStore.userInfo.healthInfo || {})

const hasValue = (v) => v !== undefined && v !== null && v !== ''

/** 档案摘要字段（始终展示全部核心字段，未填写时给出占位提示；腰围/收缩压未填写时展示本地估算值并标注预测） */
const profileFields = computed(() => {
  const h = healthInfo.value
  const bmi = calcBmi(h.height, h.weight)
  const pw = hasValue(h.waistline) ? null : predictWaist(h.sex, h.height, bmi)
  const pb = hasValue(h.systolicPressure) ? null : predictBp(h.sex, bmi)
  return Object.entries(FIELD_LABELS)
    .filter(([key]) => key !== 'diabetesType' || h.disease === '是')
    .map(([key, label]) => ({ key, label, value: formatField(key, h[key], { pw, pb }) }))
})

function formatField(key, val, extra = {}) {
  if (key === 'age') return hasValue(val) ? `${val} 岁` : '未填写'
  if (key === 'height') return hasValue(val) ? `${val} cm` : '未填写'
  if (key === 'weight') return hasValue(val) ? `${val} kg` : '未填写'
  if (key === 'waistline') return hasValue(val) ? `${val} cm` : extra.pw ? `${extra.pw} cm（预测）` : '未填写'
  if (key === 'systolicPressure') return hasValue(val) ? `${val} mmHg` : extra.pb ? `${extra.pb} mmHg（预测）` : '未填写'
  if (key === 'familyHistory') return !hasValue(val) ? '未填写' : val === '是' ? '有' : val === '否' ? '无' : val
  if (key === 'disease') return !hasValue(val) ? '未填写' : val === '是' ? '已确诊' : val === '否' ? '未确诊' : val
  return hasValue(val) ? val : '未填写'
}

/** 评分明细 */
const detailItems = computed(() => resultData.value?.detail?.items || [])
const detail = computed(() => resultData.value?.detail || {})

/** 风险等级徽章样式 */
const levelClass = computed(() => {
  const lv = resultData.value?.riskLevel || ''
  if (lv === '高风险') return 'danger'
  if (lv === '中风险') return 'warning'
  if (lv === '低风险') return 'safe'
  return 'purple'
})
const levelIcon = computed(() => {
  const lv = resultData.value?.riskLevel || ''
  if (lv === '高风险') return 'fa-solid fa-triangle-exclamation'
  if (lv === '中风险') return 'fa-solid fa-circle-exclamation'
  if (lv === '低风险') return 'fa-solid fa-circle-check'
  return 'fa-solid fa-stethoscope'
})
const scoreTip = computed(() => {
  const s = resultData.value?.riskScore
  if (s >= HIGH_RISK_THRESHOLD) {
    return `评分 ≥ ${HIGH_RISK_THRESHOLD} 分即为糖尿病高风险人群，建议尽快前往医院内分泌科进行空腹血糖及糖耐量检查。`
  }
  if (s >= MID_RISK_THRESHOLD) {
    return `评分 ≥ ${MID_RISK_THRESHOLD} 分属于中等风险，请加强血糖监测与生活方式干预，并每年进行一次血糖筛查。`
  }
  return '当前风险较低，请继续保持健康的饮食与运动习惯。'
})

/** 组装请求体：从个人信息 healthInfo 读取，透传 Dify 工作流 10 个起始变量 */
function buildPayload() {
  const h = healthInfo.value
  return {
    userId: getCurrentUserId(),
    age: h.age,
    sex: h.sex,
    height: h.height,
    weight: h.weight,
    familyHistory: h.familyHistory,
    waistline: h.waistline,
    systolicPressure: h.systolicPressure,
    isPregnancy: h.isPregnancy,
    disease: h.disease,
    diabetesType: h.diabetesType
  }
}

async function doPredict() {
  if (predicting.value) return
  predicting.value = true
  resultData.value = null
  try {
    const res = await riskPredict(buildPayload())
    const data = isMockMode() ? res : (res.data || res)
    // 防御性清理：工作流建议文本可能带首尾引号
    data.advice = String(data.advice || '').replace(/^["“'‘]|["”'’]$/g, '').trim()
    resultData.value = data || {}
    resultTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
    // 真实模式：预测完成后重新拉取档案（Dify 工作流已将推断的腰围/收缩压写库，刷新后回显）
    if (!isMockMode() && userStore.token) {
      try { await userStore.fetchUserInfo() } catch (e) { /* 忽略，不影响结果展示 */ }
    }
    recordOperation({
      type: '风险预测',
      action: '糖尿病风险预测',
      detail: `风险等级：${data.riskLevel || '未知'}，评分：${data.riskScore ?? '—'}`,
      result: 'success'
    })
  } catch (e) {
    if (!e.handled) alert('预测失败，请稍后重试')
  } finally {
    predicting.value = false
  }
}

function resetPredict() {
  resultData.value = null
  doPredict()
}

/** 初始化：统计已填写的健康档案字段 */
function initProfile() {
  const h = healthInfo.value
  const filled = Object.keys(FIELD_LABELS)
    .filter((k) => k !== 'diabetesType' || h.disease === '是')
    .filter((k) => hasValue(h[k]))
  loadedCount.value = filled.length
  loadedFields.value = filled.map((k) => FIELD_LABELS[k]).join('、')
}

onMounted(initProfile)
</script>

<style scoped>
.risk-page {
  display: flex;
  flex-direction: column;
  padding: 24px 26px;
  background: linear-gradient(180deg, #f0f5fd 0%, #eef3fa 100%);
  border-radius: 18px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* ========== 页面头部 ========== */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-head-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}

.page-title {
  margin: 0;
  font-size: 20px;
  color: #1e3a5f;
  white-space: nowrap;
}

.page-title i {
  color: #2563eb;
  margin-right: 4px;
}

.page-sub {
  margin: 0;
  font-size: 13px;
  color: #7d8ba1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #e6f7ee;
  color: #16a34a;
  border-radius: 20px;
  font-size: 13px;
  flex-shrink: 0;
}

.ai-badge i {
  font-size: 8px;
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

/* ========== 健康档案提示 ========== */
.profile-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
}

.profile-tip > i {
  flex-shrink: 0;
  font-size: 15px;
  margin-top: 1px;
}

.tip-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tip-text strong {
  font-weight: 600;
}

.tip-text span {
  font-size: 12px;
  opacity: 0.85;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-tip.loaded {
  background: #e8f7ee;
  color: #1d7a45;
  border: 1px solid #b7e4c8;
}

.profile-tip.empty {
  background: #fff4e0;
  color: #9a6b12;
  border: 1px solid #f3dfae;
}

/* ========== 预测主体 ========== */
.predict-area {
  flex: 1;
  min-height: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(31, 45, 61, 0.08);
  overflow-y: auto;
  padding: 26px 30px;
}

/* ---- 未开始 ---- */
.predict-empty {
  text-align: center;
  padding: 14px 10px 20px;
  color: #64748b;
}

.empty-icon {
  width: 78px;
  height: 78px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 50%;
  font-size: 34px;
  color: #2563eb;
}

.predict-empty h3 {
  margin: 0 0 8px;
  color: #1e3a5f;
  font-size: 17px;
}

.predict-empty > p {
  margin: 0 auto 24px;
  max-width: 460px;
  font-size: 13px;
  line-height: 1.7;
}

.profile-summary {
  max-width: 680px;
  margin: 0 auto 26px;
  padding: 18px 20px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  text-align: left;
}

.summary-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 14px;
}

.summary-head i {
  color: #2563eb;
}

.summary-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: #94a3b8;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eef2f7;
}

.s-label {
  font-size: 11px;
  color: #94a3b8;
}

.s-value {
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
}

.start-btn {
  padding: 12px 44px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 14.5px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
  transition: transform 0.2s;
}

.start-btn:hover {
  transform: translateY(-2px);
}

/* ---- 加载中 ---- */
.loading-view {
  text-align: center;
  padding: 80px 30px;
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

/* ---- 评估结果 ---- */
.result-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.result-title {
  margin: 0;
  font-size: 17px;
  color: #1e3a5f;
}

.result-title i {
  color: #2563eb;
  margin-right: 6px;
}

.result-time {
  margin: 5px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.restart-btn {
  padding: 8px 18px;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.restart-btn:hover {
  background: #dbeafe;
}

.risk-overview {
  display: flex;
  align-items: center;
  gap: 26px;
  margin-bottom: 16px;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 30px;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.12);
}

.level-badge i {
  font-size: 18px;
}

.level-badge.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.level-badge.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.level-badge.safe {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.level-badge.purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.score-box {
  text-align: center;
}

.score-num {
  font-size: 34px;
  font-weight: 800;
  color: #1e3a5f;
  line-height: 1.1;
}

.score-num span {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  margin-left: 3px;
}

.score-label {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.score-tip {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 11px 14px;
  margin-bottom: 18px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  font-size: 12.5px;
  line-height: 1.6;
  color: #475569;
}

.score-tip i {
  color: #2563eb;
  margin-top: 3px;
  flex-shrink: 0;
}

.result-card {
  margin-bottom: 16px;
  padding: 18px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #eef2f7;
}

.result-card.suggestion {
  background: #fffbeb;
  border-color: #fef3c7;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14.5px;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 14px;
}

.card-title i {
  color: #2563eb;
}

.result-card.suggestion .card-title i {
  color: #f59e0b;
}

.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px dashed #e2e8f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.d-label {
  flex: 1;
  font-size: 13px;
  color: #475569;
}

.d-value {
  width: 170px;
  text-align: left;
  font-size: 13px;
  color: #1e293b;
}

.d-score {
  width: 64px;
  text-align: center;
  padding: 3px 0;
  border-radius: 12px;
  background: #eef2f7;
  font-size: 12.5px;
  font-weight: 700;
  color: #64748b;
}

.d-score.danger {
  background: #fee2e2;
  color: #dc2626;
}

.detail-row.total {
  background: #fff;
  border-radius: 8px;
  padding: 12px 8px;
  margin-top: 4px;
}

.detail-row.total .d-label {
  font-weight: 700;
  color: #1e3a5f;
}

.detail-row.total .d-value {
  font-weight: 700;
  color: #1e3a5f;
}

.detail-row.total .d-score {
  background: #eff6ff;
  color: #2563eb;
}

.advice-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.9;
  color: #334155;
  white-space: pre-wrap;
}
</style>
