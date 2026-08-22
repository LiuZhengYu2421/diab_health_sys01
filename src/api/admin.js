/**
 * 管理后台接口 - 用户 / 医生 / 文章
 *
 * 双模式设计：
 *  1. Mock 模式（VITE_USE_MOCK=true）
 *     使用 localStorage 提供演示数据，无需后端即可运行演示。
 *  2. 真实模式（VITE_USE_MOCK=false）
 *     请求 SpringBoot 接口，对接约定见各函数注释。
 */
import request from './request'

// ========== 模式开关 ==========
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ========== Mock 数据键名 ==========
// 用户库与 auth.js 共用，保证管理后台的增删改可同步影响登录
const MOCK_USERS_KEY = 'zhitang_mock_users'
const MOCK_DOCTORS_KEY = 'zhitang_mock_doctors'
const MOCK_ARTICLES_KEY = 'zhitang_mock_articles'

// ========== Mock 种子数据 ==========

/** 演示医生（与 doctor_information 表 / 首页医师团队展示保持一致） */
const DEFAULT_MOCK_DOCTORS = [
  { infoId: 1, doctorName: '张明华', department: '内分泌科', title: '主任医师', imageUrl: '/img/doc1.jpg', chatToken: 'app-Ao5sIcq1RmPJifG2Cp1mlQ4w', introduction: '2型糖尿病个体化治疗' },
  { infoId: 2, doctorName: '李秀芬', department: '内分泌科', title: '副主任医师', imageUrl: '/img/doc2.png', chatToken: 'app-Ao5sIcq1RmPJifG2Cp1mlQ4w', introduction: '糖尿病前期干预、妊娠糖尿病' },
  { infoId: 3, doctorName: '王建国', department: '内分泌科', title: '主任医师', imageUrl: '/img/doc3.png', chatToken: 'app-Ao5sIcq1RmPJifG2Cp1mlQ4w', introduction: '1型糖尿病、糖尿病肾病' },
  { infoId: 4, doctorName: '陈雅琴', department: '营养科', title: '副主任医师', imageUrl: '/img/doc2.png', chatToken: 'app-Ao5sIcq1RmPJifG2Cp1mlQ4w', introduction: '糖尿病医学营养治疗' },
  { infoId: 5, doctorName: '刘志远', department: '内分泌科', title: '主治医师', imageUrl: '/img/doc3.png', chatToken: 'app-Ao5sIcq1RmPJifG2Cp1mlQ4w', introduction: '青少年糖尿病、动态血糖监测' }
]

/** 演示文章 */
const DEFAULT_MOCK_ARTICLES = [
  { articleId: 1, title: '糖尿病患者的饮食管理指南', coverUrl: '/img/doc1.jpg', author: '智糖健康', category: '饮食', publishTime: '2026-08-10 09:00:00', views: 328, content: '糖尿病饮食管理的核心是控制总能量摄入，均衡营养。建议主食粗细搭配，多吃绿叶蔬菜，适量优质蛋白，限制添加糖和饱和脂肪摄入，少食多餐，规律进餐。' },
  { articleId: 2, title: '运动降糖的注意事项，你做对了吗？', coverUrl: '/img/doc2.png', author: '智糖健康', category: '运动', publishTime: '2026-08-08 14:30:00', views: 256, content: '规律运动有助于改善胰岛素敏感性、降低血糖。建议每周至少 150 分钟中等强度有氧运动，如快走、游泳、骑车，配合抗阻训练。运动前注意血糖水平，避免空腹剧烈运动引发低血糖。' },
  { articleId: 3, title: '血糖监测的常见误区', coverUrl: '/img/doc3.png', author: '智糖健康', category: '监测', publishTime: '2026-08-05 10:00:00', views: 412, content: '仅测空腹血糖往往不够，还应关注餐后 2 小时血糖与糖化血红蛋白。采血时避免用力挤压指尖，试纸需在有效期内保存于干燥环境，不同血糖仪之间数值允许存在一定偏差。' },
  { articleId: 4, title: '胰岛素规范使用与储存指南', coverUrl: '/img/doc1.jpg', author: '智糖健康', category: '用药', publishTime: '2026-08-02 16:45:00', views: 189, content: '未开封胰岛素应冷藏于 2-8℃，已开封的可在室温下保存 28 天。注射前确认剂量与剂型，轮换注射部位可减少皮下脂肪增生，注射后按压针眼 5-10 秒，切勿揉搓。' },
  { articleId: 5, title: '糖友如何科学应对低血糖', coverUrl: '/img/doc2.png', author: '智糖健康', category: '并发症', publishTime: '2026-07-28 09:20:00', views: 233, content: '低血糖典型表现为心慌、出汗、手抖、饥饿感。出现症状时应立即补充 15 克快速升糖食物（如 3-5 块方糖、半杯含糖饮料），15 分钟后复测血糖，仍未恢复需再次补充，并查找原因及时调整方案。' }
]

