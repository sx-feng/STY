<template>
  <div class="detail-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">收益详情</span>
    </div>

    <!-- 表头 -->
    <div class="thead">
      <span>序号</span>
      <span>币种</span>
      <span>交易类型</span>
      <span>收支</span>
      <span>时间</span>
      <span>余额</span>
    </div>

    <!-- 数据列表 -->
    <div v-for="(item, i) in list" :key="i" class="row">
      <span>{{ i + 1 }}</span>
      <span>{{ item.coin }}</span>
      <span>{{ item.type }}</span>
      <span :class="item.amount > 0 ? 'income' : 'expense'">
        {{ item.amount > 0 ? '+' + item.amount : item.amount }}
      </span>
      <span>{{ item.time }}</span>
      <span>{{ item.balance }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 模拟数据，可以替换成接口返回的
const list = ref([
  { coin: 'USDT', type: '挖矿收益', amount: 50, time: '2025-09-20 12:00:00',balance :'1' },
  { coin: 'STY', type: '矿机购买', amount: -30, time: '2025-09-19 15:30:00' ,balance :'1'},
  { coin: 'USDT', type: '团队奖励', amount: 10, time: '2025-09-18 10:20:00' ,balance :'1'},
  { coin: 'STY', type: '手续费', amount: -2, time: '2025-09-17 09:15:00',balance :'1'      }
])

function goBack() {
  router.go(-1)
}
</script>

<style scoped>
.detail-page {
  background: #000;
  color: #FFD700;
  min-height: 100vh;
  padding: 15px;
  font-family: "Microsoft YaHei", sans-serif;
 
}

/* 顶部导航 */
.nav-bar {
     margin-left: 2%;
 width: 90%;
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(25, 25, 25, 0.95);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  margin-bottom: 15px;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}
.back-btn {
  background: transparent;
  border: none;
  color: #FFD700;
  font-size: 18px;
  margin-right: 10px;
  cursor: pointer;
}
.back-btn:hover {
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.7);
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #FFD700;
}

/* 表格样式 */
.thead {
     margin-left: 2%;
    width: 90%;
  display: grid;
grid-template-columns: 0.6fr 1fr 1.2fr 0.8fr 1.6fr 1fr;
  gap: 8px;
  padding: 12px;
  color: #FFD700;
  font-weight: bold;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 8px;
}

.row {
  display: grid;
  grid-template-columns: 0.6fr 1fr 1.2fr 0.8fr 1.6fr 1fr;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #ddd;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
}
.row:last-child {
  border-bottom: none;
}

.income {
  color: #00e676; 
}
.expense {
  color: #ff4d4f; 
}
</style>
