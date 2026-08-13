import request from './request'

/** 管理端：获取用户列表（需 role=admin） */
export function getAdminUsers() {
  return request.get('/admin/users')
}
