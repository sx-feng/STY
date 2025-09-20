<template>
  <div class="detail-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">动态理财详情</span>
    </div>

    <!-- 内容 -->
    <div class="content-card">
      <h3>当前收益情况</h3>
      <ul>
        <li>当前年化收益率：12%</li>
        <li>累计收益：300 USDT</li>
        <li>最新收益时间：2025-09-20 12:00:00</li>
      </ul>
    </div>

    <div class="content-card">
      <h3>收益记录</h3>
      <div class="thead">
        <span>时间</span>
        <span>金额</span>
        <span>类型</span>
      </div>
      <div class="row" v-for="(item,i) in list" :key="i">
        <span>{{ item.time }}</span>
        <span :class="item.amount>0?'income':'expense'">
          {{ item.amount>0? '+'+item.amount:item.amount }}
        </span>
        <span>{{ item.type }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
function goBack(){ router.go(-1) }

const list = ref([
  { time:"2025-09-20 12:00", amount:20, type:"收益" },
  { time:"2025-09-19 12:00", amount:18, type:"收益" },
  { time:"2025-09-18 12:00", amount:15, type:"收益" },
])
</script>

<style scoped>
.detail-page {
  background:#000;
  color:#FFD700;
  min-height:100vh;
  padding:15px;
  font-family:"Microsoft YaHei",sans-serif;
}
.nav-bar {
  display:flex;
  align-items:center;
  padding:12px;
  background:rgba(25,25,25,0.95);
  border-bottom:1px solid rgba(255,215,0,0.3);
  margin-bottom:15px;
  border-radius:0 0 12px 12px;
}
.back-btn {
  background:transparent;
  border:none;
  color:#FFD700;
  font-size:18px;
  margin-right:10px;
  cursor:pointer;
}
.title { font-size:18px; font-weight:bold; }
.content-card {
  background:rgba(25,25,25,0.95);
  border:1px solid rgba(255,215,0,0.3);
  border-radius:12px;
  padding:20px;
  margin-bottom:20px;
}
h3 { margin-bottom:12px; color:#FFD700; }
ul { padding-left:20px; color:#fff; }
.thead, .row {
  display:grid;
  grid-template-columns:1.5fr 1fr 1fr;
  padding:8px 0;
}
.thead { font-weight:bold; border-bottom:1px solid rgba(255,215,0,0.3); }
.row { color:#ddd; border-bottom:1px dashed rgba(255,255,255,0.1); }
.income { color:#00e676; }
.expense { color:#ff4d4f; }
</style>
