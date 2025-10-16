<template>
  <div v-if="show" class="dialog-mask">
    <div class="dialog-box cancel-sell-box">
      <!-- 头部 -->
      <div class="dialog-header">
        <span class="dialog-title">🗑️ 取消出售订单</span>
        <span class="dialog-close" @click="close">×</span>
      </div>

      <!-- 内容 -->
      <div class="dialog-list" v-if="loading">加载中...</div>
      <div class="dialog-list" v-else-if="list.length === 0">暂无正在进行的出售订单</div>

      <div class="dialog-list" v-else>
        <div class="shop-item" v-for="item in list" :key="item.id">
          <div class="shop-info">
            <div class="shop-header">
              <span class="order-id">订单号：{{ item.id }}</span>
              <span>数量：<b>{{ item.styAmount }}</b> STY</span>
              <span class="status" :class="'status-' + item.orderStatus">
                {{ formatStatus(item.orderStatus) }}
              </span>
            </div>
            <div class="shop-row">
              <span>金额：<b>{{ item.usdtAmount }}</b> USDT</span>
              <button class="shop-buy" @click="cancelOrder(item)">取消出售</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import { styMyOrdersByType, styCancel } from "@/utils/api";
import CallbackCenter from "@/utils/callbackCenter";

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(["update:show", "refresh"]);

const list = ref([]);
const loading = ref(false);

// 当弹窗打开时加载数据
watch(
  () => props.show,
  async (val) => {
    if (val) loadOrders();
  }
);

// 加载进行中的出售订单
async function loadOrders() {
  loading.value = true;
  try {
    const res = await styMyOrdersByType(2); // 2 = 卖出订单
    console.log(res,"出售订单")
    if (res?.data?.code === 200 && Array.isArray(res.data.data)) {
      list.value = res.data.data;
    } else {
      list.value = [];
    }
  } catch (err) {
    console.error("加载出售订单失败", err);
    list.value = [];
  } finally {
    loading.value = false;
  }
}

// 点击取消出售
function cancelOrder(item) {
  if (!item.id) return;
  CallbackCenter.trigger("openTwoPasswordDialog", async (pwdMd5) => {
    const res = await styCancel({ orderId: item.id, twoPassword: pwdMd5 });
    if (res?.data?.code === 200) {
      alert("订单已取消成功");
      loadOrders();
      emit("refresh");
    } else {
      alert(res?.data?.message || "取消失败");
    }
  });
}

// 关闭弹窗
function close() {
  emit("update:show", false);
}

// 状态文字
function formatStatus(status) {
  switch (status) {
    case 0:
      return "待成交";
    case 1:
      return "已成交";
    case 2:
      return "已取消";
    default:
      return "未知";
  }
}
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.dialog-box {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  width: 88%;
  max-width: 420px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  animation: fadeInUp 0.25s ease-out;
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.dialog-title {
  font-weight: 600;
  font-size: 15px;
  color: #333;
}

.dialog-close {
  cursor: pointer;
  font-size: 22px;
  font-weight: bold;
  color: #888;
  transition: color 0.2s;
}
.dialog-close:hover {
  color: #000;
}

.dialog-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  font-size: 13px;
  color: #555;
}

.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.shop-info {
  flex: 1;
}
.shop-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
  color: #555;
}
.shop-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #555;
}
.shop-buy {
  width: 80px;
  height: 26px;
  background: linear-gradient(90deg, #f6d365, #fda085);
  color: #000;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.shop-buy:hover {
  background: linear-gradient(90deg, #ffe082, #ffc107);
}
.status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  color: #fff;
}
.status-0 {
  background: #f6c244;
}
.status-1 {
  background: #4caf50;
}
.status-2 {
  background: #f44336;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
