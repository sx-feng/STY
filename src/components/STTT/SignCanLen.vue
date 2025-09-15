<template>
    <div class="sign-card">
      <div class="sign-head">
        <div class="title">
          {{ year }} {{ $t('sign.year') }} {{ month }} {{ $t('sign.month') }}
        </div>
        <div class="meta">
          {{ $t('sign.streak') }}：<b>{{ streakDays }}</b>
          <span class="dot">•</span>
          {{ $t('sign.missed') }}：
          <b :class="{ danger: missedDays > maxMiss }">{{ missedDays }}</b> / {{ maxMiss }}
        </div>
      </div>
  
      <!-- 日历网格 -->
      <div class="calendar">
        <div class="wday" v-for="w in tm('sign.weekdays')" :key="w">{{ w }}</div>
        <div v-for="cell in cells" :key="cell.key" class="cell" :class="{
            'is-empty': !cell.day,
            'is-signed': cell.signed,
            'is-today': cell.isToday,
            'is-missed': cell.isPast && !cell.signed
          }">
          <div v-if="cell.day" class="day">
            <span class="num">{{ cell.day }}</span>
            <span v-if="cell.signed" class="mark">✔</span>
            <span v-else-if="cell.isPast" class="miss">•</span>
          </div>
        </div>
      </div>
  
      <!-- 动作区 -->
      <div class="actions">
        <el-button type="primary" :disabled="isTodaySigned || signing" :loading="signing" @click="signToday">
          {{ $t('sign.signNow') }}
        </el-button>
  
        <span class="tip" v-if="locked">
          {{ $t('sign.locked', { max: maxMiss }) }}
        </span>
        <span class="tip" v-else-if="isTodaySigned">{{ $t('sign.todaySigned') }}</span>
      </div>
    </div>
  </template>
  

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
const maxMiss = 2 // 本月最多允许断签次数

/** ===== 日期工具 ===== */
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1 // 1-12
const pad = (n) => (n < 10 ? '0' + n : '' + n)
const ymKey = `${year}-${pad(month)}` // e.g., 2025-09
const daysInMonth = new Date(year, month, 0).getDate()
const todayDay = now.getDate()

/** ===== 本月签到数据（localStorage） ===== */
const signedSet = ref(new Set())
const storageKey = `sign-${ymKey}`

function load() {
    try {
        const raw = localStorage.getItem(storageKey)
        if (raw) signedSet.value = new Set(JSON.parse(raw))
        // eslint-disable-next-line no-empty
    } catch {



    }
}
function persist() {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(signedSet.value)))
}

onMounted(load)
watch(
    () => Array.from(signedSet.value),
    persist,
    { immediate: true }
)

/** ===== 计算属性 ===== */
// 今天是否已签到
const todayStr = `${year}-${pad(month)}-${pad(todayDay)}`
const isTodaySigned = computed(() => signedSet.value.has(todayStr))

// 计算从 1 号到“昨天”为止的断签天数（未打勾就是断签）
const missedDays = computed(() => {
    let miss = 0
    for (let d = 1; d < todayDay; d++) {
        const ds = `${year}-${pad(month)}-${pad(d)}`
        if (!signedSet.value.has(ds)) miss++
    }
    return miss
})

// 是否锁定（超过允许断签次数）
const locked = computed(() => missedDays.value > maxMiss)

// 连续天数（从今天往前连续有勾的天数）
const streakDays = computed(() => {
    let cnt = 0
    for (let d = todayDay; d >= 1; d--) {
        const ds = `${year}-${pad(month)}-${pad(d)}`
        if (signedSet.value.has(ds)) cnt++
        else break
    }
    return cnt
})

// 日历头部偏移（1号是星期几，转成以周一为首列的偏移）
function firstDayOffset() {
    const w = new Date(year, month - 1, 1).getDay() // 0=Sun,1=Mon...
    return (w + 6) % 7 // 转成 Mon=0
}

// 生成日历格子
const cells = computed(() => {
    const offset = firstDayOffset()
    const total = Math.ceil((offset + daysInMonth) / 7) * 7
    const arr = []
    for (let i = 0; i < total; i++) {
        const day = i - offset + 1
        if (day < 1 || day > daysInMonth) {
            arr.push({ key: `e-${i}`, day: 0 })
            continue
        }
        const ds = `${year}-${pad(month)}-${pad(day)}`
        arr.push({
            key: ds,
            day,
            signed: signedSet.value.has(ds),
            isToday: day === todayDay,
            isPast: day < todayDay
        })
    }
    return arr
})

/** ===== 动作 ===== */
function touchSet() {
    // 触发响应式：克隆一个新 Set 回去
    signedSet.value = new Set(signedSet.value)
    // 同时保存
    persist()
}
const signing = ref(false)
const { t, tm } = useI18n()
function signToday() {
  if (isTodaySigned.value) return
  signing.value = true

  setTimeout(() => {
    if (locked.value) {
      signedSet.value = new Set([todayStr])
    } else {
      const newSet = new Set(signedSet.value)
      newSet.add(todayStr)
      signedSet.value = newSet
    }

    touchSet()
    triggerAnim()
    signing.value = false
    ElMessage.success(t('sign.success'))   // 这里改成多语言
  }, 400)
}

function triggerAnim() {
  const el = document.querySelector('.cell.is-today')
  if (el) {
    el.classList.remove('is-signed')
    void el.offsetWidth // 强制 reflow
    el.classList.add('is-signed')
  }
}

</script>

<style scoped>
.sign-card {
    width: 90%;
    background: #0f0f0f;
    color: #eee;
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 14px;
    padding: 16px 16px 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, .35);
}

.sign-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
}

.title {
    font-size: 16px;
    font-weight: 600;
    color: #ffd34d;
}

.meta {
    font-size: 13px;
    color: #bbb;
}

.meta .dot {
    margin: 0 8px;
    opacity: .5;
}

.calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    background: rgba(255, 255, 255, .03);
    border: 1px solid rgba(255, 255, 255, .08);
    border-radius: 10px;
    padding: 10px;
}

.wday {
    text-align: center;
    font-size: 12px;
    color: #9aa0a6;
    padding: 6px 0;
}

.cell {
    height: 58px;
    border-radius: 10px;
    background: rgba(255, 255, 255, .02);
    border: 1px dashed rgba(255, 255, 255, .06);
    display: flex;
    align-items: center;
    justify-content: center;
}

.cell.is-empty {
    background: transparent;
    border: none;
}

.day {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
}

.num {
    font-weight: 600;
    color: #e8eaed;
}

.mark {
    color: #22c55e;
    font-weight: 700;
}

.miss {
    color: rgba(255, 255, 255, .28);
    font-size: 20px;
    line-height: 1;
    margin-top: -2px;
}

.cell.is-today {
    border-color: rgba(255, 211, 77, .7);
    box-shadow: inset 0 0 0 1px rgba(255, 211, 77, .35);
}

.cell.is-signed {
    background: rgba(34, 197, 94, .12);
    border-color: rgba(34, 197, 94, .35);
}

.cell.is-missed {
    background: rgba(255, 255, 255, .02);
}

.actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 14px;
    z-index: 2; 
}

.tip {
    font-size: 12px;
    color: #9aa0a6;
}
.cell.is-today.is-signed {
  animation: pulse 0.4s ease;
}
@keyframes pulse {
  0% { transform: scale(0.8); background: rgba(34,197,94,.4); }
  100% { transform: scale(1); }
}

.tip.danger,
.meta b.danger {
    color: #ff6b6b !important;
}
</style>
