<template>
  <el-dialog
    v-model="visible"
    title="二级密码验证"
    width="360px"
    align-center
  >
    <div class="dialog-content">
      <el-input
        v-model="twoPassword"
        type="password"
        show-password
        placeholder="请输入二级密码"
        class="password-input"
      />
      <div class="btn-group">
        <el-button type="warning" @click="confirm">确认</el-button>
        <el-button @click="close">取消</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import CallbackCenter from '@/utils/callbackCenter'

const visible = ref(false)
const twoPassword = ref('')
let currentCallback = null

function openDialog(cb) {
  console.log('[TwoPwd] openDialog')          // ✅ 调试日志
  visible.value = true
  twoPassword.value = ''
  currentCallback = cb
}

function confirm() {
  if (!twoPassword.value) {
    ElMessage.error('请输入二级密码')
    return
  }
  currentCallback?.(twoPassword.value)
  close()
}

function close() {
  visible.value = false
  twoPassword.value = ''
  currentCallback = null
}

// 把打开方法注册到全局
CallbackCenter.register('openTwoPasswordDialog', openDialog)
</script>

<style scoped>
.password-input{ margin: 12px 0; }
.dialog-content{ text-align:center; padding: 4px 0; }
.btn-group{ display:flex; justify-content:center; gap:16px; margin-top:10px; }
</style>
