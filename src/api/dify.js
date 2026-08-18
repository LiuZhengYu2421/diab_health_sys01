/**
 * Dify 对接接口封装
 * ============================================
 * 双模式设计（与 auth.js 保持一致）：
 *  1. Mock 模式（默认，VITE_USE_MOCK=true）
 *     本地模拟 Dify 回复，无需后端即可演示界面。
 *  2. 真实模式（VITE_USE_MOCK=false）
 *     请求后端代理接口（后端负责调用 Dify 并转发结果）。
 *
 * ---------------------------------------------------
 * 接口约定（请在 SpringBoot 中实现）：
 *  POST /api/dify/doctor/chat      医师咨询对话
 *     请求 { doctorName, department, userId, health, messages }
 *     响应 { code:200, data: { answer, sessionId } }
 *  POST /api/dify/punch/analyze    智能打卡分析
 *     请求 { userId }
 *     响应 { code:200, data: { process, completionStatus, evaluate, suggestion } }
 *  POST /api/dify/risk/predict     糖尿病风险预测
 *     请求 { userId, age, sex, height, weight, familyHistory, waistline, systolicPressure, isPregnancy, disease }
 *     响应 { code:200, data: { riskLevel, riskScore, advice, detail } }
 *  POST /api/dify/assistant/chat   智能助手对话
 *     请求 { userId, age, sex, height, weight, familyHistory, waistline, systolicPressure, isPregnancy, disease, messages }
 *     响应 { code:200, data: { answer, sessionId } }
 *  POST /api/dify/admin/query      AI 数据助理（管理员端）
 *     请求 { messages }
 *     响应 { code:200, data: { answer, json, table } }
 *  POST /api/dify/health/tags      健康资讯 - 标签模式
 *     请求 { userInfo }
 *     响应 { code:200, data: { eat, sport, daily, popularization } }
 *  POST /api/dify/health/detail    健康资讯 - 详情模式
 *     请求 { title, userInfo }
 *     响应 { code:200, data: { title, content, tags } }
 *  POST /api/dify/life/scheme      方案定制生成
 *     请求 { userInfo: { age, sex, height, weight, disease },
 *            habit: { sleepTime, cookOften, taste, exercise, alcohol },
 *            advice }
 *     响应 { code:200, data: { scheme } }
 * ---------------------------------------------------
 */
import request from './request'
import { getUser } from '@/utils/storage'

// ========== 模式开关 ==========
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function mockDelay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 当前登录用户信息（Mock 模式下用于填充 userId 等）
function currentUserId() {
  const user = getUser() || {}
  return user.id || user.userId || user.user_id || user.uid || 1
}

// ========== 医师咨询（Mock） ==========
function mockDoctorChat({ doctorName, department, messages }) {
  return mockDelay().then(() => {
    const last = messages && messages.length ? messages[messages.length - 1].content : ''
    const docTitle = `${doctorName || '医生'}（${department || '内分泌科'}）`
    let answer
    if (!last) {
      answer = `您好，我是${docTitle}。已收到您的基本健康档案，下面我来为您做针对性的糖尿病健康分析。请问您最近的空腹血糖大概是多少？`
    } else if (/血糖/.test(last)) {
      answer = '感谢您的反馈。空腹血糖是评估控糖效果的重要指标。结合您的身高体重和日常习惯，我建议您保持当前饮食结构，同时适当增加餐后散步（每次 20~30 分钟），帮助餐后血糖平稳。如有波动较大，请及时记录并复诊。'
    } else if (/饮食|吃|餐|糖分/.test(last)) {
      answer = '关于饮食控制，给您几点建议：1）主食定量，优选粗粮、杂豆等低 GI 食物；2）每餐保证足量蔬菜，先菜后饭；3）控制甜食、含糖饮料摄入；4）两餐之间若饥饿，可选择无糖酸奶或少量坚果。坚持两周左右，血糖会有明显改善。'
    } else {
      answer = '您的问题我已记录。糖尿病管理讲究"五驾马车"：饮食、运动、监测、药物与教育。建议您每日固定时间监测血糖并打卡，平台会根据您的数据持续给出个性化建议。如有不适，请尽快线下就诊。'
    }
    return { answer, sessionId: 'mock-session-' + Date.now() }
  })
}

