// 量 hover ring 跟 edit Field border 真實 pixel 位置(用 pixelmatch 找 visible 像素)
// 針對 user 報「右邊 border 真的有位移 1px,不是視覺感受」
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { PNG } from 'pngjs'

const url = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit&viewMode=story'
const OUT = '/tmp/hover-focus-pixel-measure'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 })
const page = await ctx.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

const cellSel = `[role="row"]:nth-child(2) [data-column-id="name"]`
const cell = await page.$(cellSel)
const box = await cell.boundingBox()
const pad = 4
const clip = { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 }

// idle baseline
await page.screenshot({ path: `${OUT}/idle.png`, clip })

// Hover
await cell.hover()
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/hover.png`, clip })

// Edit (focus)
await page.mouse.move(0, 0)
await page.waitForTimeout(200)
await cell.click()
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/edit.png`, clip })

await browser.close()

// Diff: idle vs hover, idle vs edit
function readPng(p) {
  const buf = readFileSync(p)
  return PNG.sync.read(buf)
}
function findRingPixels(idle, state) {
  // 找 visible-pixel-changes 在右邊 strip 上
  const w = idle.width, h = idle.height
  const cellW = box.width * 4, cellLeftAt = pad * 4 // DPR 4x scaled
  const cellRightAt = cellLeftAt + cellW
  const rightStart = Math.floor(cellRightAt - 16) // 看 cell 右邊 16px strip(DPR 4 = ~4 logical px)
  const rightEnd = Math.min(w, Math.floor(cellRightAt + 8))
  const midY = Math.floor(h / 2)
  const cols = []
  for (let x = rightStart; x < rightEnd; x++) {
    let diff = 0
    for (let y = midY - 8; y < midY + 8; y++) {
      const idx = (w * y + x) * 4
      const dr = Math.abs(idle.data[idx] - state.data[idx])
      const dg = Math.abs(idle.data[idx + 1] - state.data[idx + 1])
      const db = Math.abs(idle.data[idx + 2] - state.data[idx + 2])
      diff += dr + dg + db
    }
    cols.push({ x, xLogical: (x - cellLeftAt) / 4, diff })
  }
  // 找出 diff > threshold 的 x range(highlight visible ring 區)
  const visibleCols = cols.filter(c => c.diff > 100)
  if (visibleCols.length === 0) return { count: 0 }
  const xLogicalMin = Math.min(...visibleCols.map(c => c.xLogical))
  const xLogicalMax = Math.max(...visibleCols.map(c => c.xLogical))
  return {
    count: visibleCols.length,
    xLogicalRange: [xLogicalMin.toFixed(2), xLogicalMax.toFixed(2)],
    cellRightLogical: box.width,
    deltaToCellRight: (box.width - xLogicalMax).toFixed(2),
  }
}

const idle = readPng(`${OUT}/idle.png`)
const hover = readPng(`${OUT}/hover.png`)
const edit = readPng(`${OUT}/edit.png`)

console.log('Cell box:', box)
console.log('Hover ring 右邊 visible pixel range:', findRingPixels(idle, hover))
console.log('Edit border 右邊 visible pixel range:', findRingPixels(idle, edit))
console.log(`output: ${OUT}/`)
