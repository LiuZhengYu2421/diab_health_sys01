import request from './request'

/**
 * 打卡记录模块（接口 40~42，需登录）
 * 字段说明：
 *  - punchType: 血糖监测 / 饮食 / 运动 / 作息
 *  - completionStatus: 已完成 / 未完成
 * 注：新增打卡 POST /punch-in 后端未实现（属人员三负责），此处不封装
 */

/** 我的打卡记录列表（分页 + 类型 + 日期范围筛选，startDate/endDate 格式 yyyy-MM-dd） */
export function getPunchRecords(params) {
  return request.get('/punch-in', { params })
}

/** 打卡统计：{ streak, monthCount, totalCount } */
export function getPunchStats() {
  return request.get('/punch-in/stats')
}

/** 删除打卡记录（只能删自己的） */
export function deletePunchRecord(id) {
  return request.delete(`/punch-in/${id}`)
}
