<template>
  <div class="finance-page">

    <!-- 卡片1：动态理财 + 静态理财 -->
<div class="card">
  <!-- 理财宝说明 -->
  <button class="tab-btn" :class="{ active: route.path === '/finance-intro' }" @click="goFinanceIntro">
    📒 {{ $t('finance.styIntro') }}
  </button>

  <!-- 动态/静态切换 -->
  <div class="sty-btn">
    <button :class="{active: activeTab==='dynamic'}" @click="activeTab='dynamic'">动态理财</button>
    <button :class="{active: activeTab==='static'}" @click="activeTab='static'">静态理财</button>
  </div>

  <div class="gold-divider"></div>

  <!-- 商品列表 -->
<div class="product-list-wrapper">
  <!-- 商品列表 -->
  <div class="product-list">
    <div class="product" v-for="(item, i) in products" :key="i">
      <img 
        :src="activeTab === 'dynamic' ? require('@/assets/动态理财.gif') : require('@/assets/静态理财.gif')" 
        alt="理财图"
      />
      <div class="info">
        <span class="name">{{ item.name }}</span>
        <span class="price">{{ item.price }} STY</span>
      </div>
        <button class="buy-btn" @click="buyProductItem(item.id, activeTab)">购买</button>
    </div>
  </div>

  <!-- 底部明细区 -->
  <div class="list-footer">
  <div v-if="activeTab === 'dynamic'" @click="goDynamicDetail">
    📊动态理财明细
  </div>
  <div v-else @click="goStaticDetail">
    📊 静态理财明细
  </div>

  </div>
</div>

</div>
    <!-- 卡片2：买卖 STY -->
    <div class="card card-actions">
      <div class="buy-sell">
        <!-- 出售 STY 按钮 -->
        <button class="btn sell" @click="openSellDialog">
          {{ $t('finance.sell') }}
        </button>
         <button class="btn sell" @click="openPurchaseDialog">
          {{ $t('finance.buy') }}
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
  <!-- 顶部切换按钮（固定，不跟随滚动） -->
  <div class="shop-tabs">
    <button
      :class="{ active: activePool === 'buy' }"
      @click="activePool = 'buy'; getShopList()"
    >
      求购
    </button>
    <button
      :class="{ active: activePool === 'sell' }"
      @click="activePool = 'sell'; getShopList()"
    >
      出售
    </button>
  </div>

  <!-- 商品列表（单独滚动） -->
  <div class="shop-list">
    <div class="shop-item" v-for="item in shopList" :key="item.id">
      <div class="shop-info">
        <div class="shop-header">
          <span class="order-id">订单号：{{ item.id }}</span>
          <span class="status" :class="'status-' + item.orderStatus">
            {{ formatStatus(item.orderStatus) }}
          </span>
        </div>

        <div class="shop-row">
          <span>数量：<b>{{ item.styAmount }}</b> STY</span>
          <span>金额：<b>{{ item.usdtAmount }}</b> USDT</span>
        </div>
      </div>

      <button class="btn buy" @click="buyItem(item)">
        {{ activePool === 'buy' ? '购买' : '卖出' }}
      </button>
    </div>
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
          <span class="max-btn" @click="sellAmount = available">全部</span>
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
          <button @click="showSellDialog = false" class="sell-cancel">取消</button>
        </div>
      </div>
    </div>
    <!-- 求购 STY 弹窗 -->
  <div v-if="showPurchaseDialog" class="dialog-mask">
  <div class="dialog-box sell-box">
    <!-- 当前单价输入 -->
    <div class="sell-header">
      求购单价：
      <input type="number" v-model="purchasePrice" class="price-input" />
      <span class="unit">USDT</span>
    </div>

    <!-- 求购数量输入 -->
    <div class="sell-input">
      <label>求购数量：</label>
      <input type="number" v-model="purchaseAmount" />
      <span class="unit">STY</span>
    </div>

    <!-- 信息展示 -->
    <div class="sell-info">
      <div class="info-row">
        <span>总金额</span>
        <span>{{ (purchaseAmount * purchasePrice).toFixed(2) }} USDT</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="dialog-actions">
      <button @click="confirmPurchase" class="sell-confirm">挂买单</button>
      <button @click="showPurchaseDialog = false" class="sell-cancel">取消</button>
    </div>
  </div>
   </div>
  </div>
    <!-- 作为“弹窗+状态机”使用：隐藏其内置输入 -->
    <PaymentWidget
      ref="payRef"
      :show-balance="true"
      :show-list="true"
      :show-builtin-input="false"
      :WalletTP="WalletTP"
      :RequestOrder="stySell"
      :SubmitOrder="SubmitOrder"
      @done="onPayDone"
      @close="onPayClose"
    />
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import router from '@/router';
import { stySell, styExchangeRate, styBuy, getProductAllStatic, getProductAllSynamic, buyProduct,styGetAll,buyPurchase } from '@/utils/api'
import CallbackCenter from "@/utils/callbackCenter";
import { useRouter, useRoute } from 'vue-router'
import WalletTP from '@/utils/walletTP.js'
import { Exchange, SubmitOrder } from '@/utils/api.js'
import PaymentWidget from '@/components/STTT/PaymentWidget.vue'
const route = useRoute()
const showSellDialog = ref(false)
const sellAmount = ref(1)   // 默认 1 避免空请求
// 弹窗字段
const unitPrice = ref(0)
const available = ref(0)
const fee = ref(0)
const netProceeds = ref(0)
// 支付组件引用 & 就绪标记
const payRef = ref(null)
const ready = ref(false)

