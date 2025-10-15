import { ref, onMounted, watch } from 'vue'
import { userFeeRate } from '@/utils/api'  // ✅ 用你封装的接口

export function useFee(amountRef) {
  const feeRate = ref(0)     // 手续费率
  const fee = ref(0)         // 手续费金额
  const netAmount = ref(0)   // 实际到账金额

  // 获取手续费率
  const fetchFeeRate = async () => {
    try {
      const res = await userFeeRate()
      console.log(res,"00000000000000000000000000000000000")
      if (res.data.code === 200 && res.data != null) {
        feeRate.value = parseFloat(res.data.data)
      } else {
        console.warn('手续费率获取失败:', res.message)
        feeRate.value = 0
      }
    } catch (err) {
      console.error('获取手续费率异常:', err)
      feeRate.value = 0
    }
  }

  // 动态计算（金额或费率变化时自动计算）
  watch([amountRef, feeRate], () => {
    const amount = Number(amountRef.value || 0)
    fee.value = amount * feeRate.value
    netAmount.value = amount - fee.value
    console.log( fee.value,"erjhawiuhruiweahiru")
  })

  // 页面加载时获取费率
  onMounted(fetchFeeRate)

  return { feeRate, fee, netAmount, fetchFeeRate }
}
