<template>
    <div class="info-page">
      <!-- 功能按钮区 -->
      <div class="menu-grid">
        <div class="menu-item" v-for="(item, index) in menuList" :key="index">
          <span class="icon">{{ item.icon }}</span>
          <span class="text">{{ $t(item.label) }}</span>
        </div>
      </div>
  
      <!-- 白色卡片区 -->
      <div class="info-card">
      <p>{{ $t('info.playRule') }}： <span>{{ playDesc }}</span></p>
      <p>{{ $t('info.incomeRule') }}： <span>{{ incomeDesc }}</span></p>
    </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue"
import TopBar from "./TopBar.vue"
  
const menuList = ref([
  { icon: "🏠", label: "info.company" },
  { icon: "📘", label: "info.styIntro" },
  { icon: "🌐", label: "info.ecosystem" },
  { icon: "💰", label: "info.consensus" },
  { icon: "💳", label: "info.transfer" },
  { icon: "🔄", label: "info.trade" }
])
  
  // 后端传过来的说明内容
  const playDesc = ref("请输入...")
  const incomeDesc = ref("请输入...")
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
  