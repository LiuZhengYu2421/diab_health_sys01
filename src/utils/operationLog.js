/**
 * 操作日志工具
 * ============================================
 * 仅记录 AI 功能运维相关操作（AI 咨询、方案生成、风险评测、AI 打卡分析等），
 * 供管理后台「AI 智能数据 → 操作日志」面板查看与检索。
 * 登录、注册、资料修改等普通用户行为不写入日志。
 *
 * 存储策略：
 *  1. Mock 模式（默认）：写入 localStorage，刷新/重启后仍可查看，适合演示。
 *  2. 真实模式：可将下方记录内容通过后端接口上报（预留 getOperationLogs 真实分支）。
 */
import { getUser } from '@/utils/storage'

// localStorage 存储键
const LOG_KEY = 'zhitang_operation_logs'
// 最多保留日志条数，防止存储膨胀
const MAX_LOGS = 500

// AI 功能运维白名单：仅这些类型的操作会写入日志
const AI_LOG_TYPES = ['AI 咨询', '方案生成', '风险评测', '打卡']

function isAiLog(log) {
  return AI_LOG_TYPES.includes(log && log.type)
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatTime(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function getCurrentUser() {
  const u = getUser() || {}
  return {
    id: u.id ?? u.userId ?? '',
    name: u.nickname || u.username || u.userName || '游客',
    role: u.role || 'user'
  }
}

function readLogs() {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
}

function writeLogs(logs) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)))
  } catch (e) {
    /* 存储异常时忽略，不阻塞业务 */
  }
}

/**
 * 记录一条操作日志
 * @param {Object} opts
 * @param {string} opts.type    操作类型：登录 / 注册 / 退出登录 / 打卡 / AI 咨询 / 方案生成 / 风险评测 / 资料更新 / 密码修改 等
 * @param {string} opts.action  操作描述，如「AI 智能助手咨询」
 * @param {string} [opts.detail] 补充详情，如问题摘要 / 生成结果
 * @param {'success'|'fail'} [opts.result] 操作结果
 */
export function recordOperation({ type, action, detail = '', result = 'success' }) {
  // 仅记录 AI 功能运维类型，其余普通操作直接忽略
  if (!AI_LOG_TYPES.includes(type)) return null
  const user = getCurrentUser()
  const log = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    time: formatTime(new Date()),
    user: user.name,
    userId: user.id,
    role: user.role,
    type,
    action,
    detail,
    result
  }
  const logs = readLogs()
  logs.unshift(log)
  writeLogs(logs)
  return log
}

/**
 * 获取操作日志（支持搜索 / 类型 / 结果筛选 + 分页）
 * 真实模式下可改为调用后端接口：request.get('/admin/operation-logs', { params })
 */
export function getOperationLogs({ keyword = '', type = '', result = '', page = 1, pageSize = 10 } = {}) {
  // 历史数据可能包含非 AI 类型，读取时统一过滤
  let logs = readLogs().filter(isAiLog)
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    logs = logs.filter(
      (l) =>
        String(l.user || '').toLowerCase().includes(kw) ||
        String(l.action || '').toLowerCase().includes(kw) ||
        String(l.detail || '').toLowerCase().includes(kw)
    )
  }
  if (type) logs = logs.filter((l) => l.type === type)
  if (result) logs = logs.filter((l) => l.result === result)

  const total = logs.length
  const start = (page - 1) * pageSize
  const list = logs.slice(start, start + pageSize)
  return Promise.resolve({ list, total })
}

/** 获取全部 AI 运维日志（用于管理端统计概览） */
export function getRawOperationLogs() {
  return readLogs().filter(isAiLog)
}

/** 清空全部操作日志 */
export function clearOperationLogs() {
  try {
    localStorage.removeItem(LOG_KEY)
  } catch (e) {
    /* ignore */
  }
  return Promise.resolve()
}

/** 支持筛选的 AI 运维操作类型列表 */
export function getOperationLogTypes() {
  return [...AI_LOG_TYPES]
}
