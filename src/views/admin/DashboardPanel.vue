<template>
  <div class="dashboard-panel">
    <!-- 欢迎横幅 -->
    <div class="welcome-card">
      <div class="welcome-text">
        <h3>欢迎回来，{{ userStore.displayName }}</h3>
        <p>这里是智糖健康管理平台后台，按模块归属责任制进行统一运维管理。</p>
      </div>
      <div class="welcome-badge">
        <i class="fa-solid fa-shield-halved"></i>
        <span>管理员</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:#e0f2fe;color:#0284c7">
          <i class="fa-solid fa-user-doctor"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.doctors }}</div>
          <div class="stat-label">医生数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#dcfce7;color:#16a34a">
          <i class="fa-solid fa-newspaper"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.articles }}</div>
          <div class="stat-label">科普文章</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fef3c7;color:#d97706">
          <i class="fa-solid fa-disease"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.types }}</div>
          <div class="stat-label">糖尿病类型</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fce7f3;color:#db2777">
          <i class="fa-solid fa-users"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.users }}</div>
          <div class="stat-label">注册用户</div>
        </div>
      </div>
    </div>

    <!-- 职责分工说明 -->
    <div class="section-title">
      <i class="fa-solid fa-sitemap"></i>
      <span>后台管理职责分工（按模块归属责任制）</span>
    </div>
    <div class="role-grid">
      <div v-for="role in roles" :key="role.name" class="role-card">
        <div class="role-head">
          <i :class="role.icon" class="role-icon"></i>
          <div>
            <div class="role-name">{{ role.name }}</div>
            <div class="role-title">{{ role.title }}</div>
          </div>
        </div>
        <ul class="role-list">
          <li v-for="item in role.items" :key="item">{{ item }}</li>
        </ul>
        <div class="role-tag">{{ role.tag }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { getDoctors, getArticles, getDiabetesTypes, getAdminUsers } from '@/api/admin'
import { showFloatingAlert } from '@/utils/alert'

const userStore = useUserStore()

const stats = reactive({ doctors: '-', articles: '-', types: '-', users: '-' })

const roles = [
  {
    name: '核心数据运维管理员',
    title: '人员一（首页模块）',
    icon: 'fa-solid fa-database',
    tag: '公共内容运维',
    items: ['医生团队后台管理', '健康科普文章管理', '糖尿病类型管理']
  },
  {
    name: '用户账号与数据管理员',
    title: '人员二（个人中心模块）',
    icon: 'fa-solid fa-address-card',
    tag: '用户体系运维',
    items: ['用户账号管理', '用户健康风险数据管理', '打卡数据后台管理']
  },
  {
    name: '用户个性化资源管理员',
    title: '人员三（方案定制+健康资讯）',
    icon: 'fa-solid fa-heart-pulse',
    tag: '个性化业务运维',
    items: ['全局生活方案管理', '生活建议数据管理', '资讯收藏数据运维']
  },
  {
    name: 'AI 智能数据管理员',
    title: '人员四（智能助手+智能管理）',
    icon: 'fa-solid fa-robot',
    tag: '智能模块运维',
    items: ['AI 功能后台运维', 'AI 生成数据管理', '全局健康数据总览']
  }
]

async function loadStats() {
  try {
    const [doctors, articles, types, users] = await Promise.allSettled([
      getDoctors({ page: 1, pageSize: 1 }),
      getArticles({ page: 1, pageSize: 1 }),
      getDiabetesTypes({ page: 1, pageSize: 1 }),
      getAdminUsers()
    ])
    if (doctors.status === 'fulfilled') stats.doctors = doctors.value?.total ?? 0
    if (articles.status === 'fulfilled') stats.articles = articles.value?.total ?? 0
    if (types.status === 'fulfilled') stats.types = types.value?.total ?? 0
    if (users.status === 'fulfilled') {
      const u = users.value
      stats.users = Array.isArray(u) ? u.length : u?.total ?? 0
    }
  } catch (e) {
    if (!e.handled) showFloatingAlert('统计数据加载失败', 'error')
  }
}

onMounted(loadStats)
</script>

<style scoped>
.dashboard-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 26px;
  background: linear-gradient(120deg, #1e3a8a 0%, #2563eb 100%);
  border-radius: 14px;
  color: #fff;
}
.welcome-text h3 {
  margin: 0 0 6px;
  font-size: 19px;
}
.welcome-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}
.welcome-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 20px;
  font-size: 13px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}
.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-top: 4px;
}
.section-title i {
  color: #2563eb;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.role-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  position: relative;
}
.role-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.role-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}
.role-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.role-title {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
.role-list {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  font-size: 13px;
  line-height: 2;
}
.role-tag {
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  background: #f1f5f9;
  color: #64748b;
}
</style>