const receiveUSDT = computed(() => Number(netProceeds.value || 0).toFixed(2))
function fillQuote(p = {}) {
  unitPrice.value = Number(p.currentUnitPrice ?? 0)
  fee.value = Number(p.fee ?? 0)
  available.value = Number(p.sellQuantity ?? 0)
  netProceeds.value = Number(p.netProceeds ?? 0)
}

// =======================================
const activeTab = ref('dynamic')
function buy(item) {
  alert(`购买：${item.name}`)
}

function resetQuote() { fillQuote({}) }

function openSellDialog() {
  showSellDialog.value = true
  calcRate()
}

// 确认出售
async function confirmSell() {
  const amt = Number(sellAmount.value)
  if (!Number.isFinite(amt) || amt <= 0) {
    alert('请输入有效的出售数量')
    return
  }
  // 🔑 打开二级密码弹窗
  CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
    try {
      startPay();
    } catch (e) {
      console.error('获取订单异常:', e)
      alert(e.message || '获取订单失败')
    }
  })
}

// 触发支付
async function startPay() {
  if (!ready.value || !payRef.value) {
    console.warn('PaymentWidget 未挂载完成')
    return
  }
  if (!sellAmount.value || Number(sellAmount.value) <= 0) {
    alert('请输入正确金额')
    return
  }
  const res = await payRef.value.startExternal({
    amount: Number(sellAmount.value),
    token: "STYAI",   // 注意 .value
    WalletTP,
    RequestOrder: stySell,         
    SubmitOrder,
    checkTrxEarly: false
  })
  console.log('支付结果', res)

  if (res?.success) {
    sellAmount.value = ''
    // TODO: 这里可刷新平台余额/充值记录
  }
}
function onPayDone(res) {
  console.log('done', res)
  // 可在这里统一刷新数据
}
function onPayClose() {
  console.log('close')
}
// 获取报价（calcRate）
async function calcRate() {
  try {
    const res = await styExchangeRate({ amount: Number(sellAmount.value || 1) })
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
// ================== daidiaiadiaidaidiadiaidiadiai==================
const shopList = ref([])
const allOrders = ref([]) 
const activePool = ref('buy') // 默认显示求购池，取值: 'buy' / 'sell'
// 获取 STY 商品池数据
async function getShopList() {
  try {
    const res = await styGetAll({})
    if (res?.data?.code === 200 && Array.isArray(res.data.data)) {
      allOrders.value = res.data.data
    } else {
      allOrders.value = []
    }
    filterShopList()
  } catch (e) {
    console.error("获取 STY 交易池失败:", e)
    allOrders.value = []
    shopList.value = []
  }
}

function filterShopList() {
  // orderType: 1=买入STY(求购), 2=卖出STY(出售)
  shopList.value = allOrders.value.filter(item => {
    if (activePool.value === 'buy') return item.orderType === 2
    if (activePool.value === 'sell') return item.orderType === 1
  })
}

// 买sty按钮方法
function buyItem(item) {
  if (!item.orderId) {
    alert('缺少订单ID')
    return
  }  
  CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
    try {
      const res = await styBuy({
        orderId: item.orderId,                
        twoPassword: pwdMd5
      })
      const body = res?.data
      if (body?.code === 200) {
        alert(`购买成功: 订单号 ${item.orderId}`)
      } else {
        alert(body?.message || '购买失败')
      }
    } catch (e) {
      console.error('购买异常:', e)
      alert(e.message || '购买失败')
    }
  })
}
// 求购 STY
const showPurchaseDialog = ref(false)
const purchaseAmount = ref(0)
const purchasePrice = ref(0)

