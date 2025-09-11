<template>
  <el-config-provider :locale="epLocale">
    <div class="main">
      <!-- //顶部导航栏 -->
      <div class="top-bar">
        <button class="menu-btn">☰</button>
        <button class="action-btn" @click="toggleLang">
          <span class="icon">￥</span>
          <span>{{ t('btn.lang') }}</span>
        </button>
        <button class="action-btn">
          <span class="icon">￥</span>
          <span>{{ t('btn.connect') }}</span>
        </button>
      </div>
      <!-- 矿机按钮 -->
      <div class="button-container">
        <button class="tab-button" :class="{ active: currentTab === 'mine' }" @click="currentTab = 'mine'">
          <span class="icon">🏷</span>
          我的矿机
        </button>
        <button class="tab-button" :class="{ active: currentTab === 'team' }" @click="currentTab = 'team'">
          <span class="icon">🏷</span>
          团队详情
        </button>
      </div>
      <!-- 内容部分 -->
      <div class="card-container">
        <div class="card">
          <div class="card-header">
            <div class="header-item">
              <span class="we">昨日矿机产出:</span>
              <span class="ma">10</span>
            </div>
            <div class="header-item">
              <span class="we">昨日奖励：</span>
              <span class="ma">10</span>
            </div>
            <div class="header-item">
              <span class="we">团队奖励总额：</span>
              <span class="ma">10</span>
            </div>
            <div class="header-item">
              <span class="we">累计收益：</span>
              <span class="ma">10</span>
            </div>
          </div>
          <div class="card-body">
            <div class="exchange">
              <div class="exchange-header">
                闪兑：
                <div class="balance">账户余额：10000</div>
              </div>
              <div class="exchange-box">
                <div class="input-row">
                  <input type="text" placeholder="请输入内容" class="input-text" />
                  <button class="btn-all">全部</button>
                </div>
                <button class="btn-confirm">确定闪兑</button>
              </div>
            </div>
          </div>
          
      </div>
    </div>
      <div class="footer">
            <div class="mon">
              <Span>收益明细：</Span>
              <Span>收益明细>></Span>
            </div>
            <div class="thead">
        <span>时间</span>
        <span>矿机机型</span>
        <span>矿机产出</span>
      </div>

          </div>
        


    </div>




  </el-config-provider>
  <router-view />
  <IntroPage/>
  <FundsPage/>
</template>

<script setup>

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import enUS from 'element-plus/dist/locale/en.mjs'
import { ref } from 'vue';
import IntroPage from './components/STTT/IntroPage.vue';
import FundsPage from './components/STTT/FundsPage.vue';


const currentTab = ref('mine')



const { t, locale } = useI18n()
const epLocale = computed(() => (locale.value === 'zh' ? zhCn : enUS))

function toggleLang() {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('lang', locale.value)
}


</script>

<style>
/* 替换这段：让页面能滚动 */
.main {
  background: #000;
  /* height: 100vh;  <-- 删掉这句 */
  min-height: 100vh;      /* 改成最小高度 */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 50px;
  position: relative;
  overflow-x: hidden;      /* 只隐藏横向 */
  overflow-y: auto;        /* 允许纵向滚动 */
}

/* 光效永远在最底层，且不挡交互 */
.main::after {
  content: "";
  position: absolute;
  top: 60%;
  left: 60%;
  width: 300px;
  height: 700px;
  transform: translate(-50%, -50%) rotate(45deg);
  background: radial-gradient(circle,
      rgba(248, 231, 131, 0.6) 0%,
      rgba(245, 159, 0, 0.3) 50%,
      rgba(182, 11, 11, 0) 80%);
  filter: blur(120px);
  z-index: -1;             /* 关键：放到内容下方 */
  pointer-events: none;    /* 不影响点击/输入 */
}


.top-bar {
  display: flex;
  gap: 20px;
  z-index: 1;
  margin-bottom: 20px;
}

.menu-btn {
  background: #919090;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  color: gold;
  cursor: pointer;
  margin-right: 40px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #919090;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.action-btn .icon {
  background: #919090;
  border: 1px solid gold;
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 14px;
  color: gold;
}

