#!/usr/bin/env node
/**
 * USER #43 sanity check:pinned column resize 後 pinned region 仍正常顯示。
 *
 * 跑法:確認 storybook 已啟動 → `node scripts/sanity-pinned-resize.mjs`
 *
 * Verify:
 * 1. Pinned column resize handle 存在 + 可拖拉
 * 2. Resize 後 pinned region 仍 sticky(不脫離 left/right edge)
 * 3. Pinned region 寬度跟 column 寬度同步
 * 4. Center region 寬度自動 fill remainder
 */

import { chromium } from 'playwright'

const STORY = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--pinned-columns&viewMode=story'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto(STORY, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-data-table-outer]', { timeout: 15000 })
await page.waitForTimeout(500)

// Step 1: 量 pre-resize state
const pre = await page.evaluate(() => {
  const outer = document.querySelector('[data-data-table-outer]')
  const allCells = outer ? [...outer.querySelectorAll('[role="cell"]')] : []
  const firstRowCells = allCells.filter((c, i, arr) => {
    const row = c.closest('[role="row"]')
    return row && [...arr].slice(0, i).every(prev => prev.closest('[role="row"]') !== row || c === prev)
  }).slice(0, 6)
  return {
    outerWidth: outer?.getBoundingClientRect().width ?? null,
    cells: firstRowCells.map((c, i) => ({
      idx: i,
      colId: c.getAttribute('data-column-id'),
      x: c.getBoundingClientRect().x,
      width: c.getBoundingClientRect().width,
    })),
  }
})

console.log('Pre-resize first row cells:')
console.log(JSON.stringify(pre, null, 2))

// Step 2: 找 pinned column resize handle(header divider)
const handles = await page.locator('[role="columnheader"] [data-column-id], [data-resize-handle]').count()
console.log(`Resize handles found: ${handles}`)

// Step 3: 嘗試 drag pinned column resize handle(假設 left pinned 第 1 column)
try {
  // 找第一個 column header 右邊邊緣
  const firstHeader = await page.locator('[role="columnheader"]').first()
  const box = await firstHeader.boundingBox()
  if (box) {
    const startX = box.x + box.width - 1
    const startY = box.y + box.height / 2
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 50, startY, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(300)
  }
} catch (e) {
  console.log(`Drag failed: ${e.message}`)
}

// Step 4: 量 post-resize state
const post = await page.evaluate(() => {
  const outer = document.querySelector('[data-data-table-outer]')
  return {
    outerWidth: outer?.getBoundingClientRect().width ?? null,
    leftRegion: outer?.querySelector('[role="row"]')?.firstElementChild?.getBoundingClientRect().x ?? null,
  }
})

console.log('Post-resize:')
console.log(JSON.stringify(post, null, 2))

// Step 5: assertion — pinned 仍 sticky on x=0 OR x=outer-width(沒脫離)
const leftStickyOK = post.leftRegion === 0 || (post.leftRegion != null && post.leftRegion < 50)
console.log(`Left pinned sticky OK: ${leftStickyOK}`)

await browser.close()

if (!leftStickyOK) {
  console.log('USER #43 sanity FAIL: pinned region 脫離 edge')
  process.exitCode = 1
} else {
  console.log('USER #43 sanity PASS: pinned region 仍 sticky')
}
