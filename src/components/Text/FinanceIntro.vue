<template>
  <div class="finance-intro-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">理财宝说明</span>
    </div>

    <!-- 内容卡片 -->
    <div class="card">
      <h2>什么是 STY 理财宝？</h2>
      <p>
        STY 理财宝是一款数字资产增值服务，您可以将 STY 投入不同周期的理财产品，按照周期收益率获得对应回报。
      </p>

      <h3>理财周期</h3>
      <ul>
        <li>3 天周期：年化 8%</li>
        <li>10 天周期：年化 10%</li>
        <li>30 天周期：年化 12%</li>
      </ul>

      <h3>注意事项</h3>
      <ol>
        <li>理财宝收益随市场波动，实际收益以结算为准。</li>
        <li>理财周期内不能提前赎回。</li>
        <li>二级密码验证用于确保交易安全，请妥善保管。</li>
      </ol>

      <h3>风险提示</h3>
      <p>
        数字资产理财产品具有一定风险，请根据自身风险承受能力合理投资。
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"
const router = useRouter()
function goBack() {
  router.back()
}
</script>

<style scoped>
.finance-intro-page {
  background: #000;
  min-height: 100vh;
  padding: 20px;
  font-family: "Microsoft YaHei", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
 
}

.nav-bar {
  width: 100%;
  max-width: 480px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(25, 25, 25, 0.95);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 0 0 12px 12px;
  margin-bottom: 10px;
}

.back-btn {
  background: transparent;
  border: none;
  color: #FFD700;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-right: 12px;
}

.title {
  color: #FFD700;
  font-size: 18px;
  font-weight: bold;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.card h2 {
  color: #333;
  margin-bottom: 12px;
}

.card h3 {
  margin-top: 18px;
  margin-bottom: 8px;
  color: #444;
}

.card p,
.card ul,
.card ol {
  color: #555;
  line-height: 1.6;
  margin-bottom: 12px;
}

.card ul li,
.card ol li {
  margin-left: 20px;
  margin-bottom: 6px;
}
</style>
