<template>
  <div class="light-page">
    <!-- 顶部按钮 -->
    <TopBar />

    <!-- 按钮行容器 -->
    <div class="btn-row">
      <div class="top-btn">
        <span class="icon">📦 </span> 节点会员
      </div>
      <div class="top-btn">
        <span class="icon"></span> 节点会员介绍
      </div>
    </div>
    <div class="sign">
<SignCanLen/>

    </div>

    <!-- 光效 -->
    <div class="light-effect"></div>
  </div>
</template>

<script setup>
import SignCanLen from './SignCanLen.vue';
import TopBar from './TopBar.vue'
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
  display: flex;
  justify-content: center;        
  align-items: center;
  font-size: 16px; 
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
}
.sign {
  border: 1px solid #fff;   
  border-radius: 8px;       
  padding: 20px;            
  margin-top: 20px;        
  width: 80%;               
  margin-right: 10%;
  height: 60%;
  color: #fff;              
}

</style>
