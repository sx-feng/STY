
<template>
    <div class="funds-page">
      <div>
      <div class="action-switch">
        <button
          class="pill"
          :class="{ active: mode==='deposit' }"
          @click="mode='deposit'"
        >📦 {{ $t('funds.deposit') }}</button>
        <button
          class="pill"
          :class="{ active: mode==='withdraw' }"
          @click="mode='withdraw'"
        >📒 {{ $t('funds.withdraw') }}</button>
      </div>

      <input
        class="amount-input"
        type="number"
        inputmode="decimal"
          :placeholder="mode==='deposit' ? $t('funds.depositPlaceholder') : $t('funds.withdrawPlaceholder')"
        v-model.trim="amount"
      />
  
      <button class="confirm-btn" @click="onConfirm">  {{ $t('funds.confirm') }}</button>
    </div>
      <div class="list-card">
        <div class="gold-spotlight"><i class="gold-core"></i></div>
  
        <div class="list-tabs">
          <button
            class="tab"
            :class="{ on: listType==='recharge' }"
            @click="listType='recharge'"
          >📦 {{ $t('funds.rechargeList') }}</button>
          <button
            class="tab"
            :class="{ on: listType==='withdraw' }"
            @click="listType='withdraw'"
          >📒 {{ $t('funds.withdrawList') }}</button>
        </div>
  
        <div class="thead">
          <span>{{ listType==='recharge' ? $t('funds.rechargeAmount') : $t('funds.withdrawAmount') }}</span>
        <span>{{ listType==='recharge' ? $t('funds.rechargeDate') : $t('funds.withdrawDate') }}</span>
      
        </div>
  
        <div class="rows">
          <div class="row" v-for="(item,i) in rows" :key="i">
            <span>{{ item.amount }}</span>
            <span>{{ item.date }}</span>
          </div>
          <div v-if="rows.length===0" class="empty">{{ $t('funds.noRecord') }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
import TopBar from './TopBar.vue'
  
  const mode = ref('deposit')          
  const listType = ref('recharge')      
  const amount = ref('')

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
 
    alert(`${mode.value === 'deposit' ? '入金' : '出金'}成功：${amount.value}`)
    amount.value = ''
  }
  </script>
  
  <style scoped>
  .funds-page{
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
  .action-switch{
    width: 100%;
    max-width: 430px;
    display: grid;
    grid-template-columns: 1fr 1fr;
      gap: 8px;
    margin: 6px 0 18px;
    margin-top: 40px;

  }
  .pill{
    background: #fff;
    border: 1px solid #d8d8d8;
    border-radius: 999px;
    padding: 12px 14px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    width: 100%;
  }
  .pill.active{
  background: linear-gradient(135deg, #ecd693, #f1d789, #f5e5a4);
  border-color: #FFD24D;
  color: #000;
  box-shadow: 0 0 12px rgba(255, 210, 77, .55);
}

  
  
  /* 输入 & 确认 */
  .amount-input{
   
    margin-top: 20px;
    width: calc(100% - 20px); /* 比容器窄一点 */
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
 
  .confirm-btn{
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
  .list-card{
    position: relative;
    width: 94%;
    max-width: 430px;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 14px 12px 16px;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
    overflow: hidden;
    margin-top: 30px;
  }
  

  .gold-spotlight{
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
    background-color: #f5e5a4;
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
  