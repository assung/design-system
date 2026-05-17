// 截圖 cell 在 hover vs edit-focus 兩 state — 同 cell, 大放大,視覺 verify 1px 差
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const url = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit&viewMode=story'
const OUT = '/tmp/cell-hover-vs-focus'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 }) // 4x for pixel inspection
const page = await ctx.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

// 用 string cell(name)— 簡單,不被 picker layout 干擾
const cellSel = `[role="row"]:nth-child(2) [data-column-id="name"]`
const cell = await page.$(cellSel)
const box = await cell.boundingBox()

// Pad 左右 + 上下,看周邊 grid 線
const pad = 8
const clip = { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 }

await page.screenshot({ path: `${OUT}/idle.png`, clip })

await cell.hover()
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/hover.png`, clip })

// Move away first then click
await page.mouse.move(0, 0)
await page.waitForTimeout(200)
await cell.click()
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/edit-focus.png`, clip })

// edit-focus 同時 hover(模擬 user 點 cell 後游標還在上 = edit + hover)
await cell.hover()
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/edit-focus-hover.png`, clip })

console.log(`output: ${OUT}/`)
await browser.close()
