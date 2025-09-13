<template>
  <div id="app">
  
    <RouterView/>
  </div>
</template>

<script setup>
</script>

<style>
/* 可以加一些全局样式 */
body, html, #app {
  margin: 0;
  padding: 0;
  overflow-x: hidden;   /* 同时禁止横向和竖向滚动 */
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
