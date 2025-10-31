<template>

  <div class="funds-page">
    <div class="fund-heard">

      <div class="action-switch">
        <button class="pill" :class="{ active: mode === 'deposit' }" @click="mode = 'deposit'">📦 {{ $t('funds.deposit')
          }}</button>
        <button class="pill" :class="{ active: mode === 'withdraw' }" @click="mode = 'withdraw'">📒 {{
          $t('funds.withdraw')
        }}</button>
      </div>
      <div class="platform-balance-inline">
        <span class="label">💰 {{ $t('funds.balance') }}:</span>
        <span class="value">{{ platformBalance }} <span class="values">USDT</span></span>
       
      </div>

      <input class="amount-input" type="number" inputmode="decimal"
        :placeholder="mode === 'deposit' ? $t('funds.depositPlaceholder') : $t('funds.withdrawPlaceholder')"
        v-model.trim="amount" />

      <button class="confirm-btn" @click="startPay">
        {{ $t('funds.confirm') }}
      </button>
      <div class="fee-info" v-if="mode === 'withdraw' && Number(amount) > 0">
        💰STY：
        <span class="fee-amount">{{ fee .toFixed(2) }}</span>
        <span class="fee-rate">（{{ (feeRate * 100).toFixed(2) }}%）</span>
      </div>
    </div>

    <div class="list-card">
      <div class="gold-spotlight"><i class="gold-core"></i></div>

      <div class="list-tabs">
        <button class="tab" :class="{ on: listType === 'recharge' }" @click="listType = 'recharge'">📦 {{
          $t('funds.rechargeList') }}</button>
        <button class="tab" :class="{ on: listType === 'withdraw' }" @click="listType = 'withdraw'">📒 {{
          $t('funds.withdrawList') }}</button>
      </div>

      <div class="thead">
        <span>{{ listType === 'recharge' ? $t('funds.rechargeAmount') : $t('funds.withdrawAmount') }}</span>
        <span>{{ listType === 'recharge' ? $t('funds.rechargeDate') : $t('funds.withdrawDate') }}</span>
      </div>

      <div class="rows">
        <div class="row" v-for="(item, i) in rows" :key="i">
          <span>{{ item.amount }}</span>
          <span>{{ item.date }}</span>
        </div>
        <div v-if="rows.length === 0" class="empty">{{ $t('funds.noRecord') }}</div>
      </div>
    </div>
  </div>
  <!-- 作为“弹窗+状态机”使用：隐藏其内置输入 -->
  <PaymentWidget ref="payRef" :show-balance="true" :show-list="true" :show-builtin-input="false" :WalletTP="WalletTP"
    :RequestOrder="RequestOrder" :SubmitOrder="SubmitOrder" @done="onPayDone" @close="onPayClose" />

</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import WalletTP from '@/utils/walletTP.js'
import { RequestOrder, SubmitOrder, userPlatformFlowSelect, userPlatformBalance, Withdraw, getSTYAIPrice, publicRequestOrder ,verifyTwoPasswordForBuy} from '@/utils/api.js'
import PaymentWidget from '@/components/STTT/PaymentWidget.vue'
import Notify from '@/utils/notifyInApp'
// 基础状态
import { ElLoading } from 'element-plus'
import CallbackCenter from "@/utils/callbackCenter"
import { useFee } from '@/composable/useFee'
// 页面原本已有金额变量
const amount = ref('') // 输入框金额
const { feeRate, fee, netAmount } = useFee(amount)
const mode = ref('deposit')
const listType = ref('recharge')
const styGuidePrice = ref(0.1)
async function updateGuidePrice() {
  let res = await getSTYAIPrice();
  if (res?.data?.data?.price) {
    styGuidePrice.value = res.data.data.price
  }
}

// 记录列表
const rechargeList = ref([])
const withdrawList = ref([])
const rows = computed(() =>
  listType.value === 'recharge' ? rechargeList.value : withdrawList.value
)

