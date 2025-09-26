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
  <el-menu :default-active="activeIndex" class="el-menu-vertical-demo" @select="handleSelect">
    <el-menu-item index="HomePage" :class="{ on: activeIndex === 'HomePage' }">首页</el-menu-item>
    <el-menu-item index="SpotlightMember" :class="{ on: activeIndex === 'SpotlightMember' }">会员与签到</el-menu-item>
    <el-menu-item index="StyFinance" :class="{ on: activeIndex === 'StyFinance' }">理财宝</el-menu-item>
    <el-menu-item index="funds-deposit" :class="{ on: activeIndex === 'funds-deposit' }">资金管理</el-menu-item>
    <el-menu-item index="introPage" :class="{ on: activeIndex === 'introPage' }">详情</el-menu-item>
    <el-menu-item index="register" :class="{ on: activeIndex === 'register' }">安全设置</el-menu-item>
  </el-menu>
</el-drawer>
 <!-- 注册弹窗 -->
    <!-- 注册弹窗 -->
<!-- 注册弹窗 -->
<el-dialog v-model="showRegisterDialog" title="注册账户" width="400px">
  <el-form :model="registerForm" label-width="100px">
    <el-form-item label="钱包地址">
      <el-input v-model="registerForm.walletAddress" disabled></el-input>
    </el-form-item>
    <el-form-item label="邀请码">
      <el-input v-model="registerForm.upInvitationCode" placeholder="请输入邀请码"></el-input>
    </el-form-item>
    <el-form-item label="二级密码">
      <el-input v-model="registerForm.twoPassword" type="password" placeholder="请输入二级密码"></el-input>
    </el-form-item>
    <el-form-item label="确认二级密码">
      <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入二级密码"></el-input>
    </el-form-item>
  </el-form>
  <template #footer>
    <el-button @click="showRegisterDialog = false">取消</el-button>
    <el-button type="primary" @click="doRegister">确认注册</el-button>
  </template>
</el-dialog>



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
import { provide } from 'vue'
import {  userLogin, userRegister } from '@/utils/api.js'
import { onMounted } from 'vue'
import CallbackCenter from '@/utils/callbackCenter.js'

const drawerOpen = ref(false)
const router = useRouter()
const route = useRoute()
const showRegisterDialog = ref(false)
const styaiBalance = ref(0)  // 存储余额，默认0
const { t, locale } = useI18n()
const epLocale = computed(() => (locale.value === 'zh' ? zhCn : enUS))
function toggleLang() {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('lang', locale.value)
}  
const isConnected = ref(false)
const connecting = ref(false)
const registerForm = ref({
  walletAddress: '',
  upInvitationCode: '',
  twoPassword: '',
  confirmPassword: ''
})
const btnText = computed(() => {
  if (isConnected.value) return t('btn.connected', '已连接')
  if (connecting.value) return t('btn.connecting', '连接中…')
  return t('btn.connect', '连接')
})

// 初始化时读取
if (localStorage.getItem("isConnected") === "1") {
  isConnected.value = true
}

function handleLoginSuccess(token) {
  isConnected.value = true
  localStorage.setItem("isConnected", "1")
  localStorage.setItem("token", token)
  Notify.inApp({ title: '成功', message: '登录成功', type: 'success' })
  getBalance()

  // 🔔 连接成功后触发所有回调
  CallbackCenter.triggerAll({ token, wallet: localStorage.getItem("walletAddress") })
}


async function connectTP() {
  if (connecting.value || isConnected.value) return
  connecting.value = true
  try {
    const re = await WalletTP.connect()
    console.log("【连接返回】", re)

   if (re?.code !== 1) throw new Error(re?.msg || '连接失败')

    const address = re.data
    console.log("【连接成功，钱包地址】", address)

    // 请求登录
    const resp = await userLogin({ userWalletAddress: address })
    console.log("【登录响应】", resp)

    // 判断登录响应
    if (resp.data.code === 200) {
      handleLoginSuccess(resp.data.token)
    } else if (resp.data.code === 400) {
      Notify.inApp({ title: '提示', message: '未检测到账户，请先注册', type: 'warning' })
      registerForm.value.walletAddress = address
      showRegisterDialog.value = true
    } else {
      throw new Error(resp.message || '请求失败')
    }
  } catch (e) {
    Notify.inApp({ title: '错误', message: e.message || String(e), type: 'error' })
  } finally {
    connecting.value = false
  }
}
async function doRegister() {
  if (!registerForm.value.twoPassword) {
    Notify.inApp({ title: '错误', message: '请输入二级密码', type: 'error' })
    return
  }
    if (!registerForm.value.confirmPassword) {
    Notify.inApp({ title: '错误', message: '请确认二级密码', type: 'error' })
    return
  }
  if (registerForm.value.twoPassword !== registerForm.value.confirmPassword) {
    Notify.inApp({ title: '错误', message: '两次输入的密码不一致', type: 'error' })
    return
  }

  try {
    const resp = await userRegister({
      walletAddress: registerForm.value.walletAddress,
      twoPassword: registerForm.value.twoPassword,
      upInvitationCode: registerForm.value.upInvitationCode,
      confirmPassword: registerForm.value.confirmPassword  
    })

    if (resp.data.code==200) {
      Notify.inApp({ title: '成功', message: '注册成功，请重新登录', type: 'success' })
      showRegisterDialog.value = false

      // 注册成功后，直接尝试自动登录
      const loginRes = await userLogin({ userWalletAddress: registerForm.value.walletAddress })
      if (loginRes.ok && loginRes.data.code===200) {
        isConnected.value = true

        Notify.inApp({ title: '成功', message: '自动登录成功', type: 'success' })
        getBalance()
      }
    } else {
      Notify.inApp({ title: '错误', message: resp.data.message || '注册失败', type: 'error' })
    }
  } catch (e) {
    Notify.inApp({ title: '错误', message: String(e.message), type: 'error' })
  }
}

// 更新usdt 和styai 余额
async function getBalance() {
  const raw_STYAI = await WalletTP.getTrc20Balance("STYAI")
  const raw_USDT = await WalletTP.getTrc20Balance("USDT")
  console.log(raw_STYAI);         
  console.log(raw_USDT);
  styaiBalance.value = raw_STYAI?.data?.balance || 0
}

provide('styaiBalance', styaiBalance)
function handleSelect(key) {
  console.log('选中菜单：', key)
  drawerOpen.value = false   
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
          case 'register':
      router.push('/register')
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
  if (route.path.startsWith('/spot')) return 'SpotlightMember'
  if (route.path.startsWith('/change')) return 'changePass' 
  return 'HomePage' // 默认首页
})

onMounted(() => {
 const token = localStorage.getItem("token")
  if (token) {
    isConnected.value = true   
  } else {
    isConnected.value = false  
  }
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
  padding: 20px ; 
  
  box-sizing: border-box;
  display: flex;
  gap: 25px;
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
  justify-content: center;
  padding: 8px 14px;
  background: #919090;
  border: none;
 min-width: 120px;
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
