import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = join(process.cwd(), '.output', 'public')
const base = (process.env.GITHUB_PAGES_BASE || '/lovedan/').replace(/^\/?/, '/').replace(/\/?$/, '/')
const publicAssets = [
  'app-update.json', 'couplespace-mark.svg', 'demo-coffee.jpg', 'demo-sunset.jpg',
  'demo-together.jpg', 'desktop-icon.png', 'favicon.ico', 'login-couple.jpg',
  'love-home-icon.png', 'manifest.webmanifest', 'robots.txt', 'sw.js', 'models/',
]

async function files(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await files(path))
    else if (/\.(html|js|css|json|webmanifest)$/.test(entry.name)) result.push(path)
  }
  return result
}

for (const file of await files(root)) {
  let source = await readFile(file, 'utf8')
  if (file.endsWith('manifest.webmanifest')) {
    source = source.replace(/("(?:start_url|scope)"\s*:\s*)"\/"/g, `$1"${base}"`)
  }
  for (const asset of publicAssets) {
    const token = `/${asset}`
    let cursor = 0
    let index
    while ((index = source.indexOf(token, cursor)) !== -1) {
      const alreadyPrefixed = source.slice(Math.max(0, index - (base.length - 1)), index) === base.slice(0, -1)
      if (!alreadyPrefixed) {
        source = `${source.slice(0, index)}${base}${asset}${source.slice(index + token.length)}`
        cursor = index + base.length + asset.length
      } else {
        cursor = index + token.length
      }
    }
  }
  await writeFile(file, source)
}

console.log(`GitHub Pages 路径已处理：${base}`)
