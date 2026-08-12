<template>
  <div class="content-page">
    <!-- 页面头部 -->
    <div class="page-head">
      <h2><i class="fa-solid fa-book-medical"></i> 健康科普</h2>
      <p>科学控糖知识库，助您全面了解糖尿病管理</p>
    </div>

    <!-- 分类筛选 -->
    <div class="cat-bar">
      <button class="cat-pill" :class="{ active: activeCat === '全部' }" @click="activeCat = '全部'">全部</button>
      <button v-for="cat in categories" :key="cat" class="cat-pill"
              :class="{ active: activeCat === cat }" @click="activeCat = cat">
        {{ cat }}
      </button>
    </div>

    <!-- 文章列表 -->
    <div class="article-list" id="articleList">
      <div v-for="art in pageItems" :key="art.title" class="article-card" @click="openArticle(art)">
        <div class="article-img">
          <img :src="art.img" alt="文章配图">
        </div>
        <div class="article-body">
          <span class="article-cat" :class="art.catClass">{{ art.cat }}</span>
          <h4>{{ art.title }}</h4>
          <p class="article-summary">{{ art.summary }}</p>
          <div class="article-meta">
            <span><i class="fa-solid fa-user"></i> {{ art.author }}</span>
            <span><i class="fa-solid fa-clock"></i> {{ art.date }}</span>
            <span><i class="fa-solid fa-eye"></i> {{ art.views }} 阅读</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" id="articlePagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button v-for="page in totalPages" :key="page"
              class="page-btn" :class="{ active: page === currentPage }" @click="currentPage = page">
        {{ page }}
      </button>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { showFloatingAlert } from '@/utils/alert'

const articles = [
  { img: '/img/a1.jpg', cat: '饮食', catClass: 'cat-green', title: '糖尿病患者秋季饮食指南', summary: '秋季气温变化大，控糖饮食需注意补水、保暖与血糖监测频率调整，本文为您详解秋季科学饮食要点……', author: '健康管理师', date: '08-10', views: '1.2k' },
  { img: '/img/a2.jpg', cat: '运动', catClass: 'cat-blue', title: '科学运动，平稳控糖', summary: '有氧运动与力量训练结合，每周 150 分钟中强度运动有助血糖平稳，运动前后注意哪些细节？……', author: '运动医学部', date: '08-08', views: '986' },
  { img: '/img/a3.jpg', cat: '监测', catClass: 'cat-orange', title: '血糖监测的正确打开方式', summary: '掌握空腹、餐后、睡前等关键时点的监测方法，记录血糖日记，让数据更有参考价值……', author: '内分泌科', date: '08-05', views: '2.4k' },
  { img: '/img/la1.png', cat: '用药', catClass: 'cat-purple', title: '口服降糖药用药须知', summary: '常见口服降糖药的服药时间、注意事项与副作用应对，科学用药避免误区……', author: '临床药师', date: '07-28', views: '1.8k' },
  { img: '/img/la2.png', cat: '饮食', catClass: 'cat-green', title: '低GI食物的正确选择', summary: '了解食物的升糖指数（GI），学会科学搭配主食与副食，平稳血糖从餐桌开始……', author: '营养科', date: '07-20', views: '1.5k' },
  { img: '/img/la3.png', cat: '监测', catClass: 'cat-orange', title: '连续血糖监测技术解读', summary: '动态血糖仪（CGM）如何使用、数据如何解读？一文带你了解血糖管理新科技……', author: '医学工程部', date: '07-15', views: '3.2k' },
  { img: '/img/la4.png', cat: '并发症', catClass: 'cat-purple', title: '糖尿病足的日常护理', summary: '糖尿病足是最常见的并发症之一，掌握足部检查与护理要点，预防从日常开始……', author: '创面修复科', date: '07-08', views: '2.1k' },
  { img: '/img/t1.jpg', cat: '运动', catClass: 'cat-blue', title: '适合糖友的居家运动', summary: '无需器械的居家运动方案，随时随地动起来，科学控糖不枯燥……', author: '运动医学部', date: '06-30', views: '1.6k' }
]

const pageSize = 3
const activeCat = ref('全部')
const currentPage = ref(1)

const categories = computed(() => [...new Set(articles.map((a) => a.cat))])
const filtered = computed(() =>
  activeCat.value === '全部' ? articles : articles.filter((a) => a.cat === activeCat.value)
)
const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize))
const pageItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch(activeCat, () => {
  currentPage.value = 1
})

function openArticle(art) {
  showFloatingAlert('正在打开《' + art.title + '》…', 'info')
}
</script>

<style scoped>
.content-page {
  background: #eef3fa;
  min-height: 100%;
  border-radius: 18px;
}
</style>
