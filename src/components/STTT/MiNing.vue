<template>
  <div class="mining-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">{{ $t('mining.title') }}</span>
    </div>

    <!-- 主体卡片 -->
    <div class="mining-card">
      <!-- tab 按钮 -->
      <div class="btn-group">
        <button class="action-btn buy" :class="{ active: currentTab === 'buy' }" @click="currentTab = 'buy'">
          {{ $t('mining.buy') }}
        </button>
        <button class="action-btn owned" :class="{ active: currentTab === 'owned' }" @click="currentTab = 'owned'">
          {{ $t('mining.owned') }}
        </button>
      </div>

      <!-- tab 内容 -->
      <div class="tab-content">
        <!-- 购买 tab -->
        <!-- 商品列表 -->
        <div v-if="currentTab === 'buy'" class="list">
<div class="machine-row" v-for="(item, i) in machines" :key="i">
  <!-- 左边 -->
  <div class="left">
    <div class="name">{{ item.name || $t('mining.unknown') }}</div>
    <div class="time">{{ $t('mining.rentTime') }}：{{ item.days }}</div>
  </div>

  <!-- 右边 -->
  <div class="right">
    <div class="price">¥{{ item.price }}</div>
    <button class="buy-btn" @click="buyMachine(item)">
      {{ $t('mining.buyBtn') }}
    </button>
  </div>
</div>


        </div>

        <!-- 已购列表 -->
        <div v-else-if="currentTab === 'owned'" class="list">
          <div class="machine-row" v-for="(item, i) in ownedMachines" :key="i">
            <div class="left">
              <div class="name">{{ item.name }}</div>
              <div class="bottom-info">
                <span class="price">投入：{{ item.amount }}</span>
                <span class="time">创建：{{ item.createTime }}</span>
              </div>
            </div>
            <span class="status">{{ $t(item.status) }}</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { miningGet, getAllMiningMachines, buyFinancialProduct } from "@/utils/api"
import Notify from "@/utils/notifyInApp"
import CallbackCenter from "@/utils/callbackCenter"
// 已经购买的使用状态
const statusTextMap = {
  0: "mining.status.running",
  1: "mining.status.expired",
  2: "mining.status.stopped"
}
const router = useRouter()
const currentTab = ref("buy") // 默认显示购买
const machines = ref([])   // 商品列表（购买 tab）
// 返回上一级
const goBack = () => { router.go(-1) }
// 已购矿机（改为接口数据）
const ownedMachines = ref([])

// 购买矿机接口
const buyMachine = async (item) => {
  console.log("准备购买矿机:", item)

  // 🔑 先触发二级密码弹窗
  CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
    try {
      const res = await buyFinancialProduct({
        machineId: item.id,
        num: "1",
        twoPassword: pwdMd5  // 带上二级密码(MD5)
      })

      if (res.data.code === 200) {
        Notify.inApp({ type: "success", message: res.data.message || `成功购买 ${item.name}` })
        await loadOwnedMachines()
        currentTab.value = "owned"
      } else {
        Notify.inApp({ type: "error", message: res.data.message || "购买失败" })
      }
    } catch (e) {
      console.error("购买接口异常:", e)
      Notify.inApp({ type: "error", message: "网络异常" })
    }
  })
}
// 矿机商品
const loadOwnedMachines = async () => {
  try {
    const res = await miningGet({})
    console.log("已购矿机接口返回:", res)

    if (res.data.code === 200) {
      ownedMachines.value = (res.data.data || []).map(item => ({
        name: item.machineName || "未知矿机",
        remaining: item.remaining ?? "-",
        // ✅ 这里安全取值
        status: statusTextMap[item.status] ?? "未知状态",
        amount: item.amount,
        createTime: item.createTime
      }))
    } else if (res.data.code === 400) {
      ownedMachines.value = []
    } else {
      Notify.inApp({ type: "error", message: res.data.message || "获取矿机失败" })
    }
  } catch (e) {
    console.error("矿机接口异常:", e)
    Notify.inApp({ type: "error", message: "网络异常" })
  }
}
// 加载商品列表
const loadMachines = async () => {
  try {
    const res = await getAllMiningMachines()
    console.log("商品接口返回:", res)

    if (res.data.code === 200) {
      machines.value = (res.data.data || []).map(item => {
        const unitMap = { DAY: "天", MONTH: "月", YEAR: "年", PERMANENT: "永久" }
        let days

        if (item.cycleType === "PERMANENT" || item.cycleDuration === "0") {
          days = "永久"
        } else {
          days = item.cycleDuration + (unitMap[item.cycleType] || "")
        }

        return {
          id: item.id,
          name: item.name || "未知矿机",
          days, // 已经拼接好
          price: item.price ?? 0,
          yieldRate: item.yieldRate
        }
      })
    } else {
      Notify.inApp({ type: "error", message: res.data.message || "加载商品失败" })
    }
  } catch (e) {
    console.error("商品接口异常:", e)
    Notify.inApp({ type: "error", message: "网络异常" })
  }
}

onMounted(() => {
  loadOwnedMachines()
  loadMachines()
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


/* 下方价格与时长一行显示 */
.bottom-info {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #ccc;
}

/* 购买按钮靠右垂直居中 */
.buy-btn {
  background: linear-gradient(135deg, #FFD700, #FFB700);
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  color: #000;
  cursor: pointer;
  transition: 0.3s;
  align-self: center;
}

.buy-btn:hover {
  background: linear-gradient(135deg, #FFEA70, #FFC300);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

/* 状态样式（右对齐居中） */
.status {
  font-size: 14px;
  font-weight: bold;
  color: #00e676;
  align-self: center;
}


/* 保持已有的 name 样式 */
.name {
  font-weight: bold;
  color: #FFD700;
  font-size: 15px;
}

/* 新增 price 样式（如果原来没有） */
.price {
  font-size: 15px;
  color: #FFD700;
  font-weight: bold;
  margin-right: 35%;
}

.left {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 左对齐 */
  flex: 1; /* 占据剩余空间 */
}

.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 右对齐 */
  gap: 6px;
}

</style>
