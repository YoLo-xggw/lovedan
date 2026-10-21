<script setup lang="ts">
import { ArrowLeft, Gamepad2, Heart, MessageCircleHeart, RotateCcw, Sparkles } from '@lucide/vue'
import { createMemoryGame, flipMemoryCard, nextMemoryTurn } from '~/utils/coupleGames'

const props = defineProps<{ images?: string[]; names?: string[] }>()
defineEmits<{ back: [] }>()
const selected = ref<'memory' | 'questions'>('memory')
const game = ref(createMemoryGame())
const names = computed(() => [props.names?.[0] || '我', props.names?.[1] || 'TA'])
const finished = computed(() => game.value.matched.length === game.value.cards.length)
const winner = computed(() => game.value.scores[0] === game.value.scores[1] ? '平局！默契刚刚好' : `${names.value[game.value.scores[0] > game.value.scores[1] ? 0 : 1]} 赢啦`)
const status = computed(() => finished.value ? winner.value : game.value.flipped.length === 2 ? '没有配成一对，记住它们的位置，再交换回合' : `轮到 ${names.value[game.value.player]}，翻开两张卡片`)

function restart() { game.value = createMemoryGame(props.images?.slice(0, 6)) }
onMounted(restart)
function revealed(id: number) { return game.value.flipped.includes(id) || game.value.matched.includes(id) }

const questions = [
  '如果明天可以一起出发，你最想去哪里？',
  '你觉得我们最有默契的一件小事是什么？',
  '第一次见面时，你记住了对方的哪个细节？',
  '如果用一道菜形容我们的日常，你会选什么？',
  '下一次约会，你最想一起做什么？',
  '哪一张共同照片，是你最舍不得删的？',
  '对方做过的哪件小事，让你开心了很久？',
  '今年最想和对方一起完成的心愿是什么？',
]
const questionIndex = ref(0)
const phase = ref<'first' | 'handover' | 'second' | 'reveal'>('first')
const answer = ref('')
const answers = ref<[string, string]>(['', ''])
function submitAnswer() {
  if (!answer.value.trim()) return
  if (phase.value === 'first') {
    answers.value[0] = answer.value.trim()
    phase.value = 'handover'
  } else if (phase.value === 'second') {
    answers.value[1] = answer.value.trim()
    phase.value = 'reveal'
  }
  answer.value = ''
}
function nextQuestion() {
  questionIndex.value = (questionIndex.value + 1) % questions.length
  answers.value = ['', '']
  answer.value = ''
  phase.value = 'first'
}
</script>

<template>
  <section class="games-view">
    <header class="games-header">
      <div><p class="eyebrow">LET'S PLAY TOGETHER</p><h1>把今天，玩成共同回忆</h1><p>两个人，一台设备。把手机递给彼此，让快乐轮流发生。</p></div>
      <button class="page-back" type="button" @click="$emit('back')"><ArrowLeft :size="16" /> 返回首页</button>
    </header>
    <div class="game-tabs" role="group" aria-label="选择小游戏">
      <button type="button" :aria-pressed="selected === 'memory'" @click="selected = 'memory'"><Gamepad2 :size="20" /> 双人记忆翻牌 <small>一起记住每一次心动</small></button>
      <button type="button" :aria-pressed="selected === 'questions'" @click="selected = 'questions'"><MessageCircleHeart :size="20" /> 默契真心话 <small>答案揭晓前，先听听自己的心</small></button>
    </div>

    <article v-if="selected === 'memory'" class="game-board panel">
      <header><div><p class="eyebrow">MEMORY MATCH · 6 PAIRS</p><h2>找到属于你们的一对</h2></div><button class="restart-button" type="button" @click="restart"><RotateCcw :size="16" /> 重新开始</button></header>
      <p class="rules">配对成功得 1 分并继续翻牌；配对失败则换对方。六对全部找到后，分数高的一方获胜。</p>
      <div class="scoreboard">
        <div v-for="(name, index) in names" :key="index" :class="{ current: !finished && game.player === index }"><Heart :size="17" /><span>{{ name }}</span><strong>{{ game.scores[index] }} 分</strong></div>
      </div>
      <p class="turn-status" role="status">{{ status }}</p>
      <div class="memory-grid" aria-label="双人翻牌区">
        <button v-for="(card, index) in game.cards" :key="card.id" type="button" class="memory-card" :class="{ revealed: revealed(card.id), matched: game.matched.includes(card.id) }" :disabled="game.matched.includes(card.id) || game.flipped.includes(card.id) || game.flipped.length === 2" :aria-label="`第${index + 1}张卡片，${game.matched.includes(card.id) ? '已配对' : revealed(card.id) ? '已翻开' : '未翻开'}`" @click="game = flipMemoryCard(game, card.id)">
          <template v-if="revealed(card.id)"><img v-if="card.image" :src="card.image" alt="共同回忆" @error="card.image = undefined"><span v-else>{{ card.symbol }}</span></template>
          <span v-else class="card-back">♡<small>FOR US</small></span>
        </button>
      </div>
      <footer><span>已找到 {{ game.matched.length / 2 }}/6 对 · 尝试 {{ game.moves }} 次</span><button v-if="game.flipped.length === 2" type="button" class="primary-button" @click="game = nextMemoryTurn(game)">换 {{ names[game.player === 0 ? 1 : 0] }} 来翻牌</button><button v-if="finished" type="button" class="primary-button" @click="restart">再玩一局</button></footer>
    </article>

    <article v-else class="question-board panel">
      <p class="eyebrow">A LITTLE CLOSER · {{ questionIndex + 1 }}/{{ questions.length }}</p>
      <Sparkles :size="32" class="question-sparkle" />
      <h2>{{ questions[questionIndex] }}</h2>
      <template v-if="phase === 'handover'"><p class="rules">第一个答案已经收好。请把设备交给 {{ names[1] }}，准备好再继续。</p><button type="button" class="primary-button" @click="phase = 'second'">我是 {{ names[1] }}，开始回答</button></template>
      <template v-else-if="phase === 'reveal'"><div class="answer-reveal"><div v-for="(value, index) in answers" :key="index"><small>{{ names[index] }} 的答案</small><p>{{ value }}</p></div></div><p class="rules">相同的答案是默契，不同的答案是更了解彼此的机会。</p><button type="button" class="primary-button" @click="nextQuestion">下一张真心话</button></template>
      <form v-else @submit.prevent="submitAnswer"><label for="couple-answer">请 {{ names[phase === 'first' ? 0 : 1] }} 悄悄写下答案</label><textarea id="couple-answer" v-model="answer" maxlength="300" rows="4" required placeholder="写下你的第一个念头……" /><button type="submit" class="primary-button" :disabled="!answer.trim()">{{ phase === 'first' ? '收好答案，交给对方' : '一起揭晓答案' }}</button></form>
      <p class="answer-footnote">答案仅用于本轮互动，离开页面后不保存。</p>
    </article>
  </section>
