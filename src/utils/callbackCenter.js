// src/utils/callbackCenter.js
import { reactive } from 'vue'

// 存储回调函数
const callbacks = reactive({})

export default {
  // 注册回调
  register(key, fn) {
    if (typeof fn === 'function') {
      callbacks[key] = fn                             
    }
  },
  // 触发指定回调
  trigger(key, ...args) {
    if (callbacks[key]) {
      callbacks[key](...args)
    }
  },
  // 触发所有回调
  triggerAll(...args) {
    Object.values(callbacks).forEach(fn => fn(...args))
  },
  // 移除回调
  unregister(key) {
    delete callbacks[key]
  }  
}
