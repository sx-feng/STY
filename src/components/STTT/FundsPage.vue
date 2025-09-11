
<template>
    <div class="funds-page">
      <!-- 顶部：入金 / 出金 -->
      <div class="action-switch">
        <button
          class="pill"
          :class="{ active: mode==='deposit' }"
          @click="mode='deposit'"
        >📦 入金</button>
  
        <button
          class="pill"
          :class="{ active: mode==='withdraw' }"
          @click="mode='withdraw'"
        >📒 出金</button>
      </div>
  
      <!-- 金额输入 -->
      <input
        class="amount-input"
        type="number"
        inputmode="decimal"
        :placeholder="mode==='deposit' ? '请输入充值量' : '请输入提现量'"
        v-model.trim="amount"
      />
  
      <!-- 确认 -->
      <button class="confirm-btn" @click="onConfirm">确认</button>
  
      <!-- 列表卡片（黑金聚光灯） -->
      <div class="list-card">
        <div class="gold-spotlight"><i class="gold-core"></i></div>
  
        <!-- 切换：充值列表 / 提现列表 -->
        <div class="list-tabs">
          <button
            class="tab"
            :class="{ on: listType==='recharge' }"
            @click="listType='recharge'"
          >📦 充值列表</button>
          <button
            class="tab"
            :class="{ on: listType==='withdraw' }"
            @click="listType='withdraw'"
          >📒 提现列表</button>
        </div>
  
        <!-- 表头 -->
        <div class="thead">
          <span>{{ listType==='recharge' ? '充值数量' : '提现数量' }}</span>
          <span>{{ listType==='recharge' ? '充值日期' : '提现日期' }}</span>
        </div>
  
        <!-- 数据行（示例，替换为后端数据） -->
        <div class="rows">
          <div class="row" v-for="(item,i) in rows" :key="i">
            <span>{{ item.amount }}</span>
            <span>{{ item.date }}</span>
          </div>
          <div v-if="rows.length===0" class="empty">暂无记录</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const mode = ref('deposit')           // 'deposit' | 'withdraw'
  const listType = ref('recharge')      // 'recharge' | 'withdraw'
  const amount = ref('')
  
  // 假数据：实际请替换为接口返回
  const rechargeList = ref([
    { amount: '100.00', date: '2025-09-10 12:20' },
    { amount: '58.50',  date: '2025-09-09 09:05' }
  ])
  const withdrawList = ref([
    { amount: '20.00',  date: '2025-09-08 18:33' }
  ])
  
  const rows = computed(() =>
    listType.value === 'recharge' ? rechargeList.value : withdrawList.value
  )
  
  function onConfirm() {
    if (!amount.value) return alert('请输入金额')
    // TODO: 调用入金/出金接口
    // 示例：确认后清空
    alert(`${mode.value === 'deposit' ? '入金' : '出金'}成功：${amount.value}`)
    amount.value = ''
  }
  </script>
  
  <style scoped>
  .funds-page{
    min-height: 100vh;
    background: #000;
    padding: 18px 16px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-x: hidden;
    font-family: "Microsoft YaHei", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  }
  
  /* 顶部切换 */
  .action-switch{
    width: 100%;
    max-width: 430px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin: 6px 0 18px;
  }
  .pill{
    background: #fff;
    border: 1px solid #d8d8d8;
    border-radius: 999px;
    padding: 10px 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .pill.active{
    border-color: #FFD24D;
    color: #000;
    box-shadow: 0 0 12px rgba(255,210,77,.45);
  }
  
  /* 输入 & 确认 */
  .amount-input{
    width: 100%;
    max-width: 430px;
    background: #fff;
    border: none;
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 15px;
    outline: none;
    margin-bottom: 14px;
  }
  .confirm-btn{
    width: 100%;
    max-width: 430px;
    background: #f6c244;
    border: none;
    border-radius: 999px;
    padding: 12px 0;
    font-size: 18px;
    font-weight: 800;
    color: #000;
    cursor: pointer;
    margin-bottom: 18px;
  }
  
  /* 列表卡片容器 */
  .list-card{
    position: relative;
    width: 100%;
    max-width: 430px;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 14px 12px 16px;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
    overflow: hidden;
  }
  
  /* 金色聚光灯 + 中央竖线 */
  .gold-spotlight{
    --w: 180%;
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
        rgba(255,215,0,.70) 0%,
        rgba(255,193,7,.35) 38%,
        rgba(0,0,0,.98) 100%),
      radial-gradient(ellipse at 50% 100%,
        rgba(255,215,0,.40) 0%,
        rgba(0,0,0,.98) 65%);
    filter: blur(var(--blur));
    z-index: 0;
    pointer-events: none;
  }
  .gold-spotlight .gold-core{
    position: absolute;
    left: 50%;
    top: 16%;
    transform: translateX(-50%);
    width: 2px;
    height: 72%;
    background: linear-gradient(to bottom,
      rgba(255,215,0,0) 0%,
      rgba(255,215,0,.6) 15%,
      rgba(255,215,0,.95) 50%,
      rgba(255,215,0,.6) 85%,
      rgba(255,215,0,0) 100%);
    filter: blur(2px) drop-shadow(0 0 10px rgba(255,215,0,.6));
  }
  
  /* 列表 tabs */
  .list-tabs{
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }
  .tab{
    background: #fff;
    border: 1px solid #e3e3e3;
    border-radius: 999px;
    padding: 8px 10px;
    font-weight: 600;
    cursor: pointer;
  }
  .tab.on{
    border-color: #FFD24D;
    box-shadow: 0 0 10px rgba(255,210,77,.4);
  }
  
  /* 表头 & 行 */
  .thead{
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    color: #f6c244;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    padding: 8px 10px;
    border-radius: 10px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .rows{
    position: relative;
    z-index: 1;
  }
  .row{
    display: grid;
    grid-template-columns: 1fr 1fr;
    color: #eaeaea;
    padding: 10px;
    font-size: 14px;
    border-bottom: 1px dashed rgba(255,255,255,0.08);
  }
  .row:last-child{ border-bottom: 0; }
  .empty{
    color: #bbb;
    text-align: center;
    padding: 14px 0;
    font-size: 13px;
  }
  </style>
  