/** 预置管理员演示账号（与 auth.js 的 DEFAULT_MOCK_USER 保持一致） */
const DEFAULT_MOCK_ADMIN = {
  id: 1,
  username: 'admin',
  password: 'YWRtaW4xMjM=', // admin123（base64 编码）
  nickname: '演示用户',
  role: 'admin',
  desc: '智慧控糖 · 健康生活',
  createdAt: '2026-08-12'
}

// ========== Mock 工具函数 ==========

function mockDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 读取 localStorage 列表，为空时写入种子数据 */
function getStore(key, seed) {
  try {
    const list = JSON.parse(localStorage.getItem(key))
    if (Array.isArray(list)) return list
  } catch (e) {
    /* 忽略损坏缓存 */
  }
  localStorage.setItem(key, JSON.stringify(seed))
  return [...seed]
}

function saveStore(key, list) {
  localStorage.setItem(key, JSON.stringify(list))
}

/** 与 auth.js 保持一致的 base64 编码，避免明文存储密码 */
function encodeSecret(pwd) {
  try {
    return btoa(unescape(encodeURIComponent(pwd)))
  } catch (e) {
    return pwd
  }
}

function sanitizeUser(user) {
  const { password, ...safe } = user
  return safe
}

// ========== Mock 用户管理（与 auth.js 共用用户库） ==========

function mockGetAdminUsers() {
  return mockDelay().then(() => {
    const users = getStore(MOCK_USERS_KEY, [DEFAULT_MOCK_ADMIN])
    return users.map(sanitizeUser)
  })
}

function mockCreateAdminUser(data) {
  return mockDelay().then(() => {
    const { username, password, nickname, role = 'user' } = data || {}
    if (!username || !password) throw new Error('用户名和密码不能为空')
    if (!/^[\w\u4e00-\u9fa5-]{3,20}$/.test(username)) {
      throw new Error('用户名需为 3-20 位字母、数字、下划线或中文')
    }
    if (password.length < 6 || password.length > 32) {
      throw new Error('密码长度需为 6-32 位')
    }
    const users = getStore(MOCK_USERS_KEY, [DEFAULT_MOCK_ADMIN])
    if (users.some((u) => u.username === username)) {
      throw new Error('该用户名已存在')
    }
    const now = new Date()
    const user = {
      id: Date.now(),
      username,
      password: encodeSecret(password),
      nickname: nickname || username,
      role,
      desc: '智慧控糖 · 健康生活',
      createdAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }
    users.push(user)
    saveStore(MOCK_USERS_KEY, users)
    return sanitizeUser(user)
  })
}

function mockUpdateAdminUserRole(id, role) {
  return mockDelay().then(() => {
    const users = getStore(MOCK_USERS_KEY, [DEFAULT_MOCK_ADMIN])
    const user = users.find((u) => u.id === id)
    if (!user) throw new Error('用户不存在')
    user.role = role
    saveStore(MOCK_USERS_KEY, users)
    return sanitizeUser(user)
  })
}

