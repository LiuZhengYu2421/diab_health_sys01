<template>
  <div class="home-page">
    <!-- 顶部 logo + 搜索 -->
    <div class="home-header">
      <div class="home-logo">
        <i class="fa-solid fa-hand-holding-medical"></i>
        <span>糖尿病智能助手</span>
      </div>
      <!-- 搜索框（点击图标展开） -->
      <div class="home-search-box" :class="{ open: searchOpen }">
        <i class="fa-solid fa-magnifying-glass search-icon" @click="toggleSearch"></i>
        <input
          v-if="searchOpen"
          ref="searchInput"
          v-model.trim="keyword"
          class="search-input"
          placeholder="搜索健康咨询，如：糖尿病"
          @focus="searchOpen = true"
          @keyup.enter="goFirstResult"
        >
        <i v-if="searchOpen && keyword" class="fa-solid fa-xmark search-clear" @click="clearSearch"></i>

        <!-- 搜索结果下拉 -->
        <div v-if="searchOpen && keyword" class="search-dropdown">
          <div v-if="searching" class="search-tip"><i class="fa-solid fa-spinner fa-spin"></i> 加载中…</div>
          <template v-else>
            <div v-if="searchResults.length" class="search-result-list">
              <div
                v-for="item in searchResults"
                :key="item.title"
                class="search-result-item"
                @mousedown.prevent="goSearchResult(item)"
              >
                <i class="fa-solid fa-file-lines search-result-icon"></i>
                <span class="search-result-title" v-html="highlightTitle(item.title)"></span>
                <span class="search-result-cat">{{ item.categoryName || item.category }}</span>
              </div>
            </div>
            <div v-else class="search-tip">未找到「{{ keyword }}」相关的健康咨询</div>
          </template>
        </div>
      </div>
    </div>

    <!-- Banner 轮播 -->
    <div class="home-banner">
      <div class="banner-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div v-for="(item, idx) in banners" :key="idx" class="banner-slide"
             :style="{ background: item.bg }">
          <div class="banner-content">
            <h3>{{ item.title }}</h3>
            <p>{{ item.subtitle }}</p>
          </div>
        </div>
      </div>
      <button class="banner-arrow banner-prev" @click="prevSlide">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button class="banner-arrow banner-next" @click="nextSlide">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
      <div class="banner-dots">
        <span v-for="(b, idx) in banners" :key="idx"
              :class="{ active: idx === currentSlide }"
              @click="goToSlide(idx)"></span>
      </div>
    </div>

    <!-- 专业医师团队 -->
    <div class="home-section">
      <div class="section-title-row">
        <h3>专业医师团队</h3>
        <a href="javascript:;" class="section-link" @click="goAllDoctors">查看全部 <i class="fa-solid fa-angle-right"></i></a>
      </div>
      <div class="doctor-row">
        <div v-for="doc in doctors" :key="doc.id" class="doctor-card" @click="handleConsult(doc)">
          <div class="doctor-avatar">
            <img :src="doc.avatar" alt="医生头像">
          </div>
          <p class="doctor-title-tag">{{ doc.titleTag }}</p>
          <h4 class="doctor-name">{{ doc.name }}</h4>
          <p class="doctor-dept">{{ doc.department }}</p>
          <button class="btn-consult">立即咨询</button>
        </div>
      </div>
    </div>

    <!-- 健康咨询 -->
    <div class="home-section">
      <div class="section-title-row">
        <h3>健康咨询</h3>
        <a href="javascript:;" class="section-link" @click="goHealthConsult">查看全部 <i class="fa-solid fa-angle-right"></i></a>
      </div>
      <div class="health-list">
        <div v-for="art in healthArticles" :key="art.title" class="health-item" @click="goHealthConsult">
          <span class="health-cat" :class="art.cls">
            <i :class="art.icon"></i>{{ art.category }}
          </span>
          <div class="health-item-body">
            <h4 class="health-title">{{ art.title }}</h4>
            <p class="health-summary">{{ art.summary }}</p>
          </div>
          <button class="health-detail-btn" @click.stop="goHealthDetail(art)">
            查看详情 <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ====== 全部医师弹窗 ====== -->
    <div v-if="showAllDoctors" class="doc-modal-mask" @click="closeAllDoctors">
      <div class="doc-modal" @click.stop>
        <div class="doc-modal-head">
          <h3><i class="fa-solid fa-user-doctor"></i> 全部医师（{{ allDoctors.length }}）</h3>
          <button class="doc-modal-close" @click="closeAllDoctors"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="doc-modal-body">
          <div v-if="loadingDoctors" class="doc-modal-tip"><i class="fa-solid fa-spinner fa-spin"></i> 加载中…</div>
          <div v-else-if="allDoctors.length" class="doc-modal-grid">
            <div v-for="doc in allDoctors" :key="doc.id" class="doc-modal-card" @click="handleConsult(doc)">
              <div class="doctor-avatar">
                <img :src="doc.avatar" alt="医生头像">
              </div>
              <p class="doctor-title-tag">{{ doc.titleTag }}</p>
              <h4 class="doctor-name">{{ doc.name }}</h4>
              <p class="doctor-dept">{{ doc.department }}</p>
              <button class="btn-consult">立即咨询</button>
            </div>
          </div>
          <div v-else class="doc-modal-tip">暂无医师数据</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showFloatingAlert } from '@/utils/alert'
