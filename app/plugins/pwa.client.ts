export default defineNuxtPlugin(() => {
  if (!('serviceWorker' in navigator)) return
  if (!['http:', 'https:'].includes(window.location.protocol)) return
  const baseURL = useRuntimeConfig().app.baseURL || '/'
  const base = baseURL.endsWith('/') ? baseURL : `${baseURL}/`
  navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => undefined)
})
