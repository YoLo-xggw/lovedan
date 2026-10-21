import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const packagePath = new URL('../ios/App/CapApp-SPM/Package.swift', import.meta.url)
// Capacitor CLI uses the host separator. Swift needs portable POSIX package paths.
const original = await readFile(packagePath, 'utf8')
const portable = original.replace(/(path:\s*")([^"\n]*)(")/g, (_, prefix, path, suffix) =>
  `${prefix}${path.replace(/\\/g, '/')}${suffix}`)
if (portable !== original) await writeFile(packagePath, portable)

const config = JSON.parse(await readFile(new URL('../ios/App/App/capacitor.config.json', import.meta.url), 'utf8'))
if (config.server?.url) throw new Error('iPhone 工程必须使用随包页面，请移除 server.url 后重新同步。')
await readFile(new URL('../ios/App/App/public/index.html', import.meta.url))
console.log(`iPhone 工程已准备：${fileURLToPath(new URL('../ios/App/App.xcodeproj', import.meta.url))}`)
console.log('请在 Mac 上用 Xcode 选择签名团队后构建。')
