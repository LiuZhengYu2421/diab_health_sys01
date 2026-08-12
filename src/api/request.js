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

// 请求拦截器：附加 token
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
        handleUnauthorized()
        return Promise.reject(new Error(res.message || '登录已过期，请重新登录'))
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    // 非约定格式（如文件流等）直接返回
    return res
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      handleUnauthorized()
    } else if (status === 403) {
      showFloatingAlert('没有权限执行该操作', 'error')
    } else if (status === 500) {
      showFloatingAlert('服务器异常，请稍后再试', 'error')
    } else if (error.code === 'ECONNABORTED') {
      showFloatingAlert('请求超时，请检查网络', 'error')
    } else if (!error.response) {
      showFloatingAlert('无法连接服务器，请检查后端是否启动', 'error')
    }
    return Promise.reject(error)
  }
)

function handleUnauthorized() {
  clearAuth()
  showFloatingAlert('登录已过期，请重新登录', 'warning')
  const current = router.currentRoute.value
  if (current.path !== '/login') {
    router.replace({ path: '/login', query: { redirect: current.fullPath } })
  }
}

export default service