// 支付组件引用 & 就绪标记
const payRef = ref(null)
const ready = ref(false)
onMounted(async () => {
  await nextTick()
  ready.value = true
})

// 币种（也可以做成下拉切换）
const wantedToken = ref('USDT')
const STYToken = ref('STYAI')

async function startWithdraw() {


  // 🔒 先触发全局二级密码验证
  return CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
    // 打开 loading 遮罩
    const loading = ElLoading.service({
      lock: true,
      text: '正在提交提现请求...',
      background: 'rgba(0, 0, 0, 0.5)'
    })
    const feeInSTY = fee.value 
    const confirmMessage = `出金需要先支付 ${feeInSTY.toFixed(2)} STYAI 手续费`
    //!!!!!!!!加一个单独验证密码的接口
            // ✅ 第一步：单独验证密码
    const verify = await verifyTwoPasswordForBuy({ twoPassword: pwdMd5 })
    if (verify?.data?.code !== 200) {
      Notify.inApp({
        title: '验证失败',
        message: verify?.data?.message || '二级密码错误',
        type: 'error'
      })
      return
    }
    loading.close()
    if (typeof window !== 'undefined' && !window.confirm(confirmMessage)) {
      return
    }
    let isok = await startPaySTY()
    if (isok) {
      try {
        // ✅ 带上加密二级密码提交
        const re = await Withdraw({
          amount: amount.value,
          twoPassword: pwdMd5
        })
        console.log(re, '提现结果')
        if (re?.data?.code == 200 && re?.data?.data?.status == -1) {
          Notify.inApp({
            title: '成功',
            message: '提现成功，请注意查收',
            type: 'success'
          })
          amount.value = ''
        } else {
          Notify.inApp({
            title: '失败',
            message: re?.data?.data?.message || re?.data?.message || '提现失败，请稍后重试',
            type: 'error'
          })
        }
      } catch (err) {
        Notify.inApp({
          title: '错误',
          message: err.message || '系统错误，请稍后重试',
          type: 'error'
        })
      } finally {
        loading.close()
      }
    }

  })


}

// 触发支付
async function startPay() {
  if (!ready.value || !payRef.value) {
    console.warn('PaymentWidget 未挂载完成')
    return
  }
  if (!amount.value || Number(amount.value) <= 0) {
    alert('请输入正确金额')
    return
  }
  // 这里可以限制只有充值模式触发
  if (mode.value !== 'deposit') {
    startWithdraw();
    return
  }


  const res = await payRef.value.startExternal({
    amount: Number(amount.value),
    token: wantedToken.value,   // 注意 .value
    WalletTP,
    RequestOrder,
    SubmitOrder,
    checkTrxEarly: true
  })
  console.log('支付结果', res)

  if (res?.success) {
    amount.value = ''
    // TODO: 这里可刷新平台余额/充值记录
  }
}
// 触发支付
async function startPaySTY() {
  const feeInSTY =fee.value 
  if (!ready.value || !payRef.value) {
    console.warn('PaymentWidget 未挂载完成')
    return
  }
  if (!feeInSTY || Number(feeInSTY) <= 0) {
    alert('请输入正确金额')
    return
  }

  const res = await payRef.value.startExternal({
    amount: Number(feeInSTY),
    token: STYToken.value,   // 注意 .value
    WalletTP,
    RequestOrder: publicRequestOrder,
    SubmitOrder,
    checkTrxEarly: false,
    OrdrId: 0
  })
  console.log('支付结果', res)
  if (res?.success) {
    return true
  }
  return false
}
function onPayDone(res) {
  console.log('done', res)
  // 可在这里统一刷新数据
}
function onPayClose() {
  console.log('close')
}

async function loadRecharge() {
  const res = await userPlatformFlowSelect('recharge', {})
  if (res?.data.code === 200 && Array.isArray(res.data.data)) {
    rechargeList.value = res.data.data.map(item => ({
      amount: item.amount,
      date: item.transactionTime
    }))
  }
}

