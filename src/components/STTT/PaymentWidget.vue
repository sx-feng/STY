<!-- src/components/PaymentWidget.vue -->
<template>


  <!-- 支付状态弹窗 -->
  <div v-if="pay.visible" class="pay-mask">
    <div class="pay-dialog">
      <div class="pay-title">支付状态</div>

      <div class="pay-amount">
        需支付 {{ tokenRef }}：<b>{{ pay.amountUSDT }}</b>
      </div>

      <div class="pay-progress">
        <div class="label">进度</div>
        <div class="box">{{ pay.progressText }}</div>
      </div>

      <div class="pay-tip">
        <p class="warn">⚠ 支付过程中请不要刷新或关闭界面，否则会充值失败。</p>
        <p v-if="pay.tipText">{{ pay.tipText }}</p>
      </div>

      <button v-if="pay.closable" class="pay-close-btn" @click="handleClose">
        关闭
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed ,watch } from 'vue'
import { useDepositFlow } from '@/utils/useDepositFlow.js'

const props = defineProps({
  // 默认依赖（也可以完全不传，改为外部 startExternal 时提供）
  WalletTP: { type: Object, required: false },
  RequestOrder: { type: Function, required: false },
  SubmitOrder: { type: Function, required: false },

  // 运行参数（可选，外部调用时也可覆盖）
  token: { type: String, default: 'USDT' },
  amount: { type: [String, Number], default: '' }, // 若你想由父组件直接控制金额
  

  // UI 可选配置
  showBalance: { type: Boolean, default: true },
  showList: { type: Boolean, default: true },
  showBuiltinInput: { type: Boolean, default: true }, // 是否显示内置输入 + 按钮

  // 默认余额/列表
  defaultBalance: { type: Number, default: 1000 },
  defaultRechargeList: {
    type: Array,
    default: () => ([
      { amount: '100.00', date: '2025-09-10 12:20' },
      { amount: '58.50',  date: '2025-09-09 09:05' }
    ])
  },
  defaultWithdrawList: {
    type: Array,
    default: () => ([
      { amount: '20.00',  date: '2025-09-08 18:33' }
    ])
  }
})

const emit = defineEmits(['done','close'])

const mode = ref('deposit')
const localAmount = ref(String(props.amount ?? ''))
const balance = ref(props.defaultBalance)
const listType = ref('recharge')
const rechargeList = ref(props.defaultRechargeList)
const withdrawList = ref(props.defaultWithdrawList)

const rows = computed(() => listType.value === 'recharge' ? rechargeList.value : withdrawList.value)
const tokenRef = ref(props.token || 'USDT')
watch(() => props.token, v => { tokenRef.value = v || 'USDT' })
// 默认依赖（可为空；我们在调用时允许覆盖）
const { pay, runDepositFlow, closePay } = useDepositFlow({
  WalletTP: props.WalletTP,
  RequestOrder: props.RequestOrder,
  SubmitOrder: props.SubmitOrder,
  defaultToken: tokenRef.value,
  orderId:props.orderId
})



function handleClose(){
  closePay()
  emit('close')
}

/**
 * === 对外暴露：外部全量传入（金额/币种/函数对象） ===
 * 调用示例：
 *   payRef.value.startExternal({
 *     amount: 99.9,
 *     token: 'USDT',
 *     WalletTP,
 *     RequestOrder,
 *     SubmitOrder,
 *     checkTrxEarly: true
 *   })
 */
async function startExternal({ amount, token, WalletTP, RequestOrder, SubmitOrder, checkTrxEarly = true ,orderId} = {}) {
  if (token) tokenRef.value = token 
  const result = await runDepositFlow({
    amount,
    token: token ?? tokenRef.value, 
    WalletTP: WalletTP ?? props.WalletTP,
    RequestOrder: RequestOrder ?? props.RequestOrder,
    SubmitOrder: SubmitOrder ?? props.SubmitOrder,
    checkTrxEarly,
    orderId
  })
  emit('done', result)
  return result
}
function open(amount){ /* 如需手动只弹窗： */ pay.visible = true; pay.amountUSDT = String(amount ?? pay.amountUSDT) }
function close(){ closePay() }

defineExpose({ startExternal, open, close, pay })
</script>

