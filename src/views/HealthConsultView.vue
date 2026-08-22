<template>
  <div class="content-page consult-page">
    <!-- ========== 页面头部（始终渲染） ========== -->
    <div class="page-head">
      <div class="page-head-left">
        <h2 class="page-title"><i class="fa-solid fa-newspaper"></i> 健康咨询</h2>
        <p class="page-sub">系统结合您的健康情况为您推荐的知识与资讯，点击可查看详情并收藏</p>
      </div>
      <button class="generate-btn" :disabled="loading" @click="loadTags(true)">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        {{ loading ? 'AI 生成中…' : 'AI 推荐资讯' }}
      </button>
    </div>

    <!-- ========== 加载中（仅覆盖列表区，头部保留） ========== -->
    <div v-if="loading && view === 'list'" class="loading-wrap">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>AI 正在为您推荐健康咨询…</p>
    </div>

    <!-- ========== 列表视图 ========== -->
    <div v-else-if="view === 'list'" class="list-panel">
      <div v-if="pageItems.length" class="consult-list">
        <div
          v-for="(art, i) in pageItems"
          :key="art.title + i"
          class="consult-item"
          @click="openDetail(art)"
        >
          <div class="item-num">{{ startIndex + i + 1 }}</div>
          <div class="item-body">
            <div class="item-title-row">
              <span class="cat-badge" :class="art.cls">
                <i :class="art.icon"></i>{{ art.category }}
              </span>
              <i
                class="fa-solid fa-bookmark item-fav"
                :class="{ faved: art.faved }"
              ></i>
            </div>
            <h4 class="item-title" :title="art.title">{{ art.title }}</h4>
            <p v-if="art.content" class="item-summary">{{ summaryOf(art.content) }}</p>
            <p v-else class="item-summary placeholder">点击查看 AI 生成详情</p>
          </div>
        </div>
      </div>

      <div v-else class="empty-wrap">
        <div class="empty-box">
          <div class="empty-icon"><i class="fa-solid fa-newspaper"></i></div>
          <p>暂无推荐内容，点击右上角「AI 推荐资讯」生成</p>
        </div>
      </div>

      <!-- 分页（上一页 / 页码 / 下一页） -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="prev-next"
          :disabled="currentPage === 1"
          @click="currentPage = Math.max(1, currentPage - 1)"
        >
          <i class="fa-solid fa-chevron-left"></i> 上一页
        </button>
        <div class="page-nums">
          <span
            v-for="(p, i) in pageList"
            :key="i + '-' + p"
            class="page-cell"
          >
            <span v-if="p === '...'" class="page-ellipsis">…</span>
            <button
              v-else
              class="page-num"
              :class="{ active: p === currentPage }"
              @click="currentPage = p"
            >
              {{ p }}
            </button>
          </span>
        </div>
        <button
          class="prev-next"
          :disabled="currentPage === totalPages"
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
        >
          下一页 <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- ========== 文章详情视图 ========== -->
    <div v-else class="detail-view">
      <div class="detail-topbar">
        <button class="back-btn" @click="backToList">
          <i class="fa-solid fa-arrow-left"></i> 返回列表
        </button>
        <span v-if="detail.category" class="detail-cat">{{ detail.category }}</span>
      </div>
      <div class="detail-scroll">
        <div v-if="detail.loading" class="detail-loading">
          <i class="fa-solid fa-spinner fa-spin"></i> AI 正在生成文章…
        </div>
        <template v-else>
          <h2 class="detail-title">{{ detail.title }}</h2>
          <div v-if="detail.tags.length" class="detail-tags">
            <span v-for="(t, i) in detail.tags" :key="i" class="tag">
              <i class="fa-solid fa-tag"></i>{{ t }}
            </span>
          </div>
          <div class="detail-content" v-html="detail.content"></div>
        </template>
      </div>
      <!-- 底部收藏栏 -->
      <div class="detail-foot">
        <button
          class="fav-btn"
          :class="{ faved: detail.favorited }"
          :disabled="detail.loading"
          @click="toggleFavorite"
        >
          <i
            :class="
              detail.favorited ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'
            "
          ></i>
          {{ detail.favorited ? '已收藏' : '收藏' }}
        </button>
        <span v-if="detail.favorited" class="fav-tip"
          >已收藏至「个人中心 → 我的咨询」</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { healthTags, healthDetail, isMockMode } from '@/api/dify'