// ========== 智能打卡分析（Mock） ==========
function mockPunchAnalyze() {
  return mockDelay(900).then(() => {
    return {
      process: '71.4%',
      completionStatus: '最近 7 天共计划打卡 7 次，实际完成 5 次，整体完成率良好，其中饮食与运动类打卡完成度最高。',
      evaluate: '您本周控糖状态较为稳定，血糖监测频率达标，饮食结构趋于健康，运动习惯正在逐步养成，整体生活方式处于积极改善通道。',
      suggestion: '1）继续保持规律运动，本周运动打卡较上周提升明显；2）注意规律作息，早睡早起有助于血糖稳定；3）建议增加餐后血糖监测频次，以便更精细地评估饮食影响；4）本周末可安排一次足部自查与血压测量。'
    }
  })
}

// ========== 糖尿病风险预测（Mock） ==========
function mockRiskPredict(data) {
  return mockDelay(800).then(() => {
    const bmi = data.height > 0 ? data.weight / Math.pow(data.height / 100, 2) : 23
    const waist = Number(data.waistline) || 0
    const bp = Number(data.systolicPressure) || 0
    let score = 20
    if (bmi > 24) score += 15
    if (bmi >= 28) score += 10
    if (waist > 0 && ((data.sex === '男' && waist >= 90) || (data.sex === '女' && waist >= 85))) score += 20
    if (bp > 0 && bp >= 130) score += 15
    if (data.familyHistory === '是') score += 15
    if (data.isPregnancy === '是') score += 10
    score = Math.min(score, 99)
    const level = score >= 60 ? '高风险' : score >= 35 ? '中风险' : '低风险'
    return {
      riskLevel: level,
      riskScore: score,
      advice: level === '高风险' ? '您的糖尿病风险偏高，请尽快前往医院内分泌科做进一步检查，并严格遵循医生建议进行生活方式干预。' : level === '中风险' ? '您的糖尿病风险处于中等水平，建议加强血糖监测、控制饮食与体重，并定期复查。' : '您的糖尿病风险较低，请继续保持健康的生活方式，定期进行健康检查。',
      detail: { bmi: bmi.toFixed(1), waistline: data.waistline || '未填写', systolicPressure: data.systolicPressure || '未填写' }
    }
  })
}

// ========== 智能助手（Mock） ==========
function mockAssistantChat({ messages }) {
  return mockDelay(500).then(() => {
    const last = messages && messages.length ? messages[messages.length - 1].content : ''
    const tips = [
      '您好，我是您的智能健康助手，很高兴为您服务！您可以问我关于糖尿病饮食、运动、用药、血糖监测等方面的问题。',
      '关于饮食：建议三餐定时定量，主食粗细搭配，多选绿叶蔬菜，控制油盐摄入。您也可以告诉我您的身高体重，我为您估算每日能量需求。',
      '运动方面：建议每周进行 150 分钟以上的中等强度有氧运动，如快走、慢跑、游泳等，运动前后注意监测血糖，预防低血糖发生。',
      '监测建议：每日固定时间测量空腹及餐后 2 小时血糖并做好记录，连续记录有助于医生调整治疗方案。'
    ]
    if (!last) return { answer: tips[0], sessionId: 'mock-session-' + Date.now() }
    const idx = (last.length + Math.floor(last.length / 2)) % tips.length
    return { answer: tips[idx], sessionId: 'mock-session-' + Date.now() }
  })
}

// ========== AI 数据助理（Mock） ==========
// 需求要求工作流返回 { message, status, data } 格式的 JSON
function mockAdminQuery({ messages }) {
  return mockDelay(1000).then(() => {
    const last = messages && messages.length ? messages[messages.length - 1].content : ''
    if (/查询|查看|统计|列表/.test(last)) {
      return {
        message: '查询成功',
        status: 'success',
        data: {
          userTotal: 128,
          doctorTotal: 12,
          punchTotal: 356,
          riskHigh: 8,
          list: [
            { id: 1, name: '张小明', plan: '控糖计划A', progress: '82%' },
            { id: 2, name: '李红', plan: '运动计划B', progress: '67%' },
            { id: 3, name: '王芳', plan: '饮食计划C', progress: '45%' }
          ]
        }
      }
    }
    if (/新增|创建|添加/.test(last)) {
      return {
        message: '数据新增成功',
        status: 'success',
        data: { id: 1288, title: '新增健康科普文章', createdAt: '2026-08-17 10:30', status: '已发布' }
      }
    }
    if (/删除|移除/.test(last)) {
      return {
        message: '数据删除成功',
        status: 'success',
        data: { deletedId: 5, table: 'punch_in', affectedRows: 1 }
      }
    }
    if (/修改|更新|改/.test(last)) {
      return {
        message: '数据修改成功',
        status: 'success',
        data: { updatedId: 12, fields: ['plan'], affectedRows: 1 }
      }
    }
    return {
      message: '指令已执行完成',
      status: 'success',
      data: { hint: '支持通过自然语言进行查询、新增、修改、删除等数据库操作' }
    }
  })
}

