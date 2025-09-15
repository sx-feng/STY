<template>
  <div class="finance-page">
    <!-- 顶部按钮 -->
    <TopBar />

    <div class="top-actions">
      <button class="tab-btn active">📦 {{ $t('finance.styTreasure') }}</button>
      <button class="tab-btn">📒 {{ $t('finance.styIntro') }}</button>
    </div>

    <!-- 卡片1：动态理财 + 静态理财 -->
    <div class="card">
      <div class="dynamic">
        <div class="dynamic-title">{{ $t('finance.dynamic') }}</div>
        <div class="dynamic-row">
          <span class="rate">{{ $t('finance.currentRate') }}</span>
          <a class="detail" href="javascript:void(0)">{{ $t('finance.detail') }}</a>
        </div>
      </div>

      <!-- 金色分割线 -->
      <div class="gold-divider"></div>

      <div class="static">
        <div class="static-title">{{ $t('finance.static') }}</div>
        <div class="static-row" v-for="(item, index) in staticList" :key="index">
          <span>{{ $t(`finance.period${index+1}`) }}</span>
          <span>{{ item.value }}</span>
        </div>
      </div>
    </div>

    <!-- 卡片2：买卖 STY -->
    <div class="card card-actions">
      <div class="buy-sell">
        <button class="btn buy">{{ $t('finance.buy') }}</button>
        <button class="btn sell">{{ $t('finance.sell') }}</button>
      </div>
      <div class="record">
        <div class="record-box">{{ $t('finance.buyRecord') }}</div>
        <div class="record-box">{{ $t('finance.sellRecord') }}</div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import TopBar from './TopBar.vue';

  const staticList = [
    { period: "3天周期" },
    { period: "10天周期" },
    { period: "22天周期" },
    { period: "33天周期" },
    { period: "60天周期" }
  ]
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
  
  
  .dynamic{
    margin-bottom: 50px;
  }
  .dynamic-title, .static-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
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

  </style>
  