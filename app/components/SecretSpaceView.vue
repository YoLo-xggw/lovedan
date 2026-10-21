<script setup lang="ts">
import { ArrowLeft, Heart, LockKeyhole, Mail, Plus, RefreshCw, Trash2, X } from '@lucide/vue'
import type { SecretNote } from '~/composables/useSecretNotes'
defineEmits<{ back: [] }>()
const { profile } = useCoupleAuth()
const { notes, loading, localOnly, loadNotes, createNote, deleteNote } = useSecretNotes()
const title = ref('')
const content = ref('')
const composing = ref(false)
const busy = ref(false)
const error = ref('')
const saved = ref('')
const openedId = ref('')
const deletingId = ref('')
const dateLabel = (value: string) => new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(new Date(value))
function errorText(cause: any) {
  if (cause?.code === 'PGRST205' || cause?.code === '42P01') return '秘密留言还未启用，请先由空间管理员完成数据库更新。'
  return cause?.message || '暂时无法保存，请稍后重试'
}
async function refresh() {
  error.value = ''
  try { await loadNotes() } catch (cause) { error.value = errorText(cause) }
}
async function save() {
  if (busy.value) return
  busy.value = true
  error.value = ''; saved.value = ''
  try {
    await createNote(title.value, content.value)
    title.value = ''; content.value = ''; composing.value = false
    saved.value = localOnly.value ? '留言已保存在当前浏览器。' : '心意已经收好，对方打开秘密空间就能看到。'
  } catch (cause) { error.value = errorText(cause) }
  finally { busy.value = false }
}
async function remove(note: SecretNote) {
  if (busy.value) return
  busy.value = true; error.value = ''; saved.value = ''
  try { await deleteNote(note); deletingId.value = ''; saved.value = '留言已删除。' }
  catch (cause) { error.value = errorText(cause) }
  finally { busy.value = false }
}
onMounted(refresh)
</script>

<template>
  <section class="secret-view">
    <header class="secret-header"><div><p class="eyebrow">JUST BETWEEN US</p><h1>只对你说的秘密</h1><p>一些小心事，一些未说出口的喜欢，都留在这里。</p></div><button class="page-back" type="button" @click="$emit('back')"><ArrowLeft :size="16" /> 返回首页</button></header>
    <div class="secret-intro"><span class="secret-seal"><LockKeyhole :size="29" /></span><div><h2>我们的秘密信箱</h2><p>{{ localOnly ? '本地体验：留言仅保存在这台设备的浏览器里，不会同步给另一台设备。' : '留言仅向同一空间的两位成员开放。把心意留下，等对方来读。' }}</p></div></div>
    <div class="secret-toolbar"><span>{{ notes.length }} 封小心事</span><div><button type="button" class="refresh-button" :disabled="loading || busy" @click="refresh"><RefreshCw :size="16" /> 刷新信箱</button><button type="button" class="primary-button" :disabled="busy" @click="composing = !composing"><X v-if="composing" :size="17" /><Plus v-else :size="17" />{{ composing ? '收起信纸' : '写一封秘密留言' }}</button></div></div>
    <p v-if="error" class="secret-error" role="alert">{{ error }}</p><p v-if="saved" class="secret-saved" role="status">{{ saved }}</p>
    <form v-if="composing" class="secret-editor panel" @submit.prevent="save"><label for="secret-title">给这封信一个名字</label><input id="secret-title" v-model="title" required maxlength="80" placeholder="比如：今天又多喜欢了你一点"><label for="secret-content">想悄悄对你说</label><textarea id="secret-content" v-model="content" required maxlength="3000" rows="7" placeholder="从一件只有我们记得的小事开始……" /><footer><small>{{ content.length }}/3000</small><button class="primary-button" type="submit" :disabled="busy || !title.trim() || !content.trim()"><Heart :size="16" />{{ busy ? '正在收好…' : '放进我们的信箱' }}</button></footer></form>
    <p v-if="loading" class="secret-empty" role="status">正在打开秘密信箱…</p>
    <div v-else-if="notes.length" class="secret-grid">
      <article v-for="note in notes" :key="note.id" class="secret-note panel">
        <div class="note-meta"><Mail :size="19" /><small>{{ note.createdBy === profile?.id ? '我写给你的' : '对方写给我的' }} · {{ dateLabel(note.createdAt) }}</small></div>
        <button type="button" class="note-open" :aria-expanded="openedId === note.id" @click="openedId = openedId === note.id ? '' : note.id"><h2>{{ note.title }}</h2><span>{{ openedId === note.id ? '把信折好 ↑' : '拆开这封小心事 →' }}</span></button>
        <p v-if="openedId === note.id" class="note-body">{{ note.content }}</p>
        <footer v-if="note.createdBy === profile?.id"><template v-if="deletingId === note.id"><span>确定删除这封留言？</span><button type="button" :disabled="busy" @click="remove(note)">确认删除</button><button type="button" :disabled="busy" @click="deletingId = ''">取消</button></template><button v-else type="button" aria-label="删除自己的留言" @click="deletingId = note.id"><Trash2 :size="14" /> 删除</button></footer>
      </article>
    </div>
    <div v-else-if="!error" class="secret-empty panel"><Mail :size="38" /><h2>第一封信，留给你们</h2><p>也许是一句谢谢，也许是一个只有你们懂的暗号。</p><button type="button" class="primary-button" @click="composing = true">写下第一封留言</button></div>
  </section>