// ========== 健康资讯（Mock） ==========
// 说明：列表数据用结构化对象（带 content）以便列表卡片直接展示摘要。
function mockHealthTags() {
  return mockDelay(300).then(() => {
    return {
      eat: [
        { title: '糖尿病饮食指南：主食粗细搭配技巧', content: '建议用糙米、燕麦、杂豆替代部分精米白面，延缓餐后血糖上升；每餐先吃蔬菜再吃主食能进一步平稳血糖。' },
        { title: '低GI 食物清单：适合糖友的 10 种主食', content: '燕麦、糙米、藜麦、红薯、玉米、杂粮馒头、全麦面包、山药、芋头、绿豆都是常见低 GI 选项。' },
        { title: '控糖早餐怎么吃？营养师教你搭配', content: '一份优质早餐应包含蛋白质（鸡蛋 / 无糖豆浆）、复合碳水（全麦面包 / 杂粮粥）和蔬菜，比例约为 2:1:1。' },
        { title: '外食族控糖攻略：点餐避开 4 个雷区', content: '少点糖醋、勾芡、油炸、含糖饮料；多选蒸、煮、凉拌、炖汤类菜肴，并搭配足量蔬菜。' },
        { title: '下午茶怎么吃不长胖？糖友零食选择', content: '推荐原味坚果、无糖酸奶、苹果 / 梨等低 GI 水果，每次 25-30 克为宜，避免蛋糕、含糖饼干、奶茶。' }
      ],
      sport: [
        { title: '科学运动控糖：每周 150 分钟有氧计划', content: '每周至少 5 天、每天 30 分钟中等强度运动（心率 110-130 次/分），快走、骑车、游泳都是不错的选择。' },
        { title: '散步也能降血糖？餐后 20 分钟快走实验', content: '餐后 20 分钟开始的中等强度步行，可显著降低餐后 2 小时血糖约 1.5-2 mmol/L，简单易行。' },
        { title: '力量训练对糖尿病患者的 5 大好处', content: '提升基础代谢、改善胰岛素敏感性、保护骨密度、增强肌肉力量、帮助控制体重和血糖稳定。' },
        { title: '游泳对糖友的益处与注意事项', content: '游泳对关节友好、全身肌肉参与、热量消耗高；水温不宜过低、避免空腹、随身携带糖块以防低血糖。' },
        { title: '居家跳绳控糖：零基础入门指南', content: '从每组 100 个开始，循序渐进；穿缓冲好的运动鞋，铺跳绳垫，保护好膝关节和脚踝。' }
      ],
      daily: [
        { title: '糖友日常注意事项', content: '规律作息、足部护理、情绪管理、定期复诊都是日常控糖的关键环节，坚持小习惯，收获大健康。' },
        { title: '足部护理小贴士', content: '每日检查足部皮肤，保持清洁干燥，穿合脚的鞋子，预防糖尿病足。' },
        { title: '血糖监测最佳时间表', content: '空腹、餐后 2 小时、睡前三个时段监测血糖，帮助掌握全天血糖波动规律。' },
        { title: '情绪波动也影响血糖', content: '压力与焦虑会导致血糖升高，学会深呼吸、冥想等放松技巧同样重要。' },
        { title: '睡眠质量与血糖的关系', content: '长期睡眠不足会降低胰岛素敏感性，保证 7-8 小时高质量睡眠是控糖基础。' }
      ],
      popularization: [
        { title: '认识 2 型糖尿病', content: '2 型糖尿病是最常见的糖尿病类型，与胰岛素抵抗及胰岛功能减退相关，科学管理可有效延缓并发症发生。' },
        { title: '糖尿病前期的信号', content: '多饮、多食、多尿、体重下降是典型信号，早发现、早干预可有效逆转病情发展。' },
        { title: '糖尿病会遗传吗？', content: '糖尿病有家族聚集倾向，遗传因素与环境因素共同作用，健康生活方式可显著降低发病风险。' },
        { title: '糖化血红蛋白是什么', content: '糖化血红蛋白反映近 2-3 个月的平均血糖水平，是评估长期控糖效果的金标准。' },
        { title: '糖尿病并发症早期筛查', content: '定期检查眼底、肾功能、足部感觉及心血管指标，早筛早治可延缓并发症进展。' }
      ]
    }
  })
}