// 打开求购弹窗
function openPurchaseDialog() {
  showPurchaseDialog.value = true
  purchaseAmount.value = 0
  purchasePrice.value = 0
}

// 确认求购
// 确认求购
// 确认求购
async function confirmPurchase() {
  const amt = Number(purchaseAmount.value)
  const price = Number(purchasePrice.value)
  if (!Number.isFinite(amt) || amt <= 0 || !Number.isFinite(price) || price <= 0) {
    alert('请输入有效的数量和单价')
    return
  }

  // 🔑 打开二级密码弹窗
  CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
    try {
      const res = await buyPurchase({
        userId: 10001,                               // ⚠️ 替换为实际登录用户ID
        styAmount: String(amt),
        usdtAmount: String((amt * price).toFixed(2)),
        price: String(price),
        paymentId: "1",                              // ⚠️ 实际支付方式 ID
        remark: "挂买单求购 STY",
        twoPassword: pwdMd5                          // 带上二级密码
      })
      const body = res?.data
      if (body?.code === 200) {
        alert("挂买单成功！")
        showPurchaseDialog.value = false
      } else {
        alert(body?.message || "挂买单失败")
      }
    } catch (e) {
      console.error("挂买单异常:", e)
      alert(e.message || "挂买单失败")
    }
  })
}

function formatStatus(status) {
  switch (status) {
    case 0: return '待成交';
    case 1: return '已成交';
    case 2: return '已取消';
    default: return '未知';
  }
}

// 跳转各个页面
function goDynamicDetail() { router.push("/dynamic") }
function goStaticDetail() { router.push("/statuc") }
function goBuyRecord() { router.push("/buy") }
function goSellRecord() { router.push("/cell") }

function goFinance() {
  if (route.path !== '/finance') {
    router.push('/finance')
  }
}
// 理财宝说明
function goFinanceIntro() {
  if (route.path !== '/finance-intro') {
    router.push('/finance-intro')
  }
}
//=================
// 通用购买方法
async function buyProductItem(id, type) {
  // 🔑 打开二级密码弹窗
  CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
    try {
      let _productType = 0;
      if (type != "static") {
        _productType = 1;
      }
      const res = await buyProduct({ productType: _productType, twoPassword: pwdMd5, productId: id }) // 带上二级密码
      // 带上二级密码
      const body = res?.data
      if (body?.code === 200) {
        fillQuote(body.data)
        alert(body.message)

      } else {
        alert(body?.message || '购买失败')
      }
    } catch (e) {
      console.error('购买异常:', e)
      alert(e.message || '购买异常')
    }
  })
}
//=================================================
// 接口数据
const dynamicList = ref([])
const staticList = ref([])

