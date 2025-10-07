<template>
  <div class="records-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">资金流水明细</span>
    </div>

    <!-- 类型筛选 -->
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

    <!-- 表头 -->
    <div class="thead sticky">
      <span>序号</span>
      <span>币种</span>
      <span>资金类型</span>
      <span>数量</span>
      <span class="col-time">记录时间</span>
      <span>状态</span>
    </div>

    <!-- 表体 -->
    <div class="table-body" ref="scrollEl">
      <template v-if="list.length">
        <div v-for="(item, i) in list" :key="i" class="row">
          <span class="muted">{{ (page-1)*pageSize + i + 1 }}</span>
          <span class="ellipsis" @click="showFull(item.coin || item.currency || 'USDT')">
            {{ truncate(item.coin || item.currency || 'USDT') }}
          </span>
          <span class="ellipsis" @click="showFull(item.fundType || '—')">
            {{ truncate(item.fundType
 || '—') }}
          </span>
          <span
            :class="['ellipsis', (item.type==='recharge') ? 'income' : 'expense']"
            @click="showFull(formatAmount(item.amount))"
          >
            {{ formatAmount(item.amount) }}
          </span>
          <span class="col-time ellipsis" @click="showFull(formatTime(item.transactionTime ?? item.createdAt))">
            {{ formatTime(item.transactionTime ?? item.createdAt) }}
          </span>
          <span class="ellipsis" @click="showFull(item.status ?? '—')">
            {{ truncate(item.status ?? '—') }}
          </span>
        </div>

        <!-- 底部提示 -->
        <div class="list-footer">
          <span v-if="loadingMore">加载中…</span>
          <span v-else-if="finished">没有更多了</span>
        </div>
      </template>

      <div v-else class="empty">暂无记录</div>
    </div>

    <!-- 弹窗显示完整内容 -->
    <div v-if="showDialog" class="dialog-mask" @click="showDialog = false">
      <div class="dialog-box" @click.stop>
        <div class="dialog-content">{{ fullText }}</div>
        <button class="close-btn" @click="showDialog = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { userPlatformFlowSelect } from "@/utils/api"
import CallbackCenter from "@/utils/callbackCenter"

const router = useRouter()
const list = ref([])
const activeType = ref("all")
const types = [
  { label: "全部", value: "all" },
  { label: "充值", value: "recharge" },
  { label: "提现", value: "withdrawal" },
  { label: "购买", value: "purchase" },
  { label: "奖励", value: "reward" }
]
const page = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)
const scrollEl = ref(null)

// ==== 省略与弹窗 ====
const showDialog = ref(false)
const fullText = ref("")

function truncate(str) {
  if (!str) return "—"
  return str.length > 6 ? str.slice(0, 6) + "…" : str
}
function showFull(text) {
  fullText.value = text
  showDialog.value = true
}

// ==== 工具函数 ====
function formatTime(v) {
  if (!v) return '—'
  const d = new Date(v)
  if (isNaN(d)) return v
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function formatAmount(a) {
  const n = Number(a)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

// ==== 分页加载 ====
async function load(reset = false) {
  if (loading.value || loadingMore.value) return
  if (reset) {
    page.value = 1
    finished.value = false
    list.value = []
  }

  if (page.value === 1) loading.value = true
  else loadingMore.value = true

  try {
    const res = await userPlatformFlowSelect(activeType.value, { page: page.value, size: pageSize })
    const data = res?.data?.data
    const records = Array.isArray(data) ? data : data?.records || []
    total.value = data?.total || records.length
    list.value = page.value === 1 ? records : [...list.value, ...records]
    if (records.length < pageSize) finished.value = true
  } catch {
    finished.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function changeType(type) {
  if (activeType.value === type) return
  activeType.value = type
  load(true)
}
function goBack() { router.back() }

function onScroll(e) {
  const el = e.target
  if (finished.value || loadingMore.value) return
  const reachBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40
  if (reachBottom) {
    page.value++
    load(false)
  }
}

onMounted(() => {
  load(true)
  scrollEl.value?.addEventListener("scroll", onScroll, { passive: true })
  CallbackCenter.register("fundsUpdate", () => load(true))
})
onUnmounted(() => {
  scrollEl.value?.removeEventListener("scroll", onScroll)
  CallbackCenter.unregister("fundsUpdate")
})
</script>

<style scoped>
.records-page {
  background:#000; min-height:100vh; color:#FFD700;
  padding:25px; margin-top:60px; display:flex; flex-direction:column;
}
.nav-bar {
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

/* 表格 */
/* ======= 表格结构保持一致 ======= */

.thead {
  display: grid;
  width: 94%;
  grid-template-columns: 0.4fr 0.6fr 0.8fr 0.6fr 0.6fr 0.6fr;
  align-items: center;
  text-align: center;
  font-size: 13px;

}
.row {
   display: grid;
  grid-template-columns: 0.4fr 0.6fr 0.8fr 0.6fr 0.6fr 0.6fr;
  align-items: center;
  text-align: center;
  font-size: 13px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
  color: #f7f7f7;
  white-space: nowrap;
  overflow: hidden;
  line-height: 1.5;
  box-sizing: border-box;
  padding-left: 4%; /* ✅ 使用视口宽度做自适应偏移 */
}



.sticky { position:sticky; top:0; z-index:2; }

.table-body {
  flex:1;
  max-height: calc(100vh - 240px);
  overflow-y:auto;
  padding-right:6px;
  scrollbar-width: thin;
}
.table-body::-webkit-scrollbar{ width:8px; }
.table-body::-webkit-scrollbar-thumb{ background:rgba(255,215,0,.35); border-radius:8px; }


/* ✅ 溢出文字自动省略，列宽继承 grid 分配 */
.ellipsis {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  text-align: center; /* ✅ 表格内容居中，可改为 left 居左 */
  padding: 0 6px;     /* ✅ 仅在单元格内部留一点空隙，防止文字贴边 */
  box-sizing: border-box;
}


.muted { color:#c5b37a; }
.col-time { color:#ddb; }
.income { color:#00e676; }
.expense { color:#ff6b6b; }
.list-footer{ text-align:center; padding:10px; color:#c9b56a; }
.empty{ text-align:center; padding:20px; color:#aaa; }

/* 弹窗查看完整内容 */
.dialog-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; justify-content: center; align-items: center;
  z-index: 999;
}
.dialog-box {
  background: #111; border: 1px solid #ffd700; border-radius: 12px;
  padding: 20px; max-width: 80%; color: #ffd700;
  box-shadow: 0 0 20px rgba(255,215,0,0.4);
  text-align: center;
}
.dialog-content { margin-bottom: 14px; word-break: break-all; }
.close-btn {
  background: linear-gradient(90deg, #f6c244, #d6a520);
  border: none; border-radius: 8px; padding: 6px 16px;
  cursor: pointer; font-weight: 600; color: #000;
}
@media (max-width:420px){
  .thead,.row{ grid-template-columns:.6fr 1fr 1fr 1fr 1fr; }
  .col-time{ display:none; }
}
</style>
