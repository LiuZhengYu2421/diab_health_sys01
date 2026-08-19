/**
 * 糖尿病风险评估（标准风险评分表）
 * ============================================
 * 适用范围：20 - 74 岁普通人群；评分范围 0 - 51 分；总分 ≥ 25 分为糖尿病高风险人群。
 *
 * 评分指标：
 *  1) 年龄：20-24→0；25-34→4；35-39→8；40-44→11；45-49→12；50-54→13；55-59→15；60-64→16；65-74→18
 *  2) 体质指数 BMI（kg/m²）：<22.0→0；22.0-23.9→1；24.0-29.9→3；≥30.0→5
 *  3) 腰围（cm）：
 *     男 <75.0 / 女 <70.0 → 0；男 75.0-79.9 / 女 70.0-74.9 → 3；
 *     男 80.0-84.9 / 女 75.0-79.9 → 5；男 85.0-89.9 / 女 80.0-84.9 → 7；
 *     男 90.0-94.9 / 女 85.0-89.9 → 8；男 ≥95.0 / 女 ≥90.0 → 10
 *  4) 收缩压（mmHg）：<110→0；110-119→1；120-129→3；130-139→6；140-149→7；150-159→8；≥160→10
 *  5) 糖尿病家族史（父母、同胞、子女）：无→0；有→6
 *  6) 性别：女→0；男→2
 *
 * 腰围与收缩压为选填项：未填写时根据身高、体重、性别等参数推断。
 *  - 腰围：男 baseWaist = 0.47 × height；女 baseWaist = 0.45 × height；
 *         BMI > 24 时调整：baseWaist × (1 + (BMI - 22) / 10)
 *  - 收缩压：男 BMI<24→115、24≤BMI<28→125、BMI≥28→135；女 BMI<24→110、24≤BMI<28→120、BMI≥28→130
 */

/** 高风险判定阈值 */
export const HIGH_RISK_THRESHOLD = 25
/** 中风险判定阈值（< 该值视为低风险） */
export const MID_RISK_THRESHOLD = 15

const AGE_TABLE = [
  { max: 24, score: 0 },   // 20 - 24
  { max: 34, score: 4 },   // 25 - 34
  { max: 39, score: 8 },   // 35 - 39
  { max: 44, score: 11 },  // 40 - 44
  { max: 49, score: 12 },  // 45 - 49
  { max: 54, score: 13 },  // 50 - 54
  { max: 59, score: 15 },  // 55 - 59
  { max: 64, score: 16 },  // 60 - 64
  { max: 74, score: 18 }   // 65 - 74
]

/** 年龄评分（超出 20-74 范围时按边界档处理；非法值/负数按 0 分） */
export function scoreAge(age) {
  const a = Number(age)
  if (!Number.isFinite(a) || a <= 0 || a < 20) return 0
  if (a > 74) return 18
  const row = AGE_TABLE.find((r) => a <= r.max)
  return row ? row.score : 18
}

/** 体质指数评分（非法值/负数按 0 分） */
export function scoreBmi(bmi) {
  const b = Number(bmi)
  if (!Number.isFinite(b) || b < 22) return 0
  if (b < 24) return 1
  if (b < 30) return 3
  return 5
}

/** 腰围评分（分性别；非法值/负数按 0 分） */
export function scoreWaist(sex, waist) {
  const w = Number(waist)
  if (!Number.isFinite(w) || w <= 0) return 0
  if (sex === '男') {
    if (w < 75) return 0
    if (w < 80) return 3
    if (w < 85) return 5
    if (w < 90) return 7
    if (w < 95) return 8
    return 10
  }
  if (w < 70) return 0
  if (w < 75) return 3
  if (w < 80) return 5
  if (w < 85) return 7
  if (w < 90) return 8
  return 10
}

/** 收缩压评分（非法值/负数按 0 分） */
export function scoreBp(bp) {
  const b = Number(bp)
  if (!Number.isFinite(b) || b <= 0) return 0
  if (b < 110) return 0
  if (b < 120) return 1
  if (b < 130) return 3
  if (b < 140) return 6
  if (b < 150) return 7
  if (b < 160) return 8
  return 10
}

/** 糖尿病家族史评分（父母、同胞、子女） */
export function scoreFamily(familyHistory) {
  return familyHistory === '是' ? 6 : 0
}

/** 性别评分 */
export function scoreSex(sex) {
  return sex === '男' ? 2 : 0
}

/** 计算体质指数（身高/体重非法或非正数时返回 null） */
export function calcBmi(height, weight) {
  const h = Number(height)
  const w = Number(weight)
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null
  return w / Math.pow(h / 100, 2)
}

/**
 * 推断腰围（cm）：
 *  男 baseWaist = 0.47 × height；女 baseWaist = 0.45 × height
 *  BMI > 24 时调整：adjustedWaist = baseWaist × (1 + (BMI - 22) / 10)
 *  （身高非法/非正数时返回 null）
 */
