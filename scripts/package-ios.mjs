import archiver from 'archiver'
import { createWriteStream } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const target = path.resolve(root, '../Love-iPhone-工程.zip')
const archive = archiver('zip', { zlib: { level: 8 } })
const output = createWriteStream(target)
const done = new Promise((resolve, reject) => {
  output.on('close', resolve)
  output.on('error', reject)
  archive.on('error', reject)
  archive.on('warning', reject)
})
archive.pipe(output)

const directories = ['app', 'public', 'ios', 'scripts', 'supabase', 'docs', 'desktop', 'tests']
const excluded = new Set(['node_modules', '.git', 'build', 'Pods', 'DerivedData', 'xcuserdata', '.build', '.swiftpm'])
async function addDirectory(relative) {
  for (const item of await readdir(path.join(root, relative), { withFileTypes: true })) {
    if (excluded.has(item.name) || item.name.startsWith('.env') || /\.(p12|mobileprovision|key|log)$/.test(item.name)) continue
    const next = path.posix.join(relative, item.name)
    if (item.isDirectory()) await addDirectory(next)
    else if (item.isFile()) archive.file(path.join(root, next), { name: `Love-iPhone/${next}` })
  }
}
for (const directory of directories) await addDirectory(directory)
for (const item of await readdir(root, { withFileTypes: true })) {
  if (item.isFile() && (item.name === 'LICENSE' || item.name === '.gitignore' || item.name === '.env.example' || /\.(md|ts|json|cmd)$/.test(item.name))) {
    archive.file(path.join(root, item.name), { name: `Love-iPhone/${item.name}` })
  }
}

const config = JSON.parse(await readFile(path.join(root, 'ios/App/App/capacitor.config.json'), 'utf8'))
if (config.server?.url) throw new Error('工程包不应依赖外部开发服务器。')
await archive.finalize()
await done
console.log(`iPhone 工程包：${target}`)
console.log(`大小：${(archive.pointer() / 1024 / 1024).toFixed(1)} MB`)
