<template>
  <div class="detail-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">{{ $t('detail.title') }}</span>
    </div>

    <!-- 表头 -->
    <div class="thead">
      <span>{{ $t('detail.thead.index') }}</span>
      <span>{{ $t('detail.thead.coin') }}</span>
      <span>{{ $t('detail.thead.type') }}</span>
      <span>{{ $t('detail.thead.amount') }}</span>
      <span>{{ $t('detail.thead.time') }}</span>
      <span>{{ $t('detail.thead.balance') }}</span>
    </div>

    <!-- 滚动数据容器 -->
    <div class="table-body">
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
  </div>
</template>


<script setup>
import { ref ,onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { userMachineRecordList } from "@/utils/api"
const router = useRouter()

// 模拟数据，可以替换成接口返回的
// 收益详情数据
const list = ref([])
async function loadDetail(page = 1) {
  try {
    const res = await userMachineRecordList({  }) 
    console.log('收益详情全部',2222222222)
    console.log("【收益详情接口返回】", res)
    if (res.code === 200 && res.data?.records) {
      list.value = res.data.records.map((item) => ({
        coin: item.currency || 'STYAI',       
        type: item.machineName || '挖矿收益', 
        amount: Number(item.profitAmount || 0), 
        time: item.profitTime || '-',         
        balance: item.balance || 0           
      }))
    } else {
      list.value = []
    }
  } catch (err) {
    console.error("加载收益详情失败", err)
    list.value = []
  }
}
onMounted(() => {
  loadDetail()
})
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
   display: flex;
  flex-direction: column;
 height: 100vh;             /* 固定全屏 */
  overflow: hidden;          /* 禁止父容器滚动 */
}
/* 数据区域变成滚动框 */
.table-body {
  flex: 1; /* 占满剩余空间 */
  margin-left: 2%;
  width: 96%;
  max-height: 700px; /* 固定最大高度，可调整 */
  overflow-y: auto;  /* 开启滚动 */
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  margin-top: 10px;
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

/* 表头固定 */
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