function mockDeleteAdminUser(id) {
  return mockDelay().then(() => {
    const users = getStore(MOCK_USERS_KEY, [DEFAULT_MOCK_ADMIN])
    const user = users.find((u) => u.id === id)
    if (!user) throw new Error('用户不存在')
    user.status = 1
    saveStore(MOCK_USERS_KEY, users)
  })
}

function mockRestoreAdminUser(id) {
  return mockDelay().then(() => {
    const users = getStore(MOCK_USERS_KEY, [DEFAULT_MOCK_ADMIN])
    const user = users.find((u) => u.id === id)
    if (!user) throw new Error('用户不存在')
    user.status = 0
    saveStore(MOCK_USERS_KEY, users)
  })
}

// ========== Mock 医生管理 ==========

function mockGetDoctors(params = {}) {
  return mockDelay().then(() => {
    const { page = 1, pageSize = 10, keyword = '', department = '' } = params
    let list = getStore(MOCK_DOCTORS_KEY, DEFAULT_MOCK_DOCTORS)
    const kw = String(keyword || '').trim().toLowerCase()
    if (kw) {
      list = list.filter(
        (d) =>
          (d.doctorName || '').toLowerCase().includes(kw) ||
          (d.introduction || '').toLowerCase().includes(kw)
      )
    }
    if (department) {
      list = list.filter((d) => (d.department || '') === department)
    }
    const total = list.length
    const start = (page - 1) * pageSize
    return { list: list.slice(start, start + pageSize), total }
  })
}

function mockCreateDoctor(data) {
  return mockDelay().then(() => {
    const list = getStore(MOCK_DOCTORS_KEY, DEFAULT_MOCK_DOCTORS)
    const doctor = { infoId: Date.now(), ...(data || {}) }
    list.push(doctor)
    saveStore(MOCK_DOCTORS_KEY, list)
    return doctor
  })
}

function mockUpdateDoctor(infoId, data) {
  return mockDelay().then(() => {
    const list = getStore(MOCK_DOCTORS_KEY, DEFAULT_MOCK_DOCTORS)
    const doctor = list.find((d) => d.infoId === infoId)
    if (!doctor) throw new Error('医生不存在')
    Object.assign(doctor, data)
    saveStore(MOCK_DOCTORS_KEY, list)
    return doctor
  })
}

function mockDeleteDoctor(infoId) {
  return mockDelay().then(() => {
    const list = getStore(MOCK_DOCTORS_KEY, DEFAULT_MOCK_DOCTORS)
    saveStore(MOCK_DOCTORS_KEY, list.filter((d) => d.infoId !== infoId))
  })
}

// ========== Mock 文章管理 ==========

function mockGetArticles(params = {}) {
  return mockDelay().then(() => {
    const { page = 1, pageSize = 10, keyword = '', category = '' } = params
    let list = getStore(MOCK_ARTICLES_KEY, DEFAULT_MOCK_ARTICLES)
    const kw = String(keyword || '').trim().toLowerCase()
    if (kw) {
      list = list.filter((a) => (a.title || '').toLowerCase().includes(kw) || (a.author || '').toLowerCase().includes(kw))
    }
    if (category) {
      list = list.filter((a) => (a.category || '') === category)
    }
    const total = list.length
    const start = (page - 1) * pageSize
    return { list: list.slice(start, start + pageSize), total }
  })
}

function mockGetArticleCategories() {
  return mockDelay().then(() => {
    const list = getStore(MOCK_ARTICLES_KEY, DEFAULT_MOCK_ARTICLES)
    return [...new Set(list.map((a) => a.category).filter(Boolean))]
  })
}

function mockCreateArticle(data) {
  return mockDelay().then(() => {
    const list = getStore(MOCK_ARTICLES_KEY, DEFAULT_MOCK_ARTICLES)
    const article = { articleId: Date.now(), views: 0, ...(data || {}) }
    list.unshift(article)
    saveStore(MOCK_ARTICLES_KEY, list)
    return article
  })
}

