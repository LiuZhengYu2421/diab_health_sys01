import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getUserInfo as apiGetUserInfo } from '@/api/auth'
import { getToken, setToken, setUser, getUser, clearAuth } from '@/utils/storage'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userInfo: getUser() || {}
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    displayName: (state) =>
      state.userInfo.nickname ||
      state.userInfo.username ||
      state.userInfo.name ||
      state.userInfo.userName ||
      '控糖用户',
    displayDesc: (state) =>
      state.userInfo.desc ||
      state.userInfo.description ||
      '智慧控糖 · 健康生活',
    avatar: (state) => state.userInfo.avatar || state.userInfo.avatarUrl || '/img/user_icon.png'
  },

  actions: {
    /** 登录 */
    async login(form) {
      const res = await apiLogin(form)
      this.token = res.token
      this.userInfo = res.userInfo || {}
      setToken(res.token)
      setUser(this.userInfo)
      return res
    },

    /** 注册 */
    async register(form) {
      const res = await apiRegister(form)
      this.token = res.token
      this.userInfo = res.userInfo || {}
      setToken(res.token)
      setUser(this.userInfo)
      return res
    },

    /** 同步用户信息 */
    async fetchUserInfo() {
      if (!this.token) return
      try {
        const info = await apiGetUserInfo()
        if (info && typeof info === 'object') {
          // 兼容两种后端结构：{ userInfo: {...} }（包裹）或直接 {...}
          this.userInfo = info.userInfo && typeof info.userInfo === 'object'
            ? info.userInfo
            : info
          setUser(this.userInfo)
        }
      } catch (e) {
        /* 忽略，保留本地缓存 */
      }
    },

    /** 退出登录 */
    async logout() {
      try {
        await apiLogout()
      } catch (e) {
        /* 忽略退出接口异常 */
      }
      clearAuth()
      this.token = ''
      this.userInfo = {}
    }
  }
})
