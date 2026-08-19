/**
 * Axios 请求封装
 * ============================================
 * 对接 SpringBoot 后端说明：
 *  1. baseURL 取环境变量 VITE_API_BASE_URL（默认 /api），
 *     开发环境由 vite 代理转发到 http://localhost:8080。
 *  2. 统一响应格式约定（请在 SpringBoot 中按此规范返回）：
 *     {
 *       code: 200,          // 200 或 0 表示成功，401 未登录
 *       message: "ok",
 *       data: { ... }       // 业务数据
 *     }
 *  3. 请求自动携带 token：请求头 Authorization: Bearer <token>
 */
import axios from 'axios'
import { getToken, clearAuth } from '@/utils/storage'
import { showFloatingAlert } from '@/utils/alert'
import router from '@/router'

// 后端完整地址（配置了 VITE_API_SERVER_URL 则直接使用，否则走 baseURL + 代理）
const serverUrl = import.meta.env.VITE_API_SERVER_URL || ''
const baseURL = serverUrl || import.meta.env.VITE_API_BASE_URL || '/api'

const service = axios.create({
  baseURL,
  timeout: 15000
})

// 请求拦截器：附加 token；Dify/AI 类接口响应较慢（LLM 生成耗时），单独放宽超时
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.url && /^\/dify\//.test(config.url)) {
      config.timeout = 90000
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理业务码
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 约定：code 为 200 或 0 表示成功
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 200 || res.code === 0) {
        return res.data
      }
      if (res.code === 401) {
        // 登录/注册接口的 401 表示「用户名或密码错误」，属业务错误，不触发会话过期逻辑
        if (isAuthRequest(response.config)) {
          // 直接弹窗提示，避免页面 catch 因 handled=true 不重复弹而漏掉提示
          showFloatingAlert(res.message || '用户名或密码错误', 'error')
          const authErr = new Error(res.message || '用户名或密码错误')
          authErr.handled = true
          return Promise.reject(authErr)
        }
        handleUnauthorized()
        const expiredErr = new Error(res.message || '登录已过期，请重新登录')
        expiredErr.handled = true
        return Promise.reject(expiredErr)
      }
      if (res.code === 403) {
        // 后端角色拦截器（/admin/** 非管理员）返回 HTTP 200 + body code=403
        showFloatingAlert(res.message || '没有权限执行该操作', 'error')
        const forbiddenErr = new Error(res.message || '没有权限执行该操作')
        forbiddenErr.handled = true
        return Promise.reject(forbiddenErr)
      }
      if (res.code === 400 || res.code === 404 || res.code === 409) {
        // 参数校验失败 / 资源不存在 / 冲突（如用户名已注册）
        showFloatingAlert(res.message || '请求参数错误', 'error')
        const bizErr = new Error(res.message || '请求失败')
        bizErr.handled = true
        return Promise.reject(bizErr)
      }
      if (res.code === 500) {
        showFloatingAlert('服务器异常，请稍后再试', 'error')
        const serverErr = new Error('服务器异常，请稍后再试')
        serverErr.handled = true
        return Promise.reject(serverErr)
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    // 非约定格式（如文件流等）直接返回
    return res
  },
  (error) => {
    const status = error.response?.status
    const res = error.response?.data
    // 透传后端返回的业务错误信息（如参数校验错误），供页面 catch 展示
    if (res && typeof res === 'object' && res.message) {
      error.message = res.message
    }
    if (status === 401) {
      // 登录/注册接口的 401 表示用户名或密码错误，不触发会话过期逻辑
      if (isAuthRequest(error.config)) {
        showFloatingAlert(error.message || '用户名或密码错误', 'error')
        error.handled = true
      } else {
        handleUnauthorized()
        error.handled = true
      }
    } else if (status === 403) {
      showFloatingAlert(error.message || '没有权限执行该操作', 'error')
      error.handled = true
    } else if (status === 400 || status === 404 || status === 409) {
      // 参数校验失败 / 资源不存在 / 冲突（如用户名已注册）
      showFloatingAlert(error.message || '请求参数错误', 'error')
      error.handled = true
    } else if (status === 500) {
      showFloatingAlert('服务器异常，请稍后再试', 'error')
      error.handled = true
    } else if (error.code === 'ECONNABORTED') {
      showFloatingAlert('请求超时，请检查网络', 'error')
      error.handled = true
    } else if (!error.response) {
      showFloatingAlert('无法连接服务器，请检查后端是否启动', 'error')
      error.handled = true
    }
    return Promise.reject(error)
  }
)

// 判断是否为认证类接口（登录/注册/修改密码），其 401/400 等为业务错误而非会话过期
function isAuthRequest(config) {
  const url = (config && config.url) || ''
  return /\/auth\/(login|register)$/.test(url) || /\/user\/password$/.test(url)
}

function handleUnauthorized() {
  clearAuth()
  showFloatingAlert('登录已过期，请重新登录', 'warning')
  const current = router.currentRoute.value
  if (current.path !== '/login') {
    router.replace({ path: '/login', query: { redirect: current.fullPath } })
  }
}

export default service