// 当前展示的商品（根据 activeTab 动态切换）
const products = computed(() => {
  return activeTab.value === 'dynamic' ? dynamicList.value : staticList.value
})
// 获取动态产品
async function getSynamic() {
  try {
    let res = await getProductAllSynamic()
    if (res?.data?.code === 200 && Array.isArray(res.data.data)) {
      dynamicList.value = res.data.data
    }
  } catch (e) {
    console.error("获取动态理财失败:", e)
  }
}
// 获取静态产品
async function getStatic() {
  try {
    let res = await getProductAllStatic()
    if (res?.data?.code === 200 && Array.isArray(res.data.data)) {
      staticList.value = res.data.data
    }
  } catch (e) {
    console.error("获取静态理财失败:", e)
  }
}
function switchPool(type) {
  if (type) activePool.value = type
  filterShopList()
}
async function refreshPool() {
  await getShopList()
  switchPool(activePool.value)  // 确保根据当前池子过滤
}
import { onActivated } from "vue"
onActivated(() => {
  refreshPool()   // 路由切回来时再刷新
})
onMounted(() => {
  getSynamic()
  getStatic()
  getShopList()
  refreshPool() 
 switchPool() 
    ready.value = true
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
  background: radial-gradient(ellipse at 50% 0%,
      rgba(255, 215, 0, 0.6) 0%,
      rgba(255, 193, 7, 0.35) 35%,
      rgba(0, 0, 0, 0.95) 100%);
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}



.tab-btn {
  background: #fff5d6;  
  color: #b8860b;        
  border: 1px solid #f6c244;
  border-radius: 14px;   
  padding: 8px 14px;     
  font-size: 13px;       
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}

.tab-btn.active {
  background: linear-gradient(90deg, #f6c244, #d6a520);
  color: #000;
  box-shadow: 0 0 12px rgba(246, 194, 68, 0.6);
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  margin-top: 30px;

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

.dynamic-row .rate {
  color: #555;
}

.dynamic-row .detail {
  color: #f6c244;
}

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
  box-shadow: 0 0 10px rgba(246, 194, 68, 0.5);
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.shop-info {
  flex: 1;
}

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
  box-shadow: 0 0 6px rgba(246, 194, 68, 0.5);
}

/* 弹窗遮罩 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
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
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.card {
  background: #fff;
  border-radius: 30px;
  padding: 16px;
  width: 92%;
  max-width: 520px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 顶部说明按钮 */
.tab-btn {
  display: inline-block;
  background: #fff;
  color: #f6c244;
  border: 1px solid #f6c244;
  border-radius: 15px;
  padding: 10px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
}
.tab-btn:hover {
  background: #fff8e1;
  box-shadow: 0 0 4px rgba(246,194,68,0.5);
}
.tab-btn.active {
  background: linear-gradient(90deg, #f6c244, #d6a520);
  color: #000;
  border: none;
}


/* 动静理财切换 */
/* 动静理财切换 */
.sty-btn {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 12px 0;
}

.sty-btn button {
  flex: none;
  min-width: 90px;
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  color: #555;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.25s;
}

/* 激活状态：淡金底 + 金色边框 + 深色文字 */
.sty-btn button.active {
  background: #fffbe6;            /* 柔和浅金色，而不是浓烈的渐变 */
  border: 1px solid #f6c244;
  color: #b8860b;                 /* 深金色文字 */
  font-weight: 600;
  box-shadow: 0 0 4px rgba(246,194,68,0.3);
}


/* 分割线 */
.gold-divider {
  height: 1px;
  margin: 10px 0;
  background: #ffed84;
  border-radius: 2px;
}

/* 商品列表 */
.product-list-wrapper {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: #fafafa;
  overflow: hidden;
}

/* 商品滚动区 */
.product-list {
  max-height: 280px;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 底部固定区域 */
.list-footer {
  padding: 8px;
  text-align: center;
  font-size: 16px;
  color: #dab616;
  background: #f0f0f0;
  border-top: 1px solid #e0e0e0;
  font-weight: 500;
}

.product {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fafafa;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.info{
  flex: 1;
  display: flex;
 margin-top: 15px;
  gap: 16px;  
}
.product img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  
}
.product .name {
  flex: 1;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  margin-left: 10px;
}
.product .price {
  margin-right: 10px;
  color: #d6a520;
  font-weight: bold;
  font-size: 14px;
}
.product .buy-btn {
  background: linear-gradient(90deg, #f6c244, #d6a520);
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.25s;
}
.product .buy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 6px rgba(246,194,68,0.6);
}


/* 商品池子 */
.shop-item {
  background: #fafafa;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.order-id {
  font-weight: 600;
  color: #333;
}

.status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  color: #fff;
}
.status-0 { background: #f6c244; }  /* 待成交 - 黄色 */
.status-1 { background: #4caf50; }  /* 已成交 - 绿色 */
.status-2 { background: #f44336; }  /* 已取消 - 红色 */

.shop-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.shop-row b {
  color: #000;
}

.shop {
 
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

/* 顶部切换按钮（不滚动） */
.shop-tabs {
  display: flex;
  justify-content: space-around;
  background: #fff8e1;
  border-radius: 10px;
  margin-bottom: 10px;
}

.shop-tabs button {
  flex: 1;
  border: none;
  background: transparent;
  border-radius: 30px;
  font-weight: 600;
  padding: 6px 0;
  cursor: pointer;
  transition: 0.25s;
}

.shop-tabs button.active {
  background: linear-gradient(90deg, #f6c244, #d6a520);
  color: #000;
  box-shadow: 0 0 6px rgba(246, 194, 68, 0.4);
}

/* 商品列表单独滚动 */
.shop-list {
  max-height: 240px;   /* 控制滚动高度 */
  overflow-y: auto;
  padding-right: 6px;
}



</style>
