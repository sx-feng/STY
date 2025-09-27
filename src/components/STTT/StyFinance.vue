<template>
  <div class="finance-page">

    <div class="top-actions">
      <button class="tab-btn active">📦 {{ $t('finance.styTreasure') }}</button>
      <button class="tab-btn">📒 {{ $t('finance.styIntro') }}</button>
    </div>

    <!-- 卡片1：理财产品 -->
    <div class="card">
      <!-- 动态理财 -->
      <div class="dynamic">
        <div class="dynamic-title">
          {{ $t('finance.dynamic') }}
          <a class="detail" href="javascript:void(0)" @click="goDynamicDetail">
            {{ $t('finance.detail') }}
          </a>
        </div>
        <table class="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>周期</th>
              <th>利率</th>
              <th>价格</th>
              <th>购买</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dynamicList" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.cycleDays }} 天</td>
              <td>{{ item.yieldRate }}%</td>
              <td>{{ item.price }}</td>
              <td>
                <button class="btn buy" @click="buyProduct(item.id, 'dynamic')">
                  {{ $t('finance.buy') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="gold-divider"></div>
  

      <!-- 静态理财 -->
      <div class="static">
        <div class="static-title">
          {{ $t('finance.static') }}
                    <a class="detail" href="javascript:void(0)" @click="goStaticDetail">
            {{ $t('finance.detail') }}
          </a>

        </div>
        <table class="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>周期</th>
              <th>利率</th>
              <th>价格</th>
              <th>购买</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in staticList" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.cycleDays }} 天</td>
              <td>{{ item.yieldRate }}%</td>
              <td>{{ item.price }}</td>
              <td>
                <button class="btn buy" @click="buyProduct(item.id, 'static')">
                  {{ $t('finance.buy') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 卡片2：买卖 STY -->
    <div class="card card-actions">
      <div class="buy-sell">
        <!-- 出售 STY 按钮 -->
        <button class="btn sell" @click="openSellDialog">
          {{ $t('finance.sell') }}
        </button>
      </div>

      <div class="record">
        <div class="record-box" @click="goBuyRecord">
          {{ $t('finance.buyRecord') }}
        </div>
        <div class="record-box" @click="goSellRecord">
          {{ $t('finance.sellRecord') }}
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="shop">
        <div class="shop-item" v-for="(item, index) in shopList" :key="index">
          <div class="shop-info">
            <div class="shop-name">{{ item.name }}</div>
            <div class="shop-price">{{ item.price }} STY</div>
          </div>
          <button class="btn buy" @click="buyItem(item)">
            {{ $t('finance.buy') }}
          </button>
        </div>
      </div>
    </div>

   <!-- 出售 STY 弹窗 -->
<div v-if="showSellDialog" class="dialog-mask">
  <div class="dialog-box sell-box">
    <!-- 当前单价 -->
    <div class="sell-header">
      当前单价：<span class="price-value">{{ unitPrice }}</span> <span class="unit">USDT</span>
    </div>

    <!-- 出售数量输入 -->
    <div class="sell-input">
      <label>出售数量：</label>
      <input type="number" v-model="sellAmount" />
      <span class="unit">STY</span>
      <span class="max-btn" @click="sellAmount=available">全部</span>
    </div>

    <!-- 信息展示 -->
    <div class="sell-info">
      <div class="info-row">
        <span>可用</span>
        <span>{{ available }} STY</span>
      </div>
      <div class="info-row">
        <span>手续费</span>
        <span>{{ fee }} STY</span>
      </div>
      <div class="info-row highlight">
        <span>可得</span>
        <span>{{ receiveUSDT }} USDT</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="dialog-actions">
      <button @click="confirmSell" class="sell-confirm">出售 STY</button>
      <button @click="showSellDialog=false" class="sell-cancel">取消</button>
    </div>
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import router from '@/router';
import { stySell ,styExchangeRate,getProductAllStatic,getProductAllSynamic} from '@/utils/api'
const showSellDialog = ref(false)
const sellAmount    = ref(1)   // 默认 1 避免空请求

// 弹窗字段
const unitPrice   = ref(0)
const available   = ref(0)
const fee         = ref(0)
const netProceeds = ref(0)

const receiveUSDT = computed(() => Number(netProceeds.value || 0).toFixed(2))

function fillQuote(p = {}) {
  unitPrice.value   = Number(p.currentUnitPrice ?? 0)
  fee.value         = Number(p.fee ?? 0)
  available.value   = Number(p.sellQuantity ?? 0)
  netProceeds.value = Number(p.netProceeds ?? 0)
}
function resetQuote() { fillQuote({}) }

function openSellDialog() {
  showSellDialog.value = true
  calcRate() }

// 确认出售
async function confirmSell() {
  const amt = Number(sellAmount.value)
  if (!Number.isFinite(amt) || amt <= 0) {
    alert('请输入有效的出售数量')
    return
  }
  try {
    const res = await stySell({ amount: amt })
    const body = res?.data
    if (body?.code === 200) {
      fillQuote(body.data)
      alert(`出售成功: ${amt} STY`)
      showSellDialog.value = false
      sellAmount.value = 1
    } else {
      alert(body?.message || '出售失败')
    }
  } catch (e) {
    console.error('卖出异常:', e)
    alert(e.message || '出售失败')
  }
}

// 获取报价（calcRate）
async function calcRate() {
  try {
    const res = await styExchangeRate({ styNum: Number(sellAmount.value || 1) })
    const body = res?.data
    if (body?.code === 200) {
      fillQuote(body.data)
    } else {
      resetQuote()
      console.warn('兑换汇率失败:', body?.message)
    }
  } catch (e) {
    resetQuote()
    console.error('兑换汇率异常:', e)
  }
}


const shopList = [
  { name: "STY 礼包 A", price: 100 },
  { name: "STY 礼包 B", price: 200 },
  { name: "STY 礼包 C", price: 500 },
  { name: "STY 礼包 D", price: 1000 },
  { name: "STY 礼包 E", price: 2000 }
]
function buyItem(item) {
  alert(`购买成功: ${item.name}, 花费 ${item.price} STY`)
}

function goDynamicDetail() {
  router.push("/dynamic")
}

function goStaticDetail() {
  router.push("/statuc")
}

function goBuyRecord() {
  router.push("/buy")
}

function goSellRecord() {
  router.push("/cell")
}

async function calcRate() {
  const res = await styExchangeRate({amount:11})  
  console.log('兑换汇率结果:', res)
}
async function doSell() {
  try {
    const res = await stySell({ amount: 500 }) 
    if (res?.data?.code === 200) {
      console.log('卖出成功:', res.data)
    } else {
      console.error('卖出失败:', res?.data?.message || '未知错误')
    }
  } catch (e) {
    console.error('请求异常:', e)
  }
}
const staticList = ref([])
const dynamicList = ref([])
// 获取静态产品
async function getStatic() {
  try {
    let res = await getProductAllStatic();
    if (res?.data?.code === 200 && Array.isArray(res.data.data)) {
      staticList.value = [...res.data.data]; // 展开，确保触发响应式
      console.log("静态产品:", staticList.value);
    }
  } catch (e) {
    console.error("获取静态理财失败:", e)
  }
}

// 获取动态产品
async function getSynamic() {
  try {
    let res = await getProductAllSynamic();
    if (res?.data?.code === 200 && Array.isArray(res.data.data)) {
      dynamicList.value = [...res.data.data];
      console.log("动态产品:", dynamicList.value);
    }
  } catch (e) {
    console.error("获取动态理财失败:", e)
  }
}


// 通用购买方法
function buyProduct(id, type) {
  console.log(`购买理财产品: id=${id}, 类型=${type}`)
  alert(`购买成功: ID=${id}, 类型=${type}`)
}

onMounted(()=>{
  getStatic()
  getSynamic() 
})
</script>


<style>
.finance-page {
  min-height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  font-family: "Microsoft YaHei", sans-serif;
  position: relative;
  overflow: hidden;
}

/* 金色聚光灯背景 */
.finance-page::before {
  content: "";
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%) scaleY(0.55);
  width: 100%;
  height: 200%;
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(255,215,0,0.6) 0%,
    rgba(255,193,7,0.35) 35%,
    rgba(0,0,0,0.95) 100%
  );
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}

.top-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  z-index: 1;
}

.tab-btn {
  background: #fff;
  border: none;
  border-radius: 20px;
  padding: 14px 18px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.25s;
}
.tab-btn.active {
  color: #000;
  border: 1px solid gold;
  box-shadow: 0 0 12px rgba(246,194,68,0.6);
}

/* 白色卡片 */
.card {
  background: #fff;
  border-radius: 20px;
  padding: 18px;
  margin: 14px 0;
  width: 90%;
  max-width: 420px;
  z-index: 1;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}

.dynamic-title,
.static-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dynamic-title .detail,
.static-title .detail {
  margin-left: auto;
}
.dynamic-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 12px;
}
.dynamic-row .rate { color: #555; }
.dynamic-row .detail { color: #f6c244; }

.divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 12px 0;
}

.static-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  color: #444;
}
.static-row:not(:last-child) {
  border-bottom: 1px dashed #ddd;
}