function mockUpdateArticle(articleId, data) {
  return mockDelay().then(() => {
    const list = getStore(MOCK_ARTICLES_KEY, DEFAULT_MOCK_ARTICLES)
    const article = list.find((a) => a.articleId === articleId)
    if (!article) throw new Error('文章不存在')
    Object.assign(article, data)
    saveStore(MOCK_ARTICLES_KEY, list)
    return article
  })
}

function mockDeleteArticle(articleId) {
  return mockDelay().then(() => {
    const list = getStore(MOCK_ARTICLES_KEY, DEFAULT_MOCK_ARTICLES)
    saveStore(MOCK_ARTICLES_KEY, list.filter((a) => a.articleId !== articleId))
  })
}

// ========== 对外 API ==========

/* ==================== 用户管理 ==================== */

/** 管理端：获取用户列表（含已删除，含 status；需 role=admin） */
export function getAdminUsers() {
  if (USE_MOCK) return mockGetAdminUsers()
  return request.get('/admin/users')
}

/** 管理端：添加用户（username 3-20 位 / password 6-32 位 / role: user|doctor|admin） */
export function createAdminUser(data) {
  if (USE_MOCK) return mockCreateAdminUser(data)
  return request.post('/admin/users', data)
}

/** 管理端：修改用户角色（role: user|doctor|admin） */
export function updateAdminUserRole(id, role) {
  if (USE_MOCK) return mockUpdateAdminUserRole(id, role)
  return request.put(`/admin/users/${id}/role`, { role })
}

/** 管理端：软删除用户（幂等） */
export function deleteAdminUser(id) {
  if (USE_MOCK) return mockDeleteAdminUser(id)
  return request.delete(`/admin/users/${id}`)
}

/** 管理端：恢复被软删除用户（幂等），恢复其登录权限 */
export function restoreAdminUser(id) {
  if (USE_MOCK) return mockRestoreAdminUser(id)
  return request.put(`/admin/users/${id}/restore`)
}

/* ==================== 医生管理==================== */

/** 医生列表（分页 + 搜索 + 科室筛选） */
export function getDoctors(params) {
  if (USE_MOCK) return mockGetDoctors(params)
  return request.get('/doctors', { params })
}

/** 新增医生 */
export function createDoctor(data) {
  if (USE_MOCK) return mockCreateDoctor(data)
  return request.post('/admin/doctors', data)
}

/** 修改医生 */
export function updateDoctor(infoId, data) {
  if (USE_MOCK) return mockUpdateDoctor(infoId, data)
  return request.put(`/admin/doctors/${infoId}`, data)
}

/** 删除医生 */
export function deleteDoctor(infoId) {
  if (USE_MOCK) return mockDeleteDoctor(infoId)
  return request.delete(`/admin/doctors/${infoId}`)
}

/* ==================== 文章管理（接口 12~17） ==================== */

/** 文章列表（分页 + 分类 + 搜索） */
export function getArticles(params) {
  if (USE_MOCK) return mockGetArticles(params)
  return request.get('/articles', { params })
}

/** 文章分类列表 */
export function getArticleCategories() {
  if (USE_MOCK) return mockGetArticleCategories()
  return request.get('/articles/categories')
}

/** 发布文章 */
export function createArticle(data) {
  if (USE_MOCK) return mockCreateArticle(data)
  return request.post('/admin/articles', data)
}

/** 修改文章 */
export function updateArticle(articleId, data) {
  if (USE_MOCK) return mockUpdateArticle(articleId, data)
  return request.put(`/admin/articles/${articleId}`, data)
}

/** 删除文章 */
export function deleteArticle(articleId) {
  if (USE_MOCK) return mockDeleteArticle(articleId)
  return request.delete(`/admin/articles/${articleId}`)
}


