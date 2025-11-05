<template>
  <div class="finance-page">

    <!-- 动态理财板块 -->
    <div class="card">
      <div class="dynamic-title">
        <span>📊 动态理财</span>
        <span class="detail" @click="goDynamicDetail">查看详情</span>
      </div>
      <div class="gold-divider"></div>

     
        <div class="product product-3col" v-for="(item, i) in dynamicList" :key="i">
          <!-- 1) 图标列 -->
          <div class="col-icon">
            <img src="@/assets/动态理财.gif" alt="动态理财" />
          </div>

          <!-- 2) 详情列 -->
          <div class="col-detail">
            <div class="detail-top name" :title="item.name">{{ item.name }}</div>
            <div class="detail-bottom">
              <span class="cycle">{{ item.cycleDays }}小时</span>
              <span class="yield">
                <span class="value">收益率{{ (item.yieldRate * 100 ).toFixed(2) }}%</span>
              </span>
            </div>
          </div>

          <!-- 3) 价格 + 按钮 -->
          <div class="col-cta">
            <div class="price">{{ item.price }} USDT</div>
            <button class="buy-btn" @click="buyProductItem(item.id, 'dynamic')">购买</button>
          </div>
    
      </div>

    </div>

    <!-- 静态理财板块 -->
    <div class="card">
      <div class="static-title">
        <span>📊 静态理财</span>
        <span class="detail" @click="goStaticDetail">查看详情</span>
      </div>
      <div class="gold-divider"></div>



        <div class="product product-3col" v-for="(item, i) in staticList" :key="i">
          <!-- 1) 图标列：居中 -->
          <div class="col-icon">
            <img src="@/assets/静态理财.gif" alt="静态理财" />
          </div>

          <!-- 2) 详情列：上下两块，上=名称居中；下=左周期/右利率（紧凑） -->
          <div class="col-detail">
            <div class="detail-top name" :title="item.name">{{ item.name }}</div>
            <div class="detail-bottom">
              <span class="cycle">{{ item.cycleDays }}天</span>
              <span class="yield">
                <span class="value">收益率{{(((item.yieldRate/item.cycleDays) * 100 )).toFixed(2) }}%</span>
              </span>
            </div>
          </div>

          <!-- 3) 价格/购买列：上下两块，均水平/垂直居中、紧凑 -->
          <div class="col-cta">
            <div class="price">{{ item.price }} USDT</div>
            <button class="buy-btn" @click="buyProductItem(item.id, 'static')">购买</button>
          </div>


      </div>


    </div>

    <!-- 作为“弹窗+状态机”使用：隐藏其内置输入 -->
    <PaymentWidget ref="payRef" :show-balance="true" :show-list="true" :show-builtin-input="false" :WalletTP="WalletTP"
      :RequestOrder="stySell" :SubmitOrder="SubmitOrder" @done="onPayDone" @close="onPayClose" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import router from '@/router'
import { getProductAllStatic, getProductAllSynamic, buyProduct, stySell } from '@/utils/api'
import CallbackCenter from "@/utils/callbackCenter";
import WalletTP from '@/utils/walletTP.js'
import { SubmitOrder } from '@/utils/api.js'
import PaymentWidget from '@/components/STTT/PaymentWidget.vue'

const dynamicList = ref([])
const staticList = ref([])
const payRef = ref(null)
const ready = ref(false)

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

