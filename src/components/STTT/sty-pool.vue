<template>
  <div class="finance-page">
    <div class="card card-actions">

      <!-- 出售 / 求购按钮 -->
      <div class="buy-sell">
        <button class="btn sell" @click="openSellDialog">出售 STY</button>
        <button class="btn sell" @click="openPurchaseDialog">求购 STY</button>
      </div>

      <!-- 交易记录 -->
      <div class="record">
        <div class="record-box" @click="goBuyRecord">求购记录</div>
        <div class="record-box" @click="goSellRecord">出售记录</div>
      </div>

      <!-- 商品池 -->
      <div class="shop">
        <div class="shop-tabs">
          <button :class="{ active: activePool === 'buy' }" @click="activePool='buy'; getShopList()">我要求购</button>
          <button :class="{ active: activePool === 'sell' }" @click="activePool='sell'; getShopList()">我要出售</button>
        </div>

        <div class="shop-list">
          <div class="shop-item" v-for="item in shopList" :key="item.id">
            <div class="shop-info">
              <div class="shop-header">
                <span class="order-id">订单号：{{ item.id }}</span>
                  <span>数量：<b>{{ item.styAmount }}</b> STY</span>
                <span class="status" :class="'status-' + item.orderStatus">{{ formatStatus(item.orderStatus) }}</span>
              </div>
              <div class="shop-row">
                <span>金额：<b>{{ item.usdtAmount }}</b> USDT</span>
                <button class="shop-buy" @click="buyItem(item)">{{ activePool==='buy' ? '购买' : '卖出' }}</button>
          </div>
              </div>
            </div>
            
        </div>
      </div>
    </div>

    <!-- 出售弹窗 -->
    <div v-if="showSellDialog" class="dialog-mask">
      <div class="dialog-box sell-box">
        <div class="sell-input row">
          <label>单价：</label>
          <input type="number" v-model="sellPrice" :min="minSellPrice" />
          <span class="unit">USDT</span>
        </div>
        <div class="sell-input row">
          <label>数量：</label>
          <input type="number" v-model="sellAmount" />
          <span class="unit">STY</span>
        </div>
        <div class="dialog-actions">
          <button @click="confirmSell" class="sell-confirm">确认出售</button>
          <button @click="showSellDialog=false" class="sell-cancel">取消</button>
        </div>
        <div class="min-price-tip">
  最低价格不能低于 {{ minSellPrice }} USDT
</div>

      </div>
    </div>

    <!-- 求购弹窗 -->
    <div v-if="showPurchaseDialog" class="dialog-mask">
      <div class="dialog-box sell-box">
        <div class="sell-input row">
          <label>单价：</label>
          <input type="number" v-model="purchasePrice" :min="minPrice" />
          <span class="unit">USDT</span>
          <label>数量：</label>
          <input type="number" v-model="purchaseAmount" />
          <span class="unit">STY</span>
        </div>
        <div class="dialog-actions">
          <button @click="confirmPurchase" class="sell-confirm">确认求购</button>
          <button @click="showPurchaseDialog=false" class="sell-cancel">取消</button>
        </div>
        <div class="min-price-tip">
  最低价格不能低于 {{ minPrice }} USDT
</div>

      </div>
    </div>

    <!-- 支付组件 -->
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
  </div>
</template>

<script setup>
import { ref, onMounted ,onUnmounted} from "vue"
import router from '@/router'
import { styGetAll, stySell, styBuy, buyPurchase, styExchangeRate, SubmitOrder,getSTYAIPrice } from '@/utils/api'
import CallbackCenter from "@/utils/callbackCenter"
import WalletTP from '@/utils/walletTP.js'
import PaymentWidget from '@/components/STTT/PaymentWidget.vue'

// === 核心交易池状态 ===
const shopList = ref([])
const allOrders = ref([])
const activePool = ref('buy')

// === 出售相关 ===
const showSellDialog = ref(false)
const sellAmount = ref(0)
const sellPrice = ref(1.2)
const minSellPrice = ref(1.2)

// === 求购相关 ===
const showPurchaseDialog = ref(false)
const purchaseAmount = ref(0)
const purchasePrice = ref(1.2)
const minPrice = ref(1.2)

const payRef = ref(null)
const ready = ref(false)

// 获取交易池
async function getShopList() {
  const res = await styGetAll({})
  if (res?.data?.code === 200 && Array.isArray(res.data.data)) {
    allOrders.value = res.data.data
  } else {
    allOrders.value = []
  }
  filterShopList()
}

function filterShopList() {
  shopList.value = allOrders.value.filter(item => {
    if (activePool.value === 'buy') return item.orderType === 1
    if (activePool.value === 'sell') return item.orderType === 2
  })
}

function formatStatus(status) {
  switch (status) {
    case 0: return '待成交'
    case 1: return '已成交'
    case 2: return '已取消'
    default: return '未知'
  }
}
// 跳转各个页面
function goBuyRecord() { router.push("/buy") }
function goSellRecord() { router.push("/cell") }

//=================
// 出售
function openSellDialog() { showSellDialog.value = true }
async function confirmSell() {
  if (Number(sellAmount.value) <= 0) return alert('请输入数量')
  CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
    startPay(0, stySell)
  })
}

