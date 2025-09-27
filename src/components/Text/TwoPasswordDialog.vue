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
import CryptoJS from "crypto-js";

const visible = ref(false)
const twoPassword = ref('')
let currentCallback = null

function openDialog(cb) {
  // 如果当前场景不是支付，不要弹
  if (!cb || typeof cb !== 'function') {
    console.warn('[TwoPwd] openDialog 被误触发')
    return
  }
  visible.value = true
  twoPassword.value = ''
  currentCallback = cb
}


function confirm() {
  if (!twoPassword.value) {
    ElMessage.error('请输入二级密码')
    return
  }

  const md5Hex = CryptoJS.MD5(twoPassword.value).toString()

  if (typeof currentCallback === 'function') {
    currentCallback(md5Hex)
  } else {
    console.warn('[TwoPwd] currentCallback 不是函数:', currentCallback)
  }

  close()
}


function close() {
  visible.value = false
  twoPassword.value = ''
  currentCallback = null
}

// 注册全局方法
CallbackCenter.register('openTwoPasswordDialog', openDialog)
</script>

<style scoped>
.password-input{ margin: 12px 0; }
.dialog-content{ text-align:center; padding: 4px 0; }
.btn-group{ display:flex; justify-content:center; gap:16px; margin-top:10px; }
</style>