async function loadWithdraw() {
  const res = await userPlatformFlowSelect('withdrawal', {})
  if (res?.data.code === 200 && Array.isArray(res.data.data)) {
    withdrawList.value = res.data.data.map(item => ({
      amount: item.amount,
      date: item.transactionTime
    }))
  }
}
const platformBalance = ref(0)

async function loadPlatformBalance() {
  try {
    const res = await userPlatformBalance({})
    if (res.ok && res.data.code === 200) {
      platformBalance.value = res.data.data   // ✅ 余额就是这里
    } else {
      platformBalance.value = 0
    }
  } catch (e) {
    console.error("获取平台余额失败:", e)
    platformBalance.value = 0
  }
}
// 页面挂载时
onMounted(() => {
  loadPlatformBalance()
  loadRecharge()
  loadWithdraw()
  updateGuidePrice()
  // 🔔 注册全局回调
  CallbackCenter.register("fundsUpdate", () => {
    console.log("收到资金更新回调，开始刷新")
    loadPlatformBalance()
    loadRecharge()
    loadWithdraw()
    updateGuidePrice()
  })
})

// 页面卸载时记得解绑
onBeforeUnmount(() => {
  CallbackCenter.unregister("fundsUpdate")
})
</script>

<style scoped>
.page-root {
  display: block;
}

