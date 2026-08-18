import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getUserInfo as apiGetUserInfo, updateUserInfo as apiUpdateUserInfo, changePassword as apiChangePassword } from '@/api/auth'
import { getToken, setToken, setUser, getUser, clearAuth } from '@/utils/storage'
import { getTokenRole } from '@/utils/token'
import { recordOperation } from '@/utils/operationLog'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userInfo: getUser() || {}
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    /** 是否管理员（控制管理后台入口与按钮显隐）：优先取 userInfo，缺失时从 token 解码兜底 */
    isAdmin: (state) => state.userInfo.role === 'admin' || getTokenRole(state.token) === 'admin',
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
      recordOperation({
        type: '登录',
        action: '用户登录',
        detail: `账号：${form.username || form.account || form.email || ''}`,
        result: 'success'
      })
      return res
    },

    /** 注册 */
    async register(form) {
      const res = await apiRegister(form)
      this.token = res.token
      this.userInfo = res.userInfo || {}
      setToken(res.token)
      setUser(this.userInfo)
      recordOperation({
        type: '注册',
        action: '新用户注册',
        detail: `账号：${form.username || form.account || form.email || ''}`,
        result: 'success'
      })
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

    /** 更新个人信息（nickname/avatar/desc，仅更新传入字段） */
    async updateProfile(profile) {
      const info = await apiUpdateUserInfo(profile)
      if (info && typeof info === 'object') {
        // 兼容两种返回结构：{ userInfo: {...} }（包裹）或直接 {...}
        this.userInfo = info.userInfo && typeof info.userInfo === 'object' ? info.userInfo : info
        setUser(this.userInfo)
      }
      recordOperation({
        type: '资料更新',
        action: '更新个人信息',
        detail: Object.keys(profile || {}).join('、') || '修改资料',
        result: 'success'
      })
      return this.userInfo
    },

    /** 修改密码 */
    async changePassword(form) {
      const res = await apiChangePassword(form)
      recordOperation({
        type: '密码修改',
        action: '修改登录密码',
        detail: '用户主动修改登录密码',
        result: 'success'
      })
      return res
    },

    /** 退出登录 */
    async logout() {
      try {
        await apiLogout()
      } catch (e) {
        /* 忽略退出接口异常 */
      }
      recordOperation({
        type: '退出登录',
        action: '用户退出登录',
        detail: '',
        result: 'success'
      })
      clearAuth()
      this.token = ''
      this.userInfo = {}
    }
  }
})