import {
  getConsultFavorites,
  isConsultFavorite,
  addConsultFavorite,
  removeConsultFavorite
} from '@/utils/consultFavorites'
import { showFloatingAlert } from '@/utils/alert'

const loading = ref(false) // 初始不显示 loading 占位，保证头部立即可见
const currentPage = ref(1)
const pageSize = 3
const view = ref('list')

const CATEGORY_MAP = {
  eat: { name: '饮食指导', icon: 'fa-solid fa-utensils', cls: 'cat-green' },
  sport: { name: '运动指南', icon: 'fa-solid fa-person-walking', cls: 'cat-blue' },
  daily: { name: '日常习惯', icon: 'fa-solid fa-bed', cls: 'cat-orange' },
  popularization: {
    name: '糖尿病科普',
    icon: 'fa-solid fa-book-medical',
    cls: 'cat-purple'
  }
}

// Fallback 数据：接口失败或 Mock 解析异常时使用，保证页面始终有内容
const FALLBACK_TAGS = {
  eat: [
    {
      title: '糖尿病饮食指南：主食粗细搭配技巧',
      content:
        '建议用糙米、燕麦、杂豆替代部分精米白面，延缓餐后血糖上升；每餐先吃蔬菜再吃主食能进一步平稳血糖。'
    },
    {
      title: '低GI 食物清单：适合糖友的 10 种主食',
      content: '燕麦、糙米、藜麦、红薯、玉米、杂粮馒头、全麦面包、山药、芋头、绿豆都是常见低 GI 选项。'
    },
    {
      title: '控糖早餐怎么吃？营养师教你搭配',
      content:
        '一份优质早餐应包含蛋白质（如鸡蛋 / 无糖豆浆）、复合碳水（全麦面包 / 杂粮粥）和蔬菜，比例约为 2:1:1。'
    },
    {
      title: '外食族控糖攻略：点餐避开 4 个雷区',
      content: '少点糖醋、勾芡、油炸、含糖饮料；多选蒸、煮、凉拌、炖汤类菜肴，并搭配足量蔬菜。'
    },
    {
      title: '下午茶怎么吃不长胖？糖友零食选择',
      content:
        '推荐原味坚果、无糖酸奶、苹果 / 梨等低 GI 水果，每次 25-30 克为宜，避免蛋糕、含糖饼干、奶茶。'
    }
  ],
  sport: [
    {
      title: '科学运动控糖：每周 150 分钟有氧计划',
      content:
        '每周至少 5 天、每天 30 分钟中等强度运动（心率 110-130 次/分），快走、骑车、游泳都是不错的选择。'
    },
    {
      title: '散步也能降血糖？餐后 20 分钟快走实验',
      content:
        '餐后 20 分钟开始的中等强度步行，可显著降低餐后 2 小时血糖约 1.5-2 mmol/L，简单易行。'
    },
    {
      title: '力量训练对糖尿病患者的 5 大好处',
      content:
        '提升基础代谢、改善胰岛素敏感性、保护骨密度、增强肌肉力量、帮助控制体重和血糖稳定。'
    },
    {
      title: '游泳对糖友的益处与注意事项',
      content:
        '游泳对关节友好、全身肌肉参与、热量消耗高；水温不宜过低、避免空腹、随身携带糖块以防低血糖。'
    },
    {
      title: '居家跳绳控糖：零基础入门指南',
      content:
        '从每组 100 个开始，循序渐进；穿缓冲好的运动鞋，铺跳绳垫，保护好膝关节和脚踝。'
    }
  ],
  daily: [
    {
      title: '糖友日常注意事项',
      content:
        '规律作息、足部护理、情绪管理、定期复诊都是日常控糖的关键环节，坚持小习惯，收获大健康。'
    },
    {
      title: '足部护理小贴士',
      content: '每日检查足部皮肤，保持清洁干燥，穿合脚的鞋子，预防糖尿病足。'
    },
    {
      title: '血糖监测最佳时间表',
      content:
        '空腹、餐后 2 小时、睡前三个时段监测血糖，帮助掌握全天血糖波动规律。'
    },
    {
      title: '情绪波动也影响血糖',
      content: '压力与焦虑会导致血糖升高，学会深呼吸、冥想等放松技巧同样重要。'
    },
    {
      title: '睡眠质量与血糖的关系',
      content:
        '长期睡眠不足会降低胰岛素敏感性，保证 7-8 小时高质量睡眠是控糖基础。'
    }
  ],
  popularization: [
    {
      title: '认识 2 型糖尿病',
      content:
        '2 型糖尿病是最常见的糖尿病类型，与胰岛素抵抗及胰岛功能减退相关，科学管理可有效延缓并发症发生。'
    },
    {
      title: '糖尿病前期的信号',
      content:
        '多饮、多食、多尿、体重下降是典型信号，早发现、早干预可有效逆转病情发展。'
    },
    {
      title: '糖尿病会遗传吗？',
      content:
        '糖尿病有家族聚集倾向，遗传因素与环境因素共同作用，健康生活方式可显著降低发病风险。'
    },
    {
      title: '糖化血红蛋白是什么',
      content:
        '糖化血红蛋白反映近 2-3 个月的平均血糖水平，是评估长期控糖效果的金标准。'
    },
    {
      title: '糖尿病并发症早期筛查',
      content:
        '定期检查眼底、肾功能、足部感觉及心血管指标，早筛早治可延缓并发症进展。'
    }
  ]
}

