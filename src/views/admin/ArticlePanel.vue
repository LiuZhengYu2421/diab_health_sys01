<template>
  <div class="panel">
    <!-- 工具栏 -->
    <div class="panel-toolbar">
      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input v-model="keyword" placeholder="按标题搜索" @keyup.enter="onSearch">
        <select v-model="category" class="cate-select" @change="onSearch">
          <option value="">全部分类</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
        <button class="btn btn-search" @click="onSearch">查询</button>
        <button class="btn btn-reset" @click="onReset">重置</button>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <i class="fa-solid fa-plus"></i>
        <span>发布文章</span>
      </button>
    </div>

    <!-- 表格 -->
    <div class="panel-table">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>封面</th>
            <th>标题</th>
            <th>作者</th>
            <th>分类</th>
            <th>发布时间</th>
            <th>浏览量</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in list" :key="row.articleId">
            <td>{{ row.articleId }}</td>
            <td>
              <img :src="row.coverUrl || '/img/user_icon.png'" class="row-cover" alt="cover">
            </td>
            <td class="cell-strong cell-ellipsis" :title="row.title">{{ row.title }}</td>
            <td>{{ row.author || '-' }}</td>
            <td>
              <span class="cate-tag">{{ row.category || '未分类' }}</span>
            </td>
            <td>{{ row.publishTime || '-' }}</td>
            <td>{{ row.views ?? 0 }}</td>
            <td class="cell-ops">
              <button class="op-btn" @click="openEdit(row)">
                <i class="fa-solid fa-pen"></i>编辑
              </button>
              <button class="op-btn op-del" @click="onDelete(row)">
                <i class="fa-solid fa-trash"></i>删除
              </button>
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="8" class="table-empty">加载中...</td>
          </tr>
          <tr v-else-if="!list.length">
            <td colspan="8" class="table-empty">暂无文章数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pager">
      <span class="pager-info">共 {{ total }} 条</span>
      <button class="page-btn" :disabled="page <= 1" @click="page-- && load()">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <span class="pager-current">第 {{ page }} / {{ totalPages }} 页</span>
      <button class="page-btn" :disabled="page >= totalPages" @click="page++ && load()">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="modalOpen" class="modal-mask" @click.self="closeModal">
      <div class="modal modal-lg">
        <div class="modal-head">
          <h3>{{ form.articleId ? '编辑文章' : '发布文章' }}</h3>
          <i class="fa-solid fa-xmark modal-close" @click="closeModal"></i>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="form-label required">标题</label>
            <input v-model="form.title" class="form-input" placeholder="请输入文章标题">
          </div>
          <div class="form-row">
            <label class="form-label">封面地址</label>
            <input v-model="form.coverUrl" class="form-input" placeholder="如：/img/a1.jpg">
          </div>
          <div class="form-row">
            <label class="form-label">作者</label>
            <input v-model="form.author" class="form-input" placeholder="作者名">
          </div>
          <div class="form-row">
            <label class="form-label">分类</label>
            <select v-model="form.category" class="form-input">
              <option value="">请选择分类</option>
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">发布时间</label>
            <input v-model="form.publishTime" class="form-input" placeholder="如：2026-08-10 09:00:00">
          </div>
          <div class="form-row">
            <label class="form-label required">正文内容</label>
            <textarea v-model="form.content" class="form-textarea" rows="8"
                      placeholder="文章正文（Markdown 或富文本）"></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-cancel" @click="closeModal">取消</button>
          <button class="btn btn-primary" :disabled="saving" @click="onSave">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getArticles, getArticleCategories, createArticle, updateArticle, deleteArticle } from '@/api/admin'
import { showFloatingAlert } from '@/utils/alert'

const list = ref([])
const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const page = ref(1)
const pageSize = 8
const total = ref(0)
const keyword = ref('')
const category = ref('')
const modalOpen = ref(false)
const form = reactive({
  articleId: null, title: '', coverUrl: '', author: '', category: '',
  publishTime: '', content: ''
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

async function load() {
  loading.value = true
  try {
    const data = await getArticles({
      page: page.value,
      pageSize,
      keyword: keyword.value || undefined,
      category: category.value || undefined
    })
    list.value = data?.list || []
    total.value = data?.total || 0
    if (list.value.length === 0 && page.value > 1) {
      page.value = 1
      await load()
    }
  } catch (e) {
    if (!e.handled) showFloatingAlert('加载失败：' + (e.message || '请稍后再试'), 'error')
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const data = await getArticleCategories()
    categories.value = Array.isArray(data) ? data : []
  } catch (e) {
    /* 分类加载失败不阻塞 */
  }
}

function onSearch() {
  page.value = 1
  load()
}

function onReset() {
  keyword.value = ''
  category.value = ''
  onSearch()
}

function openCreate() {
  Object.assign(form, {
    articleId: null, title: '', coverUrl: '', author: '', category: '',
    publishTime: formatNow(), content: ''
  })
  modalOpen.value = true
}

function openEdit(row) {
  Object.assign(form, {
    articleId: row.articleId,
    title: row.title || '',
    coverUrl: row.coverUrl || '',
    author: row.author || '',
    category: row.category || '',
    publishTime: row.publishTime || '',
    content: row.content || ''
  })
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function formatNow() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

async function onSave() {
  if (!form.title?.trim()) {
    showFloatingAlert('请输入文章标题', 'warning')
    return
  }
  if (!form.content?.trim()) {
    showFloatingAlert('请输入正文内容', 'warning')
    return
  }
  saving.value = true
  try {
    const payload = {
      title: form.title.trim(),
      coverUrl: form.coverUrl,
      author: form.author,
      category: form.category,
      publishTime: form.publishTime,
      content: form.content
    }
    if (form.articleId) {
      await updateArticle(form.articleId, payload)
      showFloatingAlert('文章已更新', 'success')
    } else {
      await createArticle(payload)
      showFloatingAlert('文章已发布', 'success')
    }
    closeModal()
    load()
  } catch (e) {
    if (!e.handled) showFloatingAlert('保存失败：' + (e.message || '请稍后再试'), 'error')
  } finally {
    saving.value = false
  }
}

async function onDelete(row) {
  if (!confirm(`确定删除文章「${row.title}」吗？`)) return
  try {
    await deleteArticle(row.articleId)
    showFloatingAlert('文章已删除', 'success')
    load()
  } catch (e) {
    if (!e.handled) showFloatingAlert('删除失败：' + (e.message || '请稍后再试'), 'error')
  }
}

onMounted(() => {
  load()
  loadCategories()
})
</script>

<style scoped src="./panel-style.css"></style>

<style scoped>
.row-cover {
  width: 64px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}
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
.cate-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  background: #eff6ff;
  color: #2563eb;
}
.modal-lg {
  width: 640px;
}
</style>
