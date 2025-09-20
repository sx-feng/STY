<template>
  <div class="light-page">

    <!-- 按钮行容器 -->
    <div class="btn-row">
      <div class="top-btn"  @click="showDialog = true">
        <span class="icon">📦 </span> {{ $t('light.member') }}
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
        <p class="desc">是否确认购买节点会员？</p>
        <div class="btn-group">
          <el-button type="warning" @click="buyMember">确认购买</el-button>
          <el-button @click="showDialog = false">取消</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 光效 -->
    <div class="light-effect"></div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import SignCanLen from './SignCanLen.vue';
import { useRouter } from "vue-router"
const showDialog = ref(false)
const router = useRouter()
// 模拟购买逻辑
function buyMember() {
  console.log("购买会员成功")
  showDialog.value = false
}
function goMember() {
 router.push("/member")
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