/* 原样式保持 */
.funds-page {
  min-height: 100vh;
  background: #000;
  padding: 18px 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  font-family: "Microsoft YaHei", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

/* 顶部切换 */
.action-switch {
  width: 100%;
  max-width: 430px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 6px 0 18px;
  margin-top: 10px;
}

.pill {
  background: #fff;
  border: 1px solid #d8d8d8;
  border-radius: 999px;
  padding: 12px 14px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
}

.pill.active {
  background: linear-gradient(135deg, #ecd693, #f1d789, #f5e5a4);
  border-color: #FFD24D;
  color: #000;
  box-shadow: 0 0 12px rgba(255, 210, 77, .55);
}

/* 平台余额 */
.platform-balance {
  color: #FFD24D;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* 输入 & 确认 */
.amount-input {
  margin-top: 20px;
  width: calc(100% - 20px);
  margin-right: 30px;
  max-width: 430px;
  background: #fff;
  border: none;
  border-radius: 20px;
  padding: 16px 10px;
  font-size: 15px;
  outline: none;
  margin-bottom: 14px;
}

.confirm-btn {
  width: 100%;
  background: #e49f00;
  border: none;
  border-radius: 999px;
  padding: 12px 14px;
  font-size: 18px;
  font-weight: 800;
  color: #000;
  cursor: pointer;
  margin-bottom: 18px;
}

/* 充值列表 */
.list-card {
  position: relative;
  width: 94%;
  max-width: 430px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 14px 12px 16px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  overflow: hidden;
  margin-top: 30px;
}

.gold-spotlight {
  --w: 100%;
  --h: 220%;
  --scaleY: .56;
  --blur: 90px;
  position: absolute;
  left: 50%;
  top: -4%;
  width: var(--w);
  height: var(--h);
  transform: translateX(-50%) scaleY(var(--scaleY));
  background:
    radial-gradient(ellipse at 50% 0%,
      rgba(255, 215, 0, .70) 0%,
      rgba(255, 193, 7, .35) 38%,
      rgba(0, 0, 0, .98) 100%),
    radial-gradient(ellipse at 50% 100%,
      rgba(255, 215, 0, .40) 0%,
      rgba(0, 0, 0, .98) 65%);
  filter: blur(var(--blur));
  z-index: 0;
  pointer-events: none;
}

.gold-spotlight .gold-core {
  position: absolute;
  left: 50%;
  top: 16%;
  transform: translateX(-50%);
  width: 2px;
  height: 72%;
  background: linear-gradient(to bottom,
      rgba(255, 215, 0, 0) 0%,
      rgba(255, 215, 0, .6) 15%,
      rgba(255, 215, 0, .95) 50%,
      rgba(255, 215, 0, .6) 85%,
      rgba(255, 215, 0, 0) 100%);
  filter: blur(2px) drop-shadow(0 0 10px rgba(255, 215, 0, .6));
}

/* 列表 tabs */
.list-tabs {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.tab {
  background: #fff;
  border: 1px solid #e3e3e3;
  border-radius: 999px;
  padding: 8px 10px;
  font-weight: 600;
  cursor: pointer;
}

.tab.on {
  border-color: #FFD24D;
  box-shadow: 0 0 10px rgba(255, 210, 77, .4);
  background-color: #f5e5a4;
}

/* 表头 & 行 */
.thead {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  color: #f6c244;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  padding: 8px 10px;
  border-radius: 10px;
  font-weight: 700;
  margin-bottom: 6px;
}

.rows {
  position: relative;
  z-index: 1;
  max-height: 300px;
  /* 限制最大高度 */
  overflow-y: auto;
  /* 超出滚动 */
  scrollbar-width: thin;
  /* Firefox: 窄滚动条 */
  scrollbar-color: #f6c244 rgba(255, 255, 255, 0.08);
}

/* Chrome / Edge 滚动条美化 */
.rows::-webkit-scrollbar {
  width: 6px;
}

.rows::-webkit-scrollbar-thumb {
  background: #f6c244;
  border-radius: 4px;
}

.rows::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.08);
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  color: #eaeaea;
  padding: 10px;
  font-size: 14px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
}

.row:last-child {
  border-bottom: 0;
}

.empty {
  color: #bbb;
  text-align: center;
  padding: 14px 0;
  font-size: 13px;
}

/* 弹窗样式（若父页也用到） */
.pay-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.pay-dialog {
  width: min(92vw, 420px);
  background: #111;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 16px;
  padding: 16px 14px;
  color: #eee;
  box-shadow: 0 10px 40px rgba(0, 0, 0, .5);
}

.pay-title {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #f6c244;
}

.pay-amount {
  margin-bottom: 10px;
}

.pay-amount b {
  color: #FFD24D;
  font-size: 18px;
}

.pay-progress {
  margin: 10px 0;
}

.pay-progress .label {
  color: #aaa;
  font-size: 12px;
  margin-bottom: 4px;
}

.pay-progress .box {
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .10);
  border-radius: 10px;
  padding: 10px;
  white-space: pre-wrap;
  word-break: break-word;
}

.pay-tip {
  margin-top: 10px;
  font-size: 13px;
  color: #ddd;
}

.pay-tip .warn {
  color: #ffcf66;
  font-weight: 600;
}

.pay-close-btn {
  margin-top: 14px;
  width: 100%;
  background: #e49f00;
  color: #000;
  font-weight: 800;
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
}

.platform-balance-inline {
  width: 94%;
  max-width: 430px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 210, 77, 0.35);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 左右分布 */
  font-size: 16px;
  color: #f6c244;
  box-shadow: 0 0 10px rgba(255, 210, 77, .15);
}

.platform-balance-inline .label {
  font-weight: 600;
  color: #ffd24d;
}

.platform-balance-inline .value {
  font-weight: 800;
  font-size: 18px;
  color: #fff;
  margin-right: 5%;
 
}
.platform-balance-inline .values{
  font-size: 12px;
  font-weight: normal;
  color: #d4a017;
}
/* 金色外框卡片（用于 fund-heard） */
.fund-heard {
  width: 94%;
  max-width: 430px;
  background: rgba(0, 0, 0, 0.7);
  /* 黑底半透明 */
  border: 1px solid rgb(255, 255, 255);
  /* 金色边框 */
  border-radius: 16px;
  padding: 18px 14px 24px;
  margin-top: 50px;
  box-shadow: 0 0 18px rgba(255, 210, 77, 0.2);
  /* 外发光 */
  position: relative;
  z-index: 1;
}


.fee-info .fee-amount {
  color: #d4a017;
  font-weight: 600;
}

.fee-info .fee-rate {
  color: #888;
  font-size: 12px;
}
</style>
