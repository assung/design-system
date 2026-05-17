// Within-row cell alignment audit(image 3 concern from user)。
// 驗:同 row 內所有 cell 的 display element 垂直起始位置一致
// - autoRow mode(有 error)→ 所有 cell display.top 應一致(items-start canonical)
// - fixed mode(無 error)→ 所有 cell display 應垂直置中(同 center y)

import { chromium } from 'playwright'

const URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--cell-errors-fixed-row-override&viewMode=story'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(800)

const stats = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('[role="row"][data-row-index]')).slice(0, 4)
  return rows.map(r => {
    const idx = r.getAttribute('data-row-index')
    const cells = Array.from(r.querySelectorAll('[role="cell"]'))
    const cellInfo = cells.map(c => {
      const colId = c.getAttribute('data-column-id') || c.getAttribute('data-col-id') || '?'
      const cellRect = c.getBoundingClientRect()
      // 找 cell 內第一個有實質內容的元素(不算 invisible/empty wrapper)
      // 通常是 .truncate / button / input / span 子節點
      const content = c.querySelector('[role="textbox"], [role="combobox"], input, .truncate, button, span:not(:empty)')
      const contentRect = content?.getBoundingClientRect()
      const mode = c.getAttribute('data-row-mode')
      const hasErr = c.getAttribute('aria-invalid') === 'true'
      return {
        colId,
        mode,
        hasErr,
        cellTop: cellRect.top.toFixed(1),
        cellHeight: cellRect.height.toFixed(1),
        contentTop: contentRect?.top.toFixed(1) ?? null,
        contentHeight: contentRect?.height.toFixed(1) ?? null,
      }
    })
    return { idx, cellInfo }
  })
})

await page.close()
await browser.close()

// 分析:per row,所有 cell 的 contentTop 是否一致(容忍 ±1px)
console.log('\n=== Within-row cell display alignment audit ===\n')
let allPass = true

for (const row of stats) {
  const tops = row.cellInfo.map(c => parseFloat(c.contentTop)).filter(t => !isNaN(t))
  if (tops.length < 2) {
    console.log(`Row ${row.idx}: skip(< 2 cells with content)`)
    continue
  }
  const minTop = Math.min(...tops)
  const maxTop = Math.max(...tops)
  const delta = maxTop - minTop
  const pass = delta <= 1.5
  if (!pass) allPass = false
  const mark = pass ? '✓' : '✗'
  console.log(`${mark} Row ${row.idx} cell content tops: min=${minTop} max=${maxTop} Δ=${delta.toFixed(2)}px`)
  if (!pass) {
    console.log(`   Detail:`, JSON.stringify(row.cellInfo, null, 2))
  }
}

console.log(allPass ? '\n✅ ALL PASS — within-row alignment consistent' : '\n❌ FAIL — some rows have inconsistent cell content alignment')
process.exit(allPass ? 0 : 1)
