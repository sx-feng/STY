<template>
  <div class="mining-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">我的矿机</span>
    </div>

    <!-- 主体卡片 -->
    <div class="mining-card">
      <!-- tab 按钮 -->
      <div class="btn-group">
        <button
          class="action-btn buy"
          :class="{ active: currentTab === 'buy' }"
          @click="currentTab = 'buy'"
        >
          购买
        </button>
        <button
          class="action-btn owned"
          :class="{ active: currentTab === 'owned' }"
          @click="currentTab = 'owned'"
        >
          已购
        </button>
      </div>

      <!-- tab 内容 -->
       <div class="tab-content">
        <!-- 购买 tab -->
        <div v-if="currentTab === 'buy'" class="list">
          <div class="machine-row" v-for="(item, i) in machines" :key="i">
            <div class="info">
              <div class="name">{{ item.name }}</div>
              <div class="time">租用时长：{{ item.days }}天</div>
            </div>
            <button class="buy-btn">抢购</button>
          </div>
        </div>

        <!-- 已购 tab -->
        <div v-else-if="currentTab === 'owned'" class="list">
          <div class="machine-row" v-for="(item, i) in ownedMachines" :key="i">
            <div class="info">
              <div class="name">{{ item.name }}</div>
              <div class="time">剩余使用时间：{{ item.remaining }}天</div>
            </div>
            <span class="status">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted  } from "vue"
import { useRouter } from "vue-router"
import { miningGet } from "@/utils/api"
import Notify from "@/utils/notifyInApp" 
const router = useRouter()
const currentTab = ref("buy") // 默认显示购买

// 返回上一级
const goBack = () => {
  router.go(-1)
}
// 模拟矿机购买数据
const machines = ref([
  { name: "FKS8型超级AI矿机", days: 1 },
  { name: "GHD5型AI智能矿机", days: 90 },
  { name: "BUR5型AI智能矿机", days: 90 },
  { name: "SUM型AI智能矿机", days: 90 },
  { name: "ARF9型AI智能矿机", days: 90 },
  { name: "AIS5型AI智能矿机", days: 82 },
  { name: "AI智能永久矿机", days: "永久" }
])

// 已购矿机（改为接口数据）
const ownedMachines = ref([])
// 已购矿机接口
const loadOwnedMachines = async () => {
  try {
    const res = await miningGet({})
    console.log("已购矿机接口返回:", res)

if (res.code === 200) {
  ownedMachines.value = (res.data || []).map(item => ({
    name: item.name || "未知矿机",
    remaining: item.remaining ?? "永久",
    status: item.status === 1 ? "使用中" : "已过期"
  }))
} else if (res.code === 400) {
  ownedMachines.value = [] // 清空列表
  // 不要提示 error，而是显示空状态
  // Notify.inApp({ type: "info", message: "暂无已购矿机" })
} else {
  Notify.inApp({ type: "error", message: res.message || "获取矿机失败" })
}
  } catch (e) {
    console.error("矿机接口异常:", e)
    Notify.inApp({ type: "error", message: "网络异常" })
  }
}



onMounted(() => {
  loadOwnedMachines()
})

</script>

<style scoped>
.mining-page {
  background: #000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
}

/* 顶部导航栏 */
.nav-bar {
  width: 86%;
  max-width: 480px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 16px;
  background: rgba(25, 25, 25, 0.95);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 0 0 12px 12px;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.back-btn {
  background: transparent;
  border: none;
  color: #FFD700;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-right: 12px;
}

.title {
  color: #FFD700;
  font-size: 18px;
  font-weight: bold;
}

/* 卡片 */
.mining-card {
  margin-top: 10px;
  background: rgba(25, 25, 25, 0.95);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 16px;
  padding: 30px 25px;
  width: 86%;
  max-width: 420px;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.2);
  backdrop-filter: blur(6px);
}

/* 按钮组 */
.btn-group {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.action-btn {
  flex: 1;
  padding: 8px 0;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid rgba(255, 215, 0, 0.4);
  transition: 0.3s;
}

/* 默认按钮样式 */
.action-btn.buy,
.action-btn.owned {
  background: linear-gradient(135deg, #222, #111);
  color: #FFD700;
}

/* 激活状态 */
.action-btn.active {
  background: linear-gradient(135deg, #FFD700, #FFB700);
  color: #000;
  border: none;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
}



/* 列表样式 */
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.machine-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(40, 40, 40, 0.9);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 10px;
  padding: 12px 15px;
  color: #fff;
}
.info .name {
  font-weight: bold;
  color: #FFD700;
}
.info .time {
  font-size: 13px;
  color: #ccc;
}
.buy-btn {
  background: linear-gradient(135deg, #FFD700, #FFB700);
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  color: #000;
  cursor: pointer;
  transition: 0.3s;
}
.buy-btn:hover {
  background: linear-gradient(135deg, #FFEA70, #FFC300);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}
.status {
  font-size: 14px;
  font-weight: bold;
  color: #00e676; /* 绿色表示使用中 */
}
</style>
