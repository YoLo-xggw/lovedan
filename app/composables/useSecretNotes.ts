export type SecretNote = { id: string; title: string; content: string; createdBy: string; createdAt: string }

export function useSecretNotes() {
  const { $supabase } = useNuxtApp()
  const { profile, demoMode } = useCoupleAuth()
  const notes = ref<SecretNote[]>([])
  const loading = ref(false)
  const localOnly = computed(() => !$supabase || demoMode.value)
  const storageKey = () => `couple-space-secret-notes:${profile.value?.coupleId || 'demo'}`
  const membership = () => {
    if (!profile.value?.id || !profile.value.coupleId) throw new Error('请先登录并加入你们的双人空间')
    return { userId: profile.value.id, coupleId: profile.value.coupleId }
  }
  function saveLocal(next: SecretNote[]) {
    localStorage.setItem(storageKey(), JSON.stringify(next))
    notes.value = next
  }
  async function loadNotes() {
    const { coupleId } = membership()
    loading.value = true
    try {
      if (localOnly.value) {
        const stored = JSON.parse(localStorage.getItem(storageKey()) || '[]')
        if (!Array.isArray(stored)) throw new Error('本地留言格式有误，请检查浏览器存储')
        notes.value = stored
        return
      }
      const { data, error } = await $supabase!.from('secret_notes')
        .select('id,title,content,created_by,created_at').eq('couple_id', coupleId).order('created_at', { ascending: false })
      if (error) throw error
      notes.value = (data || []).map(row => ({ id: row.id, title: row.title, content: row.content, createdBy: row.created_by, createdAt: row.created_at }))
    } finally { loading.value = false }
  }
  async function createNote(title: string, content: string) {
    const { userId, coupleId } = membership()
    title = title.trim()
    content = content.trim()
    if (!title || title.length > 80 || !content || content.length > 3000) throw new Error('标题需为 1–80 字，正文需为 1–3000 字')
    if (localOnly.value) {
      saveLocal([{ id: crypto.randomUUID(), title, content, createdBy: userId, createdAt: new Date().toISOString() }, ...notes.value])
      return
    }
    const { data, error } = await $supabase!.from('secret_notes').insert({ couple_id: coupleId, created_by: userId, title, content })
      .select('id,title,content,created_by,created_at').single()
    if (error) throw error
    notes.value = [{ id: data.id, title: data.title, content: data.content, createdBy: data.created_by, createdAt: data.created_at }, ...notes.value]
  }
  async function deleteNote(note: SecretNote) {
    const { userId, coupleId } = membership()
    if (note.createdBy !== userId) throw new Error('只能删除自己写的留言')
    if (localOnly.value) { saveLocal(notes.value.filter(item => item.id !== note.id)); return }
    const { error } = await $supabase!.from('secret_notes').delete().eq('id', note.id).eq('couple_id', coupleId).eq('created_by', userId)
    if (error) throw error
    notes.value = notes.value.filter(item => item.id !== note.id)
  }
  return { notes, loading, localOnly, loadNotes, createNote, deleteNote }
}
