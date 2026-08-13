<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>管理后台</h2>
      <p class="page-tip">当前角色：<span class="role-tag">管理员</span>，可管理平台用户数据</p>
    </div>

    <div class="admin-card">
      <div class="card-title">
        <i class="fa-solid fa-users"></i>
        <span>用户列表</span>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>角色</th>
            <th>注册时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.nickname || '-' }}</td>
            <td>
              <span class="role-tag" :class="u.role === 'admin' ? 'role-admin' : 'role-user'">
                {{ u.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
            </td>
            <td>{{ u.createdAt || '-' }}</td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="table-empty">加载中...</td>
          </tr>
          <tr v-else-if="!users.length">
            <td colspan="5" class="table-empty">暂无用户数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getAdminUsers } from '@/api/admin'
import { showFloatingAlert } from '@/utils/alert'

const users = ref([])
const loading = ref(false)

async function loadUsers() {
  loading.value = true
  try {
    const data = await getAdminUsers()
    users.value = Array.isArray(data) ? data : []
  } catch (e) {
    // 403 无权限等错误已在请求拦截器统一提示，页面不再重复弹窗
    if (!e.handled) {
      showFloatingAlert('加载失败：' + (e.message || '请稍后再试'), 'error')
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.admin-page {
  padding: 8px 4px;
}
.page-header h2 {
  margin: 0 0 8px;
  color: #1e293b;
}
.page-tip {
  margin: 0 0 16px;
  color: #64748b;
  font-size: 14px;
}
.role-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  background: #dbeafe;
  color: #2563eb;
}
.role-admin {
  background: #fef3c7;
  color: #b45309;
}
.admin-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 14px;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.admin-table th,
.admin-table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid #eef2f7;
}
.admin-table th {
  color: #64748b;
  font-weight: 500;
  background: #f8fafc;
}
.table-empty {
  text-align: center;
  color: #94a3b8;
  padding: 24px 0 !important;
}
</style>
