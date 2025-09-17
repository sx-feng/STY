<template>
  <el-config-provider :locale="epLocale">
    <TopBar v-if="showTopBar" />
    <main :class="['page-content', { 'no-topbar': !showTopBar }]">
      <router-view />
    </main>
  </el-config-provider>
</template>


<script setup>
import TopBar from '@/components/STTT/TopBar.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import enUS from 'element-plus/dist/locale/en.mjs'

const { locale } = useI18n()
const epLocale = computed(() => (locale.value === 'zh' ? zhCn : enUS))

const route = useRoute()
// 关键：任一匹配记录上有 hideTopBar 即隐藏（对子路由也生效）
const showTopBar = computed(() => !route.matched.some(r => r.meta?.hideTopBar))
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
