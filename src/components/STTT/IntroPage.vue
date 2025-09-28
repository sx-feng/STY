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
     <!-- 公告按钮 -->
    <div class="notice-btn" @click="openNotice">
      📢 公告
    </div>

    <!-- 公告弹窗 -->
    <div v-if="showNotice" class="dialog-mask">
      <div class="dialog-box">
        <h3>📢 公告</h3>
        <div class="notice-content" v-html="noticeContent"></div>
        <button class="close-btn" @click="showNotice = false">关闭</button>
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref,onMounted } from "vue"
import { userCompany,getField } from "@/utils/api"
  
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
// 公告逻辑
const showNotice = ref(false)
const noticeContent = ref("暂无公告")
// 请求公告
async function loadNotice() {
  try {
    const res = await getField({})
    noticeContent.value = res?.data?.content || "暂无公告"
  } catch (e) {
    console.error("加载公告失败:", e)
    noticeContent.value = "公告加载失败"
  }
}
function openNotice() {
  loadNotice()
  showNotice.value = true
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
  /* 底部公告按钮 */
.notice-btn {
  margin-top: 20px;
  background: #f6c244;
  color: #000;
  font-weight: bold;
  padding: 10px 70px;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.25s;
}
.notice-btn:hover {
  background: #d6a520;
}

/* 弹窗遮罩 */
.dialog-mask {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

/* 弹窗主体 */
.dialog-box {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  width: 80%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}

.dialog-box h3 {
  margin-bottom: 12px;
  color: #333;
}

.notice-content {
  max-height: 300px;
  overflow-y: auto;
  text-align: left;
  font-size: 14px;
  color: #444;
  margin-bottom: 16px;
  line-height: 1.5;
}

/* 关闭按钮 */
.close-btn {
  background: #f6c244;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
.close-btn:hover {
  background: #d6a520;
}
  </style>
  