</template>

<style scoped>
.games-view { max-width:1040px; margin:auto; padding:12px 0 35px; }
.games-header,.game-board>header { display:flex;align-items:flex-start;justify-content:space-between;gap:20px; }
h1 { margin:0;font-size:clamp(25px,3vw,36px);letter-spacing:-1px; } .games-header p:last-child,.rules { color:var(--muted);font-size:13px;line-height:1.8; }
.game-tabs { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:26px 0 18px; }
.game-tabs button { display:grid;grid-template-columns:24px 1fr;gap:6px 10px;padding:19px;border:1px solid var(--line);border-radius:20px;background:rgba(255,255,255,.65);text-align:left;font-weight:800;cursor:pointer; }
.game-tabs button[aria-pressed=true] { background:linear-gradient(125deg,#f0dcff,#ffe6f0);border-color:#c28bdd; } .game-tabs small { grid-column:2;font-size:11px;font-weight:400;color:var(--muted); }
h2 { margin:0;font-size:22px; } .restart-button { display:flex;align-items:center;gap:6px;flex-shrink:0;padding:9px 12px;border:1px solid var(--line);border-radius:12px;background:white;cursor:pointer;font-size:12px; }
.scoreboard { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:22px 0 16px; }.scoreboard>div { display:flex;align-items:center;gap:9px;padding:14px 16px;border:1px solid var(--line);border-radius:15px;background:#fff; }.scoreboard .current { border-color:#b977d2;background:#f8ecff; }.scoreboard span { min-width:0;overflow-wrap:anywhere; }.scoreboard strong { margin-left:auto;flex-shrink:0; }.turn-status { min-height:22px;text-align:center;font-size:13px;color:var(--lavender-deep); }
.memory-grid { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;max-width:640px;margin:20px auto; }.memory-card { display:grid;place-items:center;aspect-ratio:1.12;border:1px solid #e1cbe8;border-radius:18px;background:linear-gradient(140deg,#ebd6f8,#fbe0eb);cursor:pointer;overflow:hidden;padding:0; }.memory-card.revealed { background:white; }.memory-card.matched { border:2px solid #9ccbb5;background:#effaf3;opacity:.8; }.memory-card span { font-size:clamp(24px,5vw,46px); }.memory-card .card-back { color:#a469b2;line-height:1; }.card-back small { display:block;margin-top:6px;font-size:8px;letter-spacing:2px; }.memory-card img { width:100%;height:100%;object-fit:cover; }.memory-card:disabled { cursor:default; }
.game-board footer { display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;min-height:48px;color:var(--muted);font-size:12px; }.question-board { text-align:center;padding:35px clamp(18px,5vw,60px); }.question-sparkle { color:var(--pink);margin:20px 0; }.question-board h2 { line-height:1.7; }.question-board form { max-width:560px;margin:26px auto;display:grid;gap:12px;text-align:left; }.question-board label { font-size:13px; }.question-board textarea { width:100%;resize:vertical;padding:16px;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.8);font:inherit;font-size:14px;color:inherit; }.question-board .primary-button { justify-content:center;margin:20px auto 0; }.question-board form .primary-button { margin:0; }.primary-button:disabled { opacity:.5;cursor:default; }.answer-reveal { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:28px 0;text-align:left; }.answer-reveal>div { padding:20px;background:#f5eaf9;border-radius:18px;min-width:0; }.answer-reveal small { color:var(--muted); }.answer-reveal p { white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8; }.answer-footnote { margin-top:28px;color:var(--muted);font-size:11px; }
@media(max-width:650px) { .games-header { flex-direction:column; }.game-tabs { gap:8px; }.game-tabs button { padding:13px;font-size:12px; }.game-tabs small { grid-column:1/-1;line-height:1.6; }.game-board { padding:18px; }.game-board>header { flex-direction:column;gap:12px; }h2 { font-size:19px; }.memory-grid { gap:8px; }.memory-card { border-radius:12px; }.scoreboard>div { padding:12px 10px;font-size:12px; }.answer-reveal { grid-template-columns:1fr; } }
</style>
