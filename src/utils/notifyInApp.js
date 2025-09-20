import { ElNotification, ElMessage } from 'element-plus'

/** 应用内角标通知（右上角弹出卡片） */
export function notifyInApp({
  title = '提示',
  message = '',
  type = 'info',
  duration = 2000,
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
    type,
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
    notifyInApp({ title, message: body, type: 'info' })
    return null
  }
}

/** 
 * 默认导出函数（直接调用 Notify(...) == notifyInApp(...)）
 * 并挂载额外方法：Notify.inApp / Notify.toast / Notify.native
 */
function Notify(options) {
  return notifyInApp(options)
}
Notify.inApp = notifyInApp
Notify.toast = toast
Notify.native = notifyNative

export { Notify }     // 具名导出
export default Notify // 默认导出
