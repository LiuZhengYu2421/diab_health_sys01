/**
 * 健康咨询搜索封装（SpringBoot 业务接口，非 Dify）
 * ============================================
 * 健康咨询文章由 Dify「健康咨询-标签/详情模式」生成后由后端落库到 `articles` 表，
 * 首页搜索直接复用文章列表接口 `GET /articles?keyword=` 做标题模糊查询。
 * 接口定义见《后端接口文档》第 11 章（4.1 文章列表接口的复用）。
 * ---------------------------------------------------
 * 响应 { code:200, data: { list: [...], total, page, pageSize } }
 * 双模式设计（与 dify.js 保持一致）：
 *  1. Mock 模式（默认，VITE_USE_MOCK=true）：本地标题模糊匹配，无需后端
 *  2. 真实模式（VITE_USE_MOCK=false）：请求 SpringBoot `/articles` 接口
 */
import request from './request'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ========== Mock 数据源：健康咨询标题（模拟 `articles` 表数据） ==========
const MOCK_ARTICLES = [
  { articleId: 1, title: '糖尿病饮食指南：主食粗细搭配技巧', category: '饮食指导' },
  { articleId: 2, title: '低GI 食物清单：适合糖友的 10 种主食', category: '饮食指导' },
  { articleId: 3, title: '控糖早餐怎么吃？营养师教你搭配', category: '饮食指导' },
  { articleId: 4, title: '外食族控糖攻略：点餐避开 4 个雷区', category: '饮食指导' },
  { articleId: 5, title: '下午茶怎么吃不长胖？糖友零食选择', category: '饮食指导' },
  { articleId: 6, title: '科学运动控糖：每周 150 分钟有氧计划', category: '运动指南' },
  { articleId: 7, title: '散步也能降血糖？餐后 20 分钟快走实验', category: '运动指南' },
  { articleId: 8, title: '力量训练对糖尿病患者的 5 大好处', category: '运动指南' },
  { articleId: 9, title: '游泳对糖友的益处与注意事项', category: '运动指南' },
  { articleId: 10, title: '居家跳绳控糖：零基础入门指南', category: '运动指南' },
  { articleId: 11, title: '糖友日常注意事项', category: '日常习惯' },
  { articleId: 12, title: '足部护理小贴士', category: '日常习惯' },
  { articleId: 13, title: '血糖监测最佳时间表', category: '日常习惯' },
  { articleId: 14, title: '情绪波动也影响血糖', category: '日常习惯' },
  { articleId: 15, title: '睡眠质量与血糖的关系', category: '日常习惯' },
  { articleId: 16, title: '认识 2 型糖尿病', category: '糖尿病科普' },
  { articleId: 17, title: '糖尿病前期的信号', category: '糖尿病科普' },
  { articleId: 18, title: '糖尿病会遗传吗？', category: '糖尿病科普' },
  { articleId: 19, title: '糖化血红蛋白是什么', category: '糖尿病科普' },
  { articleId: 20, title: '糖尿病并发症早期筛查', category: '糖尿病科普' }
]

function mockDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ========== 健康咨询搜索（Mock） ==========
// 模拟 `GET /articles?keyword=` 的服务端模糊查询
function mockSearchArticles(params = {}) {
  const { keyword = '', page = 1, pageSize = 8 } = params
  const kw = String(keyword).trim().toLowerCase()
  let list = kw
    ? MOCK_ARTICLES.filter((item) => item.title.toLowerCase().includes(kw))
    : []
  const start = (page - 1) * pageSize
  return mockDelay().then(() => ({
    list: list.slice(start, start + pageSize),
    total: list.length,
    page,
    pageSize
  }))
}

// ========== 对外 API ==========

/**
 * 健康咨询搜索（首页搜索栏）
 * @param {object} params { keyword, page?, pageSize? }
 */
export function searchHealthConsult(params) {
  if (USE_MOCK) return mockSearchArticles(params)
  // 真实模式：复用文章列表接口，按 keyword 标题模糊搜索
  return request.get('/articles', { params })
}

/** 是否处于 Mock 模式 */
export function isMockMode() {
  return USE_MOCK
}
