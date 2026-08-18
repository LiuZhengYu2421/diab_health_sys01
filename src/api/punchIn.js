import request from './request'

/**
 * 打卡记录模块（接口 39~42，需登录）
 * 字段说明：
 *  - punchType: 血糖监测 / 饮食 / 运动 / 作息
 *  - completionStatus: 已完成 / 未完成
 *  - message: 打卡备注（如血糖值）
 *
 * 双模式设计：
 *  1. Mock 模式（VITE_USE_MOCK=true）：使用 localStorage 提供演示打卡数据。
 *  2. 真实模式（VITE_USE_MOCK=false）：请求 SpringBoot 接口。
 */

// ========== 模式开关 ==========
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ========== Mock 数据 ==========
const MOCK_PUNCH_KEY = 'zhitang_mock_punch'

/** 演示打卡记录（按打卡时间倒序） */
const DEFAULT_MOCK_PUNCH = [
  { id: 1, punchType: '血糖监测', completionStatus: '已完成', message: '空腹血糖 6.1 mmol/L', punchDate: '2026-08-18 07:30:00' },
  { id: 2, punchType: '饮食', completionStatus: '已完成', message: '早餐：燕麦 + 鸡蛋 + 牛奶', punchDate: '2026-08-18 08:10:00' },
  { id: 3, punchType: '运动', completionStatus: '已完成', message: '晚饭后快走 40 分钟', punchDate: '2026-08-17 19:20:00' },
  { id: 4, punchType: '作息', completionStatus: '未完成', message: '昨晚熬夜了，今天注意休息', punchDate: '2026-08-17 23:00:00' },
  { id: 5, punchType: '血糖监测', completionStatus: '已完成', message: '餐后 2 小时血糖 8.3 mmol/L', punchDate: '2026-08-16 12:40:00' }
]

function mockDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getMockPunch() {
  try {
    const list = JSON.parse(localStorage.getItem(MOCK_PUNCH_KEY))
    if (Array.isArray(list)) return list
  } catch (e) {
    /* 忽略损坏缓存 */
  }
  localStorage.setItem(MOCK_PUNCH_KEY, JSON.stringify(DEFAULT_MOCK_PUNCH))
  return [...DEFAULT_MOCK_PUNCH]
}

function saveMockPunch(list) {
  localStorage.setItem(MOCK_PUNCH_KEY, JSON.stringify(list))
}

function mockCreatePunchRecord(data) {
  return mockDelay().then(() => {
    const list = getMockPunch()
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const record = {
      id: Date.now(),
      punchType: data.punchType,
      completionStatus: data.completionStatus,
      message: data.message || '',
      punchDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    }
    list.unshift(record)
    saveMockPunch(list)
    return record
  })
}

function mockGetPunchRecords(params = {}) {
  return mockDelay().then(() => {
    const { page = 1, pageSize = 50, punchType = '', startDate = '', endDate = '' } = params
    let list = getMockPunch()
    if (punchType) list = list.filter((r) => r.punchType === punchType)
    if (startDate) list = list.filter((r) => (r.punchDate || '').slice(0, 10) >= startDate)
    if (endDate) list = list.filter((r) => (r.punchDate || '').slice(0, 10) <= endDate)
    const total = list.length
    const start = (page - 1) * pageSize
    return { list: list.slice(start, start + pageSize), total }
  })
}

function mockGetPunchStats() {
  return mockDelay().then(() => {
    const list = getMockPunch()
    const monthKey = new Date().toISOString().slice(0, 7)
    const monthCount = list.filter((r) => (r.punchDate || '').startsWith(monthKey)).length
    // 连续打卡天数：从最新记录向前统计
    let streak = 0
    const sorted = [...list].sort((a, b) => String(b.punchDate).localeCompare(String(a.punchDate)))
    if (sorted.length) {
      const seen = new Set()
      const cursor = new Date()
      while (true) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
        if (seen.has(key)) break
        if (!sorted.some((r) => (r.punchDate || '').slice(0, 10) === key)) break
        seen.add(key)
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
      }
    }
    return { streak, monthCount, totalCount: list.length }
  })
}

function mockDeletePunchRecord(id) {
  return mockDelay().then(() => {
    saveMockPunch(getMockPunch().filter((r) => r.id !== id))
  })
}

// ========== 对外 API ==========

/** 新增打卡（punch_time 由服务端生成当前时间，user_id 从 token 解析） */
export function createPunchRecord(data) {
  if (USE_MOCK) return mockCreatePunchRecord(data)
  return request.post('/punch-in', data)
}

/** 我的打卡记录列表（分页 + 类型 + 日期范围筛选，startDate/endDate 格式 yyyy-MM-dd） */
export function getPunchRecords(params) {
  if (USE_MOCK) return mockGetPunchRecords(params)
  return request.get('/punch-in', { params })
}

/** 打卡统计：{ streak, monthCount, totalCount } */
export function getPunchStats() {
  if (USE_MOCK) return mockGetPunchStats()
  return request.get('/punch-in/stats')
}

/** 删除打卡记录（只能删自己的） */
export function deletePunchRecord(id) {
  if (USE_MOCK) return mockDeletePunchRecord(id)
  return request.delete(`/punch-in/${id}`)
}
