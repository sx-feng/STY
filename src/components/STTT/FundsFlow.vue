<template>
  <div class="records-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">资金流水明细</span>
    </div>

    <!-- 类型筛选（四种） -->
    <div class="filter-bar">
      <button
        v-for="t in types"
        :key="t.value"
        :class="['filter-btn', { active: activeType === t.value }]"
        @click="changeType(t.value)"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 表头（粘在顶部） -->
    <div class="thead sticky">
      <span>序号</span>
      <span>币种</span>
      <span>类型</span>
      <span>数量</span>
      <span class="col-time">时间</span>
      <span>状态</span>
    </div>

    <!-- 可滚动的表体 -->
    <div class="table-body" ref="scrollEl">
      <template v-if="list.length">
        <div v-for="(item, i) in list" :key="i" class="row">
          <span class="muted">{{ (page-1)*pageSize + i + 1 }}</span>
          <span>{{ item.coin || item.currency || '—' }}</span>
          <span>{{ item.type || '—' }}</span>
          <span :class="(item.type==='recharge') ? 'income' : 'expense'">
            {{ formatAmount(item.amount) }}
          </span>
          <span class="col-time">{{ formatTime(item.time ?? item.createdAt) }}</span>
          <span>{{ item.status ?? '—' }}</span>
        </div>

        <!-- 底部提示 -->
        <div class="list-footer">
          <span v-if="loadingMore">加载中…</span>
          <span v-else-if="finished">没有更多了</span>
        </div>
      </template>

      <div v-else class="empty">暂无记录</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { userPlatformFlowSelect } from "@/utils/api"
import CallbackCenter from "@/utils/callbackCenter"

// ====== 基础状态 ======
const router = useRouter()
const list = ref([])

const activeType = ref("all")         // all | recharge | withdrawal | purchase
const types = [
  { label: "全部", value: "all" },
  { label: "充值", value: "recharge" },
  { label: "提现", value: "withdrawal" },
  { label: "购买", value: "purchase" }
]

// 分页 & 加载状态
const page = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)

const scrollEl = ref(null)

// ====== 数据加载 ======
async function load(reset = false) {
  if (loading.value || loadingMore.value) return
  if (reset) {
    page.value = 1
    finished.value = false
    list.value = []
  }

  // 首屏加载与翻页加载分离两个状态，避免按钮闪
  if (page.value === 1) loading.value = true
  else loadingMore.value = true

  try {
    const res = await userPlatformFlowSelect(activeType.value, {
      page: page.value,
      size: pageSize
    })
    const body = res?.data
    if (body?.code === 200) {
      const data = body.data
      const records = Array.isArray(data) ? data : (data?.records || [])
      total.value = Array.isArray(data) ? data.length : (data?.total || 0)

      list.value = page.value === 1 ? records : [...list.value, ...records]
      // 本页数量少于 pageSize，则认为已到底
      if (!records.length || records.length < pageSize) finished.value = true
    } else {
      if (page.value === 1) list.value = []
      finished.value = true
    }
  } catch (e) {
    console.error("资金流水加载失败:", e)
    if (page.value === 1) list.value = []
    finished.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 切换类型
function changeType(type) {
  if (activeType.value === type) return
  activeType.value = type
  load(true)
}

// 无限滚动：接近底部时翻页
function onScroll(e) {
  const el = e.target
  if (finished.value || loadingMore.value) return
  const reachBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40
  if (reachBottom) {
    page.value += 1
    load(false)
  }
}

// ====== 工具函数 ======
function formatTime(v) {
  if (v == null) return '—'
  let ts = v
  if (typeof v === 'string' && /^\d+$/.test(v)) ts = Number(v)
  if (typeof ts === 'number' && String(ts).length === 10) ts *= 1000
  const d = new Date(ts)
  if (isNaN(d.getTime())) return String(v)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function formatAmount(a) {
  const n = Number(a)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

function goBack() { router.back() }

// ===== 生命周期 =====
onMounted(() => {
  load(true)

  // 绑定滚动
  if (scrollEl.value) {
    scrollEl.value.addEventListener('scroll', onScroll, { passive: true })
  }
  // ✅ 注册全局回调：外部触发 fundsUpdate → 自动刷新
  CallbackCenter.register('fundsUpdate', () => {
    console.log("records-page 收到 fundsUpdate，刷新数据")
    load(true)
  })
})

onUnmounted(() => {
  if (scrollEl.value) {
    scrollEl.value.removeEventListener('scroll', onScroll)
  }
  CallbackCenter.unregister('fundsUpdate')
})
</script>

<style scoped>
.records-page{
  background:#000; min-height:100vh; color:#FFD700;
  padding:25px; margin-top:60px; display:flex; flex-direction:column;
}
.nav-bar{
  display:flex; align-items:center; padding:12px;
  background:rgba(25,25,25,.95); border-bottom:1px solid rgba(255,215,0,.3);
  margin-bottom:10px; border-radius:0 0 12px 12px;
}
.back-btn{ background:transparent; border:none; color:#FFD700; font-size:18px; margin-right:10px; cursor:pointer; }
.title{ font-size:18px; font-weight:700; }

/* 筛选 */
.filter-bar{ display:flex; gap:10px; margin:8px 0 12px; flex-wrap:wrap; }
.filter-btn{
  background:#1b1b1b; color:#ffd700; border:1px solid rgba(255,215,0,.3);
  padding:6px 12px; border-radius:999px; cursor:pointer;
}
.filter-btn.active{ background:#ffd700; color:#000; border-color:#ffd700; }

/* 表头 / 表体 */
.thead, .row{
  display:grid;
  grid-template-columns:.6fr 1fr 1fr 1fr 1.4fr 1fr;
  gap:8px; align-items:center; padding:10px;
}
.thead{
  font-weight:700; background:rgba(255,255,255,.05);
  border:1px solid rgba(255,215,0,.2); border-radius:10px; margin-bottom:6px;
}
.sticky{ position:sticky; top:0; z-index:2; }

/* 关键：滚动容器 */
.table-body{
  flex:1;
  max-height: calc(100vh - 240px); /* 视口内滚动，数值可按页面实际头部高度微调 */
  overflow-y:auto;
  padding-right:6px;
  scrollbar-width: thin;              /* Firefox */
}

/* 自定义滚动条（WebKit内核） */
.table-body::-webkit-scrollbar{ width:8px; }
.table-body::-webkit-scrollbar-track{ background:rgba(255,255,255,.05); border-radius:8px; }
.table-body::-webkit-scrollbar-thumb{
  background:rgba(255,215,0,.35); border-radius:8px;
  border:1px solid rgba(0,0,0,.3);
}
.table-body::-webkit-scrollbar-thumb:hover{ background:rgba(255,215,0,.55); }

.row{
  border-bottom:1px dashed rgba(255,255,255,.1);
  color:#f7f7f7;
}
.muted{ color:#c5b37a; }
.col-time{ color:#ddb; }

/* 金额颜色 */
.income{ color:#00e676; }
.expense{ color:#ff6b6b; }

/* 底部提示 */
.list-footer{
  text-align:center; padding:10px; color:#c9b56a;
}

/* 窄屏隐藏时间列 */
@media (max-width:420px){
  .thead,.row{ grid-template-columns:.6fr 1fr 1fr 1fr 1fr; }
  .col-time{ display:none; }
}

.empty{ text-align:center; padding:20px; color:#aaa; }
</style>
