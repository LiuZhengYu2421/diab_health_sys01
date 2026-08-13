/**
 * JWT 工具：解码后端签发的 token（payload 含 userId / username / role / exp），
 * 用于前端兜底判断用户角色，避免依赖本地 userInfo 缓存。
 */

/** 解码 JWT 的 payload 部分（base64url -> JSON），非法/非 JWT 返回 null */
export function decodeTokenPayload(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4))
    const json = decodeURIComponent(
      atob(base64 + pad)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

/** 从 token 中提取角色，无法解析返回 null */
export function getTokenRole(token) {
  const payload = decodeTokenPayload(token)
  return payload && typeof payload.role === 'string' ? payload.role : null
}
