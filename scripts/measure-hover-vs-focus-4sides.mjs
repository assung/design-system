// 量 hover ring vs edit Field border 真實 visible pixel 位置(4 邊 + 多 cell 類型)
// 用 idle baseline diff 找 ring-only pixels,排除 cell border-r 干擾
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { PNG } from 'pngjs'

const url = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit&viewMode=story'
const OUT = '/tmp/hover-focus-4sides'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 })
const page = await ctx.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

const cells = [
  { id: 'name', label: 'string' },
  { id: 'category', label: 'select' },
  { id: 'releaseDate', label: 'date' },
  { id: 'reminderTime', label: 'time' },
]

const DPR = 4

function readPng(p) { return PNG.sync.read(readFileSync(p)) }

function findVisibleRange(idle, state, side, cellBox, pad) {
  const w = idle.width, h = idle.height
  const cellLeftPx = pad * DPR
  const cellTopPx = pad * DPR
  const cellRightPx = cellLeftPx + cellBox.width * DPR
  const cellBottomPx = cellTopPx + cellBox.height * DPR
  const diffs = []
  if (side === 'right') {
    const startX = cellRightPx - 8 * DPR, endX = cellRightPx + 4 * DPR
    const midY = Math.floor((cellTopPx + cellBottomPx) / 2)
    for (let x = startX; x < endX; x++) {
      let d = 0
      for (let y = midY - 6; y < midY + 6; y++) {
        const idx = (w * y + x) * 4
        d += Math.abs(idle.data[idx] - state.data[idx]) + Math.abs(idle.data[idx + 1] - state.data[idx + 1]) + Math.abs(idle.data[idx + 2] - state.data[idx + 2])
      }
      diffs.push({ x, xLogical: (x - cellLeftPx) / DPR, d })
    }
  } else if (side === 'left') {
    const startX = cellLeftPx - 4 * DPR, endX = cellLeftPx + 8 * DPR
    const midY = Math.floor((cellTopPx + cellBottomPx) / 2)
    for (let x = startX; x < endX; x++) {
      let d = 0
      for (let y = midY - 6; y < midY + 6; y++) {
        const idx = (w * y + x) * 4
        d += Math.abs(idle.data[idx] - state.data[idx]) + Math.abs(idle.data[idx + 1] - state.data[idx + 1]) + Math.abs(idle.data[idx + 2] - state.data[idx + 2])
      }
      diffs.push({ x, xLogical: (x - cellLeftPx) / DPR, d })
    }
  } else if (side === 'top') {
    const startY = cellTopPx - 4 * DPR, endY = cellTopPx + 8 * DPR
    const midX = Math.floor((cellLeftPx + cellRightPx) / 2)
    for (let y = startY; y < endY; y++) {
      let d = 0
      for (let x = midX - 6; x < midX + 6; x++) {
        const idx = (w * y + x) * 4
        d += Math.abs(idle.data[idx] - state.data[idx]) + Math.abs(idle.data[idx + 1] - state.data[idx + 1]) + Math.abs(idle.data[idx + 2] - state.data[idx + 2])
      }
      diffs.push({ x: y, xLogical: (y - cellTopPx) / DPR, d })
    }
  } else if (side === 'bottom') {
    const startY = cellBottomPx - 8 * DPR, endY = cellBottomPx + 4 * DPR
    const midX = Math.floor((cellLeftPx + cellRightPx) / 2)
    for (let y = startY; y < endY; y++) {
      let d = 0
      for (let x = midX - 6; x < midX + 6; x++) {
        const idx = (w * y + x) * 4
        d += Math.abs(idle.data[idx] - state.data[idx]) + Math.abs(idle.data[idx + 1] - state.data[idx + 1]) + Math.abs(idle.data[idx + 2] - state.data[idx + 2])
      }
      diffs.push({ x: y, xLogical: (y - cellTopPx) / DPR, d })
    }
  }
  const visible = diffs.filter(d => d.d > 80)
  if (!visible.length) return null
  return { range: [Math.min(...visible.map(c => c.xLogical)).toFixed(2), Math.max(...visible.map(c => c.xLogical)).toFixed(2)] }
}

for (const c of cells) {
  console.log(`\n=== ${c.label} (${c.id}) ===`)
  const cellSel = `[role="row"]:nth-child(2) [data-column-id="${c.id}"]`
  const cell = await page.$(cellSel)
  if (!cell) { console.log('  no cell'); continue }
  const box = await cell.boundingBox()
  const pad = 8
  const clip = { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 }

  await page.mouse.move(0, 0); await page.waitForTimeout(200)
  await page.screenshot({ path: `${OUT}/${c.id}-idle.png`, clip })

  await cell.hover(); await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/${c.id}-hover.png`, clip })

  await page.mouse.move(0, 0); await page.waitForTimeout(200)
  await cell.click(); await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${c.id}-edit.png`, clip })
  // Esc to exit edit
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)

  const idle = readPng(`${OUT}/${c.id}-idle.png`)
  const hover = readPng(`${OUT}/${c.id}-hover.png`)
  const edit = readPng(`${OUT}/${c.id}-edit.png`)
  console.log(`  cellBox: ${box.width}×${box.height}`)
  for (const side of ['top', 'right', 'bottom', 'left']) {
    const hRange = findVisibleRange(idle, hover, side, box, pad)
    const eRange = findVisibleRange(idle, edit, side, box, pad)
    console.log(`  ${side}: hover ring=${JSON.stringify(hRange)} | edit border=${JSON.stringify(eRange)}`)
  }
}

await browser.close()
