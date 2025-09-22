<template>
  <el-config-provider :locale="epLocale">
    <!-- 启动遮罩 -->
    <div v-if="loading" class="startup-mask">
      <div class="mask-content">
        <el-icon class="loading-icon"><i class="el-icon-loading"></i></el-icon>
        <p>🔐 加密通道启动中...</p>
      </div>
    </div>

    <!-- 主内容 -->
    <TopBar v-if="showTopBar" />
    <main :class="['page-content', { 'no-topbar': !showTopBar }]">
      <router-view />
    </main>
   
  </el-config-provider>
</template>



<script setup>
import TopBar from '@/components/STTT/TopBar.vue'
import { ref, computed, onMounted } from 'vue'  
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import enUS from 'element-plus/dist/locale/en.mjs'
import { userInit} from '@/utils/api.js'
import Notify from '@/utils/notifyInApp' 
import { useRouter } from 'vue-router'

const { locale } = useI18n()
const epLocale = computed(() => (locale.value === 'zh' ? zhCn : enUS))

const route = useRoute()
// 关键：任一匹配记录上有 hideTopBar 即隐藏（对子路由也生效）
const showTopBar = computed(() => !route.matched.some(r => r.meta?.hideTopBar))

// 遮罩控制
const loading = ref(true)
const router = useRouter()


onMounted(async () => {
  try {
    // 进入时检查是否刷新
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("token")   // ✅ 只有刷新才清除
  })
    const address = localStorage.getItem('walletAddress') || '' // 假设存过钱包地址
    const initRes = await userInit({ userwalletAddress: address })
    console.log("【初始化响应】", initRes)

    if (!initRes.ok) {
      Notify({ type: 'danger', message: initRes.message || '初始化失败' })
    }
  } catch (err) {
    Notify({ type: 'danger', message: '初始化异常：' + err.message })
  } finally {
    loading.value = false
  }
  router.replace('/')
})
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
.startup-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 保证在最上层 */
  color: #fff;
  font-size: 18px;
}

.mask-content {
  text-align: center;
}

.loading-icon {
  font-size: 40px;
  margin-bottom: 12px;
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
