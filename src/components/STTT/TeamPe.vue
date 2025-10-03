<template>
  <div class="team-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="goBack">← </button>
      <span class="title">{{ $t('team.title') }}</span>
            <!-- 分享按钮 -->
      <button class="share-btn" @click="openShareDialog">📤 分享</button>
    </div>

    <div class="team-card">
      <div class="team-summary">
        <div class="summary-item">
          <span>{{ $t('team.summary.total') }}</span>
          <b>{{ team.total }}</b>
        </div>
        <div class="summary-item">
          <span>{{ $t('team.summary.direct') }}</span>
          <b>{{ team.direct }}</b>
        </div>
        <div class="summary-item">
          <span>{{ $t('team.summary.indirect') }}</span>
          <b>{{ team.indirect }}</b>
        </div>
      </div>

      <div class="team-assets">
        <div class="asset-item">
          <span>{{ $t('team.assets.usdt') }}</span>
          <b>{{ team.usdt }}</b>
        </div>
        <div class="asset-item">
          <span>{{ $t('team.assets.sty') }}</span>
          <b>{{ team.sty }}</b>
        </div>
        <div class="asset-item">
          <span>{{ $t('team.assets.rights') }}</span>
          <b>{{ team.rights }}</b>
        </div>
      </div>

      <div class="team-list">
        <div class="list-head">
          <span>{{ $t('team.list.index') }}</span>
          <span>{{ $t('team.list.account') }}</span>
          <span>{{ $t('team.list.relation') }}</span>
        </div>
        <div class="list-scroll">
          <div class="list-row" v-for="(item, index) in team.members" :key="index">
            <span>{{ index + 1 }}</span>
            <span>{{ item.account }}</span>
            <span>{{ item.type }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- ✅ 新增：分享弹窗 -->
<div v-if="share.visible" class="share-mask">
  <div class="share-dialog">
    <h3>🔗 分享信息</h3>
    <div class="share-item">
      <span>分享链接:</span>
      <input v-model="share.link" readonly />
      <button @click="copyText(share.link)">复制</button>
    </div>
    <div class="share-item">
      <span>邀请码:</span>
      <input v-model="share.code" readonly />
      <button @click="copyText(share.code)">复制</button>
    </div>
    <button class="close-btn" @click="share.visible = false">关闭</button>
  </div>
</div>

</template>


<script setup>
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { teamMembersAll} from "@/utils/api"
import { columnAlignment } from "element-plus"
const router = useRouter()
// ✅ 新增：分享相关数据
const share = ref({
  visible: false,
  link: "",
  code: ""
})
// ✅ 新增：弹窗逻辑
function openShareDialog() {
  const baseUrl = window.location.origin
  const code = localStorage.getItem("invitation_code") || "未设置"
  share.value = {
    visible: true,
    // ✅ 修改：拼接邀请码到链接上
    link: `${baseUrl}`,
    code
  }
}
// ✅ 新增：复制功能
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("复制成功: " + text)
  }).catch(() => {
    alert("复制失败")
  })
}


const goBack = () => {
  router.go(-1) // 返回上一个页面
}

const team = ref({
  total: 1,
  direct: 1,
  indirect: 0,
  usdt: 0,
  sty: 0,
  rights: 0,
  members: [
    { account: "", type: "" }
  ]
})

 async function getTeamMembersAll() {
  try{

    const res=await teamMembersAll({})
    console.log('团队详情',res)
   if (res.ok && res.data.code === 200) {
  const d = res.data.data
  team.value = {
    total: d.teamSize,
    direct: d.directPush,
    indirect: d.intervalPush,
    usdt: d.teamAllBuyKjTotalAmount,
    sty: d.teamIncome,
    rights: d.teamVip, 
    members: d.teamMembers.map(m => ({
      account: m.walletAddress,
      type: m.relation
    }))
  }
}

  // eslint-disable-next-line no-empty
  }catch(err){                                                                                                                                                                                                                                                                                                                                                                                                                             

  }
 }
 onMounted(()=>{
  getTeamMembersAll()
 })
</script>

<style scoped>
.team-page {
  background: #000;
  min-height: 100vh;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;

}

/* 顶部导航栏 */
.nav-bar {
  width: 86%;
  max-width: 480px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(25, 25, 25, 0.95);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px 12px 0 0;
  margin-bottom: 10px;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
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

.back-btn:hover {
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.7);
}

.title {
  color: #FFD700;
  font-size: 18px;
  font-weight: bold;
}

.team-card {
  background: rgba(25, 25, 25, 0.95);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 16px;
  padding: 20px;
  width: 86%;
  max-width: 480px;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.15);
}

.team-summary,
.team-assets {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.team-summary{
    margin-bottom: 40px;
}
.summary-item,
.asset-item {
  flex: 1;
  text-align: center;
  color: #FFD700;
}

.summary-item span,
.asset-item span {
  display: block;
  font-size: 14px;
  opacity: 0.8;
}

.summary-item b,
.asset-item b {
  display: block;
  font-size: 16px;
  margin-top: 5px;
  color: #fff;
}

.team-list {
  margin-top: 15px;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
}

.list-head {
  font-weight: bold;
  color: #FFD700;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

/* ✅ 单独的滚动容器 */
.list-scroll {
  max-height: 460px;     /* 列表区高度，超出就滚动，你可以调 */
  overflow-y: auto;
  overflow-x: hidden;
}

/* 列表行 */
.list-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #fff;
  font-size: 12px;
}

.list-row:nth-child(odd) {
  background: rgba(255, 215, 0, 0.05);
}
/* ✅ 新增：分享按钮样式 */
.share-btn {
  background: transparent;
  border: none;
  color: #FFD700;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
.share-btn:hover {
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.7);
}

/* ✅ 新增：分享弹窗样式 */
.share-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.share-dialog {
  background: #222;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  width: 80%;
  max-width: 400px;
  color: #fff;
}

.share-dialog h3 {
  margin-bottom: 15px;
  color: #FFD700;
}

.share-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.share-item span {
  width: 70px;
  color: #FFD700;
}

.share-item input {
  flex: 1;
  background: #111;
  border: 1px solid rgba(255,215,0,0.3);
  border-radius: 6px;
  color: #fff;
  padding: 4px 8px;
  margin-right: 8px;
}

.share-item button {
  background: #FFD700;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.close-btn {
  margin-top: 10px;
  width: 100%;
  padding: 8px;
  background: #444;
  border: none;
  color: #FFD700;
  border-radius: 8px;
  cursor: pointer;
}


</style>
