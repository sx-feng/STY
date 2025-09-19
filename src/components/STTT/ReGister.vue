<template>
  <div class="register-page">
    <TopBar />

    <div class="change-password-card">
      <h3>修改二级密码</h3>

      <form @submit.prevent="changePassword">
        <!-- 当前密码 -->
        <div class="form-group">
          <label for="oldPassword">当前二级密码</label>
          <input
            v-model="oldPassword"
            type="password"
            id="oldPassword"
            placeholder="请输入当前二级密码"
            required
          />
        </div>

        <!-- 新密码 -->
        <div class="form-group">
          <label for="newPassword">新密码</label>
          <input
            v-model="newPassword"
            type="password"
            id="newPassword"
            placeholder="请输入新密码"
            required
          />
        </div>

        <!-- 确认新密码 -->
        <div class="form-group">
          <label for="confirmPassword">确认新密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            id="confirmPassword"
            placeholder="请再次输入新密码"
            required
          />
        </div>

        <button class="submit-btn" type="submit" :disabled="isSubmitting">
          提交修改
        </button>
      </form>

      <!-- 提示信息 -->
      <transition name="fade">
        <div v-if="message" :class="['alert', messageType]">
          {{ message }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import TopBar from "./TopBar.vue"
import { request } from "@/utils/request"  
const oldPassword = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const message = ref("")
const messageType = ref("")
const isSubmitting = ref(false)

const changePassword = async () => {
  message.value = ""
  messageType.value = ""

  if (newPassword.value !== confirmPassword.value) {
    message.value = "新密码和确认密码不一致"
    messageType.value = "error"
    return
  }

  if (newPassword.value.length < 6) {
    message.value = "新密码必须至少 6 个字符"
    messageType.value = "error"
    return
  }

  
  isSubmitting.value = true
  try {
    // 调用封装好的 request 方法
    const res = await request(1, "/api/user/update/paswad", {
     twoPassword: newPassword.value
    })
    console.log("返回结果", res)

    if (res.ok && res.data?.code === 200) {
  message.value = res.data.message || "密码修改成功"
  messageType.value = "success"
  oldPassword.value = ""
  newPassword.value = ""
  confirmPassword.value = ""

  // 5 秒后清除提示
  setTimeout(() => {
    message.value = ""
    messageType.value = ""
  }, 3000)
} else {
  message.value = res.data?.message || "修改失败"
  messageType.value = "error"

  // 5 秒后清除提示
  setTimeout(() => {
    message.value = ""
    messageType.value = ""
  }, 3000)
}

  } catch (e) {
    message.value = "请求出错，请稍后再试"
    messageType.value = "error"
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.register-page {
  background: #000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.change-password-card {
  margin-top: 40px;
  background: rgba(25, 25, 25, 0.95);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 16px;
  padding: 30px 25px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.2);
  backdrop-filter: blur(6px);
}

h3 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 22px;
  color: #FFD700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  color: #FFD700;
}

input {
  width: 90%;
  padding: 12px;
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 8px;
  background: #111;
  color: #fff;
  font-size: 15px;
  transition: 0.3s;
}

input:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #FFD700, #FFB700);
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  color: #000;
  cursor: pointer;
  transition: 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #FFEA70, #FFC300);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.7);
}

.submit-btn:disabled {
  background: #444;
  color: #aaa;
}

.alert {
  margin-top: 18px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.alert.success {
  background: rgba(0, 230, 118, 0.15);
  color: #00e676;
  border: 1px solid #00e676;
}

.alert.error {
  background: rgba(255, 77, 79, 0.15);
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