<style scoped>
/* —— 样式保持不变（略） —— */
.funds-page{ min-height:100vh;background:#000;padding:18px 30px 20px;display:flex;flex-direction:column;align-items:center;overflow-x:hidden;font-family:"Microsoft YaHei",system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;}
.action-switch{ width:100%;max-width:430px;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 18px;margin-top:40px;}
.pill{ background:#fff;border:1px solid #d8d8d8;border-radius:999px;padding:12px 14px;font-weight:600;font-size:16px;cursor:pointer;width:100%;}
.pill.active{ background:linear-gradient(135deg,#ecd693,#f1d789,#f5e5a4);border-color:#FFD24D;color:#000;box-shadow:0 0 12px rgba(255,210,77,.55);}
.platform-balance{ color:#FFD24D;font-size:18px;font-weight:bold;margin-bottom:20px;}
.amount-input{ margin-top:20px;width:calc(100% - 20px);margin-right:30px;max-width:430px;background:#fff;border:none;border-radius:20px;padding:16px 10px;font-size:15px;outline:none;margin-bottom:14px;}
.confirm-btn{ width:100%;background:#e49f00;border:none;border-radius:999px;padding:12px 14px;font-size:18px;font-weight:800;color:#000;cursor:pointer;margin-bottom:18px;}
.list-card{ position:relative;width:94%;max-width:430px;background:rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:14px 12px 16px;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06);overflow:hidden;margin-top:30px;}
.gold-spotlight{ --w:100%;--h:220%;--scaleY:.56;--blur:90px;position:absolute;left:50%;top:-4%;width:var(--w);height:var(--h);transform:translateX(-50%) scaleY(var(--scaleY));background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.70) 0%,rgba(255,193,7,.35) 38%,rgba(0,0,0,.98) 100%),radial-gradient(ellipse at 50% 100%,rgba(255,215,0,.40) 0%,rgba(0,0,0,.98) 65%);filter:blur(var(--blur));z-index:0;pointer-events:none;}
.gold-spotlight .gold-core{ position:absolute;left:50%;top:16%;transform:translateX(-50%);width:2px;height:72%;background:linear-gradient(to bottom,rgba(255,215,0,0) 0%,rgba(255,215,0,.6) 15%,rgba(255,215,0,.95) 50%,rgba(255,215,0,.6) 85%,rgba(255,215,0,0) 100%);filter:blur(2px) drop-shadow(0 0 10px rgba(255,215,0,.6));}
.list-tabs{ position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
.tab{ background:#fff;border:1px solid #e3e3e3;border-radius:999px;padding:8px 10px;font-weight:600;cursor:pointer;}
.tab.on{ border-color:#FFD24D;box-shadow:0 0 10px rgba(255,210,77,.4);background-color:#f5e5a4;}
.thead{ position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;color:#f6c244;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);padding:8px 10px;border-radius:10px;font-weight:700;margin-bottom:6px;}
.rows{ position:relative;z-index:1;}
.row{ display:grid;grid-template-columns:1fr 1fr;color:#eaeaea;padding:10px;font-size:14px;border-bottom:1px dashed rgba(255,255,255,0.08);}
.row:last-child{ border-bottom:0;}
.empty{ color:#bbb;text-align:center;padding:14px 0;font-size:13px;}
.pay-mask{ position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999;}
.pay-dialog{ width:min(92vw,420px);background:#111;border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:16px 14px;color:#eee;box-shadow:0 10px 40px rgba(0,0,0,.5);}
.pay-title{ font-size:18px;font-weight:800;margin-bottom:8px;color:#f6c244;}
.pay-amount{ margin-bottom:10px;}
.pay-amount b{ color:#FFD24D;font-size:18px;}
.pay-progress{ margin:10px 0;}
.pay-progress .label{ color:#aaa;font-size:12px;margin-bottom:4px;}
.pay-progress .box{ background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px;white-space:pre-wrap;word-break:break-word;}
.pay-tip{ margin-top:10px;font-size:13px;color:#ddd;}
.pay-tip .warn{ color:#ffcf66;font-weight:600;}
.pay-close-btn{ margin-top:14px;width:100%;background:#e49f00;color:#000;font-weight:800;border:none;border-radius:999px;padding:10px 14px;cursor:pointer;}
</style>