const articles = ref([])

const detail = reactive({
  loading: false,
  title: '',
  content: '',
  tags: [],
  category: '',
  favorited: false
})

function parseApiData(data) {
  const list = []
  if (!data || typeof data !== 'object') return list
  Object.keys(CATEGORY_MAP).forEach((key) => {
    const meta = CATEGORY_MAP[key]
    const raw = data[key]
    if (!raw) return
    const items = Array.isArray(raw) ? raw : [raw]
    items.forEach((item) => {
      let title = ''
      let content = ''
      if (typeof item === 'string') {
        title = item
      } else if (item && typeof item === 'object') {
        title = item.title || item.name || ''
        content = item.content || item.summary || item.desc || ''
      }
      if (!title) return
      list.push({
        title,
        content,
        category: meta.name,
        icon: meta.icon,
        cls: meta.cls,
        faved: isConsultFavorite(title)
      })
    })
  })
  return list
}

/* ---------- 列表数据 ---------- */
async function loadTags(force = false) {
  if (!force && loading.value) return
  loading.value = true
  try {
    const res = await healthTags({ userInfo: {} })
    const data = isMockMode() ? res : res?.data?.data || res?.data || res
    let list = parseApiData(data)
    // 兜底：若接口异常返回空，直接用 FALLBACK 填充，避免空页面
    if (!list.length) {
      list = parseApiData(FALLBACK_TAGS)
      showFloatingAlert('已为您展示本地推荐内容', 'info')
    }
    articles.value = list
    currentPage.value = 1
  } catch (e) {
    // 接口失败也用兜底数据，保证页面始终有内容可显示
    articles.value = parseApiData(FALLBACK_TAGS)
    showFloatingAlert('已为您展示本地推荐内容', 'info')
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil(articles.value.length / pageSize))
)
const startIndex = computed(() => (currentPage.value - 1) * pageSize)
const pageItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return articles.value.slice(start, start + pageSize)
})

