import request from './request'

/** 管理端：获取用户列表（含已删除，含 status；需 role=admin） */
export function getAdminUsers() {
  return request.get('/admin/users')
}

/** 管理端：添加用户（username 3-20 位 / password 6-32 位 / role: user|doctor|admin） */
export function createAdminUser(data) {
  return request.post('/admin/users', data)
}

/** 管理端：修改用户角色（role: user|doctor|admin） */
export function updateAdminUserRole(id, role) {
  return request.put(`/admin/users/${id}/role`, { role })
}

/** 管理端：软删除用户（幂等） */
export function deleteAdminUser(id) {
  return request.delete(`/admin/users/${id}`)
}

/** 管理端：恢复被软删除用户（幂等），恢复其登录权限 */
export function restoreAdminUser(id) {
  return request.put(`/admin/users/${id}/restore`)
}

/* ==================== 医生管理（接口 7~11） ==================== */

/** 医生列表（分页 + 搜索 + 科室筛选） */
export function getDoctors(params) {
  return request.get('/doctors', { params })
}

/** 新增医生 */
export function createDoctor(data) {
  return request.post('/admin/doctors', data)
}

/** 修改医生 */
export function updateDoctor(infoId, data) {
  return request.put(`/admin/doctors/${infoId}`, data)
}

/** 删除医生 */
export function deleteDoctor(infoId) {
  return request.delete(`/admin/doctors/${infoId}`)
}

/* ==================== 文章管理（接口 12~17） ==================== */

/** 文章列表（分页 + 分类 + 搜索） */
export function getArticles(params) {
  return request.get('/articles', { params })
}

/** 文章分类列表 */
export function getArticleCategories() {
  return request.get('/articles/categories')
}

/** 发布文章 */
export function createArticle(data) {
  return request.post('/admin/articles', data)
}

/** 修改文章 */
export function updateArticle(articleId, data) {
  return request.put(`/admin/articles/${articleId}`, data)
}

/** 删除文章 */
export function deleteArticle(articleId) {
  return request.delete(`/admin/articles/${articleId}`)
}

/* ==================== 糖尿病类型管理（接口 22~26） ==================== */

/** 类型列表 */
export function getDiabetesTypes(params) {
  return request.get('/diabetes-types', { params })
}

/** 新增类型 */
export function createDiabetesType(data) {
  return request.post('/admin/diabetes-types', data)
}

/** 修改类型 */
export function updateDiabetesType(typeId, data) {
  return request.put(`/admin/diabetes-types/${typeId}`, data)
}

/** 删除类型 */
export function deleteDiabetesType(typeId) {
  return request.delete(`/admin/diabetes-types/${typeId}`)
}
