import { chromium } from '@playwright/test'
import { readFile, writeFile, copyFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const svg = await readFile(new URL('public/couplespace-mark.svg', root), 'utf8')
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
})
try {
  const page = await browser.newPage()
  const render = async (size, iconSize) => {
    const data = await page.evaluate(async ({ svg, size, iconSize }) => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d', { alpha: false })
      const gradient = ctx.createLinearGradient(0, 0, size, size)
      gradient.addColorStop(0, '#f5e9fc')
      gradient.addColorStop(1, '#fbdce8')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)
      const img = new Image()
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
      await img.decode()
      ctx.drawImage(img, (size - iconSize) / 2, (size - iconSize) / 2, iconSize, iconSize)
      return canvas.toDataURL('image/png').split(',')[1]
    }, { svg, size, iconSize })
    return Buffer.from(data, 'base64')
  }
  await writeFile(new URL('public/love-home-icon.png', root), await render(1024, 1024))
  await copyFile(new URL('public/love-home-icon.png', root), new URL('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', root))
  await writeFile(new URL('ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png', root), await render(2732, 640))
  for (const suffix of ['-1', '-2']) {
    await copyFile(new URL('ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png', root), new URL(`ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732${suffix}.png`, root))
  }
  console.log('已生成不透明 iPhone 图标和启动图。')
} finally {
  await browser.close()
}
