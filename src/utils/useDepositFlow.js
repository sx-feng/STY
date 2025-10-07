// src/composables/useDepositFlow.js
import { reactive } from 'vue'

export function useDepositFlow({
  WalletTP,            // 默认钱包工具（可在 runDepositFlow 时覆盖）
  RequestOrder,        // 默认创建订单（可覆盖）
  SubmitOrder,         // 默认提交订单（可覆盖）
  defaultToken = 'USDT',
  orderId
} = {}) {
  if (!WalletTP)   throw new Error('useDepositFlow: 缺少 WalletTP')
  if (!RequestOrder) throw new Error('useDepositFlow: 缺少 RequestOrder')
  if (!SubmitOrder)  throw new Error('useDepositFlow: 缺少 SubmitOrder')

  // —— 弹窗状态 —— //
  const pay = reactive({
    visible: false,
    closable: false,
    amountUSDT: '0',
    progressText: '',
    tipText: '',
  })

  function openPay(amount){
    const val = typeof amount === 'number' ? amount : Number(amount?.value ?? amount ?? 0)
    pay.amountUSDT = String(val || 0)
    pay.progressText = '准备中…'
    pay.tipText = ''
    pay.closable = false
    pay.visible = true
  }
  function setProgress(text){ pay.progressText = String(text || '') }
  function setTip(text){ pay.tipText = String(text || '') }
  function closePay(){ pay.visible = false }

  // —— 小工具 —— //
  const sleep = (ms)=> new Promise(r=>setTimeout(r, ms))
  function getAvailResources(r){
    const enLimit = Number(r?.EnergyLimit || 0)
    const enUsed  = Number(r?.EnergyUsed  || 0)
    const freeL   = Number(r?.freeNetLimit || 0)
    const freeU   = Number(r?.freeNetUsed  || 0)
    const netL    = Number(r?.NetLimit || 0)
    const netU    = Number(r?.NetUsed  || 0)
    const energyAvail = Math.max(0, enLimit - enUsed)
    const bandwidthAvail = Math.max(0, (freeL - freeU) + (netL - netU))
    return { energyAvail, bandwidthAvail }
  }
  async function retryWithStatus(taskName, fn, maxTry = 3, onProgress) {
    let lastErr
    for (let i = 1; i <= maxTry; i++) {
      try {
        onProgress?.(i, maxTry)
        return await fn(i)
      } catch (e) {
        lastErr = e
        if (i < maxTry) await sleep(1500)
      }
    }
    throw lastErr || new Error(`${taskName} 失败`)
  }

  /**
   * 统一充值流程（支持每次调用覆盖依赖）
   * @param {Object} args
   * @param {number|string|Ref} args.amount
   * @param {boolean} args.checkTrxEarly
   * @param {string} args.token
   * @param {Object} args.WalletTP 覆盖默认钱包
   * @param {Function} args.RequestOrder 覆盖默认创建订单
   * @param {Function} args.SubmitOrder 覆盖默认提交订单
   * @returns {Promise<{success:boolean, orderNo?:string, txid?:string, message?:string}>}
   */
  async function runDepositFlow({
    amount,
    checkTrxEarly = true,
    token = defaultToken,
    WalletTP: WalletTPOverride,
    RequestOrder: RequestOrderOverride,
    SubmitOrder: SubmitOrderOverride,
    orderId:orderIdArg
  } = {}) {
    // —— 本次调用使用的依赖（可覆盖）——
    const W  = WalletTPOverride       ?? WalletTP
    const RO = RequestOrderOverride   ?? RequestOrder
    const SO = SubmitOrderOverride    ?? SubmitOrder


    if (!W || !RO || !SO) {
      return { success:false, message:'依赖未注入完整（WalletTP/RequestOrder/SubmitOrder）' }
    }

    const now = () => Date.now()

    function progressStep(title, { attempt = null, max = null, remainMs = null } = {}) {
      let suffix = ''
      if (attempt != null && max != null) suffix += `（第 ${attempt}/${max} 次）`
      if (remainMs != null) suffix += `（剩余 ${Math.ceil(remainMs / 1000)} 秒）`
      setProgress(title + suffix)
    }
    async function waitUntil(checkFn, {
      timeoutMs = 120_000,
      intervalMs = 3_000,
      title = '等待条件成立',
    } = {}) {
      const deadline = now() + timeoutMs
      let attempt = 0
      while (now() < deadline) {
        attempt++
        const ok = await checkFn(attempt)
        const remain = deadline - now()
        progressStep(title, { attempt, max: Math.ceil(timeoutMs / intervalMs), remainMs: remain })
        if (ok) return true
        await sleep(intervalMs)
      }
      return false
    }

    async function getEnergyEnough() {
      const rr = await W.getResources()
      if (rr.code !== 1) throw new Error(rr.msg || '无法获取账户资源')
      const { energyAvail, bandwidthAvail } = getAvailResources(rr.data)
    console.log(energyAvail);
    
      return { energyEnough: energyAvail >= 65000, energyAvail, bandwidthAvail }
    }
    async function getTrx() {
      const t = await W.getTrxBalance()
      if (t.code !== 1) throw new Error(t.msg || '无法获取 TRX 余额')
      return Number(t.data?.trx || 0)
    }
    async function getTokenBalance(symbol) {
      const u = await W.getTrc20Balance(symbol)
      if (u.code !== 1) throw new Error(u.msg || `无法获取 ${symbol} 余额`)
      return Number(u.data?.balance || 0)
    }

    // ===== 1) 金额校验 & 打开弹窗 =====
    const amt = typeof amount === 'number'
      ? amount
      : Number((amount && amount.value != null) ? amount.value : amount)
    if (!amt || !isFinite(amt) || amt <= 0) {
      return { success:false, message:'请输入正确的金额' }
    }
    openPay(amt)

    // ===== 2) 资源检查 & （可选）前置 TRX 检查 =====
    setProgress('校验账号状态…')
    let energyEnough
    try {
      ({ energyEnough } = await getEnergyEnough())
    } catch (e) {
      setProgress('获取资源失败')
      setTip(e?.message || '无法获取账户资源')
      pay.closable = true
      return { success:false, message: e?.message }
    }

    const needTrxMin = energyEnough ? 1 : 3
    if (checkTrxEarly) {
      progressStep(`检测 TRX 余额（需 ≥ ${needTrxMin}）…`)
      try {
        const trx = await getTrx()
        if (energyEnough && trx < 1) {
          setProgress('校验未通过')
          setTip('能量/带宽已足够，但 TRX 不足 1 个。请先补充 TRX 后再试。')
          pay.closable = true
          return { success:false, message:'TRX不足1' }
        }
        if (!energyEnough && trx < 3) {
          setProgress('校验未通过')
          setTip('能量不足，需先租用能量。请确保 TRX ≥ 3 个以支付链上费用。')
          pay.closable = true
          return { success:false, message:'TRX不足3' }
        }
      } catch (e) {
        setProgress('获取 TRX 余额失败')
        setTip(e?.message || '无法获取余额')
        pay.closable = true
        return { success:false, message:e?.message }
      }
    }

    // ===== 3) 代币余额校验 =====
    progressStep(`检测 ${token} 余额…`)
    let tokenBal
    try {
      tokenBal = await getTokenBalance(token)
    } catch (e) {
      setProgress(`获取 ${token} 余额失败`)
      setTip(e?.message || `无法获取 ${token} 余额`)
      pay.closable = true
      return { success:false, message:e?.message }
    }
    if (tokenBal < amt) {
      setProgress('余额不足')
      setTip(`${token} 余额不足：需 ${amt}，当前 ${tokenBal}`)
      pay.closable = true
      return { success:false, message:'Token余额不足' }
    }
    if (tokenBal === amt) {
      setTip(`温馨提示：请确保账户 ${token} 余额留有少量余量，以免后续手续费影响。`)
    }

    // ===== 4) 创建订单（3次重试） =====
    progressStep('创建订单…')
    let orderResp
    try {
      orderResp = await retryWithStatus(
        '创建订单',
        async (i) => {
     let r = await RO({ amount: String(amt), orderId: orderIdArg })

          r = r?.data ?? r
          if (!r) throw new Error('响应为空或不合法')
          return r
        },
        3,
        (i, max) => progressStep('创建订单…', { attempt: i, max })
      )
    } catch (e) {
      setProgress('创建订单失败')
      setTip(e?.message || '系统错误，请稍后重试或联系客服')
      pay.closable = true
      return { success:false, message:e?.message }
    }

    const okCode = (orderResp.code === 200 || orderResp.code === 401) && orderResp.data
    if (!okCode) {
      setProgress('创建订单失败')
      setTip(orderResp?.message || '系统错误，请稍后重试或联系客服')
      pay.closable = true
      return { success:false, message:orderResp?.message }
    }
    let { orderNo, platformReceiveAddress, leaseAddress, tradingTrx } = orderResp.data || {}
    if (!platformReceiveAddress || !orderNo) {
      setProgress('订单数据异常')
      setTip('平台收款地址或订单号缺失')
      pay.closable = true
      return { success:false, message:'订单数据异常' }
    }

    // ===== 5) 若选择“先下单再收 TRX”，在此等待 TRX 到账 =====
    if (!checkTrxEarly) {
      try {
        ({ energyEnough } = await getEnergyEnough())
      } catch (e) {
        setProgress('获取资源失败')
        setTip(e?.message || '无法获取账户资源')
        pay.closable = true
        return { success:false, message:e?.message }
      }
      const needMinAfterOrder = energyEnough ? 1 : 3
      const ok = await waitUntil(async () => {
        try {
          const trx = await getTrx()
          setTip(`等待 TRX 到账中…当前余额：${trx}，需 ≥ ${needMinAfterOrder}`)
          return trx >= needMinAfterOrder
        } catch {
          return false
        }
      }, {
        timeoutMs: 120_000,
        intervalMs: 3_000,
        title: `等待 TRX 到账（需 ≥ ${needMinAfterOrder}）…`
      })
      if (!ok) {
        setProgress('TRX 到账超时')
        setTip('120 秒内 TRX 未到账，请稍后再试或联系客服')
        pay.closable = true
        return { success:false, message:'TRX到账超时' }
      }
    }

    // ===== 6) 若能量不足则先租能量（TRX 转租赁地址） =====
    try {
      ({ energyEnough } = await getEnergyEnough())
    } catch (e) {
      setProgress('获取资源失败')
      setTip(e?.message || '无法获取账户资源')
      pay.closable = true
      return { success:false, message:e?.message }
    }

    if (!energyEnough) {
      const trx4Lease = (Number(tradingTrx) >= 4 ? 4 : 2);
      progressStep(`租用能量：向租赁地址转 TRX（${trx4Lease}）…`)
      try {
        await retryWithStatus(
          '租能量',
          async () => {
            const res = await W.transfer({ to: leaseAddress, tokenType: 'TRX', amount: String(trx4Lease) })
            if (res.code !== 1) throw new Error(res.msg || 'TRX 转账失败')
            const okTx = res?.data?.tx?.transaction?.txID || res?.data?.signed?.txID || res?.data?.res?.txid
            if (!okTx) throw new Error('未获得 TRX 交易哈希')
            return res
          },
          3,
          (i, max) => progressStep(`租用能量：向租赁地址转 TRX（${trx4Lease}）…`, { attempt: i, max })
        )
      } catch (e) {
        setProgress('租能量失败')
        setTip(e?.message || '请稍后再试')
        pay.closable = true
        return { success:false, message:e?.message }
      }

      // 等待能量到账（≤60s）
      const ok = await waitUntil(async () => {
        const rr = await W.getResources()
        if (rr.code !== 1) return false
        const { energyAvail: e2 } = getAvailResources(rr.data)
        return e2 >= 60000
      }, {
        timeoutMs: 60_000,
        intervalMs: 3_000,
        title: '等待能量到账…'
      })
      if (!ok) {
        setProgress('能量未就绪')
        setTip('能量/带宽未在 60 秒内就绪，请稍后再试或联系客服')
        pay.closable = true
        return { success:false, message:'能量未就绪' }
      }
    }

    // ===== 7) 支付 token =====
    progressStep(`支付 ${token} 中…`)
    let payHash = ''
    try {
      const tx = await retryWithStatus(
        `${token} 支付`,
        async () => {
          const r = await W.transfer({ to: platformReceiveAddress, tokenType: token, amount: String(amt) })
          if (r.code !== 1) throw new Error(r.msg || `${token} 转账失败`)
          const txid = r?.data?.tx?.transaction?.txID || r?.data?.signed?.txID || r?.data?.res?.txid
          if (!txid) throw new Error('未获得交易哈希')
          return { txid }
        },
        3,
        (i, max) => progressStep(`支付 ${token} 中…`, { attempt: i, max })
      )
      payHash = tx.txid
    } catch (e) {
      setProgress(`${token} 支付失败`)
      setTip(e?.message || '请稍后重试或联系客服')
      pay.closable = true
      return { success:false, message:e?.message }
    }

    // ===== 8) 提交订单并轮询确认 =====
    progressStep('提交订单并确认中…')
    const start = now()
    const timeout = 120_000
    let success = false
    let lastMsg = ''
    let attempt = 0

    while (now() - start < timeout) {
      attempt++
      try {
        let resp = await SO({ amount: String(amt), orderNo, txid: payHash })
        resp = resp?.data ?? resp
        if (resp?.data?.status === 5) {
          success = true
          break
        }
        lastMsg = resp?.message || lastMsg || '等待链上确认…'
      } catch (e) {
        lastMsg = e?.message || lastMsg
      }
      const remain = timeout - (now() - start)
      progressStep('确认中…', { attempt, max: Math.ceil(timeout / 3000), remainMs: remain })
      setTip(lastMsg || '等待链上确认…')
      await sleep(3000)
    }

    if (success) {
      setProgress('充值成功，请查收')
      setTip(`订单号：${orderNo}\n交易哈希：${payHash}`)
      pay.closable = true
      return { success:true, orderNo, txid: payHash }
    } else {
      setProgress('确认超时')
      setTip('后台正在确认订单中。如长时间不到账，请联系客服处理。')
      pay.closable = true
      return { success:false, orderNo, txid: payHash, message:'确认超时' }
    }
  }

  return {
    pay, openPay, closePay,
    runDepositFlow,
    setProgress, setTip,
  }
}
