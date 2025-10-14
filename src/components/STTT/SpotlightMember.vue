<template>
  <div class="light-page">
    <!-- 按钮行容器 -->
    <div class="btn-row">
      <!-- 节点会员按钮 -->
      <div class="top-btn" @click="handleNodeMember">
        <span class="icon">📦 </span>
        {{ vipStatus ? "节点会员收益" : $t('light.member') }}
      </div>
      <div class="top-btn" @click="goMember">
        <span class="icon"></span> {{ $t('light.memberIntro') }}
      </div>
    </div>

    <div class="sign">
      <div class="biao"> <SignCanLen/></div>
     
    </div>

    <!-- 购买会员弹窗 -->
      <el-dialog
    v-model="showDialog"
    :title="$t('light.memberBuy')"
    width="400px"
    align-center
    class="custom-dialog"
  >
    <div class="dialog-content">
      <!-- 描述 -->
      <p class="desc">{{ $t('dialog.buyMember.desc') }}</p>

      <!-- VIP价格显示 -->
      <p class="vip-price" v-if="vipPrice !== null">
        💎 当前 VIP 价格：
        <span class="price">{{ vipPrice }} USDT</span>
      </p>
      <p class="vip-price" v-else>正在获取价格...</p>

      <!-- 按钮 -->
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
import { ref ,onMounted,onBeforeUnmount,watch} from "vue"
import SignCanLen from './SignCanLen.vue'
import { useRouter } from "vue-router"
import { ElMessage } from 'element-plus'
import CallbackCenter from '@/utils/callbackCenter'
// 引入接口
import { productVip, vipUserStatus,getVipConfig } from "@/utils/api"

const vipStatus = ref(false)   // 是否是 VIP
const showDialog = ref(false)
const router = useRouter()
const vipPrice = ref(null)
// 购买会员
// 购买会员
async function buyMember() {
  CallbackCenter.trigger('openTwoPasswordDialog', async (pwdMd5) => {
    try {
      const res = await productVip({ level: 1, twoPassword: pwdMd5 })
      if (res.data.code === 200) {
        ElMessage.success("购买成功！")
        showDialog.value = false
        vipStatus.value = true
        // 通知全局刷新
        CallbackCenter.trigger('vipUpdate')
      } else if (res.data.code === 401) {
        // 已是会员
        ElMessage.warning(res.data.message || "您已是VIP会员")
        vipStatus.value = true
      } else {
        ElMessage.error(res.data.message || "购买失败")
      }
    } catch (err) {
      console.error('[buyMember] error:', err)
      ElMessage.error("网络错误，请稍后重试")
    }
  })
}


// 查询 VIP 状态
async function checkVip() {
  try {
    const res = await vipUserStatus({})
    if (res.data.code === 200 && res.data.data === true) {
      vipStatus.value = true
    } else {
      vipStatus.value = false
    }
  } catch {
    vipStatus.value = false
  }
}

// 节点会员按钮
function handleNodeMember() {
  if (vipStatus.value) {
    // 已是 VIP → 跳转收益记录
    router.push("/vip")
  } else {
    // 未开通 → 打开购买弹窗
    showDialog.value = true
  }
}

// 会员介绍页
function goMember() {
  router.push("/member")
}

// 生命周期：挂载/卸载
onMounted(async () => {
  await checkVip()
  // 🔔 注册全局刷新
  CallbackCenter.register('vipUpdate', (info) => {
    console.log("light-page 收到 vipUpdate:", info)
    checkVip()
  })
})
// 监听弹窗打开时加载价格
watch(showDialog, async (val) => {
  if (val) {
    try {
      const res = await getVipConfig('VIP')
      console.log(res.data.data.configValue,"ppppppppppppppp")
      if (res.data.code === 200 && res.data.data?.configValue?.VIP_PRICE != null) {
        vipPrice.value = res.data.data.configValue.VIP_PRICE
      } else {
        vipPrice.value = '加载失败'
      }
    } catch (e) {
      console.error('获取VIP配置失败：', e)
      vipPrice.value = '加载失败'
    }
  }
})

onBeforeUnmount(() => {
  CallbackCenter.unregister('vipUpdate')
})
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
  margin-top: 50px;
 
}

/* 新增按钮行：横向排列 */
.btn-row {
  display: flex;
  justify-content: space-between; 
  gap: 5%;                        
  width: 80%;                    
  margin-top: 40px;
  z-index: 2;

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
       width: 90%;     
  margin-top: 20px;      
    padding-bottom: 20px;  
  height: 55%;
  color: #fff;         
  z-index: 22;     
}

.biao{
  width: 90%;
  padding: 3%;
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