function mockHealthDetail({ title }) {
  return mockDelay(700).then(() => {
    return {
      title: title || '糖尿病饮食指南',
      content: '<p><strong>控制总能量</strong>：根据身高体重计算每日所需总热量，做到"吃动平衡"。</p><p><strong>主食粗细搭配</strong>：用糙米、燕麦、杂豆替代部分精米白面，延缓餐后血糖上升。</p><p><strong>保证蔬菜摄入</strong>：每餐 200g 以上深色蔬菜，先菜后饭顺序进食。</p><p><strong>限制糖油盐</strong>：少喝含糖饮料，烹饪少油少盐，避免油炸食品。</p>',
      tags: ['饮食指导', '控糖', '糖尿病科普']
    }
  })
}

// ========== 方案定制（Mock） ==========
// 根据表单（个人信息 + 生活习惯 + 方案建议）生成个性化方案；
// 兼容旧调用：{ type: '饮食' | '运动', userInfo }
function mockLifeScheme(data) {
  return mockDelay(900).then(() => {
    const u = data.userInfo || {}
    const h = data.habit || {}
    const age = Number(u.age) || 40
    const isSick = u.disease === '是'
    const bmi = u.height > 0 ? (u.weight / Math.pow(u.height / 100, 2)).toFixed(1) : '--'

    // 饮食偏好提示
    const tasteTips = {
      偏甜: '您偏好甜食，建议逐步减少精制糖与含糖饮料，用无糖酸奶、水果代替甜点',
      偏咸: '您口味偏咸，注意控盐（每日＜5g），警惕高盐饮食加重血压负担',
      偏油: '您饮食偏油腻，建议多用蒸、煮、凉拌，减少油炸与肥肉摄入',
      偏辣: '您口味偏辣，注意避免重油重辣的烹饪方式，减少对胃肠的刺激',
      清淡: '您饮食清淡的习惯非常好，继续保持，注意主食粗细搭配即可',
      无特殊偏好: ''
    }
    const tasteTip = tasteTips[h.taste] || tasteTips['无特殊偏好']
    const isDiabetic = isSick || /糖尿|糖友|控糖|糖尿病/.test(u.disease || '')

    // 旧调用兼容（仅传 type）
    if (!h || (!h.sleepTime && !h.taste && !h.exercise)) {
      if (data.type === '运动') {
        return {
          scheme: {
            name: '科学运动方案',
            desc: '以有氧为主、力量为辅，循序渐进，每周 5 天',
            items: [
              { time: '周一 · 晨', content: '快走 30 分钟（心率 110-130 次/分）', done: true },
              { time: '周二 · 晚', content: '慢跑/游泳 30 分钟 + 拉伸放松', done: true },
              { time: '周三 · 休息', content: '静态拉伸、太极等舒缓活动', done: true },
              { time: '周四 · 晨', content: '快走 40 分钟 + 上肢力量训练', done: false },
              { time: '周五 · 晚', content: '骑车/椭圆机 30 分钟', done: false },
              { time: '周末', content: '户外登山或骑行 60 分钟以上', done: false }
            ]
          }
        }
      }
      return {
        scheme: {
          name: '均衡饮食方案',
          desc: '低GI · 高纤维 · 定时定量，每日 5 餐',
          items: [
            { time: '早餐 07:30', content: '全麦面包2片 + 鸡蛋1个 + 无糖豆浆250ml', done: true },
            { time: '上午 10:00', content: '无糖酸奶1杯 或 苹果半个', done: true },
            { time: '午餐 12:00', content: '杂粮饭1碗 + 清蒸鱼150g + 时蔬200g', done: true },
            { time: '下午 15:30', content: '坚果一小把（约20g）', done: false },
            { time: '晚餐 18:30', content: '小米粥1碗 + 豆腐100g + 凉拌蔬菜', done: false }
          ]
        }
      }
    }

    // ========== 新表单：按生活习惯生成个性化方案 ==========
    const items = []

    // 作息建议
    if (h.sleepTime === '经常熬夜' || h.sleepTime === '作息不规律') {
      items.push({ time: '就寝 23:00 前', content: '早睡早起，保证 7~8 小时睡眠，熬夜会影响胰岛素敏感性', done: false })
    } else {
      items.push({ time: '起床 07:00', content: '规律作息，起床后先喝一杯温水，再测一次空腹血糖', done: true })
    }

    // 早餐
    items.push({ time: '早餐 07:30', content: '全麦面包2片 + 鸡蛋1个 + 无糖豆浆250ml（主食粗粮优先）', done: true })

    // 运动建议（结合运动习惯）
    if (h.exercise === '几乎不运动') {
      items.push({ time: '上午 10:00', content: '从每天快走 20 分钟开始，循序渐进增加运动量，餐后 30 分钟再走', done: false })
      items.push({ time: '午餐 12:00', content: '杂粮饭半碗 + 清蒸鱼150g + 时蔬200g', done: false })
    } else if (h.exercise === '每周1-2次') {
      items.push({ time: '上午 10:00', content: '加一次 20 分钟快走/拉伸，培养运动频率', done: true })
      items.push({ time: '午餐 12:00', content: '杂粮饭1碗 + 鸡胸肉120g + 时蔬200g', done: false })
    } else {
      items.push({ time: '上午 10:00', content: '餐后 30 分钟快走 20~30 分钟，保持每周 5 天以上', done: true })
      items.push({ time: '午餐 12:00', content: '杂粮饭1碗 + 清蒸鱼150g + 深色蔬菜200g', done: false })
    }

    // 下午加餐
    items.push({ time: '下午 15:30', content: '加餐：无糖酸奶1杯 或 苹果半个 或 坚果一小把', done: false })

    // 饮酒建议
    if (h.alcohol === '经常饮酒') {
      items.push({ time: '晚餐 18:30', content: '晚餐避免饮酒；饮酒会干扰血糖，建议逐步戒酒或严格限量', done: false })
    } else if (h.alcohol === '偶尔饮酒') {
      items.push({ time: '晚餐 18:30', content: '晚餐以清淡为主，如小米粥 + 豆腐 + 凉拌蔬菜；应酬饮酒务必限量', done: false })
    } else {
      items.push({ time: '晚餐 18:30', content: '小米粥1碗 + 豆腐100g + 凉拌蔬菜，少油少盐', done: false })
    }

    // 是否经常做饭
    if (h.cookOften === '很少做饭' || h.cookOften === '从不下厨') {
      items.push({ time: '温馨提示', content: '您较少在家做饭，建议外食时优先选择蒸煮类菜品，主动要求少油少盐，控制主食量', done: false })
    }

    // 饮食口味建议
    if (tasteTip) {
      items.push({ time: '饮食要点', content: tasteTip, done: false })
    }

    // 用户额外建议
    if (data.advice && data.advice.trim()) {
      items.push({ time: '定制说明', content: `根据您的建议「${data.advice.trim()}」已纳入方案考虑，将随执行动态调整`, done: false })
    }

    const diseaseDesc = isDiabetic ? '控糖' : '预防'
    return {
      scheme: {
        name: `${diseaseDesc} · 个性化${data.type === '运动' ? '运动' : '生活'}方案`,
        desc: `针对 ${age} 岁 ${u.sex || ''}、BMI ${bmi}${isSick ? '、已确诊糖尿病' : ''} 量身定制，结合您的作息、饮食与运动习惯${data.advice ? '，并参考您的定制建议' : ''}`,
        items
      }
    }
  })
}

