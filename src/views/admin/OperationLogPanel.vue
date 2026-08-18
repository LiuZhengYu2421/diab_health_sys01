<template>
  <div class="panel">
    <!-- 统计概览 -->
    <div class="log-stats">
      <div class="stat-card">
        <div class="stat-icon icon-total"><i class="fa-solid fa-list-check"></i></div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.total }}</div>
          <div class="stat-label">AI 运维记录</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-success"><i class="fa-solid fa-circle-check"></i></div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.success }}</div>
          <div class="stat-label">成功操作</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-fail"><i class="fa-solid fa-circle-xmark"></i></div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.fail }}</div>
          <div class="stat-label">失败操作</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-today"><i class="fa-solid fa-calendar-day"></i></div>
        <div class="stat-info">
          <div class="stat-num">{{ stats.today }}</div>
          <div class="stat-label">今日操作</div>
        </div>
      </div>
    </div>

    <!-- 搜索工具栏 -->
    <div class="panel-toolbar log-toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input v-model.trim="filters.keyword" placeholder="搜索用户 / 详情 / 描述" @keyup.enter="onSearch">
        </div>
        <select v-model="filters.type" class="filter-select">
          <option value="">全部类型</option>
          <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
        </select>
        <select v-model="filters.result" class="filter-select">
          <option value="">全部结果</option>
          <option value="success">成功</option>
          <option value="fail">失败</option>
        </select>
        <button class="btn btn-search" @click="onSearch"><i class="fa-solid fa-magnifying-glass"></i> 查询</button>
        <button class="btn btn-reset" @click="onReset"><i class="fa-solid fa-rotate-left"></i> 重置</button>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-primary" @click="loadLogs"><i class="fa-solid fa-rotate"></i> 刷新</button>
        <button class="op-del" @click="handleClear"><i class="fa-solid fa-trash-can"></i> 清空日志</button>
      </div>
    </div>

    <!-- 日志表格 -->
    <div class="log-card">
      <div class="log-table-wrap">
        <table class="table log-table">
          <thead>
            <tr>
              <th class="col-time">操作时间</th>
              <th class="col-user">操作用户</th>
              <th class="col-type">操作类型</th>
              <th>操作描述</th>
              <th class="col-detail">详情</th>
              <th class="col-result">结果</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!list.length">
              <td colspan="6">
                <div class="empty-state">
                  <i class="fa-solid fa-folder-open"></i>
                  <p>暂无 AI 功能运维记录</p>
                </div>
              </td>
            </tr>
            <tr v-for="log in list" :key="log.id" class="log-row">
              <td class="log-time">
                <i class="fa-regular fa-clock"></i>
                <span>{{ log.time }}</span>
              </td>
              <td>
                <div class="user-cell">
                  <span class="log-avatar" :class="{ 'is-admin': log.role === 'admin' }">{{ userInitial(log.user) }}</span>
                  <span class="user-name">{{ log.user }}</span>
                  <span v-if="log.role === 'admin'" class="admin-badge" title="管理员"><i class="fa-solid fa-shield-halved"></i></span>
                </div>
              </td>
              <td>
                <span class="type-tag" :class="typeClass(log.type)">
                  <i :class="typeIcon(log.type)"></i>{{ log.type }}
                </span>
              </td>
              <td class="log-desc">{{ log.action }}</td>
              <td class="log-detail" :title="log.detail">{{ log.detail }}</td>
              <td>
                <span class="result-badge" :class="log.result === 'success' ? 'result-ok' : 'result-fail'">
                  <i :class="log.result === 'success' ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
                  {{ log.result === 'success' ? '成功' : '失败' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pager">
        <span class="pager-info">共 <b>{{ total }}</b> 条记录</span>
        <div class="pager-btns">
          <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="pager-current">{{ page }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { showFloatingAlert } from '@/utils/alert'
import {
  getOperationLogs,
  clearOperationLogs,
  getOperationLogTypes,
  getRawOperationLogs
} from '@/utils/operationLog'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const filters = ref({ keyword: '', type: '', result: '' })
const typeOptions = getOperationLogTypes()

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

/* ---------- AI 运维类型样式映射 ---------- */
const TYPE_MAP = {
  'AI 咨询': { icon: 'fa-solid fa-robot', cls: 't-ai' },
  '方案生成': { icon: 'fa-solid fa-clipboard-list', cls: 't-plan' },
  '风险评测': { icon: 'fa-solid fa-shield-halved', cls: 't-risk' },
  '打卡': { icon: 'fa-solid fa-calendar-check', cls: 't-check' }
}

function typeIcon(type) {
  return TYPE_MAP[type]?.icon || 'fa-solid fa-circle-info'
}
function typeClass(type) {
  return TYPE_MAP[type]?.cls || 't-default'
}
function userInitial(name) {
  return (name || '游').charAt(0).toUpperCase()
}

/* ---------- 统计概览 ---------- */
const stats = ref({ total: 0, success: 0, fail: 0, today: 0 })

function loadStats() {
  const all = getRawOperationLogs()
  const todayStr = formatDate(new Date())
  stats.value = {
    total: all.length,
    success: all.filter((r) => r.result === 'success').length,
    fail: all.filter((r) => r.result === 'fail').length,
    today: all.filter((r) => (r.time || '').slice(0, 10) === todayStr).length
  }
}

function formatDate(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/* ---------- 数据加载 ---------- */
async function loadLogs() {
  const res = await getOperationLogs({
    page: page.value,
    pageSize,
    ...filters.value
  })
  list.value = res.list
  total.value = res.total
  if (page.value > totalPages.value) {
    page.value = 1
    await loadLogs()
    return
  }
  loadStats()
}

function changePage(p) {
  page.value = p
  loadLogs()
}

function onSearch() {
  page.value = 1
  loadLogs()
}

function onReset() {
  filters.value = { keyword: '', type: '', result: '' }
  page.value = 1
  loadLogs()
}

async function handleClear() {
  if (!confirm('确定要清空全部操作日志吗？该操作不可恢复！')) return
  clearOperationLogs()
  showFloatingAlert('操作日志已清空', 'success')
  page.value = 1
  loadLogs()
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped src="./panel-style.css"></style>

<style scoped>
/* ========== 统计概览 ========== */
.log-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e5eaf0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.05);
  transition: all 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 58, 95, 0.09);
}
.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  color: #fff;
  flex-shrink: 0;
}
.icon-total { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25); }
.icon-success { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 4px 10px rgba(22, 163, 74, 0.25); }
.icon-fail { background: linear-gradient(135deg, #f87171, #dc2626); box-shadow: 0 4px 10px rgba(220, 38, 38, 0.22); }
.icon-today { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 4px 10px rgba(217, 119, 6, 0.25); }
.stat-info { min-width: 0; }
.stat-num {
  font-size: 22px;
  font-weight: 800;
  color: #1e3a5f;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.stat-label { font-size: 12.5px; color: #7d8ba1; margin-top: 3px; }

/* ========== 工具栏 ========== */
.log-toolbar { gap: 10px; }
.toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; gap: 10px; }
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 34px;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.2s;
}
.search-box:focus-within {
  background: #fff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.search-box i { color: #94a3b8; font-size: 13px; }
.search-box input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  width: 180px;
  color: #1e293b;
}
.filter-select {
  height: 34px;
  padding: 0 10px;
  font-size: 13px;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

/* ========== 日志卡片与表格 ========== */
.log-card {
  background: #fff;
  border: 1px solid #e5eaf0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.05);
  overflow: hidden;
}
.log-table-wrap { overflow-x: auto; }
.log-table { margin-bottom: 0; }
.log-table thead th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 12.5px;
  letter-spacing: 0.3px;
}
.col-time { width: 175px; }
.col-user { width: 150px; }
.col-type { width: 110px; }
.col-detail { width: 160px; max-width: 160px; }
.col-result { width: 90px; }

.log-row { transition: background 0.15s; }
.log-row:hover { background: #f8fafc; }

.log-time {
  font-size: 12.5px;
  color: #64748b;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.log-time i { color: #94a3b8; margin-right: 6px; }

/* 用户列 */
.user-cell { display: flex; align-items: center; gap: 8px; }
.log-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  flex-shrink: 0;
}
.log-avatar.is-admin {
  background: linear-gradient(135deg, #fbbf24, #d97706);
  box-shadow: 0 0 0 2px #fef3c7;
}
.user-name { font-size: 13px; color: #334155; font-weight: 500; }
.admin-badge {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fbbf24;
  color: #fff;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 操作类型标签 */
.type-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.t-ai { background: #ede9fe; color: #6d28d9; }
.t-plan { background: #ffedd5; color: #c2410c; }
.t-risk { background: #fce7f3; color: #be185d; }
.t-check { background: #dcfce7; color: #15803d; }
.t-default { background: #f1f5f9; color: #475569; }

/* 描述 / 详情 */
.log-desc { font-size: 13px; color: #334155; }
.log-detail {
  font-size: 12.5px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

/* 结果徽章 */
.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.result-ok { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.result-fail { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

/* 空状态 */
.empty-state {
  padding: 46px 0;
  text-align: center;
  color: #b6c2d2;
}
.empty-state i { font-size: 36px; margin-bottom: 10px; }
.empty-state p { margin: 0; font-size: 13.5px; }

/* 分页 */
.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #eef2f7;
  background: #fafbfd;
}
.pager-info { font-size: 12.5px; color: #7d8ba1; }
.pager-info b { color: #2563eb; font-weight: 700; }
.pager-btns { display: flex; align-items: center; gap: 8px; }
.page-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #dbe2ea;
  background: #fff;
  border-radius: 8px;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pager-current {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  font-variant-numeric: tabular-nums;
  min-width: 56px;
  text-align: center;
}

/* 清空按钮 */
.op-del {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #fecaca;
  background: #fff;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.op-del:hover {
  background: #fef2f2;
  border-color: #f87171;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
}

@media (max-width: 900px) {
  .log-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .log-stats { grid-template-columns: 1fr; }
  .toolbar-right { width: 100%; justify-content: flex-end; }
}
</style>
