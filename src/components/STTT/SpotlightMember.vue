<template>
    <div class="light-page">
      <!-- 顶部按钮 -->
      <div class="top-btn">
        <span class="icon">📦</span> 节点会员
      </div>
  
      <!-- 光效 -->
      <div class="light-effect"></div>
    </div>
  </template>
  
  <script setup>
  // 这里不需要额外逻辑，如果按钮要点击，可以加事件
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
  }
  
  /* 顶部按钮 */
  .top-btn {
    margin-top: 60px;
    padding: 16px 20px;
    background: #fff;
    border-radius: 30px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 0 12px rgba(255, 210, 77, 0.45);
    cursor: pointer;
    z-index: 2;
  }
  
  /* 光效 */
  .light-effect {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    height: 800px;
    background: radial-gradient(ellipse at center,
                rgba(255, 200, 0, 0.7) 0%,
                rgba(255, 200, 0, 0.2) 40%,
                rgba(0, 0, 0, 0) 70%);
    transform: translate(-50%, -50%) rotate(45deg);
    filter: blur(60px);
  }
  </style>
  