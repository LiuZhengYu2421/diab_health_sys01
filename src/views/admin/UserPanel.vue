<template>
  <div class="panel">
    <!-- 工具栏 -->
    <div class="panel-toolbar">
      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input v-model="keyword" placeholder="按用户名/昵称搜索" @keyup.enter="onSearch">
        <select v-model="roleFilter" class="cate-select" @change="onSearch">
          <option value="">全部角色</option>
          <option value="user">普通用户</option>
          <option value="doctor">医生</option>
          <option value="admin">管理员</option>
        </select>
        <select v-model="statusFilter" class="cate-select" @change="onSearch">
          <option value="">全部状态</option>
          <option value="0">正常</option>
          <option value="1">已删除</option>
        </select>
        <button class="btn btn-search" @click="onSearch">查询</button>
        <button class="btn btn-reset" @click="onReset">重置</button>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <i class="fa-solid fa-user-plus"></i>
        <span>新增用户</span>
      </button>
    </div>

    <!-- 表格 -->
    <div class="panel-table">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>角色</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id" :class="{ 'row-deleted': u.status === 1 }">
            <td>{{ u.id }}</td>
            <td class="cell-strong">
              {{ u.username }}
              <span v-if="isSelf(u)" class="self-tag">我</span>
            </td>
            <td>{{ u.nickname || '-' }}</td>
            <td>
              <span class="role-tag" :class="roleClass(u.role)">{{ roleName(u.role) }}</span>
            </td>
            <td>
              <span class="status-tag" :class="u.status === 1 ? 'status-del' : 'status-ok'">
                {{ u.status === 1 ? '已删除' : '正常' }}
              </span>
            </td>
            <td>{{ u.createdAt || '-' }}</td>
            <td class="cell-ops">
              <template v-if="u.status === 1">
                <button class="op-btn op-restore" @click="onRestore(u)">
                  <i class="fa-solid fa-rotate-left"></i>恢复
                </button>
              </template>
              <template v-else>
                <button class="op-btn" :disabled="isSelf(u)" @click="openRole(u)">
                  <i class="fa-solid fa-user-shield"></i>改角色
                </button>
                <button class="op-btn op-del" :disabled="isSelf(u)" @click="onDelete(u)">
                  <i class="fa-solid fa-trash"></i>删除
                </button>
              </template>
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="7" class="table-empty">加载中...</td>
          </tr>
          <tr v-else-if="!filteredUsers.length">
            <td colspan="7" class="table-empty">暂无用户数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="panel-tip">
      <i class="fa-solid fa-circle-info"></i>
      <span>用户删除为软删除（状态置为已删除），不会物理移除数据；已删除用户可点击「恢复」重新获得登录权限。当前登录的管理员账号不可被修改或删除。</span>
    </div>

    <!-- 新增用户弹窗 -->
    <div v-if="createOpen" class="modal-mask" @click.self="closeCreate">
      <div class="modal">
        <div class="modal-head">
          <h3>新增用户</h3>
          <i class="fa-solid fa-xmark modal-close" @click="closeCreate"></i>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="form-label required">用户名</label>
            <input v-model="createForm.username" class="form-input"
                   placeholder="3-20 位字母、数字、下划线或中文">
          </div>
          <div class="form-row">
            <label class="form-label required">密码</label>
            <input v-model="createForm.password" type="password" class="form-input"
                   placeholder="6-32 位">
          </div>
          <div class="form-row">
            <label class="form-label">昵称（可选，默认取用户名）</label>
            <input v-model="createForm.nickname" class="form-input" placeholder="请输入昵称">
          </div>
          <div class="form-row">
            <label class="form-label">角色</label>
            <select v-model="createForm.role" class="form-input">
              <option value="user">普通用户</option>
              <option value="doctor">医生</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-cancel" @click="closeCreate">取消</button>
          <button class="btn btn-primary" :disabled="saving" @click="onCreate">
            {{ saving ? '提交中...' : '确认新增' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 修改角色弹窗 -->
    <div v-if="roleOpen" class="modal-mask" @click.self="closeRole">
      <div class="modal modal-sm">
        <div class="modal-head">
          <h3>修改用户角色</h3>
          <i class="fa-solid fa-xmark modal-close" @click="closeRole"></i>
        </div>
        <div class="modal-body">
          <div class="role-target">
            <span>用户：</span>
            <b>{{ roleTarget?.username }}</b>
            <span class="role-tag" :class="roleClass(roleTarget?.role)">{{ roleName(roleTarget?.role) }}</span>
          </div>
          <div class="form-row">
            <label class="form-label required">目标角色</label>
            <select v-model="roleForm.role" class="form-input">
              <option value="user">普通用户</option>
              <option value="doctor">医生</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <p class="role-tip">角色变更后，该用户将立即获得/失去对应模块的访问权限。</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-cancel" @click="closeRole">取消</button>
          <button class="btn btn-primary" :disabled="saving" @click="onUpdateRole">
            {{ saving ? '提交中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUserRole,
  deleteAdminUser,
  restoreAdminUser
} from '@/api/admin'
import { useUserStore } from '@/stores/user'
import { showFloatingAlert } from '@/utils/alert'

const userStore = useUserStore()

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const keyword = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

const createOpen = ref(false)
const createForm = reactive({ username: '', password: '', nickname: '', role: 'user' })

const roleOpen = ref(false)
const roleTarget = ref(null)
const roleForm = reactive({ role: 'user' })

// 角色映射
const ROLE_MAP = {
  user: '普通用户',
  doctor: '医生',
  admin: '管理员'
}

function roleName(role) {
  return ROLE_MAP[role] || role || '-'
}

function roleClass(role) {
  return {
    user: 'role-user',
    doctor: 'role-doctor',
    admin: 'role-admin'
  }[role] || 'role-user'
}

function isSelf(u) {
  return String(u.id) === String(userStore.userInfo.id || userStore.userInfo.userId || '')
}

const filteredUsers = computed(() => {
  const kw = keyword.value?.trim().toLowerCase()
  return users.value.filter((u) => {
    const hitKw = !kw || (u.username || '').toLowerCase().includes(kw) || (u.nickname || '').toLowerCase().includes(kw)
    const hitRole = !roleFilter.value || (u.role || '') === roleFilter.value
    const hitStatus = statusFilter.value === '' || String(u.status ?? 0) === statusFilter.value
    return hitKw && hitRole && hitStatus
  })
})

async function load() {
  loading.value = true
  try {
    const data = await getAdminUsers()
    if (Array.isArray(data)) {
      users.value = data
    } else if (data && Array.isArray(data.list)) {
      users.value = data.list
    } else {
      users.value = []
    }
  } catch (e) {
    if (!e.handled) showFloatingAlert('加载失败：' + (e.message || '请稍后再试'), 'error')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  /* 前端过滤即可 */
}

function onReset() {
  keyword.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
}

// ---------- 新增用户 ----------
function openCreate() {
  Object.assign(createForm, { username: '', password: '', nickname: '', role: 'user' })
  createOpen.value = true
}

function closeCreate() {
  if (saving.value) return
  createOpen.value = false
}

async function onCreate() {
  const username = createForm.username?.trim()
  const password = createForm.password
  if (!username || !/^[\w\u4e00-\u9fa5-]{3,20}$/.test(username)) {
    showFloatingAlert('用户名需为 3-20 位字母、数字、下划线或中文', 'warning')
    return
  }
  if (!password || password.length < 6 || password.length > 32) {
    showFloatingAlert('密码长度需为 6-32 位', 'warning')
    return
  }
  saving.value = true
  try {
    await createAdminUser({
      username,
      password,
      nickname: createForm.nickname?.trim() || undefined,
      role: createForm.role
    })
    showFloatingAlert('用户添加成功', 'success')
    createOpen.value = false
    load()
  } catch (e) {
    if (!e.handled) showFloatingAlert('添加失败：' + (e.message || '请稍后再试'), 'error')
  } finally {
    saving.value = false
  }
}

// ---------- 修改角色 ----------
function openRole(u) {
  roleTarget.value = u
  roleForm.role = u.role || 'user'
  roleOpen.value = true
}

function closeRole() {
  if (saving.value) return
  roleOpen.value = false
}

async function onUpdateRole() {
  if (!roleTarget.value || roleForm.role === roleTarget.value.role) {
    closeRole()
    return
  }
  saving.value = true
  try {
    await updateAdminUserRole(roleTarget.value.id, roleForm.role)
    showFloatingAlert('角色修改成功', 'success')
    roleOpen.value = false
    load()
  } catch (e) {
    if (!e.handled) showFloatingAlert('修改失败：' + (e.message || '请稍后再试'), 'error')
  } finally {
    saving.value = false
  }
}

// ---------- 软删除 ----------
async function onDelete(u) {
  if (isSelf(u)) {
    showFloatingAlert('不能删除当前登录的账号', 'warning')
    return
  }
  if (!confirm(`确定删除用户「${u.username}」吗？删除后将无法登录，可随时恢复。`)) return
  try {
    await deleteAdminUser(u.id)
    showFloatingAlert('用户已删除', 'success')
    load()
  } catch (e) {
    if (!e.handled) showFloatingAlert('删除失败：' + (e.message || '请稍后再试'), 'error')
  }
}

// ---------- 恢复被软删除用户 ----------
async function onRestore(u) {
  if (!confirm(`确定恢复用户「${u.username}」的登录权限吗？`)) return
  try {
    await restoreAdminUser(u.id)
    showFloatingAlert('用户已恢复，可正常登录', 'success')
    load()
  } catch (e) {
    if (!e.handled) showFloatingAlert('恢复失败：' + (e.message || '请稍后再试'), 'error')
  }
}

onMounted(load)
</script>

<style scoped src="./panel-style.css"></style>

<style scoped>
.cate-select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  color: #334155;
  background: #fff;
}
.role-tag,
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}
.role-admin {
  background: #fef3c7;
  color: #b45309;
}
.role-doctor {
  background: #dcfce7;
  color: #16a34a;
}
.role-user {
  background: #dbeafe;
  color: #2563eb;
}
.status-ok {
  background: #f0fdf4;
  color: #16a34a;
}
.status-del {
  background: #fee2e2;
  color: #dc2626;
}
.self-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 11px;
  background: #fef3c7;
  color: #b45309;
}
.row-deleted {
  opacity: 0.55;
  background: #fafafa;
}
.op-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.op-disabled {
  font-size: 12px;
  color: #cbd5e1;
}
.op-restore {
  background: #f0fdf4;
  color: #16a34a;
}
.op-restore:hover {
  background: #dcfce7;
}
.panel-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
}
.panel-tip i {
  color: #2563eb;
}
.modal-sm {
  width: 440px;
}
.role-target {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 13px;
  color: #475569;
}
.role-target b {
  color: #1e293b;
}
.role-tip {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}
</style>
