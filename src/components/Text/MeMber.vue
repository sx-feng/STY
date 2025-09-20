 <template>
  <div class="member-intro-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">节点会员介绍</span>
    </div>

    <!-- 内容部分 -->
    <div class="content-card">
      <h3 class="section-title">什么是节点会员？</h3>
      <p class="desc">
        节点会员是平台的高级权益用户，享有更高收益分成、团队奖励以及专属服务。
      </p>

      <h3 class="section-title">节点会员权益</h3>
      <ul class="list">
        <li>⚡ 更高算力收益加成</li>
        <li>👥 团队返利奖励</li>
        <li>🎁 专属活动优先参与</li>
        <li>📞 专属客服支持</li>
      </ul>

      <h3 class="section-title">如何成为节点会员？</h3>
      <p class="desc">
        用户可在购买会员页面选择“节点会员”进行开通，支付成功后立即生效。
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"
const router = useRouter()

function goBack() {
  router.go(-1)
}
</script>

<style scoped>
.member-intro-page {
  background: #000;
  min-height: 100vh;
  font-family: "Microsoft YaHei", sans-serif;
  color: #fff;
  padding: 15px;
}

/* 顶部导航栏 */
.nav-bar {
    width: 90%;
    margin-left: 2%;
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(25, 25, 25, 0.95);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  margin-bottom: 15px;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}
.back-btn {
  background: transparent;
  border: none;
  color: #FFD700;
  font-size: 18px;
  margin-right: 10px;
  cursor: pointer;
}
.back-btn:hover {
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.7);
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #FFD700;
}

/* 内容卡片 */
.content-card {
        width: 86%;
  margin-left: 2%;
  background: rgba(25, 25, 25, 0.95);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  line-height: 1.6;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}
.section-title {
  color: #FFD700;
  font-size: 16px;
  margin: 15px 0 8px;
}
.desc {
  color: #ddd;
  font-size: 14px;
  margin-bottom: 12px;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
}
.list li {
  margin: 6px 0;
  font-size: 14px;
  color: #eee;
}
</style>