.button-container {
  display: flex;
  gap: 10px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 22px;
  background: #fff;
  color: #333;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  position: relative;
  /* 增加相对定位 */
}

.tab-button .icon {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid gold;
  color: gold;
  font-size: 14px;
  background: #fff;
  position: relative;
  /* 增加相对定位 */
  z-index: 1;
  /* 确保图标在上层 */
}

/* 增加点击区域 */
.tab-button::before {
  content: "";
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: transparent;
  z-index: 0;
  /* 确保伪元素在图标下方 */
}

.we {
  width: 60%;
  display: inline-block;
  margin-left: 10px;
  margin-top: 7px;
  margin-bottom: 6px;
}

.ma {
  width: 30%;
  display: inline-block;
}

.tab-button:hover {
  background: #fdf6e3;
  border-color: gold;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(255, 215, 0, 0.3);
}

.tab-button.active {
  border-color: gold;
  background: linear-gradient(145deg, #fff8e1, #fff);
  color: #000;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(255, 215, 0, 0.35);
}

/* contain */
.card-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border: 1px #b9b9b9 solid;
  border-radius: 10px;
  /* 圆角 */
  width: 76%;
  margin-top: 20px;
}


.card-header {
  white-space: pre-wrap;
  font-size: 18px;
  color: rgb(0, 0, 0);
  /* 使用纯黑色 */
  background-color: rgb(255, 255, 255);
  /* 纯白色背景 */
  width: 94%;
  margin-left: 3%;
  border-radius: 15px;
  z-index: 11;
}

.exchange {
  color: #000;
  background-color: rgba(212, 208, 208, 0.5);
  /* 设置半透明灰色背景 */
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  width: 80%;
  margin-left: 4%;
  background: #e0dfdf;
}

.exchange::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(212, 208, 208, 0.5);
  border-radius: 10px;
  z-index: -1;
}

.exchange-box {
  width: 260px;
  margin: 20px auto;
  text-align: center;
  font-family: "Microsoft YaHei", sans-serif;
}

.input-row {
  display: flex;
  background: #fff;
  width: 82%;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid #ddd;
}

.input-text {
  width: 65%;
 flex:1;
  border: none;
  padding: 8px 10px;
  outline: none;
}

.btn-all {
  background: none;
  border: none;
  padding: 0 12px;
  color: #333;
  cursor: pointer;
}

.btn-confirm {
  width: 50%;
  background: #f6c244;
  margin-right: 16%;
  border: none;
  padding: 10px 0;
  border-radius: 20px;
  font-size: 15px;
  color: #333;
  font-weight: bold;
  cursor: pointer;
}

.footer{

  width: 78%;
  margin: 20px 0 32px;
  padding: 12px 14px 18px;
  background: #000;
  border: 1px solid #b9b9b9;
  border-radius: 12px;
  position: relative;
  overflow: hidden;           
  z-index: 1;                
}


.footer::before{
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  width: 180%;
  height: 180%;
  transform: translateX(-50%) scaleY(.55); 
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(255, 215, 0, .70) 0%,
    rgba(255, 193, 7,  .40) 38%,
    rgba(184, 134, 11, .22) 60%,
    rgba(0,   0,   0,  .96) 100%
  );
  filter: blur(70px);        
  pointer-events: none;
  z-index: 0;
}

.mon{
  position: relative;
  z-index: 1;
  color: #f6c244;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 6px 8px;
  font-size: 14px;
}


.thead{
  position: relative;
  z-index: 1;                 
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 8px;
  padding: 10px 12px;
  color: #eaeaea;
  font-size: 13px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  width: 100%;                /* 修正 width:0.8 的错误值 */
}

.row{
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 8px;
  padding: 10px 12px;
  color: #ddd;
  font-size: 13px;
  border-bottom: 1px dashed rgba(255,255,255,0.08);
}
.row:last-child{ border-bottom: 0; }

@media (max-width: 480px){
  .thead,.row{
    grid-template-columns: 1fr 1fr 1fr;
    font-size: 12px;
  }
}
.exchange{ position: relative; }

</style>