// 求购
function openPurchaseDialog() { showPurchaseDialog.value = true }
async function confirmPurchase() {
  if (Number(purchaseAmount.value) <= 0) return alert('请输入数量')
  CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
    const res = await buyPurchase({
      styAmount: String(purchaseAmount.value),
      usdtAmount: String((purchaseAmount.value * purchasePrice.value).toFixed(2)),
      price: String(purchasePrice.value),
      paymentId: "1",
      remark: "挂买单求购 STY",
      twoPassword: pwdMd5
    })
    if (res?.data?.code === 200) {
      alert("挂买单成功！")
      showPurchaseDialog.value = false
    } else {
      alert(res?.data?.message || "挂买单失败")
    }
  })
}

// 买入/卖出订单
function buyItem(item) {
  if (!item.id) return alert('缺少订单ID')
  if (item.orderType === 2) {
    CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
      sellAmount.value = item.styAmount
      startPay(item.id, styBuy)
    })
  } else {
    CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
      const res = await styBuy({ orderId: item.id, twoPassword: pwdMd5 })
      if (res?.data?.code === 200) {
        alert(`购买成功: 订单号 ${item.id}`)
      } else {
        alert(res?.data?.message || '购买失败')
      }
    })
  }
}

// 统一支付
async function startPay(orderId, fun) {
  if (!ready.value || !payRef.value) return
  const res = await payRef.value.startExternal({
    amount: Number(sellAmount.value),
    token: "STYAI",
    WalletTP,
    RequestOrder: fun,
    SubmitOrder,
    checkTrxEarly: false,
    orderId
  })
  console.log('支付结果', res)
}

function onPayDone(res) { console.log('done', res) }
function onPayClose() { console.log('close') }
async function updateGuidePrice (){
  let res= await getSTYAIPrice();
  if(res?.data?.data?.price){
  sellPrice.value  = res.data.data.price
  minSellPrice.value  = res.data.data.price
  purchasePrice.value  = res.data.data.price
  minPrice.value  = res.data.data.price
  }
}

onMounted(async () => {
  getShopList()
  await updateGuidePrice ();
  ready.value = true
    const inputs = document.querySelectorAll("input, textarea")
  inputs.forEach(input => {
    input.addEventListener("focus", () => {
      setTimeout(() => {
        input.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 200)
    })
  })
})

</script>

<style>

.finance-page {
  min-height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
  font-family: "Microsoft YaHei", sans-serif;
  position: relative;
  overflow: hidden;
}

.finance-page::before {
  content: "";
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%) scaleY(0.55);
  width: 100%;
  height: 200%;
  background: radial-gradient(ellipse at 50% 0%, rgba(255, 215, 0, 0.6) 0%, rgba(255, 193, 7, 0.35) 35%, rgba(0, 0, 0, 0.95) 100%);
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}

.card {
  background: #fff;
  border-radius: 20px;
  padding: 18px;
  margin: 20px 0;
  width: 90%;
  max-width: 420px;
  z-index: 1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

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

.btn.sell {
  background: linear-gradient(90deg, #ff8c42, #d65f20);
  color: #000;
}

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

.shop {
  margin-top: 20px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 6px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
}

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

.shop-list {
  max-height: 240px;
  overflow-y: auto;
  padding-right: 6px;
}

.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
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
.shop-row{
    display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
  color: #555;
}
.shop-buy {
  width: 70px; /* 保持原大小 */
  height: 26px;
  background: linear-gradient(90deg, #f6d365, #fda085); /* 柔金到橙色渐变 */
  color: #000;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
}

/* 悬停时稍微亮一点 */
.shop-buy:hover {
  background: linear-gradient(90deg, #ffe082, #ffc107);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* 点击时暗一点有按压感 */
.shop-buy:active {
  background: linear-gradient(90deg, #fbc02d, #f57c00);
  transform: scale(0.96);
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

.status-0 { background: #f6c244; }
.status-1 { background: #4caf50; }
.status-2 { background: #f44336; }



.dialog-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  overflow-y: auto;
}

.dialog-box {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  width: 82%;
  max-width: 340px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  animation: fadeInUp 0.25s ease-out;
  display: flex;
  flex-direction: column;
  margin: 20vh auto;
}

.sell-input.row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.sell-input label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.sell-input input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid #ccc;
  outline: none;
  transition: border-color 0.25s;
  text-align: left;
}

.sell-input input:focus {
  border-color: #f6c244;
  box-shadow: 0 0 2px rgba(246, 194, 68, 0.3);
}

.sell-input .unit {
  align-self: flex-end;
  font-size: 13px;
  color: #777;
  margin-top: -4px;
  margin-bottom: 6px;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  gap: 8px;
}

.sell-confirm,
.sell-cancel {
  flex: 1;
  padding: 7px 0;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
}

.sell-confirm {
  background: linear-gradient(90deg, #f6c244, #d6a520);
  color: #000;
}

.sell-cancel {
  background: #eee;
  color: #333;
}

.min-price-tip {
  margin-top: 4px;
  text-align: right;
  font-size: 12px;
  color: #999;
  font-weight: 500;
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