import { getDoctors } from '@/api/admin'
import { searchHealthConsult, isMockMode } from '@/api/search'

const router = useRouter()
const userStore = useUserStore()

// ====== 轮播 ======
const banners = [
  {
    title: '健康同行',
    subtitle: '全方位管理您的血糖健康',
    bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)'
  },
  {
    title: '专业医师在线',
    subtitle: '内分泌科专家 1对1 咨询',
    bg: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)'
  },
  {
    title: '智能控糖方案',
    subtitle: 'AI 定制您的个性化管理方案',
    bg: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 50%, #5eead4 100%)'
  }
]
const currentSlide = ref(0)
let slideTimer = null

function goToSlide(idx) {
  currentSlide.value = (idx + banners.length) % banners.length
  resetTimer()
}
function prevSlide() { goToSlide(currentSlide.value - 1) }
function nextSlide() { goToSlide(currentSlide.value + 1) }

function resetTimer() {
  if (slideTimer) clearInterval(slideTimer)
  slideTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % banners.length
  }, 4000)
}

// ====== 医师（首页展示前 3 位）======
const doctors = [
  { id: 1, name: '赵晓峰', avatar: '/img/doc1.jpg', titleTag: '主任医师', department: '内分泌科' },
  { id: 2, name: '孙雅琴', avatar: '/img/doc2.png', titleTag: '副主任医师', department: '内分泌科' },
  { id: 3, name: '周伟',   avatar: '/img/doc3.png', titleTag: '主治医师',   department: '内分泌科' }
]

// 后端不可用/无数据时降级展示的本地示例医师
const fallbackDoctors = [
  { id: 1, name: '赵晓峰', avatar: '/img/doc1.jpg', titleTag: '主任医师', department: '内分泌科' },
  { id: 2, name: '孙雅琴', avatar: '/img/doc2.png', titleTag: '副主任医师', department: '内分泌科' },
  { id: 3, name: '周伟',   avatar: '/img/doc3.png', titleTag: '主治医师',   department: '内分泌科' },
  { id: 4, name: '李建华', avatar: '/img/doc1.jpg', titleTag: '主任医师', department: '心内科' },
  { id: 5, name: '王丽华', avatar: '/img/doc2.png', titleTag: '副主任医师', department: '营养科' },
  { id: 6, name: '陈志明', avatar: '/img/doc3.png', titleTag: '主治医师',   department: '眼科' }
]

// ====== 全部医师弹窗 ======
const showAllDoctors = ref(false)
const loadingDoctors = ref(false)
const allDoctors = ref([])

function closeAllDoctors() {
  showAllDoctors.value = false
}

// 将后端返回字段统一为前端卡片结构
function normalizeDoctor(d) {
  return {
    id: d.infoId || d.id,
    name: d.doctorName || d.name,
    avatar: d.imageUrl || d.avatar || '/img/doctor-default.png',
    titleTag: d.title || '医师',
    department: d.department || '内分泌科',
    bio: d.introduction || '',
    chatToken: d.chatToken || ''
  }
}

async function goAllDoctors() {
  showAllDoctors.value = true
  loadingDoctors.value = true
  try {
    const res = await getDoctors({ page: 1, pageSize: 100 })
    const list = (res && res.list) || []
    allDoctors.value = list.length ? list.map(normalizeDoctor) : fallbackDoctors
  } catch (e) {
    // 后端未启动或请求失败时，降级展示本地示例医师
    allDoctors.value = fallbackDoctors
  } finally {
    loadingDoctors.value = false
  }
}

