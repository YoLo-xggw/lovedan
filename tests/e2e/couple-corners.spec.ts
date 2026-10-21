import { expect, test, type Page } from '@playwright/test'

async function enterDemo(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: '直接体验本地小家', exact: true }).click()
  await expect(page.getByRole('button', { name: /双人小游戏/ })).toBeVisible()
}

async function goHome(page: Page) {
  // Desktop and mobile have separate navigation bars; only one is displayed.
  await page.locator('.nav-button:visible, .mobile-nav-button:visible').filter({ hasText: /^首页$/ }).click()
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('couple-space-declaration-accepted', '1')
    localStorage.setItem('couple-space-first-run-intro', '1')
    localStorage.setItem('couple-space-first-run-complete', '1')
  })
})

test('birthday countdown, turn taking, and concealed answers work on both screen sizes', async ({ page }) => {
  await page.addInitScript(() => {
    const date = new Date()
    date.setDate(date.getDate() + 2)
    const iso = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
    localStorage.setItem('couple-space-anniversaries', JSON.stringify([{ id: 'birthday-demo', title: 'TA的生日', eventDate: iso, kind: 'birthday', recurring: true, note: '', createdBy: 'demo-user' }]))
  })
  await enterDemo(page)
  await expect(page.getByRole('timer')).toBeVisible()
  await expect(page.getByRole('timer')).toHaveAttribute('aria-label', /距离TA的生日还有/)
  await noOverflow(page)
  await page.getByRole('button', { name: /双人小游戏/ }).click()
  await expect(page.locator('.memory-grid button')).toHaveCount(12)
  await page.locator('.memory-grid button').nth(0).click()
  await expect(page.locator('.memory-grid button').nth(0)).toBeDisabled()
  await page.locator('.memory-grid button').nth(1).click()
  const nextTurn = page.getByRole('button', { name: /来翻牌/ })
  if (await nextTurn.isVisible()) {
    await nextTurn.click()
    await expect(page.getByRole('status').filter({ hasText: /轮到 TA/ })).toBeVisible()
  } else {
    await expect(page.locator('.scoreboard')).toContainText('1 分')
  }
  await noOverflow(page)
  await page.getByRole('button', { name: /默契真心话/ }).click()
  await page.getByLabel(/悄悄写下答案/).fill('一起去看海')
  await page.getByRole('button', { name: '收好答案，交给对方' }).click()
  await expect(page.getByText('一起去看海', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: /开始回答/ }).click()
  await page.getByLabel(/悄悄写下答案/).fill('一起去爬山')
  await page.getByRole('button', { name: '一起揭晓答案' }).click()
  await expect(page.getByText('一起去看海', { exact: true })).toBeVisible()
  await expect(page.getByText('一起去爬山', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '下一张真心话' }).click()
  await expect(page.getByText('一起去看海', { exact: true })).toHaveCount(0)
  await noOverflow(page)
})

test('secret letters persist locally, render text safely, and require delete confirmation', async ({ page }) => {
  await enterDemo(page)
  await expect(page.getByRole('button', { name: '记下你们的生日' })).toBeVisible()
  await page.getByRole('button', { name: '记下你们的生日' }).click()
  await page.locator('.ann-header').getByRole('button', { name: '添加纪念日' }).click()
  await page.getByLabel('名称', { exact: true }).fill('我的生日')
  await page.getByLabel('日期', { exact: true }).fill('2000-12-12')
  await page.getByRole('combobox', { name: /类型/ }).selectOption('birthday')
  await page.getByRole('button', { name: '保存纪念日' }).click()
  await expect(page.locator('.ann-editor')).toHaveCount(0)
  await goHome(page)
  await expect(page.getByRole('timer')).toHaveAttribute('aria-label', /距离我的生日还有/)
  await page.getByRole('button', { name: /我们的秘密空间/ }).click()
  await expect(page.getByText(/留言仅保存在这台设备/)).toBeVisible()
  await page.getByRole('button', { name: '写下第一封留言' }).click()
  await page.getByLabel('给这封信一个名字').fill('我们的暗号')
  const message = '<script>window.secretUnsafe = true</script> 今天也喜欢你'
  await page.getByLabel('想悄悄对你说').fill(message)
  await page.getByRole('button', { name: '放进我们的信箱' }).click()
  await expect(page.getByText('留言已保存在当前浏览器。')).toBeVisible()
  await expect(page.getByText(message, { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: /我们的暗号/ }).click()
  await expect(page.getByText(message, { exact: true })).toBeVisible()
  expect(await page.evaluate(() => 'secretUnsafe' in window)).toBe(false)
  await noOverflow(page)
  await goHome(page)
  await page.getByRole('button', { name: /我们的秘密空间/ }).click()
  await expect(page.getByRole('heading', { name: '我们的暗号' })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: '直接体验本地小家', exact: true }).click()
  await page.getByRole('button', { name: /我们的秘密空间/ }).click()
  await expect(page.getByRole('heading', { name: '我们的暗号' })).toBeVisible()
  await page.getByRole('button', { name: '删除自己的留言' }).click()
  await expect(page.getByRole('heading', { name: '我们的暗号' })).toBeVisible()
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await page.getByRole('button', { name: '删除自己的留言' }).click()
  await page.getByRole('button', { name: '确认删除', exact: true }).click()
  await expect(page.getByRole('heading', { name: '第一封信，留给你们' })).toBeVisible()
  await noOverflow(page)
})
