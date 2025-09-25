<template>
  <div class="finance-page">


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
           <!-- ✅ 新增 -->
  <a class="detail" href="javascript:void(0)" @click="goDynamicDetail">
    {{ $t('finance.detail') }}
  </a>
        </div>
      </div>

      <!-- 金色分割线 -->
      <div class="gold-divider"></div>

      <div class="static">
        <div class="static-title">{{ $t('finance.static') }}
           <!-- ✅ 新增 -->
  <a class="detail" href="javascript:void(0)" @click="goStaticDetail">
    {{ $t('finance.detail') }}
  </a>
        </div>
        <div class="static-row" v-for="(item, index) in staticList" :key="index">
          <span>{{ $t(`finance.period${index+1}`) }}</span>
          <span>{{ item.value }}</span>
        </div>
      </div>
    </div>

    <!-- 卡片2：买卖 STY -->
    <div class="card card-actions">
      <div class="buy-sell">
        <button class="btn sell">{{ $t('finance.sell') }}</button>
      </div>
      <div class="record">
        <div class="record-box">{{ $t('finance.buyRecord') }}</div>
        <div class="record-box">{{ $t('finance.sellRecord') }}</div>
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
  </div>
</template>
  
  <script setup>

import router from '@/router';
  const staticList = [
    { period: "3天周期" },
    { period: "10天周期" },
    { period: "22天周期" },
    { period: "33天周期" },
    { period: "60天周期" }
  ]
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


  // 跳转到动态理财详情
function goDynamicDetail() {
  router.push("/dynamic")
}

// 跳转到静态理财详情
function goStaticDetail() {
  router.push("/statuc")
}

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
  margin-left: auto;             /* ✅ 确保详情贴右边 */
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
         /* ✅ 比普通卡片更窄 */
  max-width: 360px;   /* ✅ 限制最大宽度 */
  margin-bottom: 40px; /* ✅ 和底部多留点空间 */
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
  color: #f6c244;         /* 金色 */
  text-decoration: none;  /* 去掉下划线 */
  cursor: pointer;
  transition: 0.25s;
}

.detail:hover {
  color: #ffd700;         /* 更亮的金色 */
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
}
/* Shop 外层：竖向滑动区域 */
.shop {
  margin-top: 20px;
  max-height: 240px;     /* 限制高度，超出部分可滚动 */
  overflow-y: auto;      /* 竖向滚动 */
  padding-right: 6px;    /* 给滚动条留点空间 */
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
  padding: 6px 10px;  /* 内边距更小 */
  font-size: 12px;    /* 字体更小 */
  border-radius: 6px; /* 圆角更紧凑 */
  background: linear-gradient(90deg, #f6c244, #d6a520);
  border: none;
  color: #000;
  font-weight: 500;   /* 取消过粗 */
  cursor: pointer;
  transition: .25s;
   width: fit-content;     
  max-width: 100px;  
}

.shop-item .btn.buy:hover {
  transform: translateY(-1px); /* 悬停时轻微浮动 */
  box-shadow: 0 0 6px rgba(246,194,68,0.5);
}


  </style>
  