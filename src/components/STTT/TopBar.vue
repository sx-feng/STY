<template>
  <div class="top-bar-container">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <!-- 菜单按钮：打开抽屉 -->
      <button @click="drawerOpen = true" class="menu-btn">☰</button>

      <!-- 切换语言 -->
      <button class="action-btn" @click="toggleLang">
        <span class="icon">🌐</span>
        <span>{{ t('btn.lang') }}</span>
      </button>

      <!-- 连接按钮 -->
      <button class="action-btn" @click="connectTP" :disabled="isConnected || connecting"
        :aria-busy="connecting ? 'true' : 'false'">
        <span class="icon">{{ isConnected ? '✅' : '🔗' }}</span>
        <span>{{ btnText }}</span>
      </button>
    </div>

    <!-- 左侧抽屉导航 -->
    <el-drawer v-model="drawerOpen" title="侧边栏" :with-header="false" direction="ltr" size="220px">
      <el-menu default-active="1" class="el-menu-vertical-demo" @select="handleSelect">
        <el-menu-item index="HomePage">首页</el-menu-item>
        <el-menu-item index="SpotlightMember">会员与签到</el-menu-item>
        <el-menu-item index="StyFinance">理财宝</el-menu-item>
        <el-menu-item index="funds-deposit">资金管理</el-menu-item>
       
        <el-menu-item index="introPage">详情</el-menu-item>


      </el-menu>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import enUS from 'element-plus/dist/locale/en.mjs'
import WalletTP from '@/utils/walletTP.js'
import Notify from '@/utils/notifyInApp'
const drawerOpen = ref(false)
const router = useRouter()
const route = useRoute()

const { t, locale } = useI18n()
const epLocale = computed(() => (locale.value === 'zh' ? zhCn : enUS))
function toggleLang() {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('lang', locale.value)
}
const isConnected = ref(false)
const connecting = ref(false)

const btnText = computed(() => {
  if (isConnected.value) return t('btn.connected', '已连接')
  if (connecting.value) return t('btn.connecting', '连接中…')
  return t('btn.connect', '连接')
})
async function connectTP() {
  if (connecting.value || isConnected.value) return
  connecting.value = true
  try {
    const re = await WalletTP.connect()
    if (re?.code !== 1) {
      Notify.inApp({ title: t('tips.error', '错误'), message: re?.msg || t('tips.connectFail', '连接失败'), type: 'error' })
    } else {
      isConnected.value = true
      Notify.inApp({ title: t('tips.success', '成功'), message: re?.data || t('tips.connectOk', '连接成功'), type: 'success' })
      getBalance();
    }
  } catch (e) {
    Notify.inApp({ title: t('tips.error', '错误'), message: String(e), type: 'error' })
  } finally {
    connecting.value = false
  }
}

//更新usdt 和styai 余额
async function getBalance() {
  const raw_STYAI = await WalletTP.getTrc20Balance("STYAI")
  const raw_USDT = await WalletTP.getTrc20Balance("USDT")
  console.log(raw_STYAI);
  console.log(raw_USDT);
}

function handleSelect(key) {
  console.log('选中菜单：', key)
  drawerOpen.value = false   // 选完后自动关闭抽屉
  switch (key) {
    case 'HomePage':
      router.push('/')
      break
    case 'StyFinance':
      router.push('/finance')
      break
    case 'introPage':
      router.push('/info')
      break
    case 'funds-deposit':
      router.push({ path: '/funds', query: { tab: 'deposit' } })
      break
  
    case 'SpotlightMember':
      router.push('/spot')
      break

  }
}
const activeIndex = computed(() => {
  if (route.path.startsWith('/finance')) return 'StyFinance'
  if (route.path.startsWith('/info')) return 'introPage'
  if (route.path.startsWith('/funds')) {
    if (route.query.tab === 'deposit') return 'funds-deposit'
    if (route.query.tab === 'withdraw') return 'funds-withdraw'
    return 'FundsPage'
  }
  if (route.path.startsWith('/spot')) return 'SpotlightMember' // ✅ 节点会员高亮
  if (route.path.startsWith('/top')) return 'TopBar'
  return ''
})


</script>

<style scoped>
.top-bar-container {
  margin-bottom: 30px;
}


.top-bar {
  position: fixed;
  /* 固定定位 */
  top: 0;
  /* 吸顶 */
  left: 0;
  width: 100vw;
  z-index: 1000;
  /* 保证在最上层 */
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  gap: 20px;
  background-color: #000;

}

.menu-btn {
  background: #919090;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  color: gold;
  cursor: pointer;
  margin-right: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #919090;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.action-btn .icon {
  border: 1px solid gold;
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 14px;
  color: gold;
}
</style>
