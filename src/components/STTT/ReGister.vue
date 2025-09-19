<template>
  <div class="change-password-container">
    <h3>修改二级密码</h3>

    <form @submit.prevent="changePassword">
      <!-- 当前密码 -->
      <div>
        <label for="oldPassword">当前密码</label>
        <input v-model="oldPassword" type="password" id="oldPassword" required />
      </div>

      <!-- 新密码 -->
      <div>
        <label for="newPassword">新密码</label>
        <input v-model="newPassword" type="password" id="newPassword" required />
      </div>

      <!-- 确认新密码 -->
      <div>
        <label for="confirmPassword">确认新密码</label>
        <input v-model="confirmPassword" type="password" id="confirmPassword" required />
      </div>

      <button type="submit" :disabled="isSubmitting">提交</button>
    </form>

    <!-- 提示信息 -->
    <div v-if="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const messageType = ref('')
const isSubmitting = ref(false)

const changePassword = async () => {
  // 清除旧的消息
  message.value = ''
  messageType.value = ''

  // 检查新密码和确认密码是否一致
  if (newPassword.value !== confirmPassword.value) {
    message.value = '新密码和确认密码不一致'
    messageType.value = 'error'
    return
  }

  // 这里你可以加上密码强度验证（如长度、包含特殊字符等）
  if (newPassword.value.length < 6) {
    message.value = '新密码必须至少6个字符'
    messageType.value = 'error'
    return
  }

  isSubmitting.value = true

  try {
    const response = await fetch('/api/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        oldPassword: oldPassword.value,
        newPassword: newPassword.value
      })
    })
    const data = await response.json()

    if (data.success) {
      message.value = '密码修改成功'
      messageType.value = 'success'
    } else {
      message.value = data.message || '修改失败'
      messageType.value = 'error'
    }
  } catch (error) {
    message.value = '发生错误，请稍后再试'
    messageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
:global(body) {
  background-color: #000;  /* 整个页面黑色 */
  margin: 0;
  padding: 0;
  min-height: 100vh;       /* 确保撑满屏幕 */
  color: #FFD700;          /* 默认文字金色 */
}
.change-password-container {
  width: 100%;
 
  margin: 60px auto;  /* 居中 */
  padding: 40px;

  border-radius: 12px;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.25);
  color: #FFD700; /* 金色文字 */
  height: 100%;
}

h3 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 22px;
  color: #dbcc75;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

form div {
  margin-bottom: 18px;
}

form label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #FFD700;
  border-radius: 6px;
  background: #1a1a1a;
  color: #fff;
  font-size: 15px;
}

form input:focus {
  outline: none;
  border-color: #ffcc00;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.7);
}

button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #FFD700, #FFB700);
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  color: #000;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background: linear-gradient(135deg, #FFDF70, #FFC300);
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.7);
}

button:disabled {
  background: #555;
  color: #aaa;
}

.error {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
}

.success {
  color: #00e676;
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
}
</style>
