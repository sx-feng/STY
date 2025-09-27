<template>
  <div class="records-page">
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">节点会员收益记录</span>
    </div>

    <div class="thead">
      <span>序号</span>
      <span>币种</span>
      <span>类型</span>
      <span>数量</span>
      <span>时间</span>
      <span>状态</span>
    </div>

    <div class="table-body">
      <template v-if="list.length">
        <div v-for="(item,i) in list" :key="i" class="row">
          <span>{{ i+1 }}</span>
          <span>{{ item.coin || 'STYAI' }}</span>
          <span>{{ item.type || '收益' }}</span>
          <span class="income">{{ item.amount }}</span>
          <span>{{ item.time }}</span>
          <span>{{ item.status || '成功' }}</span>
        </div>
      </template>
      <div v-else class="empty">暂无记录</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { userPlatformFlowSelect } from "@/utils/api"

const router = useRouter()
const list = ref([])

// 加载收益明细（调用资金流水接口）
async function loadIncome() {
  const res = await userPlatformFlowSelect("purchase", {})
  if (res.ok && res.data?.code === 200) {
    list.value = res.data.data || []
  } else {
    list.value = []
  }
}
function goBack() { router.back() }

onMounted(() => {
  loadIncome()
})
</script>

<style scoped>
.records-page {
  background: #000;
  min-height: 100vh;
  color: #FFD700;
  padding: 20px;
}
.nav-bar {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(25,25,25,0.95);
  border-bottom: 1px solid rgba(255,215,0,0.3);
  margin-bottom: 10px;
  border-radius: 0 0 12px 12px;
}
.back-btn {
  background: transparent;
  border: none;
  color: #FFD700;
  font-size: 18px;
  margin-right: 10px;
  cursor: pointer;
}
.title { font-size: 18px; font-weight: bold; }
.thead, .row {
  display: grid;
  grid-template-columns: 0.6fr 1fr 1fr 1fr 1.4fr 1fr;
  padding: 10px;
}
.thead {
  font-weight: bold;
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,215,0,0.3);
}
.row {
  border-bottom: 1px dashed rgba(255,255,255,0.1);
}
.income { color: #00e676; }
.empty { text-align: center; padding: 20px; color: #aaa; }
</style>
