<template>
  <div class="light-page">

    <!-- 按钮行容器 -->
    <div class="btn-row">
      <div class="top-btn"  @click="openVipDialog">
       <!-- 根据 vipStatus 动态显示 -->
         <span class="icon">📦 </span>
        {{ vipStatus ? "VIP 已开通" : $t('light.member') }}
      </div>
      <div class="top-btn" @click="goMember">
        <span class="icon"></span> {{ $t('light.memberIntro') }}
      </div>
    </div>
    <div class="sign">
<SignCanLen/>

    </div>
<!-- 弹窗 -->
    <el-dialog
      v-model="showDialog"
      :title="$t('light.memberBuy')"
      width="400px"
      align-center
      class="custom-dialog"
    >
     <div class="dialog-content">
  <p class="desc">{{ $t('dialog.buyMember.desc') }}</p>
  <div class="btn-group">
    <el-button type="warning" @click="buyMember">
      {{ $t('dialog.buyMember.confirm') }}
    </el-button>
    <el-button @click="showDialog = false">
      {{ $t('dialog.buyMember.cancel') }}
    </el-button>
  </div>
</div>

    </el-dialog>
    <!-- 光效 -->
    <div class="light-effect"></div>
  </div>
</template>

<script setup>
import { ref ,onMounted} from "vue"
import SignCanLen from './SignCanLen.vue';
import { useRouter } from "vue-router"
import { ElMessage } from 'element-plus'
const vipStatus = ref(false)   // 当前用户是否是 VIP
// 引入接口
import { productVip,vipUserStatus } from "@/utils/api"
const showDialog = ref(false)
const router = useRouter()
// 购买会员
async function buyMember() {
  try {
    const res = await productVip({ level: 1 }) // 传参可根据业务需要，比如 level
    if (res.code === 200) {
      ElMessage.success("购买成功！")
      showDialog.value = false
    } else {
      ElMessage.error(res.message || "购买失败")
    }
  } catch (err) {
    ElMessage.error("网络错误，请稍后重试")
  }
}
// 查询 VIP 状态
async function checkVip() {
  try {
    const res = await vipUserStatus({})
    if (res.code === 200 && res.data?.isVip) {
      vipStatus.value = true
    } else {
      vipStatus.value = false
    }
  } catch {
    vipStatus.value = false
  }
}
// 跳转会员介绍页
function goMember() {
  router.push("/member")
}
// 页面加载时查询 VIP 状态
onMounted(async () => {
  await checkVip()
})
// 打开弹窗（如果已是 VIP 则不弹）
function openVipDialog() {
  if (vipStatus.value) {
    ElMessage.info("您已是 VIP 会员")
    return
  }
  showDialog.value = true
}
</script>

<style scoped>
.light-page {
  width: 100%;
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
 
}

/* 新增按钮行：横向排列 */
.btn-row {
  display: flex;
  justify-content: space-between; 
  gap: 5%;                        
  width: 80%;                    
  margin-top: 40px;
  z-index: 2;
  margin-right: 10%;
}

.top-btn {
  flex: 1;
  max-width: 45%;                 
  text-align: center;
  padding: 12px;
  background: #fff;
  border-radius: 30px;
  font-weight: 600;
  overflow: hidden; 
  display: flex;
  justify-content: center;        
  align-items: center;
  font-size: 14px; 
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  gap: 6px;
  box-shadow: 0 0 12px rgba(255, 210, 77, 0.45);
  cursor: pointer;
}
  
/* 光效 */
.light-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  height: 800px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 200, 0, 0.7) 0%,
    rgba(255, 200, 0, 0.2) 40%,
    rgba(0, 0, 0, 0) 70%
  );
  transform: translate(-50%, -50%) rotate(45deg);
  filter: blur(60px);
  z-index: 0;
}

.sign {
  border: 1px solid #fff;   
  border-radius: 8px;       
  padding: 20px;            
  margin-top: 20px;      
    padding-bottom: 20px;  
  width: 86%;               
  margin-right: 10%;
  height: 55%;
  color: #fff;         
  z-index: 22;     
}



/* 弹窗样式黑金化 */
:deep(.custom-dialog .el-dialog__header) {
  background: #111;
  color: #FFD700;
  font-weight: bold;
  text-align: center;
   padding-top: 20px;   
  padding-bottom: 10px
}
:deep(.custom-dialog .el-dialog__body) {
  background: #000;
  color: #fff;
}
:deep(.custom-dialog .el-dialog__footer) {
  background: #111;
  text-align: center;
}


.dialog-content {
  text-align: center;
   padding-top: 20px;   
  padding-bottom: 20px
}
.dialog-content .desc {
  margin-bottom: 20px;
  font-size: 14px;
  color: #ccc;
}
.btn-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

</style>