export function predictWaist(sex, height, bmi) {
  const h = Number(height)
  if (!Number.isFinite(h) || h <= 0 || !sex) return null
  const base = sex === '男' ? 0.47 * h : 0.45 * h
  const b = Number(bmi)
  if (!Number.isFinite(b) || b <= 0) return Math.round(base)
  return Math.round(b > 24 ? base * (1 + (b - 22) / 10) : base)
}

/**
 * 推断收缩压（mmHg）：
 *  男：BMI<24→115；24≤BMI<28→125；BMI≥28→135
 *  女：BMI<24→110；24≤BMI<28→120；BMI≥28→130
 *  （BMI 非法/非正数时返回 null）
 */
export function predictBp(sex, bmi) {
  const b = Number(bmi)
  if (!Number.isFinite(b) || b <= 0 || !sex) return null
  if (sex === '男') {
    if (b < 24) return 115
    if (b < 28) return 125
    return 135
  }
  if (b < 24) return 110
  if (b < 28) return 120
  return 130
}

/** 根据评分生成建议文案 */
export function buildAdvice(total) {
  if (total >= HIGH_RISK_THRESHOLD) {
    return `您的糖尿病风险评分为 ${total} 分（≥${HIGH_RISK_THRESHOLD} 分），属于糖尿病高风险人群。建议您尽快前往医院内分泌科进行空腹血糖及口服葡萄糖耐量试验检查，并严格遵循医生建议：控制饮食总热量、坚持规律运动、科学减重，每 3~6 个月复查一次血糖。`
  }
  if (total >= MID_RISK_THRESHOLD) {
    return `您的糖尿病风险评分为 ${total} 分，风险处于中等水平。建议加强血糖监测，控制精制碳水与高糖食物摄入，坚持每周 150 分钟以上中等强度运动，将体质指数控制在 24 以下，并每年进行一次空腹血糖筛查。`
  }
  return `您的糖尿病风险评分为 ${total} 分，风险较低。请继续保持健康的饮食与运动习惯，控制体重、避免久坐，坚持每年进行一次健康体检。`
}

/**
 * 计算糖尿病风险（未患病人群）
 * @param {object} params { age, sex, height, weight, familyHistory, waistline, systolicPressure }
 * @returns {object} { total, level, items, bmi, waist, bp, waistPredicted, bpPredicted, advice }
 */
export function calcDiabetesRisk(params = {}) {
  const age = Number(params.age)
  const sex = params.sex === '男' ? '男' : params.sex === '女' ? '女' : ''
  const height = Number(params.height)
  const weight = Number(params.weight)
  const familyHistory = params.familyHistory

  const bmi = calcBmi(height, weight)

  // 腰围 / 收缩压为选填项，未填写或为非法值（负数等）时由其他参数推断
  const rawWaist = Number(params.waistline)
  const rawBp = Number(params.systolicPressure)
  let waist = Number.isFinite(rawWaist) && rawWaist > 0 ? rawWaist : null
  let bp = Number.isFinite(rawBp) && rawBp > 0 ? rawBp : null
  let waistPredicted = false
  let bpPredicted = false
  if (waist === null && sex && height) {
    waist = predictWaist(sex, height, bmi)
    waistPredicted = true
  }
  if (bp === null && sex && bmi !== null) {
    bp = predictBp(sex, bmi)
    bpPredicted = true
  }

  const items = [
    {
      key: 'age',
      label: '年龄',
      value: age ? `${age} 岁` : '—',
      score: scoreAge(age)
    },
    {
      key: 'bmi',
      label: '体质指数 (BMI)',
      value: bmi !== null ? `${bmi.toFixed(1)} kg/m²` : '—',
      score: scoreBmi(bmi)
    },
    {
      key: 'waist',
      label: '腰围',
      value: waist !== null ? `${waist} cm${waistPredicted ? '（预测）' : ''}` : '—',
      score: scoreWaist(sex, waist),
      predicted: waistPredicted
    },
    {
      key: 'bp',
      label: '收缩压',
      value: bp !== null ? `${bp} mmHg${bpPredicted ? '（预测）' : ''}` : '—',
      score: scoreBp(bp),
      predicted: bpPredicted
    },
    {
      key: 'family',
      label: '糖尿病家族史',
      value: familyHistory === '是' ? '有' : familyHistory === '否' ? '无' : '—',
      score: scoreFamily(familyHistory)
    },
    {
      key: 'sex',
      label: '性别',
      value: sex || '—',
      score: scoreSex(sex)
    }
  ]

  const total = items.reduce((sum, it) => sum + (it.score || 0), 0)
  const level = total >= HIGH_RISK_THRESHOLD ? '高风险' : total >= MID_RISK_THRESHOLD ? '中风险' : '低风险'

  return { total, level, items, bmi, waist, bp, waistPredicted, bpPredicted, advice: buildAdvice(total) }
}
