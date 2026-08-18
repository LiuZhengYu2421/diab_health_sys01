/**
 * 健康咨询收藏工具
 * ============================================
 * 用户点击健康咨询详情底部的「收藏」后，将该咨询存入 localStorage，
 * 个人中心「我的咨询」子功能中展示所有收藏的健康咨询。
 *
 * 存储策略：
 *   - 按用户隔离：key = zhitang_consult_favorites_<userId>
 *   - 未登录用户使用 guest 作为兜底，仅本地演示
 */
import { getUser } from '@/utils/storage'

const FAV_KEY_PREFIX = 'zhitang_consult_favorites'

function currentKey() {
  const user = getUser() || {}
  const uid = user.id || user.userId || user.username || 'guest'
  return `${FAV_KEY_PREFIX}_${uid}`
}

/** 获取全部收藏 */
export function getConsultFavorites() {
  try {
    return JSON.parse(localStorage.getItem(currentKey()) || '[]')
  } catch (e) {
    return []
  }
}

/** 判断某标题是否已收藏 */
export function isConsultFavorite(title) {
  return getConsultFavorites().some((f) => f.title === title)
}

/**
 * 添加收藏
 * @param {Object} item { title, content, tags, category }
 * @returns {boolean} 是否新增成功（已存在返回 false）
 */
export function addConsultFavorite(item) {
  const list = getConsultFavorites()
  if (list.some((f) => f.title === item.title)) return false
  const fav = {
    title: item.title || '',
    content: item.content || '',
    tags: item.tags || [],
    category: item.category || '',
    savedAt: new Date().toLocaleString('zh-CN', { hour12: false })
  }
  list.unshift(fav)
  localStorage.setItem(currentKey(), JSON.stringify(list))
  return true
}

/** 取消收藏 */
export function removeConsultFavorite(title) {
  const list = getConsultFavorites().filter((f) => f.title !== title)
  localStorage.setItem(currentKey(), JSON.stringify(list))
}

/** 清空收藏 */
export function clearConsultFavorites() {
  localStorage.removeItem(currentKey())
}