// ====== 健康咨询（首页展示）======
const healthArticles = [
  {
    title: '糖尿病饮食指南：主食粗细搭配技巧',
    summary: '建议用糙米、燕麦、杂豆替代部分精米白面，延缓餐后血糖上升，同时保证优质蛋白和膳食纤维摄入。',
    category: '饮食指导',
    icon: 'fa-solid fa-utensils',
    cls: 'cat-green'
  },
  {
    title: '科学运动控糖：每周 150 分钟有氧计划',
    summary: '每周至少 5 天、每天 30 分钟中等强度运动，快走、骑车、游泳都是不错的选择，注意运动前后测血糖。',
    category: '运动指南',
    icon: 'fa-solid fa-person-walking',
    cls: 'cat-blue'
  },
  {
    title: '认识 2 型糖尿病',
    summary: '2 型糖尿病是最常见的糖尿病类型，与胰岛素抵抗及胰岛功能减退相关，科学管理可有效延缓并发症发生。',
    category: '糖尿病科普',
    icon: 'fa-solid fa-book-medical',
    cls: 'cat-purple'
  },
  {
    title: '足部护理小贴士',
    summary: '每日检查足部皮肤，保持清洁干燥，穿合脚的鞋子，预防糖尿病足。',
    category: '日常习惯',
    icon: 'fa-solid fa-shoe-prints',
    cls: 'cat-orange'
  }
]

function goHealthConsult() {
  router.push('/lifeadvice')
}

// 查看详情：跳转到健康咨询页并直接打开对应文章
function goHealthDetail(art) {
  router.push({ path: '/lifeadvice', query: { open: art.title } })
}

// ====== 健康咨询搜索 ======
const searchOpen = ref(false)
const keyword = ref('')
const searching = ref(false)
const searchInput = ref(null)

// 搜索结果：优先走后端搜索接口（复用 GET /articles?keyword=，SpringBoot 查 articles 表），失败时退化为本地匹配
const searchResults = ref([])
const searchTimer = ref(null)

// 本地匹配 fallback：用首页 4 条健康资讯 + 分类映射数据
function searchLocalFallback(kw) {
  return healthArticles
    .filter((a) => a.title.toLowerCase().includes(kw))
    .map((a) => ({ title: a.title, category: a.category }))
}

// 关键词变化 → 调用后端搜索接口（防抖 300ms）
watch(keyword, (kw) => {
  clearTimeout(searchTimer.value)
  if (!kw) {
    searchResults.value = []
    searching.value = false
    return
  }
  const lowerKw = kw.toLowerCase()
  searching.value = true
  searchTimer.value = setTimeout(async () => {
    try {
      const res = await searchHealthConsult({ keyword: kw })
      const data = isMockMode() ? res : res?.data?.data || res?.data || res
      searchResults.value = (data?.list || []).slice(0, 8)
    } catch (e) {
      searchResults.value = searchLocalFallback(lowerKw)
    } finally {
      searching.value = false
    }
  }, 300)
})

function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    nextTick(() => searchInput.value && searchInput.value.focus())
  }
}

function clearSearch() {
  keyword.value = ''
  nextTick(() => searchInput.value && searchInput.value.focus())
}

// 关键词高亮（用 <mark> 包裹匹配部分），注意先做 HTML 转义防注入
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
function highlightTitle(title) {
  const safeTitle = escapeHtml(title)
  const kw = keyword.value
  if (!kw) return safeTitle
  const safeKw = escapeHtml(kw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (!safeKw) return safeTitle
  const regex = new RegExp(safeKw, 'gi')
  return safeTitle.replace(regex, (m) => `<mark>${m}</mark>`)
}

// 回车默认打开第一条结果
function goFirstResult() {
  if (searchResults.value.length) goSearchResult(searchResults.value[0])
}

// 点击结果 → 直达健康咨询详情页
function goSearchResult(item) {
  searchOpen.value = false
  keyword.value = ''
  router.push({ path: '/lifeadvice', query: { open: item.title } })
}

// ====== 交互 ======
function onSearch() {
  toggleSearch()
}

function handleConsult(doc) {
  if (!userStore.isLoggedIn) {
    showFloatingAlert('请先登录后再进行咨询', 'info')
    router.push({ path: '/login', query: { redirect: '/consult' } })
    return
  }
  router.push({
    path: '/consult',
    query: {
      name: doc.name,
      department: doc.department,
      title: doc.titleTag,
      avatar: doc.avatar
    }
  })
}

// 点击页面其他区域关闭搜索下拉
function onDocClick(e) {
  if (!e.target.closest('.home-search-box')) {
    searchOpen.value = false
  }
}

onMounted(() => {
  resetTimer()
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  if (slideTimer) clearInterval(slideTimer)
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.home-page {
  background: #eef3fa;
  min-height: 100%;
  padding: 0 0 24px;
}

/* ====== 顶部 header ====== */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 12px;
  background: linear-gradient(180deg, #ffffff 0%, #eef3fa 100%);
}

.home-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #1d4ed8;
  letter-spacing: 1px;
}

.home-logo i {
  font-size: 22px;
  color: #2563eb;
}

.home-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  transition: color 0.2s;
}

.search-icon:hover {
  color: #2563eb;
}

.search-input {
  width: 210px;
  padding: 8px 30px 8px 12px;
  margin-left: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.search-clear:hover {
  color: #2563eb;
}

/* 搜索结果下拉 */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #eef2f8;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(30, 99, 240, 0.14);
  z-index: 200;
  padding: 6px;
}

.search-tip {
  padding: 20px 12px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: #f1f6ff;
}

.search-result-icon {
  font-size: 12px;
  color: #2563eb;
  flex-shrink: 0;
}

.search-result-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result-title mark {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 600;
  border-radius: 3px;
  padding: 0 2px;
}

.search-result-cat {
  flex-shrink: 0;
  font-size: 11px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
}

/* ====== Banner 轮播 ====== */
.home-banner {
  position: relative;
  margin: 0 16px 18px;
  height: 170px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
  background: #fff;
}

.banner-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.banner-slide {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  text-align: center;
  color: #1e3a8a;
  padding: 0 30px;
}

.banner-content h3 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 4px;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.4);
}

