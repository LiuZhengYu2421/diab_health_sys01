<template>
  <div class="placeholder">
    <i class="fa-solid fa-hammer"></i>
    <h3>{{ title }}建设中</h3>
    <p>该功能正在加紧开发中，敬请期待～</p>
    <button class="placeholder-btn" @click="$router.push('/team')">
      <i class="fa-solid fa-house"></i> 返回首页
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title || '页面')
</script>

<style scoped>
.placeholder {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  background: #fff;
  border-radius: 18px;
}
.placeholder i {
  font-size: 56px;
  color: #c3cdde;
}
.placeholder h3 {
  font-size: 22px;
  color: #26314a;
}
.placeholder p {
  font-size: 14px;
  color: #93a0b8;
}
.placeholder-btn {
  margin-top: 10px;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: inherit;
}
.placeholder-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

@media (max-width: 480px) {
  .placeholder-content {
    padding: 30px 20px;
  }
  .placeholder-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
  }
  .placeholder-title {
    font-size: 18px;
  }
}
</style>
