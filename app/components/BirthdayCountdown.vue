<script setup lang="ts">
import { Cake, ChevronRight } from '@lucide/vue'
import { countdownParts, nextBirthday } from '../utils/birthdayCountdown'

const emit = defineEmits<{ manage: [] }>()
const { anniversaries } = useAnniversaries()
const now = ref(new Date())
const upcoming = computed(() => nextBirthday(anniversaries.value, now.value))
const parts = computed(() => upcoming.value ? countdownParts(upcoming.value.date, now.value) : [0, 0, 0, 0])
const units = ['天', '时', '分', '秒']
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { now.value = new Date(); timer = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section class="panel birthday-panel" aria-label="生日倒计时">
    <div class="birthday-heading"><span class="birthday-icon"><Cake :size="25" /></span><div><p class="eyebrow">A DAY JUST FOR YOU</p><h2>把你的生日，放在心上</h2></div></div>
    <template v-if="upcoming">
      <p class="birthday-title">{{ upcoming.event.title }} · {{ upcoming.date.getMonth() + 1 }} 月 {{ upcoming.date.getDate() }} 日</p>
      <p v-if="upcoming.isToday" class="birthday-wish">生日快乐！今天的偏爱，都留给你 🎂</p>
      <div v-else class="birthday-clock" role="timer" :aria-label="`距离${upcoming.event.title}还有${parts[0]}天${parts[1]}小时${parts[2]}分${parts[3]}秒`"><div v-for="(part, index) in parts" :key="index"><strong>{{ String(part).padStart(2, '0') }}</strong><small>{{ units[index] }}</small></div></div>
      <p class="birthday-note">提前准备一个小惊喜，也是一种认真喜欢。</p>
    </template>
    <p v-else class="birthday-empty">还没记下生日？在纪念日里添加「生日」，这里就会为你们倒数。每年重复的生日会自动计算下一次。</p>
    <button class="birthday-manage" type="button" @click="emit('manage')">{{ upcoming ? '管理生日与纪念日' : '记下你们的生日' }}<ChevronRight :size="16" /></button>
  </section>
</template>

<style scoped>
.birthday-panel{background:linear-gradient(135deg,#fff7f1,#fff0f7)!important;min-width:0}.birthday-heading{display:flex;gap:12px;align-items:center}.birthday-icon{display:grid;place-items:center;flex:0 0 48px;height:48px;border-radius:17px;color:#d86a8b;background:#ffe0e9}.birthday-heading .eyebrow{font-size:10px;letter-spacing:.12em;margin:0 0 5px}.birthday-heading h2{font-size:19px;margin:0}.birthday-title{margin:23px 0 14px;font-weight:750;overflow-wrap:anywhere}.birthday-clock{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.birthday-clock>div{padding:14px 5px;text-align:center;border:1px solid #f5dce4;border-radius:16px;background:#ffffffb8}.birthday-clock strong{display:block;font-size:clamp(22px,3vw,34px);font-variant-numeric:tabular-nums;color:#ad597c}.birthday-clock small{font-size:11px;color:var(--muted)}.birthday-note,.birthday-empty{color:var(--muted);font-size:13px;line-height:1.8}.birthday-empty{margin:24px 0}.birthday-wish{font-size:19px;line-height:1.8;color:#b85581}.birthday-manage{display:flex;gap:5px;align-items:center;border:0;padding:7px 0;background:transparent;color:#a3507b;font-weight:750;font-size:13px}.birthday-heading h2{line-height:1.5}
</style>

<style scoped>
.birthday-panel{grid-column:1/-1}
@media(min-width:800px){.birthday-panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 35px;align-items:center}.birthday-heading{grid-column:1;grid-row:1}.birthday-title{grid-column:1;grid-row:2;margin:17px 0 0}.birthday-clock,.birthday-wish{grid-column:2;grid-row:1/5}.birthday-note{grid-column:1;grid-row:3;margin:8px 0}.birthday-manage{grid-column:1;grid-row:4;justify-self:start}.birthday-empty{grid-column:2;grid-row:1/4;margin:0}}
</style>
