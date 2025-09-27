// src/utils/callbackCenter.js
import { reactive } from 'vue'

const callbacks = reactive({})

export default {
  register(key, fn) {
    if (typeof fn === 'function') {
      callbacks[key] = fn
    }
  },
  trigger(key, ...args) {
    if (callbacks[key]) {
      callbacks[key](...args)
    }
  },
  emit(key, ...args) {   // 👈 新增别名
    if (callbacks[key]) {
      callbacks[key](...args)
    }
  },
  triggerAll(...args) {
    Object.values(callbacks).forEach(fn => fn(...args))
  },
  unregister(key) {
    delete callbacks[key]
  }
}