/**
 * 分页页码列表：最多显示 5 个页码，超出用省略号代替。
 */
const pageList = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const list = []
  if (cur <= 4) {
    for (let i = 1; i <= 5; i++) list.push(i)
    list.push('...')
    list.push(total)
  } else if (cur >= total - 3) {
    list.push(1)
    list.push('...')
    for (let i = total - 4; i <= total; i++) list.push(i)
  } else {
    list.push(1)
    list.push('...')
    for (let i = cur - 1; i <= cur + 1; i++) list.push(i)
    list.push('...')
    list.push(total)
  }
  return list
})

function summaryOf(content) {
  const plain = String(content)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 60 ? plain.slice(0, 60) + '…' : plain
}

/* ---------- 详情 ---------- */
async function openDetail(art) {
  view.value = 'detail'
  detail.loading = true
  detail.title = art.title
  detail.content = ''
  detail.tags = []
  detail.category = art.category
  detail.favorited = isConsultFavorite(art.title)
  try {
    const res = await healthDetail({ title: art.title, userInfo: {} })
    const data = isMockMode() ? res : res?.data?.data || res?.data || res
    detail.title = data?.title || art.title
    detail.content = data?.content || ''
    detail.tags = data?.tags || []
  } catch (e) {
    // 详情失败时也保留原标题与 category，并给出加载失败提示
    detail.content =
      '<p style="color:#94a3b8">文章详情加载失败，但您仍可收藏本条标题。</p>'
  } finally {
    detail.loading = false
  }
}

function backToList() {
  view.value = 'list'
}

/* ---------- 收藏 ---------- */
function toggleFavorite() {
  if (detail.loading) return
  if (detail.favorited) {
    removeConsultFavorite(detail.title)
    detail.favorited = false
    syncFavState(detail.title, false)
    showFloatingAlert('已取消收藏', 'info')
  } else {
    const ok = addConsultFavorite({
      title: detail.title,
      content: detail.content,
      tags: detail.tags,
      category: detail.category
    })
    if (ok) {
      detail.favorited = true
      syncFavState(detail.title, true)
      showFloatingAlert('收藏成功，已加入「个人中心 → 我的咨询」', 'success')
    } else {
      detail.favorited = true
    }
  }
}

function syncFavState(title, faved) {
  const item = articles.value.find((a) => a.title === title)
  if (item) item.faved = faved
}

// 首次进入加载列表；若携带 ?open=标题，则直接打开对应文章详情
const route = useRoute()
onMounted(async () => {
  await loadTags(true)
  const openTitle = route.query.open
  if (openTitle) {
    const target = articles.value.find((a) => a.title === openTitle)
    if (target) openDetail(target)
  }
})
</script>

<style scoped>
.consult-page {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 24px 26px;
  background: #eef3fa;
  border-radius: 18px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
  flex-shrink: 0;
}
.page-head-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.page-title {
  margin: 0;
  font-size: 20px;
  color: #1e3a5f;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.page-title i {
  color: #2563eb;
}
.page-sub {
  margin: 0;
  font-size: 13px;
  color: #7d8ba1;
}
.generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border: none;
  border-radius: 22px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
  transition: transform 0.2s, opacity 0.2s;
}
.generate-btn:hover {
  transform: translateY(-2px);
  opacity: 0.95;
}
.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ========== 加载中 ========== */
.loading-wrap {
  flex: 1;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #2563eb;
  font-size: 14px;
}
.loading-wrap i {
  font-size: 26px;
}

