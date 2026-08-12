/**
 * 认证接口 - 登录 / 注册 / 退出 / 用户信息
 * ============================================
 * 本模块已彻底脱离 Dify，改为对接自建后端（SpringBoot）。
 *
 * 双模式设计：
 *  1. Mock 模式（默认，VITE_USE_MOCK=true）
 *     使用 localStorage 模拟用户库，无需后端即可运行演示。
 *  2. 真实模式（VITE_USE_MOCK=false）
 *     请求 SpringBoot 接口，对接约定见下方「接口约定」。
 *
 * ---------------------------------------------------
 * 接口约定（请在 SpringBoot 中实现）：
 *  POST /api/auth/login     请求 { username, password }
 *                           响应 { code:200, data: { token, userInfo } }
 *  POST /api/auth/register  请求 { username, password, nickname? }
 *                           响应 { code:200, data: { token, userInfo } }
 *  POST /api/auth/logout    请求 {}  （携带 token）
 *                           响应 { code:200 }
 *  GET  /api/user/info      请求 {}  （携带 token）
 *                           响应 { code:200, data: { userInfo } }
 * ---------------------------------------------------
 * userInfo 建议字段：id, username, nickname, avatar, desc, createdAt
 */
import request from './request'
import { getToken, setToken, setUser, getUser, clearAuth } from '@/utils/storage'

// ========== 模式开关 ==========
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ========== Mock 用户库（仅 Mock 模式使用） ==========
const MOCK_USERS_KEY = 'zhitang_mock_users'

/** 演示账号（首次使用时自动预置，便于快速体验登录） */
const DEFAULT_MOCK_USER = {
  id: 1,
  username: 'admin',
  password: 'YWRtaW4xMjM=', // admin123（base64 编码）
  nickname: '演示用户',
  desc: '智慧控糖 · 健康生活',
  createdAt: '2026-08-12'
}

function getMockUsers() {
  try {
    const list = JSON.parse(localStorage.getItem(MOCK_USERS_KEY)) || []
    if (list.length === 0) {
      list.push(DEFAULT_MOCK_USER)
      saveMockUsers(list)
    }
    return list
  } catch (e) {
    return []
  }
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

function mockDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildMockToken() {
  return 'mock-token-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

// Mock 模式不存储明文密码，用简单编码降低直接读取风险（仅演示，非安全加密）
function encodeSecret(pwd) {
  try {
    return btoa(unescape(encodeURIComponent(pwd)))
  } catch (e) {
    return pwd
  }
}

function decodeSecret(encoded) {
  try {
    return decodeURIComponent(escape(atob(encoded)))
  } catch (e) {
    return encoded
  }
}

function mockLogin({ username, password }) {
  return mockDelay().then(() => {
    const users = getMockUsers()
    // 兼容旧版明文存储：解码后匹配或直接明文匹配
    const user = users.find((u) =>
      u.username === username &&
      (decodeSecret(u.password) === password || u.password === password)
    )
    if (!user) {
      throw new Error('用户名或密码错误')
    }
    const token = buildMockToken()
    const userInfo = sanitizeUser(user)
    setToken(token)
    setUser(userInfo)
    return { token, userInfo }
  })
}

function mockRegister({ username, password, nickname }) {
  return mockDelay().then(() => {
    const users = getMockUsers()
    if (!username || !password) {
      throw new Error('用户名和密码不能为空')
    }
    if (users.some((u) => u.username === username)) {
      throw new Error('该用户名已被注册')
    }
    const now = new Date()
    const user = {
      id: Date.now(),
      username,
      password: encodeSecret(password),
      nickname: nickname || username,
      desc: '智慧控糖 · 健康生活',
      createdAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }
    users.push(user)
    saveMockUsers(users)

    const token = buildMockToken()
    const userInfo = sanitizeUser(user)
    setToken(token)
    setUser(userInfo)
    return { token, userInfo }
  })
}

function sanitizeUser(user) {
  const { password, ...safe } = user
  return safe
}

// ========== 对外 API ==========

/** 登录 */
export function login(data) {
  if (USE_MOCK) return mockLogin(data)
  return request.post('/auth/login', data)
}

/** 注册 */
export function register(data) {
  if (USE_MOCK) return mockRegister(data)
  return request.post('/auth/register', data)
}

/** 退出登录 */
export function logout() {
  if (USE_MOCK) return Promise.resolve()
  return request.post('/auth/logout')
}

/** 获取当前用户信息（真实模式下可保持与后端同步） */
export function getUserInfo() {
  if (USE_MOCK) return Promise.resolve(getUser() || {})
  return request.get('/user/info')
}

/** 是否处于 Mock 模式（用于界面提示） */
export function isMockMode() {
  return USE_MOCK
}

/** 清空本地认证信息 */
export function resetAuth() {
  clearAuth()
}

export { getToken }