.banner-content p {
  font-size: 14px;
  color: #1e40af;
  opacity: 0.85;
}

.banner-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  color: #2563eb;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.banner-arrow:hover {
  background: #fff;
  transform: translateY(-50%) scale(1.08);
}

.banner-prev { left: 10px; }
.banner-next { right: 10px; }

.banner-dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.banner-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.banner-dots span.active {
  background: #fff;
  width: 22px;
  border-radius: 4px;
}

/* ====== 公共 section ====== */
.home-section {
  margin: 0 16px 20px;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 0 4px;
}

.section-title-row h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  position: relative;
  padding-left: 12px;
}

.section-title-row h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #2563eb, #60a5fa);
  border-radius: 2px;
}

.section-link {
  font-size: 13px;
  color: #2563eb;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  transition: opacity 0.2s;
}

.section-link:hover {
  opacity: 0.75;
}

/* ====== 医师三列 ====== */
.doctor-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.doctor-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 8px 14px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
  box-shadow: 0 4px 16px rgba(30, 99, 240, 0.05);
  border: 1px solid #edf1f8;
}

.doctor-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(30, 99, 240, 0.12);
}

.doctor-avatar {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  margin: 0 auto 10px;
  padding: 3px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  box-sizing: border-box;
}

.doctor-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  background: #e8f1ff;
}

.doctor-title-tag {
  display: inline-block;
  font-size: 11px;
  color: #2563eb;
  background: #eaf1ff;
  padding: 2px 10px;
  border-radius: 10px;
  margin-bottom: 6px;
  font-weight: 500;
}

.doctor-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.doctor-dept {
  font-size: 12px;
  color: #93a0b8;
  margin-bottom: 10px;
}

.btn-consult {
  width: 100%;
  height: 30px;
  border: none;
  border-radius: 16px;
  background: #eaf1ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-consult:hover {
  background: #2563eb;
  color: #fff;
}

/* ====== 健康咨询列表 ====== */
.health-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  border: 1px solid #edf1f8;
  box-shadow: 0 2px 10px rgba(30, 99, 240, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.health-item:hover {
  transform: translateX(3px);
  box-shadow: 0 6px 18px rgba(30, 99, 240, 0.1);
}

.health-cat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
  white-space: nowrap;
}

.health-cat i {
  font-size: 10px;
}

.cat-green { background: linear-gradient(135deg, #16a34a, #22c55e); }
.cat-blue { background: linear-gradient(135deg, #2563eb, #3b82f6); }
.cat-purple { background: linear-gradient(135deg, #7c3aed, #8b5cf6); }
.cat-orange { background: linear-gradient(135deg, #f59e0b, #f97316); }

.health-item-body {
  flex: 1;
  min-width: 0;
}

.health-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.health-summary {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.health-detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  transition: background 0.2s, transform 0.2s;
}

.health-detail-btn:hover {
  background: #2563eb;
  color: #fff;
  transform: translateX(2px);
}

.health-detail-btn i {
  font-size: 10px;
}

/* ====== 全部医师弹窗 ====== */
.doc-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.doc-modal {
  width: 720px;
  max-width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.25);
}

.doc-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eef2f7;
}

.doc-modal-head h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
}

.doc-modal-head h3 i {
  color: #2563eb;
  margin-right: 6px;
}

.doc-modal-close {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.doc-modal-close:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.doc-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 20px;
}

.doc-modal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.doc-modal-card {
  background: #fff;
  border: 1px solid #edf1f8;
  border-radius: 12px;
  padding: 14px 8px 12px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.doc-modal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(30, 99, 240, 0.12);
}

.doc-modal-tip {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
  font-size: 14px;
}

/* ====== 响应式 ====== */
@media (max-width: 600px) {
  .home-banner { height: 150px; }
  .banner-content h3 { font-size: 24px; letter-spacing: 2px; }
  .doctor-avatar { width: 64px; height: 64px; }
  .doc-modal-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
