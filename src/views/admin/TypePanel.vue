<template>
  <div class="panel">
    <!-- 工具栏 -->
    <div class="panel-toolbar">
      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input v-model="keyword" placeholder="按类型名称搜索" @keyup.enter="onSearch">
        <button class="btn btn-search" @click="onSearch">查询</button>
        <button class="btn btn-reset" @click="onReset">重置</button>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <i class="fa-solid fa-plus"></i>
        <span>新增类型</span>
      </button>
    </div>

    <!-- 卡片列表 -->
    <div v-if="!loading && list.length" class="type-grid">
      <div v-for="row in list" :key="row.typeId" class="type-card">
        <div class="type-head">
          <img :src="row.img || '/img/t1.jpg'" class="type-img" alt="type">
          <div class="type-title-box">
            <div class="type-name">{{ row.typeName }}</div>
            <span class="type-id">ID: {{ row.typeId }}</span>
          </div>
          <div class="type-ops">
            <button class="op-btn" @click="openEdit(row)">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="op-btn op-del" @click="onDelete(row)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="type-body">
          <div class="type-item">
            <div class="type-item-label"><i class="fa-solid fa-dna"></i>发病机制</div>
            <div class="type-item-text">{{ row.pathogenesis || '暂无' }}</div>
          </div>
          <div class="type-item">
            <div class="type-item-label"><i class="fa-solid fa-notes-medical"></i>临床表现</div>
            <div class="type-item-text">{{ row.manifestation || '暂无' }}</div>
          </div>
          <div class="type-item">
            <div class="type-item-label"><i class="fa-solid fa-syringe"></i>治疗方案</div>
            <div class="type-item-text">{{ row.treatment || '暂无' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="panel-table">
      <div class="table-empty">加载中...</div>
    </div>
    <div v-else-if="!list.length" class="panel-table">
      <div class="table-empty">暂无类型数据</div>
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
          <h3>{{ form.typeId ? '编辑类型' : '新增类型' }}</h3>
          <i class="fa-solid fa-xmark modal-close" @click="closeModal"></i>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="form-label required">类型名称</label>
            <input v-model="form.typeName" class="form-input" placeholder="如：1型糖尿病">
          </div>
          <div class="form-row">
            <label class="form-label">图片地址</label>
            <input v-model="form.img" class="form-input" placeholder="如：/img/t1.jpg">
          </div>
          <div class="form-row">
            <label class="form-label">发病机制</label>
            <textarea v-model="form.pathogenesis" class="form-textarea" rows="3"
                      placeholder="发病机制说明"></textarea>
          </div>
          <div class="form-row">
            <label class="form-label">临床表现</label>
            <textarea v-model="form.manifestation" class="form-textarea" rows="3"
                      placeholder="临床表现说明"></textarea>
          </div>
          <div class="form-row">
            <label class="form-label">治疗方案</label>
            <textarea v-model="form.treatment" class="form-textarea" rows="3"
                      placeholder="治疗方案说明"></textarea>
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
import { getDiabetesTypes, createDiabetesType, updateDiabetesType, deleteDiabetesType } from '@/api/admin'
import { showFloatingAlert } from '@/utils/alert'

const list = ref([])
const loading = ref(false)
const saving = ref(false)
const page = ref(1)
const pageSize = 6
const total = ref(0)
const keyword = ref('')
const modalOpen = ref(false)
const form = reactive({
  typeId: null, typeName: '', img: '', pathogenesis: '', manifestation: '', treatment: ''
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

async function load() {
  loading.value = true
  try {
    const data = await getDiabetesTypes({ page: page.value, pageSize })
    let result = data?.list || []
    const kw = keyword.value?.trim()
    if (kw) {
      result = result.filter((t) => (t.typeName || '').includes(kw))
      total.value = result.length
    } else {
      total.value = data?.total || result.length
    }
    list.value = result
  } catch (e) {
    if (!e.handled) showFloatingAlert('加载失败：' + (e.message || '请稍后再试'), 'error')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1
  load()
}

function onReset() {
  keyword.value = ''
  onSearch()
}

function openCreate() {
  Object.assign(form, { typeId: null, typeName: '', img: '', pathogenesis: '', manifestation: '', treatment: '' })
  modalOpen.value = true
}

function openEdit(row) {
  Object.assign(form, {
    typeId: row.typeId,
    typeName: row.typeName || '',
    img: row.img || '',
    pathogenesis: row.pathogenesis || '',
    manifestation: row.manifestation || '',
    treatment: row.treatment || ''
  })
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

async function onSave() {
  if (!form.typeName?.trim()) {
    showFloatingAlert('请输入类型名称', 'warning')
    return
  }
  saving.value = true
  try {
    const payload = {
      typeName: form.typeName.trim(),
      img: form.img,
      pathogenesis: form.pathogenesis,
      manifestation: form.manifestation,
      treatment: form.treatment
    }
    if (form.typeId) {
      await updateDiabetesType(form.typeId, payload)
      showFloatingAlert('类型已更新', 'success')
    } else {
      await createDiabetesType(payload)
      showFloatingAlert('类型已新增', 'success')
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
  if (!confirm(`确定删除类型「${row.typeName}」吗？`)) return
  try {
    await deleteDiabetesType(row.typeId)
    showFloatingAlert('类型已删除', 'success')
    load()
  } catch (e) {
    if (!e.handled) showFloatingAlert('删除失败：' + (e.message || '请稍后再试'), 'error')
  }
}

onMounted(load)
</script>

<style scoped src="./panel-style.css"></style>

<style scoped>
.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.type-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.type-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(120deg, #f8fafc, #f1f5f9);
}
.type-img {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  object-fit: cover;
}
.type-title-box {
  flex: 1;
  min-width: 0;
}
.type-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.type-id {
  font-size: 12px;
  color: #94a3b8;
}
.type-ops {
  display: flex;
  gap: 4px;
}
.type-body {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.type-item-label {
  font-size: 12px;
  color: #2563eb;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
}
.type-item-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.modal-lg {
  width: 640px;
}
</style>
