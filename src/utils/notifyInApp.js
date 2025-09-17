// src/utils/notifyInApp.js
import { ElNotification, ElMessage } from 'element-plus'
/**
 * <script setup>
import Notify from '@/utils/notifyInApp'

function onSaveOk() {
  Notify.toast('已保存')                 // 轻提示
}

function onNewMessage(msg) {
  Notify.inApp({ title: '新消息', message: msg, type: 'success' }) // 应用内通知
  Notify.native({ title: '新消息', body: msg })                    // 系统通知（有权限时）
}
</script>

 * 
 * 
 */
/** 应用内角标通知（右上角弹出卡片） */
export function notifyInApp({
  title = '提示',
  message = '',
  type = 'info',        // 'success' | 'warning' | 'info' | 'error'
  duration = 3000,
  placement = 'top-right'
} = {}) {
  return ElNotification({
    title,
    message,
    type,
    duration,
    position: placement,
    showClose: true
  })
}

/** 轻量吐司 */
export function toast(message, type = 'success', duration = 2000) {
  return ElMessage({
    message,
    type,               // 'success' | 'warning' | 'info' | 'error'
    duration,
    showClose: true
  })
}

/** 系统级桌面通知（浏览器 Notification），失败时回落到应用内通知 */
export async function notifyNative({
  title = '通知',
  body = '',
  icon,
  tag
} = {}) {
  try {
    if (!('Notification' in window)) throw new Error('当前浏览器不支持系统通知')
    let perm = Notification.permission
    if (perm === 'default') perm = await Notification.requestPermission()
    if (perm !== 'granted') throw new Error('未授权系统通知')
    return new Notification(title, { body, icon, tag })
  } catch (e) {
    // 回落
    notifyInApp({ title, message: body, type: 'info' })
    return null
  }
}

export default {
  inApp: notifyInApp,
  toast,
  native: notifyNative
}
