<template>
    <div class="info-page">
      <!-- 功能按钮区 -->
      <div class="menu-grid">
        <div
  class="menu-item"
  v-for="(item, index) in menuList"
  :key="index"
  @click="$router.push(item.path)"
>
  <span class="icon">{{ item.icon }}</span>
  <span class="text" v-html="item.text"></span>
</div>
      </div>
  
      <!-- 白色卡片区 -->
    <div class="info-card">
      <p>
        {{ $t('info.playRule') }}：
        <span v-html="playDesc"></span>
      </p>
      <p>
        {{ $t('info.incomeRule') }}：
        <span v-html="incomeDesc"></span>
      </p>
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref,onMounted } from "vue"
import { userCompany } from "@/utils/api"
  
const menuList = ref([
])
  // 后端传过来的说明内容
  const playDesc = ref("请输入...")
  const incomeDesc = ref("请输入...")
  // 请求数据
async function loadConfig() {
  try {
  
    const res = await userCompany({})
    // 兼容后端返回结构
    const data = res.data || res

    menuList.value = [
    { icon: "🏠", text: "公司简介", path: "/company-profile" },
  { icon: "📘", text: "STY介绍", path: "/sty-introduction" },
  { icon: "🌐", text: "未来生态", path: "/future-ecosystem" },
  { icon: "💰", text: "币种共识", path: "/token-consensus" },
    ]

    playDesc.value = data.minerGameplayGuide || "暂无说明"
    incomeDesc.value = data.earningsDetails || "暂无说明"
  } catch (e) {
    console.error("加载配置失败:", e)
    playDesc.value = "加载失败"
    incomeDesc.value = "加载失败"
  }
}

onMounted(() => {
  loadConfig()
})
  </script>
  
  <style scoped>
  .info-page {
    background: #000;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }
  
  /* 按钮区 */
  .menu-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 50px;
    width: 90%;
    max-width: 400px;
    margin-top: 40px;
 
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border-radius: 30px;
    padding: 16px 30px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    color: #d4af37; /* 金色文字 */
  }
  
  .menu-item .icon {
    font-size: 18px;
  }
  
  /* 白色卡片 */
  .info-card {
    width: 80%;
    max-width: 400px;
    background: #fff;
    border-radius: 18px;
    padding: 20px;
    font-size: 14px;
    color: #333;
    line-height: 1.6;
  }
  </style>
  