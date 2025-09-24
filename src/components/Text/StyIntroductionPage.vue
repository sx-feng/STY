<template>
  <div class="info-page">
    <!-- 顶部固定返回栏 -->
    <div class="top-bar" @click="$router.back()">
      <span class="back-arrow"></span>
      <span class="back-text">返回</span>
    </div>

    <!-- 内容卡片 -->
    <div class="info-card">
      <h2>STY介绍</h2>
      <div v-html="content"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { userCompany } from "@/utils/api"

const content = ref("加载中...")

onMounted(async () => {
  const res = await userCompany({})
  const data = res.data?.data || res.data || res
  content.value = data.styIntroduction || "暂无内容"
})
</script>

<style scoped>
/* 整体黑金背景 */
.info-page {
  background: #000;
  min-height: 100vh;
  color: #d4af37;
   padding: 14px;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 顶部返回栏 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 50px;
  background: #111;
  border-bottom: 1px solid #d4af37;
  display: flex;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
}

/* 箭头 */
.back-arrow {
  width: 10px;
  height: 10px;
  border-left: 2px solid #ffd700;
  border-bottom: 2px solid #ffd700;
  transform: rotate(45deg);
  margin-right: 8px;
}

/* 返回文字 */
.back-text {
  font-size: 14px;
  color: #ffd700;
  font-weight: bold;
}

/* 内容卡片 */
.info-card {
  width: 90%;
  max-width: 600px;
  margin: 70px auto 20px; /* 留出顶栏空间 */
  background: #111;
  border: 1px solid #d4af37;
  border-radius: 12px;
  padding: 20px;
  font-size: 14px;
  color: #d4af37;
  line-height: 1.6;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
}

.info-card h2 {
  margin-bottom: 16px;
  color: #ffd700;
  text-align: center;
}
</style>
