<template>
  <div class="pending-panel">
    <div class="pending-card">
      <div class="pending-icon">
        <i class="fa-solid fa-helmet-safety"></i>
      </div>
      <h3>{{ title }}</h3>
      <p class="pending-desc">{{ desc }}</p>

      <div class="pending-owner">
        <i class="fa-solid fa-user-shield"></i>
        <span>归属职责：{{ owner }}</span>
      </div>

      <div v-if="points.length" class="pending-points">
        <div class="points-title">规划功能</div>
        <div class="points-list">
          <span v-for="p in points" :key="p" class="point-item">
            <i class="fa-solid fa-circle-check"></i>
            {{ p }}
          </span>
        </div>
      </div>

      <div class="pending-note">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span>该模块后端管理接口待接入，敬请期待。</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '功能建设中' },
  owner: { type: String, default: '管理员' },
  desc: { type: String, default: '' },
  points: { type: Array, default: () => [] }
})
</script>

<style scoped>
.pending-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 480px;
}
.pending-card {
  width: 560px;
  max-width: 92%;
  background: #fff;
  border-radius: 16px;
  padding: 40px 36px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
}
.pending-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}
.pending-card h3 {
  margin: 0 0 10px;
  font-size: 20px;
  color: #1e293b;
}
.pending-desc {
  margin: 0 auto 18px;
  color: #64748b;
  font-size: 13.5px;
  line-height: 1.7;
  max-width: 460px;
}
.pending-owner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #475569;
  font-size: 13px;
  margin-bottom: 20px;
}
.pending-owner i {
  color: #2563eb;
}
.pending-points {
  text-align: left;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 20px;
}
.points-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 10px;
}
.points-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.point-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
}
.point-item i {
  color: #22c55e;
}
.pending-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fef3c7;
  color: #b45309;
  font-size: 13px;
}
.pending-note i {
  font-size: 14px;
}
</style>
