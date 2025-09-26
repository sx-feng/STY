<template>
  <div class="records-page">
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">{{ $t('finance.sellRecord') }}</span>
    </div>

    <div class="thead">
      <span>{{ $t('records.index') }}</span>
      <span>{{ $t('records.coin') }}</span>
      <span>{{ $t('records.type') }}</span>
      <span>{{ $t('records.amount') }}</span>
      <span>{{ $t('records.time') }}</span>
      <span>{{ $t('records.status') }}</span>
    </div>

    <div class="table-body">
  <template v-if="list.length">
    <div v-for="(item,i) in list" :key="i" class="row">
      <span>{{ i+1 }}</span>
      <span>{{ item.coin }}</span>
      <span>{{ item.type }}</span>
      <span>{{ item.amount }}</span>
      <span>{{ item.time }}</span>
      <span>{{ item.status }}</span>
    </div>
  </template>
  <div v-else class="empty">{{ $t('records.empty') }}</div>
</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { styOrdersByType } from "@/utils/api"

const router = useRouter()
const list = ref([])

async function loadRecords() {
  const res = await styOrdersByType({ type: 2 }) // 2 卖出
  if (res.ok && res.data?.code === 200) {
    list.value = res.data.data || []
  } else {
    list.value = []
  }
}

onMounted(() => {
  loadRecords()
})

function goBack() {
  router.back()
}
</script>

<style scoped>
.records-page {
  background: #000;
  min-height: 100vh;
  color: #FFD700;
  padding: 15px;
  display: flex;
  flex-direction: column;
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

.title {
  font-size: 18px;
  font-weight: bold;
}

.thead {
  display: grid;
  grid-template-columns: 0.5fr 1fr 1fr 1fr 1.5fr 1fr;
  font-weight: bold;
  padding: 10px;
    width: 94%;
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,215,0,0.3);
}

.table-body {
  flex: 1;
  overflow-y: auto;
}

.row {
  display: grid;
  grid-template-columns: 0.5fr 1fr 1fr 1fr 1.5fr 1fr;
  padding: 8px 10px;
  border-bottom: 1px dashed rgba(255,255,255,0.1);
}

.income {
  color: #00e676;
}

.expense {
  color: #ff4d4f;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #aaa;
}
</style>