/* 买卖 STY */
.card-actions .buy-sell {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
}
.card-actions .btn {
  flex: 1;
  margin: 0 8px;
  padding: 10px 0;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: .25s;
}
.btn.buy {
  background: linear-gradient(90deg, #f6c244, #d6a520);
  color: #000;
}
.btn.sell {
  background: linear-gradient(90deg, #ff8c42, #d65f20);
  color: #000;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(246,194,68,0.5);
}
.card.card-actions {
  max-width: 360px;
  margin-bottom: 40px;
}

/* 记录 */
.record {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
.record-box {
  flex: 1;
  text-align: center;
  padding: 8px;
  font-size: 13px;
  border-right: 1px solid #ddd;
}
.record-box:last-child {
  border-right: none;
}
.gold-divider {
  height: 1px;
  width: 100%;
  margin: 10px 0 14px;
  background-color: #ffed84;
  border-radius: 1px;
}
.detail {
  font-size: 13px;
  font-weight: bold;
  color: #f6c244;
  text-decoration: none;
  cursor: pointer;
  transition: 0.25s;
}
.detail:hover {
  color: #ffd700;
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
}

/* Shop 外层：竖向滑动区域 */
.shop {
  margin-top: 20px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 6px;
}

/* 每个商品卡片 */
.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.shop-info { flex: 1; }
.shop-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}
.shop-price {
  color: #d4af37;
  font-size: 14px;
}

/* 按钮 */
.shop-item .btn.buy {
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f6c244, #d6a520);
  border: none;
  color: #000;
  font-weight: 500;
  cursor: pointer;
  transition: .25s;
  width: fit-content;
  max-width: 100px;
}
.shop-item .btn.buy:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 6px rgba(246,194,68,0.5);
}

/* 弹窗遮罩 */
.dialog-mask {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* 弹窗内容 */
.dialog-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  width: 80%;
  max-width: 300px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.dialog-box h3 {
  margin-bottom: 14px;
  color: #333;
}
.dialog-box input {
  width: 100%;
  padding: 8px;
  margin-bottom: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}
.dialog-actions {
  display: flex;
  justify-content: space-around;
}
.dialog-btn {
  flex: 1;
  margin: 0 6px;
  padding: 8px 0;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.25s;
}
.dialog-btn.confirm {
  background: linear-gradient(90deg, #f6c244, #d6a520);
  color: #000;
}
.dialog-btn.cancel {
  background: #ccc;
  color: #000;
}
.price {
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

/* 弹窗内容整体 */
.sell-box {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  width: 80%;
  max-width: 360px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  animation: fadeInUp 0.25s ease-out;
}

/* 顶部单价 */
.sell-header {
  font-size: 14px;
  margin-bottom: 16px;
  color: #666;
}
.price-value {
  font-weight: bold;
  color: #000;
}
.unit {
  color: #888;
  margin-left: 4px;
}

/* 输入框区域 */
.sell-input {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.sell-input label {
  flex: 1;
  font-size: 14px;
  color: #444;
}
.sell-input input {
  flex: 2;
  padding: 8px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 0 6px;
}
.max-btn {
  color: #337ab7;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
.max-btn:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* 信息区域 */
.sell-info {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 14px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.info-row:last-child {
  margin-bottom: 0;
}
.info-row.highlight span:last-child {
  color: #d65f20;
  font-weight: bold;
}

/* 操作按钮 */
.dialog-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sell-confirm {
  background: #000;
  color: #fff;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
.sell-confirm:hover {
  background: #222;
}
.sell-cancel {
  background: #eee;
  color: #333;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
.sell-cancel:hover {
  background: #ddd;
}

/* 弹窗动画 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}


.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-top: 10px;
}
.product-table th,
.product-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.product-table th {
  background: #f6c244;
  color: #000;
}
.product-table td {
  color: #000; /* 强制黑字 */
}
/* 表格里的购买按钮样式 */
.product-table .btn {
  border: none;              /* 去掉黑色边框 */
  border-radius: 12px;       /* 圆润一点 */
  padding: 6px 12px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.25s;
}

/* 表格里的购买按钮颜色 */
.product-table .btn.buy {
  background: linear-gradient(90deg, #f6c244, #d6a520);
  color: #000;
}

.product-table .btn.buy:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 8px rgba(246, 194, 68, 0.5);
}


</style>