async function buyProductItem(id, type) {
  CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
    try {
      let _productType = type === "static" ? 0 : 1
      const res = await buyProduct({ productType: _productType, twoPassword: pwdMd5, productId: id })
      const body = res?.data
      if (body?.code === 200) {
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

function goDynamicDetail() { router.push("/dynamic") }
function goStaticDetail() { router.push("/statuc") }

function onPayDone(res) { console.log('done', res) }
function onPayClose() { console.log('close') }

onMounted(() => {
  getSynamic()
  getStatic()
  ready.value = true
})
</script>
<style >
/* ========== 页面布局 ========== */
.finance-page {
  min-height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px;
  font-family: "Microsoft YaHei", sans-serif;
  position: relative;
  overflow: hidden;
  font-size: 13px;
  
  padding-top: 60px;
  /* ✅ 全局字体略小 */
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

/* ========== 卡片通用 ========== */
.card {
  
  background: #fff;
  padding: 20px 20px 18px 18px;
  margin: 16px 0;
  width: 90%;
  max-width: 520px;
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15),
    0 0 8px rgba(255, 215, 0, 0.15);
  transition: all 0.25s ease;
  z-index: 1;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18),
    0 0 10px rgba(255, 215, 0, 0.25);
}

/* ========== 标题部分 ========== */
.dynamic-title,
.static-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  /* ✅ 略小标题 */
}

.detail {
  font-size: 12px;
  font-weight: bold;
  color: #f6c244;
  cursor: pointer;
  transition: 0.25s;
}

.detail:hover {
  color: #ffd700;
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
}

/* ========== 金色分割线 ========== */
.gold-divider {
  height: 2px;
  margin: 10px 0 14px;
  background: linear-gradient(90deg, #fff4a3, #f6c244, #fff4a3);
  border-radius: 2px;
  box-shadow: 0 0 4px rgba(246, 194, 68, 0.4);
}

/* ========== 商品列表容器 ========== */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 6px;
}

/* ========== 单个商品卡片（3列结构） ========== */
/* ========== 单个商品卡片（3列结构） ========== */
.product.product-3col {
  display: grid;
  grid-template-columns: 80px 1fr 80px; /* 左右对称 */
  align-items: stretch;
  column-gap: 12px;
  background: #fffdf5;
  border-radius: 14px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08),
              0 0 5px rgba(255, 215, 0, 0.08);
  transition: all 0.25s ease;
  margin: 10px 0;
  padding: 10px 0;
}

.product.product-3col:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12),
              0 0 6px rgba(255, 215, 0, 0.2);
}
.product.product-3col .col-detail .detail-top.name {
  flex: unset !important;
  margin-left: 0 !important;
  text-align: left;
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

/* ========== 1. 图标列 ========== */
.col-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.col-icon img {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* ========== 2. 详情列 ========== */
.col-detail {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 0;            /* 让内容上下有呼吸感 */
  padding-left: 10px;        /* 左边距用于对齐 */
  box-sizing: border-box;
}

/* 上行：商品名称（靠下左） */
.detail-top.name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  text-align: left;
  margin: 0;
  padding: 0;
  line-height: 1.3;
  display: flex;
  align-items: flex-end;      /* ✅ 让文字靠下 */
  min-height: 26px;           /* ✅ 保证上行高度一致 */
}

/* 下行：周期/收益（靠上 左右对齐） */
.detail-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;     /* ✅ 靠上 */
  font-size: 12px;
  color: #555;
  margin-top: 4px;
  line-height: 1.2;
}

/* 左边靠上左，有些边距 */
.detail-bottom .cycle {
  margin-left: 2px;
  margin-top: 0;
  text-align: left;
}

/* 右边靠上右，有些边距 */
.detail-bottom .yield {
  margin-right: 2px;
  text-align: right;
  font-weight: 700;
  color: #4caf50;
  text-shadow: 0 0 4px rgba(76, 175, 80, 0.3);
}

/* ✅ 特别强调：上下两行左边完全对齐 */
.detail-top.name,
.detail-bottom .cycle {
  padding-left: 0;
  margin-left: 0;
}

/* ========== 3. 购买列 ========== */
.col-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* ✅ 垂直水平居中 */
  height: 100%;
  gap: 6px;
}

.col-cta .price {
  font-size: 13px;
  font-weight: 700;
  color: #d6a520;
  line-height: 1.1;
}

.col-cta .buy-btn {
  background: linear-gradient(135deg, #f6c244, #d6a520);
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 1px 3px rgba(246, 194, 68, 0.3);
  white-space: nowrap;
}

.col-cta .buy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 6px rgba(246, 194, 68, 0.4);
  background: linear-gradient(135deg, #ffea70, #ffc300);
}

/* ========== 小屏优化 ========== */
@media (max-width: 400px) {
  .product.product-3col {
    grid-template-columns: 70px 1fr 70px;
    column-gap: 8px;
  }

  .col-icon img {
    width: 42px;
    height: 42px;
  }

  .detail-top.name {
    font-size: 13px;
    min-height: 22px;
  }

  .col-cta .buy-btn {
    padding: 5px 10px;
    font-size: 11px;
  }
}



</style>
