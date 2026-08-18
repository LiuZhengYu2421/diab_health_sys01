<template>
  <div class="content-page mine-page">
    <div class="panel-content">
      <!-- 个人信息 -->
      <section v-if="panel === 'profile'" class="panel-card">
        <div class="card-head">
          <div class="card-title"><i class="fa-solid fa-id-card"></i> 个人资料</div>
          <button class="ghost-btn" @click="editing = !editing">
            <i :class="editing ? 'fa-solid fa-xmark' : 'fa-solid fa-pen'"></i>{{ editing ? '取消' : '编辑' }}
          </button>
        </div>

        <div class="profile-grid">
          <div class="profile-item">
            <span class="label">头像</span>
            <div class="avatar-line">
              <img class="mini-avatar" :src="profileForm.avatar || userStore.avatar" alt="头像" @error="avatarError">
              <div v-if="editing" class="avatar-options">
                <img v-for="a in avatarOptions" :key="a" :src="a" :class="{ active: (profileForm.avatar || userStore.avatar) === a }" @click="profileForm.avatar = a" @error="avatarError">
              </div>
            </div>
          </div>
          <div class="profile-item">
            <span class="label">昵称</span>
            <input v-if="editing" v-model="profileForm.nickname" class="text-input" maxlength="20" placeholder="请输入昵称">
            <span v-else class="value">{{ userStore.displayName }}</span>
          </div>
          <div class="profile-item">
            <span class="label">用户名</span>
            <span class="value">{{ userStore.userInfo.username || userStore.userInfo.userName || '—' }}</span>
          </div>
          <div class="profile-item">
            <span class="label">角色</span>
            <span class="value">{{ userStore.isAdmin ? '管理员' : '普通用户' }}</span>
          </div>
          <div class="profile-item">
            <span class="label">注册时间</span>
            <span class="value">{{ userStore.userInfo.createdAt || '—' }}</span>
          </div>
          <div class="profile-item">
            <span class="label">个性签名</span>
            <input v-if="editing" v-model="profileForm.desc" class="text-input" maxlength="30" placeholder="一句话介绍自己">
            <span v-else class="value">{{ userStore.displayDesc }}</span>
          </div>
        </div>

        <div v-if="editing" class="card-actions">
          <button class="primary-btn" @click="saveProfile"><i class="fa-solid fa-check"></i> 保存修改</button>
        </div>

        <div class="card-head pwd-head">
          <div class="card-title"><i class="fa-solid fa-key"></i> 修改密码</div>
        </div>
        <div class="pwd-form">
          <input v-model="pwdForm.oldPassword" type="password" class="text-input" placeholder="原密码">
          <input v-model="pwdForm.newPassword" type="password" class="text-input" placeholder="新密码（6-32 位）">
          <input v-model="pwdForm.confirmPassword" type="password" class="text-input" placeholder="确认新密码">
          <button class="primary-btn" @click="savePassword"><i class="fa-solid fa-lock"></i> 确认修改</button>
        </div>
      </section>

      <!-- 我的方案 -->
      <section v-else-if="panel === 'plan'" class="panel-card">
        <div class="card-head">
          <div class="card-title"><i class="fa-solid fa-clipboard-list"></i> 我的健康方案</div>
          <button class="ghost-btn" @click="loadScheme"><i class="fa-solid fa-rotate" :class="{ spinning: schemeLoading }"></i> 重新生成</button>
        </div>

        <div class="scheme-tabs">
          <button v-for="t in schemeTypes" :key="t" :class="{ active: schemeTab === t }" @click="switchSchemeTab(t)">{{ t }}方案</button>
        </div>

        <div v-if="schemeLoading" class="loading-view">
          <div class="loader"><span></span><span></span><span></span></div>
          <p>正在生成{{ schemeTab }}方案，请稍候…</p>
        </div>

        <div v-else-if="scheme" class="scheme-block">
          <div class="scheme-name">{{ scheme.name }}</div>
          <div class="scheme-desc">{{ scheme.desc }}</div>
          <div class="scheme-list">
            <div v-for="(item, i) in scheme.items" :key="i" class="scheme-item">
              <i :class="item.done ? 'fa-solid fa-circle-check done' : 'fa-regular fa-circle'"></i>
              <span class="scheme-time">{{ item.time }}</span>
              <span class="scheme-content">{{ item.content }}</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-view">
          <div class="empty-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
          <p>点击「重新生成」，AI 将结合您的健康档案生成个性化{{ schemeTab }}方案</p>
          <button class="primary-btn" @click="loadScheme"><i class="fa-solid fa-play"></i> 生成方案</button>
        </div>
      </section>

      <!-- 我的建议 -->
      <section v-else-if="panel === 'advice'" class="panel-card">
        <div class="card-head">
          <div class="card-title"><i class="fa-solid fa-heart-pulse"></i> 健康建议</div>
          <button class="ghost-btn" @click="loadAdvice"><i class="fa-solid fa-rotate" :class="{ spinning: adviceLoading }"></i> 刷新建议</button>
        </div>

        <div v-if="adviceLoading" class="loading-view">
          <div class="loader"><span></span><span></span><span></span></div>
          <p>正在为您生成健康建议，请稍候…</p>
        </div>

        <div v-else class="advice-groups">
          <div class="advice-group eat">
            <div class="group-title"><i class="fa-solid fa-bowl-food"></i> 饮食建议</div>
            <div class="advice-cards">
              <div v-for="(d, i) in adviceData.eat" :key="'eat' + i" class="advice-card eat">
                <div class="card-title-sm">{{ d.title }}</div>
                <div class="card-text">{{ d.content }}</div>
              </div>
            </div>
          </div>
          <div class="advice-group sport">
            <div class="group-title"><i class="fa-solid fa-dumbbell"></i> 运动建议</div>
            <div class="advice-cards">
              <div v-for="(d, i) in adviceData.sport" :key="'sport' + i" class="advice-card sport">
                <div class="card-title-sm">{{ d.title }}</div>
                <div class="card-text">{{ d.content }}</div>
              </div>
            </div>
          </div>
          <div class="advice-group daily">
            <div class="group-title"><i class="fa-solid fa-lightbulb"></i> 日常提醒</div>
            <div class="advice-cards">
              <div v-for="(d, i) in adviceData.daily" :key="'daily' + i" class="advice-card daily">
                <div class="card-title-sm">{{ d.title }}</div>
                <div class="card-text">{{ d.content }}</div>
              </div>
            </div>
          </div>
          <div class="advice-group pop">
            <div class="group-title"><i class="fa-solid fa-book-open"></i> 控糖科普</div>
            <div class="advice-cards">
              <div v-for="(p, i) in adviceData.popularization" :key="'pop' + i" class="advice-card pop">
                <div class="card-title-sm">{{ p.title }}</div>
                <div class="card-text">{{ p.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 打卡记录 -->
      <section v-else-if="panel === 'check'" class="panel-card">
        <div class="card-head">
          <div class="card-title"><i class="fa-solid fa-calendar-check"></i> 打卡记录</div>
          <div class="head-actions">
            <button class="ghost-btn" @click="loadPunch"><i class="fa-solid fa-rotate" :class="{ spinning: punchLoading }"></i> 刷新</button>
            <button class="ghost-btn add-btn" @click="openPunchDialog"><i class="fa-solid fa-plus"></i> 新增打卡</button>
          </div>
        </div>

        <div v-if="punchLoading" class="loading-view">
          <div class="loader"><span></span><span></span><span></span></div>
          <p>正在加载打卡记录，请稍候…</p>
        </div>

        <template v-else>
          <div class="punch-stats">
            <div class="stat-box"><div class="stat-num warn">{{ punchStats.streak }}</div><div class="stat-label">连续天数</div></div>
            <div class="stat-box"><div class="stat-num">{{ punchStats.monthCount }}</div><div class="stat-label">本月打卡</div></div>
            <div class="stat-box"><div class="stat-num success">{{ punchStats.totalCount }}</div><div class="stat-label">累计打卡</div></div>
          </div>

          <div v-if="punchRecords.length" class="record-list">
            <div v-for="r in punchRecords" :key="r.id" class="record-item">
              <i :class="typeIcon(r.punchType)" class="record-icon" :style="{ color: typeColor(r.punchType) }"></i>
              <div class="record-info">
                <div class="record-type">
                  {{ r.punchType }}
                  <span v-if="r.message" class="record-message">{{ r.message }}</span>
                </div>
                <div class="record-date">{{ r.punchDate || r.createTime || r.createdAt || '' }}</div>
              </div>
              <span class="status-badge" :class="{ ok: isDone(r.completionStatus) }">{{ formatStatus(r.completionStatus) }}</span>
              <button class="record-del" :disabled="punchDeleting" @click="removePunch(r)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>

          <div v-else class="empty-view">
            <div class="empty-icon"><i class="fa-solid fa-calendar-xmark"></i></div>
            <p>暂无打卡记录，快去完成今日打卡吧</p>
            <button class="primary-btn" @click="openPunchDialog"><i class="fa-solid fa-plus"></i> 新增打卡</button>
          </div>
        </template>
      </section>

      <!-- 新增打卡弹窗 -->
      <div v-if="punchDialog.show" class="punch-mask" @click.self="closePunchDialog">
        <div class="punch-dialog">
          <div class="punch-dialog-head">
            <h3><i class="fa-solid fa-calendar-plus"></i> 新增打卡</h3>
            <button class="close-btn" @click="closePunchDialog"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="punch-dialog-body">
            <div class="punch-form-item">
              <label>打卡类型</label>
              <div class="punch-type-group">
                <button
                  v-for="(m, key) in punchTypeMap"
                  :key="key"
                  class="punch-type-btn"
                  :class="{ on: punchForm.punchType === key }"
                  @click="punchForm.punchType = key"
                >
                  <i :class="m.icon" :style="{ color: m.color }"></i>
                  {{ key }}
                </button>
              </div>
            </div>
            <div class="punch-form-item">
              <label>完成状态</label>
              <div class="seg-group">
                <button class="seg" :class="{ on: punchForm.completionStatus === '已完成' }" @click="punchForm.completionStatus = '已完成'">已完成</button>
                <button class="seg" :class="{ on: punchForm.completionStatus === '未完成' }" @click="punchForm.completionStatus = '未完成'">未完成</button>
              </div>
            </div>
            <div class="punch-form-item">
              <label>备注</label>
              <input v-model.trim="punchForm.message" class="text-input" maxlength="50" placeholder="如：空腹血糖 5.6 mmol/L（选填）">
            </div>
          </div>
          <div class="punch-dialog-foot">
            <button class="cancel-btn" @click="closePunchDialog">取消</button>
            <button class="confirm-btn" :disabled="punchSubmitting" @click="submitPunch">
              <i class="fa-solid fa-check"></i> {{ punchSubmitting ? '提交中…' : '确认打卡' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 我的咨询 -->
      <section v-else-if="panel === 'consult'" class="panel-card">
        <div class="card-head">
          <div class="card-title"><i class="fa-solid fa-bookmark"></i> 我的咨询</div>
          <button class="ghost-btn" @click="loadFavorites"><i class="fa-solid fa-rotate"></i> 刷新</button>
        </div>

        <div v-if="favorites.length" class="fav-list">
          <div v-for="(f, i) in favorites" :key="i" class="fav-item" @click="openFavorite(f)">
            <div class="fav-icon"><i class="fa-solid fa-file-lines"></i></div>
            <div class="fav-info">
              <div class="fav-title">{{ f.title }}</div>
              <div class="fav-meta">
                <span v-if="f.category" class="fav-cat">{{ f.category }}</span>
                <span class="fav-date"><i class="fa-solid fa-clock"></i> {{ f.savedAt }}</span>
              </div>
            </div>
            <button class="fav-remove" @click.stop="removeFavorite(f.title)">
              <i class="fa-solid fa-bookmark"></i> 已收藏
            </button>
          </div>
        </div>

        <div v-else class="empty-view">
          <div class="empty-icon"><i class="fa-solid fa-bookmark"></i></div>
          <p>暂无收藏的健康咨询，去「健康咨询」收藏感兴趣的内容吧</p>
          <button class="primary-btn" @click="goConsult"><i class="fa-solid fa-newspaper"></i> 去健康咨询</button>
        </div>

        <!-- 收藏详情弹窗 -->
        <div v-if="favDetail.show" class="fav-detail-mask" @click.self="closeFavoriteDetail">
          <div class="fav-detail-dialog">
            <div class="detail-head">
              <h3><i class="fa-solid fa-file-lines"></i> {{ favDetail.title }}</h3>
              <button class="close-btn" @click="closeFavoriteDetail"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div v-if="favDetail.tags.length" class="detail-tags">
              <span v-for="(t, i) in favDetail.tags" :key="i" class="tag"><i class="fa-solid fa-tag"></i>{{ t }}</span>
            </div>
            <div class="detail-content" v-html="favDetail.content"></div>
            <div class="detail-foot">
              <button class="unfav-btn" @click="unfavFromDetail">
                <i class="fa-solid fa-bookmark"></i> 取消收藏
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 帮助中心 -->
      <section v-else-if="panel === 'help'" class="panel-card">
        <div class="card-head">
          <div class="card-title"><i class="fa-solid fa-circle-question"></i> 帮助中心</div>
        </div>
        <div class="faq-card">
          <div v-for="(f, i) in faqList" :key="i" class="faq-item" :class="{ open: openFaq === i }" @click="openFaq = openFaq === i ? -1 : i">
            <div class="faq-question">
              <span><i class="fa-solid fa-circle-question"></i>{{ f.q }}</span>
              <i class="fa-solid fa-angle-down faq-arrow"></i>
            </div>
            <div class="faq-answer"><p>{{ f.a }}</p></div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showFloatingAlert } from '@/utils/alert'
import { lifeScheme, healthTags, isMockMode } from '@/api/dify'
import { getPunchStats, getPunchRecords, createPunchRecord, deletePunchRecord } from '@/api/punchIn'
import { getConsultFavorites, removeConsultFavorite } from '@/utils/consultFavorites'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 仅接受已知面板，未知值回退到个人信息，避免显示空白
const VALID_PANELS = ['profile', 'plan', 'advice', 'check', 'consult', 'help']
const panel = computed(() => {
  const p = route.query.panel
  return p && VALID_PANELS.includes(p) ? p : 'profile'
})

function avatarError(e) {
  e.target.src = '/img/user_icon.png'
}

/* ========== 个人信息 ========== */
const editing = ref(false)
const profileForm = ref({ nickname: '', avatar: '', desc: '' })
const avatarOptions = ['/img/user_icon.png', '/img/user1.png', '/img/user2.png', '/img/user.jpg', '/img/p3.png']

watch(
  () => userStore.userInfo,
  (info) => {
    profileForm.value = {
      nickname: info.nickname || userStore.displayName,
      avatar: info.avatar || info.avatarUrl || '',
      desc: info.desc || ''
    }
    editing.value = false
  },
  { immediate: true }
)

async function saveProfile() {
  const nickname = profileForm.value.nickname.trim()
  if (!nickname) {
    showFloatingAlert('昵称不能为空', 'warning')
    return
  }
  try {
    await userStore.updateProfile({
      nickname,
      avatar: profileForm.value.avatar || undefined,
      desc: profileForm.value.desc.trim() || undefined
    })
    showFloatingAlert('个人资料已更新', 'success')
    editing.value = false
  } catch (e) {
    showFloatingAlert(e.message || '保存失败，请稍后重试', 'error')
  }
}

const pwdForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })

async function savePassword() {
  const { oldPassword, newPassword, confirmPassword } = pwdForm.value
  if (!oldPassword || !newPassword) {
    showFloatingAlert('请填写完整密码信息', 'warning')
    return
  }
  if (newPassword !== confirmPassword) {
    showFloatingAlert('两次输入的新密码不一致', 'warning')
    return
  }
  try {
    await userStore.changePassword({ oldPassword, newPassword })
    showFloatingAlert('密码修改成功', 'success')
    pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (e) {
    showFloatingAlert(e.message || '修改失败，请稍后重试', 'error')
  }
}

/* ========== 我的方案 ========== */
const schemeTypes = ['饮食', '运动']
const schemeTab = ref('饮食')
const scheme = ref(null)
const schemeLoading = ref(false)

function switchSchemeTab(t) {
  schemeTab.value = t
  scheme.value = null
  loadScheme()
}

async function loadScheme() {
  schemeLoading.value = true
  scheme.value = null
  try {
    const res = await lifeScheme({ type: schemeTab.value, userInfo: userStore.userInfo })
    const data = isMockMode() ? res : (res.data || res)
    scheme.value = data.scheme || data
  } catch (e) {
    showFloatingAlert('方案生成失败，请稍后重试', 'error')
  } finally {
    schemeLoading.value = false
  }
}

/* ========== 我的建议 ========== */
const adviceData = ref({ eat: [], sport: [], daily: [], popularization: [] })
const adviceLoading = ref(false)

async function loadAdvice() {
  adviceLoading.value = true
  try {
    const res = await healthTags({ userInfo: userStore.userInfo })
    const data = isMockMode() ? res : (res.data || res)
    adviceData.value = {
      eat: data.eat || [],
      sport: data.sport || [],
      daily: data.daily || [],
      popularization: data.popularization || []
    }
  } catch (e) {
    showFloatingAlert('建议加载失败，请稍后重试', 'error')
  } finally {
    adviceLoading.value = false
  }
}

/* ========== 打卡记录 ========== */
const punchStats = ref({ streak: 0, monthCount: 0, totalCount: 0 })
const punchRecords = ref([])
const punchLoading = ref(false)

const punchTypeMap = {
  '血糖监测': { icon: 'fa-solid fa-droplet', color: '#3b82f6' },
  '饮食': { icon: 'fa-solid fa-bowl-food', color: '#16a34a' },
  '运动': { icon: 'fa-solid fa-dumbbell', color: '#f59e0b' },
  '作息': { icon: 'fa-solid fa-moon', color: '#8b5cf6' }
}

// 新增打卡弹窗
const punchDialog = ref({ show: false })
const punchForm = ref({ punchType: '血糖监测', completionStatus: '已完成', message: '' })
const punchSubmitting = ref(false)
const punchDeleting = ref(false)

function openPunchDialog() {
  punchForm.value = { punchType: '血糖监测', completionStatus: '已完成', message: '' }
  punchDialog.value.show = true
}

function closePunchDialog() {
  if (punchSubmitting.value) return
  punchDialog.value.show = false
}

async function submitPunch() {
  if (!punchForm.value.punchType) {
    showFloatingAlert('请选择打卡类型', 'warning')
    return
  }
  punchSubmitting.value = true
  try {
    await createPunchRecord({
      punchType: punchForm.value.punchType,
      completionStatus: punchForm.value.completionStatus,
      message: punchForm.value.message || undefined
    })
    showFloatingAlert('打卡成功', 'success')
    await loadPunch()
    punchDialog.value.show = false
  } catch (e) {
    showFloatingAlert(e.message || '打卡失败，请稍后重试', 'error')
  } finally {
    punchSubmitting.value = false
  }
}

async function removePunch(r) {
  punchDeleting.value = true
  try {
    await deletePunchRecord(r.id)
    const idx = punchRecords.value.findIndex((x) => x.id === r.id)
    if (idx > -1) punchRecords.value.splice(idx, 1)
    punchStats.value.totalCount = Math.max(0, punchStats.value.totalCount - 1)
    showFloatingAlert('打卡记录已删除', 'success')
  } catch (e) {
    showFloatingAlert(e.message || '删除失败，请稍后重试', 'error')
  } finally {
    punchDeleting.value = false
  }
}

function typeIcon(type) {
  return (punchTypeMap[type] || { icon: 'fa-solid fa-check' }).icon
}
function typeColor(type) {
  return (punchTypeMap[type] || { color: '#64748b' }).color
}
function isDone(status) {
  return String(status) === '已完成' || Number(status) === 1 || status === true
}
function formatStatus(status) {
  return isDone(status) ? '已完成' : '未完成'
}

async function loadPunch() {
  punchLoading.value = true
  try {
    const [statsRes, recordsRes] = await Promise.all([getPunchStats(), getPunchRecords({ page: 1, pageSize: 50 })])
    const s = statsRes.data || statsRes || {}
    punchStats.value = { streak: s.streak || 0, monthCount: s.monthCount || 0, totalCount: s.totalCount || 0 }
    const r = recordsRes.data || recordsRes || {}
    punchRecords.value = r.list || r.records || r.rows || (Array.isArray(r) ? r : [])
  } catch (e) {
    showFloatingAlert('打卡记录加载失败，请稍后重试', 'error')
  } finally {
    punchLoading.value = false
  }
}

/* ========== 我的咨询（收藏） ========== */
const favorites = ref([])
const favDetail = reactive({ show: false, title: '', content: '', tags: [] })

function loadFavorites() {
  favorites.value = getConsultFavorites()
}

function openFavorite(f) {
  favDetail.show = true
  favDetail.title = f.title
  favDetail.content = f.content || '<p>该收藏内容为空。</p>'
  favDetail.tags = f.tags || []
}

function closeFavoriteDetail() {
  favDetail.show = false
}

function removeFavorite(title) {
  removeConsultFavorite(title)
  loadFavorites()
  if (favDetail.show && favDetail.title === title) favDetail.show = false
  showFloatingAlert('已取消收藏', 'info')
}

function unfavFromDetail() {
  removeConsultFavorite(favDetail.title)
  loadFavorites()
  favDetail.show = false
  showFloatingAlert('已取消收藏', 'info')
}

function goConsult() {
  router.push('/lifeadvice')
}

// 进入「我的咨询」面板时刷新收藏列表
watch(
  () => route.query.panel,
  (p) => {
    if (p === 'consult') loadFavorites()
  },
  { immediate: true }
)

// ========== 帮助中心 ==========
const faqList = [
  { q: '如何修改个人资料？', a: '进入「个人中心 → 个人信息」，点击「编辑」即可修改昵称、头像与个性签名，保存后立即生效。' },
  { q: '如何定制健康方案？', a: '在「个人中心 → 我的方案」或「方案定制」中填写个人信息与生活习惯，点击「生成方案」，AI 将结合您的信息生成个性化方案。' },
  { q: '如何查看打卡记录？', a: '在「个人中心 → 打卡记录」中可查看连续天数、本月打卡与累计打卡统计，以及全部打卡明细。' },
  { q: '如何修改登录密码？', a: '在「个人中心 → 个人信息」底部填写原密码与新密码，确认后即可完成修改。' },
  { q: '健康建议多久更新？', a: '健康建议由 AI 根据您的健康档案实时生成，可随时点击「刷新建议」获取最新内容。' },
  { q: '数据安全如何保障？', a: '您的健康数据仅用于个性化健康服务，平台采用登录认证机制保护账户信息安全。' }
]
const openFaq = ref(0)

</script>

<style scoped>
.mine-page {
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
/* 面板内容 */
.panel-content { flex: 1; min-height: 0; overflow-y: auto; padding-right: 4px; }
.panel-card {
  background: #fff; border-radius: 14px; padding: 20px;
  box-shadow: 0 2px 12px rgba(31, 45, 61, 0.06);
}
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: #1e3a5f; }
.card-title i { color: #2563eb; }
.card-actions { margin-top: 16px; }
.ghost-btn {
  padding: 7px 14px; border: 1px solid #dbeafe; border-radius: 8px;
  background: #eff6ff; color: #2563eb; font-size: 12.5px; cursor: pointer;
  transition: all 0.2s;
}
.ghost-btn:hover { background: #dbeafe; }
.primary-btn {
  padding: 9px 22px; border: none; border-radius: 20px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff; font-size: 13px; cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: transform 0.2s;
}
.primary-btn:hover { transform: translateY(-1px); }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 个人信息：自适应列数（容器 880px 下约 4 列，窄屏自动减少） */
.profile-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px 24px; }
.profile-item { display: flex; flex-direction: column; gap: 6px; }
.profile-item .label { font-size: 12px; color: #94a3b8; }
.profile-item .value { font-size: 14px; color: #1e293b; }
.text-input {
  padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 13.5px; color: #1e293b; outline: none; background: #f8fafc;
  transition: all 0.2s; width: 100%; box-sizing: border-box;
}
.text-input:focus { border-color: #2563eb; background: #fff; }
.avatar-line { display: flex; align-items: center; gap: 12px; }
.mini-avatar { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; border: 1px solid #e2e8f0; }
.avatar-options { display: flex; gap: 8px; flex-wrap: wrap; }
.avatar-options img {
  width: 44px; height: 44px; border-radius: 10px; object-fit: cover;
  border: 2px solid transparent; cursor: pointer; transition: all 0.2s;
}
.avatar-options img:hover { border-color: #93c5fd; }
.avatar-options img.active { border-color: #2563eb; box-shadow: 0 0 0 2px #dbeafe; }

.pwd-head { margin-top: 24px; }
.pwd-form { display: flex; gap: 10px; flex-wrap: wrap; }
.pwd-form .text-input { flex: 1; min-width: 160px; }

/* 我的方案 */
.scheme-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.scheme-tabs button {
  padding: 7px 20px; border: 1px solid #e2e8f0; border-radius: 18px;
  background: #f8fafc; color: #475569; font-size: 13px; cursor: pointer;
  transition: all 0.2s;
}
.scheme-tabs button.active { background: #2563eb; border-color: #2563eb; color: #fff; }
.scheme-name { font-size: 16px; font-weight: 700; color: #1e3a5f; }
.scheme-desc { font-size: 12.5px; color: #94a3b8; margin: 4px 0 14px; }
.scheme-list { display: flex; flex-direction: column; gap: 8px; }
.scheme-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 14px; background: #f8fafc; border-radius: 10px;
  border: 1px solid #eef2f7;
}
.scheme-item i { color: #cbd5e1; font-size: 16px; }
.scheme-item i.done { color: #16a34a; }
.scheme-time { font-size: 12px; color: #94a3b8; width: 110px; flex-shrink: 0; }
.scheme-content { font-size: 13.5px; color: #334155; flex: 1; }

/* 加载 / 空态 */
.loading-view { text-align: center; padding: 50px 30px; color: #64748b; font-size: 13px; }
.loader { display: flex; justify-content: center; gap: 6px; margin-bottom: 12px; }
.loader span {
  width: 8px; height: 8px; border-radius: 50%; background: #2563eb;
  animation: bounce 1.2s infinite ease-in-out;
}
.loader span:nth-child(2) { animation-delay: 0.15s; }
.loader span:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
.empty-view { text-align: center; padding: 50px 30px; color: #94a3b8; }
.empty-icon { font-size: 40px; color: #cbd5e1; margin-bottom: 12px; }
.empty-view p { font-size: 13.5px; margin-bottom: 16px; }

/* 我的建议 */
.advice-group { margin-bottom: 18px; }
.group-title { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 10px; }
.group-title i { margin-right: 6px; }
/* 各分组标题图标主题色 */
.advice-group.eat .group-title i { color: #16a34a; }
.advice-group.sport .group-title i { color: #d97706; }
.advice-group.daily .group-title i { color: #2563eb; }
.advice-group.pop .group-title i { color: #7c3aed; }

.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.advice-tag {
  padding: 6px 14px; border-radius: 16px; font-size: 12.5px;
  background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe;
}
.advice-tag.eat { background: #f0fdf4; color: #16a34a; border-color: #dcfce7; }
.advice-tag.sport { background: #fffbeb; color: #d97706; border-color: #fef3c7; }
.advice-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.advice-card {
  padding: 12px 14px; background: #f8fafc; border-radius: 10px;
  border: 1px solid #eef2f7;
}
/* 各分组卡片主题色 */
.advice-card.eat { background: #f0fdf4; border-color: #dcfce7; }
.advice-card.sport { background: #fffbeb; border-color: #fef3c7; }
.advice-card.daily { background: #eff6ff; border-color: #dbeafe; }
.advice-card.pop { background: #f5f3ff; border-color: #ede9fe; }
/* 各分组卡片标题主题色 */
.advice-card.eat .card-title-sm { color: #15803d; }
.advice-card.sport .card-title-sm { color: #b45309; }
.advice-card.daily .card-title-sm { color: #1d4ed8; }
.advice-card.pop .card-title-sm { color: #6d28d9; }
.card-title-sm { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 6px; }
.card-text { font-size: 12.5px; color: #64748b; line-height: 1.7; }

/* 打卡记录 */
.punch-stats { display: flex; gap: 12px; margin-bottom: 16px; }
.stat-box {
  flex: 1; text-align: center; padding: 16px 10px;
  background: #f8fafc; border-radius: 12px; border: 1px solid #eef2f7;
}
.stat-num { font-size: 26px; font-weight: 700; color: #2563eb; }
.stat-num.warn { color: #f59e0b; }
.stat-num.success { color: #16a34a; }
.stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
.record-list { display: flex; flex-direction: column; gap: 8px; }
.record-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 14px; background: #f8fafc; border-radius: 10px;
  border: 1px solid #eef2f7;
}
.record-icon { font-size: 16px; width: 20px; text-align: center; }
.record-info { flex: 1; min-width: 0; }
.record-type { font-size: 13.5px; color: #334155; font-weight: 500; }
.record-date { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.status-badge {
  padding: 4px 12px; border-radius: 14px; font-size: 12px;
  background: #fef2f2; color: #dc2626; white-space: nowrap;
}
.status-badge.ok { background: #f0fdf4; color: #16a34a; }

/* ========== 我的咨询（收藏） ========== */
.fav-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
}
.fav-item:hover {
  border-color: #dbeafe;
  background: #eff6ff;
}
.fav-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: #2563eb;
  font-size: 16px;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(31, 45, 61, 0.08);
}
.fav-info {
  flex: 1;
  min-width: 0;
}
.fav-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
.fav-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11.5px;
  color: #94a3b8;
}
.fav-cat {
  color: #2563eb;
  background: #eff6ff;
  padding: 1px 8px;
  border-radius: 8px;
}
.fav-remove {
  padding: 6px 12px;
  border: 1px solid #fde68a;
  border-radius: 16px;
  background: #fffbeb;
  color: #b45309;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.fav-remove:hover {
  background: #fef3c7;
}
.empty-view {
  text-align: center;
  padding: 48px 20px;
  color: #94a3b8;
}
.empty-view .empty-icon {
  font-size: 38px;
  color: #cbd5e1;
  margin-bottom: 12px;
}
.empty-view p {
  margin: 0 0 18px;
  font-size: 13px;
}
.loading-view {
  text-align: center;
  padding: 48px 20px;
  color: #94a3b8;
}

/* 收藏详情弹窗 */
.fav-detail-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.fav-detail-dialog {
  width: 620px;
  max-width: 92vw;
  max-height: 80vh;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.3);
}
.fav-detail-dialog .detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eef2f7;
}
.fav-detail-dialog .detail-head h3 {
  margin: 0;
  font-size: 16px;
  color: #1e3a5f;
}
.fav-detail-dialog .detail-head h3 i {
  color: #2563eb;
  margin-right: 6px;
}
.fav-detail-dialog .close-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.fav-detail-dialog .close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}
.fav-detail-dialog .detail-tags {
  padding: 14px 20px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.fav-detail-dialog .detail-tags .tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 12px;
  font-size: 12px;
}
.fav-detail-dialog .detail-content {
  flex: 1;
  padding: 14px 20px 18px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.9;
  color: #334155;
}
.fav-detail-dialog .detail-content :deep(p) {
  margin: 0 0 12px;
}
.fav-detail-dialog .detail-foot {
  display: flex;
  justify-content: flex-end;
  padding: 14px 20px;
  border-top: 1px solid #eef2f7;
  background: #f8fafc;
}
.fav-detail-dialog .unfav-btn {
  padding: 9px 24px;
  border: 1px solid #fde68a;
  border-radius: 20px;
  background: #fffbeb;
  color: #b45309;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s;
}
.fav-detail-dialog .unfav-btn:hover {
  background: #fef3c7;
}

/* ====== 打卡：头部操作按钮 ====== */
.head-actions {
  display: flex;
  gap: 8px;
}

.add-btn {
  background: #eff6ff;
  border-color: #dbeafe;
  color: #2563eb;
}

.add-btn:hover {
  background: #dbeafe;
}

/* ====== 打卡：备注 + 删除按钮 ====== */
.record-message {
  margin-left: 8px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 400;
}

.record-del {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: background 0.2s, color 0.2s;
}

.record-del:hover {
  background: #fee2e2;
  color: #ef4444;
}

.record-del:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ====== 新增打卡弹窗 ====== */
.punch-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.punch-dialog {
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.3);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.punch-dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eef2f7;
}

.punch-dialog-head h3 {
  margin: 0;
  font-size: 16px;
  color: #1e3a5f;
}

.punch-dialog-head h3 i {
  color: #2563eb;
  margin-right: 6px;
}

.punch-dialog-head .close-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.punch-dialog-head .close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.punch-dialog-body {
  padding: 18px 20px;
  overflow-y: auto;
}

.punch-form-item {
  margin-bottom: 16px;
}

.punch-form-item > label {
  display: block;
  font-size: 13px;
  color: #475569;
  margin-bottom: 8px;
  font-weight: 500;
}

.punch-type-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.punch-type-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.punch-type-btn:hover {
  border-color: #93c5fd;
}

.punch-type-btn.on {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
  font-weight: 600;
}

.punch-type-btn i {
  font-size: 14px;
}

.punch-form-item .seg-group {
  display: flex;
  gap: 10px;
}

.punch-form-item .seg {
  flex: 1;
  padding: 9px 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.punch-form-item .seg.on {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
  font-weight: 600;
}

.punch-dialog-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #eef2f7;
  background: #f8fafc;
}

.punch-dialog-foot .cancel-btn {
  padding: 9px 22px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  color: #64748b;
  font-size: 13.5px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.punch-dialog-foot .cancel-btn:hover {
  background: #f1f5f9;
}

.punch-dialog-foot .confirm-btn {
  padding: 9px 24px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 13.5px;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s;
}

.punch-dialog-foot .confirm-btn:hover {
  opacity: 0.9;
}

.punch-dialog-foot .confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