/* ========== 列表容器 ========== */
.list-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ========== 咨询列表（纵向，从上到下） ========== */
.consult-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}
.consult-item {
  display: flex;
  gap: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 1px 6px rgba(31, 45, 61, 0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  border: 1px solid transparent;
  width: 100%;
  box-sizing: border-box;
}
.consult-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 45, 61, 0.1);
  border-color: #dbeafe;
}
.item-num {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13.5px;
  font-weight: 700;
  border-radius: 10px;
  margin-top: 2px;
}
.item-body {
  flex: 1;
  min-width: 0;
}
.item-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.cat-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}
.cat-badge i {
  font-size: 10px;
}
.cat-green {
  background: linear-gradient(135deg, #16a34a, #22c55e);
}
.cat-blue {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}
.cat-orange {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}
.cat-purple {
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
}
.item-fav {
  color: #cbd5e1;
  font-size: 15px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.item-fav.faved {
  color: #f59e0b;
}
.item-title {
  margin: 0 0 6px;
  font-size: 14.5px;
  font-weight: 600;
  color: #1e3a5f;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-summary {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-summary.placeholder {
  color: #94a3b8;
  font-style: italic;
}

/* ========== 空状态 ========== */
.empty-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}
.empty-box {
  text-align: center;
  padding: 40px 60px;
  color: #94a3b8;
}
.empty-icon {
  font-size: 40px;
  color: #cbd5e1;
  margin-bottom: 12px;
}
.empty-box p {
  margin: 0;
  font-size: 13.5px;
}

/* ========== 分页 ========== */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 0 2px;
  flex-shrink: 0;
}
.prev-next {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.prev-next:hover:not(:disabled) {
  border-color: #2563eb;
  color: #2563eb;
}
.prev-next:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-nums {
  display: flex;
  align-items: center;
  gap: 6px;
}
.page-num {
  min-width: 34px;
  height: 34px;
  padding: 0 6px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.page-num:hover {
  border-color: #2563eb;
  color: #2563eb;
}
.page-num.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  font-weight: 600;
}
.page-ellipsis {
  padding: 0 2px;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1;
}

/* ========== 文章详情视图 ========== */
.detail-view {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(31, 45, 61, 0.06);
}
.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #eef2f7;
  flex-shrink: 0;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}
.detail-cat {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}
.detail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.detail-loading {
  padding: 60px 20px;
  text-align: center;
  color: #2563eb;
  font-size: 14px;
}
.detail-loading i {
  margin-right: 6px;
}
.detail-title {
  margin: 0;
  padding: 20px 26px 0;
  font-size: 19px;
  font-weight: 700;
  color: #1e3a5f;
  line-height: 1.5;
}
.detail-tags {
  padding: 14px 26px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 12px;
  font-size: 12px;
}
.tag i {
  font-size: 10px;
}
.detail-content {
  padding: 18px 26px 22px;
  font-size: 14px;
  line-height: 1.9;
  color: #334155;
}
.detail-content :deep(p) {
  margin: 0 0 12px;
}
.detail-content :deep(strong) {
  color: #1e3a5f;
}
.detail-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid #eef2f7;
  background: #f8fafc;
  flex-shrink: 0;
}
.fav-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 26px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  color: #64748b;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s;
}
.fav-btn:hover:not(:disabled) {
  border-color: #2563eb;
  color: #2563eb;
}
.fav-btn.faved {
  background: #f59e0b;
  border-color: #f59e0b;
  color: #fff;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
.fav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.fav-tip {
  font-size: 12px;
  color: #94a3b8;
}

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .consult-page {
    padding: 16px 14px;
    overflow-y: auto;
  }
  .page-head {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .consult-page {
    padding: 14px 12px;
    border-radius: 14px;
  }
  .page-title {
    font-size: 17px;
  }
  .generate-btn {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
  .consult-card {
    padding: 14px;
  }
  .card-title {
    font-size: 15px;
  }
  .detail-topbar {
    padding: 12px 14px;
  }
  .detail-scroll {
    padding: 0 14px 20px;
  }
  .detail-title {
    font-size: 17px;
  }
  .back-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
