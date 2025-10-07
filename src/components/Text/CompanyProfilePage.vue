<template>
  <div class="info-page">
    <!-- 顶部固定返回栏 -->
    <div class="top-bar" @click="$router.back()">
      <span class="back-arrow"></span>
      <span class="back-text">返回</span>
    </div>

    <!-- 内容卡片 -->
    <div class="info-card">
      <h2>{{ title }}</h2>
      <div v-html="content"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { userCompany } from "@/utils/api"

// 标题和数据字段传入（每个页面自己设置）
const title = ref("公司简介")
const field = "companyProfile"

const content = ref("加载中...")

onMounted(async () => {
  const res = await userCompany({})
  const data = res.data?.data || res
  content.value = data[field] || "暂无内容"
})
</script>

<style scoped>
/* 整体黑金背景 */
.info-page {
  background: #000;
  min-height: 100vh;
  padding: 14px;
  color: #d4af37;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 顶部返回栏 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;   /* 改成视口宽度，确保铺满两边 */
  max-width: 100%; /* 禁止被容器限制 */
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
  margin: 70px auto 20px; /* 留出顶部栏的空间 */
  background: #111;
  border: 1px solid #d4af37;
  border-radius: 12px;
  padding: 0 10px;
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
/* ===== 自适应视频大小 ===== */
/* ✅ 使用 ::v-deep 让作用域穿透到 v-html 内容 */
::v-deep(.info-card video),
::v-deep(.info-card iframe) {
  display: block;
  width: 80%;
  max-width: 480px;
  height: auto;
  margin: 10px auto;
  border-radius: 12px;
  border: 1px solid #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

/* 悬停光效 */
::v-deep(.info-card video:hover),
::v-deep(.info-card iframe:hover) {
  box-shadow: 0 0 16px rgba(255, 215, 0, 0.5);
}

/* 移动端 */
@media (max-width: 480px) {
  ::v-deep(.info-card video),
  ::v-deep(.info-card iframe) {
    width: 95%;
    max-width: none;
  }
}


</style>