// ========== 对外 API ==========

/** 医师咨询对话 */
export function doctorChat(data) {
  if (USE_MOCK) return mockDoctorChat(data)
  return request.post('/dify/doctor/chat', data)
}

/** 智能打卡分析 */
export function punchAnalyze(data) {
  if (USE_MOCK) return mockPunchAnalyze(data)
  return request.post('/dify/punch/analyze', data)
}

/** 糖尿病风险预测 */
export function riskPredict(data) {
  if (USE_MOCK) return mockRiskPredict(data)
  return request.post('/dify/risk/predict', data)
}

/** 智能助手对话 */
export function assistantChat(data) {
  if (USE_MOCK) return mockAssistantChat(data)
  return request.post('/dify/assistant/chat', data)
}

/** AI 数据助理（管理员端） */
export function adminQuery(data) {
  if (USE_MOCK) return mockAdminQuery(data)
  return request.post('/dify/admin/query', data)
}

/** 健康资讯 - 标签模式 */
export function healthTags(data) {
  if (USE_MOCK) return mockHealthTags(data)
  return request.post('/dify/health/tags', data)
}

/** 健康资讯 - 详情模式 */
export function healthDetail(data) {
  if (USE_MOCK) return mockHealthDetail(data)
  return request.post('/dify/health/detail', data)
}

/** 方案定制生成 */
export function lifeScheme(data) {
  if (USE_MOCK) return mockLifeScheme(data)
  return request.post('/dify/life/scheme', data)
}

/** 是否处于 Mock 模式 */
export function isMockMode() {
  return USE_MOCK
}

/** 当前登录用户 id（供页面默认填充） */
export function getCurrentUserId() {
  return currentUserId()
}
