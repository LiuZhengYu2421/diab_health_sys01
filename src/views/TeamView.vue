<template>
  <div class="content-page">
    <!-- 页面头部 -->
    <div class="page-head">
      <h2><i class="fa-solid fa-user-doctor"></i> 专业医师团队</h2>
      <p>三甲医院内分泌科专家团队，为您的血糖健康保驾护航</p>
    </div>

    <!-- 团队横幅 -->
    <div class="team-banner">
      <div class="team-banner-text">
        <h3>智糖健康 · 名医团队</h3>
        <p>汇聚内分泌、营养、运动、中医等多学科专家，提供全周期健康管理</p>
      </div>
      <div class="team-banner-stats">
        <div class="banner-stat">
          <div class="banner-stat-num">{{ doctors.length }}+</div>
          <div class="banner-stat-label">专家医师</div>
        </div>
        <div class="banner-stat">
          <div class="banner-stat-num">15</div>
          <div class="banner-stat-label">年+经验</div>
        </div>
        <div class="banner-stat">
          <div class="banner-stat-num">10w+</div>
          <div class="banner-stat-label">服务患者</div>
        </div>
      </div>
    </div>

    <!-- 医师卡片 -->
    <div class="doctor-grid" id="doctorGrid">
      <div v-for="doc in pageItems" :key="doc.name" class="doctor-card">
        <div class="doctor-avatar">
          <img :src="doc.avatar" alt="医生头像">
        </div>
        <h4>{{ doc.name }}</h4>
        <p class="doctor-title">{{ doc.title }}</p>
        <p class="doctor-desc">{{ doc.desc }}</p>
        <span class="doctor-tag">{{ doc.tag }}</span>
        <button class="btn-consult" @click="handleConsult(doc.name)">
          <i class="fa-solid fa-comments"></i> 立即咨询
        </button>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" id="doctorPagination">
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
import { computed, ref } from 'vue'
import { showFloatingAlert } from '@/utils/alert'

const doctors = [
  { name: '李建华', avatar: '/img/doc1.jpg', title: '主任医师 · 内分泌科', desc: '从事糖尿病临床诊疗 25 年，擅长糖尿病及其并发症的综合管理。', tag: '专家推荐' },
  { name: '王志明', avatar: '/img/doc2.png', title: '副主任医师 · 内分泌科', desc: '专注糖尿病营养干预与生活方式管理，个性化治疗方案经验丰富。', tag: '营养管理' },
  { name: '陈慧敏', avatar: '/img/doc3.png', title: '主治医师 · 全科医学', desc: '擅长慢性病随访与患者教育，倡导"医患共管"的健康理念。', tag: '患者教育' },
  { name: '刘建国', avatar: '/img/user1.png', title: '主任医师 · 心血管内科', desc: '关注糖尿病心血管并发症防治，为患者提供多学科联合诊疗。', tag: '心脑防治' },
  { name: '孙晓芸', avatar: '/img/user2.png', title: '主治医师 · 营养科', desc: '专注糖尿病医学营养治疗，提供科学饮食结构与控糖配餐方案。', tag: '营养专家' },
  { name: '周文斌', avatar: '/img/user.jpg', title: '副主任医师 · 内分泌科', desc: '擅长胰岛素强化治疗与血糖精细化管理，临床经验 15 年。', tag: '血糖管理' },
  { name: '吴丽华', avatar: '/img/doc1.jpg', title: '主任医师 · 老年医学科', desc: '深耕老年糖尿病管理，关注慢病共存的综合评估与个体化照护。', tag: '老年慢病' },
  { name: '郑海涛', avatar: '/img/doc2.png', title: '主治医师 · 运动医学', desc: '以运动康复见长，制定科学运动处方，帮助患者平稳控糖。', tag: '运动康复' },
  { name: '林雅婷', avatar: '/img/doc3.png', title: '副主任医师 · 内分泌科', desc: '擅长糖尿病肾病与周围神经病变的早期筛查与干预治疗。', tag: '并发症防治' },
  { name: '郭宏达', avatar: '/img/user1.png', title: '主任医师 · 内分泌科', desc: '糖尿病精准诊疗专家，致力于基于数据驱动的个性化控糖方案。', tag: '专家推荐' },
  { name: '赵雪梅', avatar: '/img/user2.png', title: '主治医师 · 全科医学', desc: '专注糖尿病患者的心理疏导与生活方式干预，注重长期依从性。', tag: '心理支持' },
  { name: '黄志强', avatar: '/img/user.jpg', title: '副主任医师 · 中医内科', desc: '中西医结合治疗糖尿病，擅长中药调理与并发症的中医外治。', tag: '中医调理' }
]

const pageSize = 4
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(doctors.length / pageSize))
const pageItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return doctors.slice(start, start + pageSize)
})

function handleConsult(name) {
  showFloatingAlert('正在为您接通 ' + name + ' 医生，请稍候…', 'info')
}
</script>

<style scoped>
.content-page {
  background: #eef3fa;
  min-height: 100%;
  border-radius: 18px;
}
</style>