</template>

<style scoped>
.secret-view { max-width:1040px;margin:auto;padding:12px 0 35px; }.secret-header { display:flex;justify-content:space-between;align-items:flex-start;gap:18px; }h1 { margin:0;font-size:clamp(26px,3vw,36px);letter-spacing:-1px; }.secret-header p:last-child { color:var(--muted);font-size:13px;line-height:1.8; }.secret-intro { display:flex;align-items:center;gap:20px;margin:26px 0;padding:27px;border:1px solid #e7d5ef;border-radius:25px;background:linear-gradient(125deg,#f1e4fc,#ffe8f0); }.secret-seal { display:grid;place-items:center;width:65px;height:65px;flex-shrink:0;border-radius:23px;background:rgba(255,255,255,.7);color:#9b63b4; }h2 { margin:0;font-size:20px; }.secret-intro p { margin:8px 0 0;color:#8e6f95;line-height:1.8;font-size:13px; }.secret-toolbar { display:flex;justify-content:space-between;align-items:center;gap:12px;margin:24px 0;color:var(--muted);font-size:13px; }.secret-toolbar>div { display:flex;gap:10px; }.refresh-button { display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 14px;border:1px solid var(--line);border-radius:15px;background:white;cursor:pointer;font-size:12px; }.primary-button { justify-content:center;min-height:42px;font-size:12px; }.primary-button:disabled { opacity:.5;cursor:default; }.secret-editor { display:grid;gap:12px;margin-bottom:24px; }.secret-editor label { font-size:13px;font-weight:700; }.secret-editor input,.secret-editor textarea { width:100%;min-width:0;padding:14px;border:1px solid var(--line);border-radius:13px;background:white;color:inherit;font:inherit;font-size:14px; }.secret-editor textarea { resize:vertical;line-height:1.8; }.secret-editor footer { display:flex;align-items:center;justify-content:space-between;gap:12px; }.secret-editor small { color:var(--muted); }.secret-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px; }.secret-note { min-width:0;align-self:start; }.note-meta { display:flex;align-items:center;gap:9px;color:#a17aa8;font-size:12px; }.note-open { display:block;width:100%;padding:20px 0 14px;border:0;background:transparent;text-align:left;cursor:pointer; }.note-open h2 { line-height:1.6;overflow-wrap:anywhere; }.note-open span { display:block;margin-top:12px;color:var(--pink);font-size:12px; }.note-body { padding-top:17px;margin:0 0 18px;border-top:1px dashed var(--line);white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.9;font-size:14px; }.secret-note footer { display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:10px;color:var(--muted);font-size:11px; }.secret-note footer button { display:flex;align-items:center;gap:5px;border:0;background:none;color:#a16e85;cursor:pointer;font-size:11px;padding:8px 0; }.secret-empty { display:grid;place-items:center;gap:15px;text-align:center;padding:50px 20px;color:var(--muted); }.secret-empty h2 { color:var(--ink); }.secret-empty p { margin:0;font-size:13px;line-height:1.8; }.secret-error,.secret-saved { padding:14px 18px;border-radius:14px;font-size:13px;line-height:1.7; }.secret-error { background:#ffe9ed;color:#b34360; }.secret-saved { background:#eaf5ef;color:#477660; }
@media(max-width:650px) { .secret-header { flex-direction:column; }.secret-intro { gap:13px;padding:20px; }.secret-seal { width:48px;height:48px;border-radius:17px; }.secret-grid { grid-template-columns:1fr; }.secret-toolbar { align-items:flex-start;flex-direction:column; }.secret-toolbar>div { width:100%; }.secret-toolbar .primary-button { padding:0 13px;flex:1; }.secret-note,.secret-editor { padding:20px; } }
</style>
