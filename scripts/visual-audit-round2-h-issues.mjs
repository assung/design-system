// Round 2 H1/H2/H3 audit:per-row auto-height on cell error / pinned resize / meta.resizable
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const results = []

// H1: cell error → row auto-height(per row not global)
// 2026-05-11:targets CellErrorsFixedRowOverride(固定行高 baseline + cell error per-row 撐高)
// Baseline CellErrors story 用 autoRowHeight=true 整 table auto;本 test 驗 fixed-default + per-row override
{
  const URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--cell-errors-fixed-row-override&viewMode=story'
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(800)
  const stats = await page.evaluate(() => {
    // Cell errors story has 4 rows; some with errors some without
    const rows = Array.from(document.querySelectorAll('[role="row"][data-row-index]'))
    return rows.slice(0, 4).map(r => {
      const idx = r.getAttribute('data-row-index')
      const height = r.getBoundingClientRect().height
      const cells = r.querySelectorAll('[role="cell"]')
      const anyError = Array.from(cells).some(c => c.getAttribute('aria-invalid') === 'true')
      const firstCellMode = cells[1]?.getAttribute('data-row-mode')
      return { idx, height, anyError, firstCellMode }
    })
  })
  // Pass:rows with error have data-row-mode='auto' + larger height,rows without 'fixed'
  const rowsWithError = stats.filter(r => r.anyError)
  const rowsWithoutError = stats.filter(r => !r.anyError)
  const errorRowsAuto = rowsWithError.every(r => r.firstCellMode === 'auto')
  const noErrorRowsFixed = rowsWithoutError.every(r => r.firstCellMode === 'fixed')
  results.push({
    label: 'H1: per-row auto-height when cell has error',
    stats,
    errorRowsAuto,
    noErrorRowsFixed,
    pass: errorRowsAuto && noErrorRowsFixed && rowsWithError.length > 0,
  })
  await page.close()
}

// H2: pinned col 右邊可 resize(hot zone present even when no visual divider)
{
  const URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--column-resize&viewMode=story'
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(800)
  const stats = await page.evaluate(() => {
    // Second table has pinned col + resize
    const tables = document.querySelectorAll('[data-data-table-outer]')
    const t2 = tables[1]
    if (!t2) return { error: 'no t2' }
    const leftHeader = t2.querySelector('[data-datatable-header-panel="left"]')
    if (!leftHeader) return { error: 'no left header panel' }
    // Find all header cells in left panel + their resize handles
    const headers = Array.from(leftHeader.querySelectorAll('[role="columnheader"]'))
    return headers.map(h => {
      const colId = h.getAttribute('data-column-id')
      const handle = h.querySelector('[role="separator"][aria-orientation="vertical"]')
      return { colId, hasResizeHandle: !!handle, ariaLabel: handle?.getAttribute('aria-label') }
    })
  })
  // SKU + name should both have resize handles (panel boundary col 'name' was previously blocked,
  // now H2 fix lets it have hot zone)
  const allResizable = Array.isArray(stats) && stats.length >= 2 && stats.every(h => h.hasResizeHandle)
  results.push({
    label: 'H2: pinned cols all have resize handle (incl panel boundary)',
    stats,
    pass: allResizable,
  })
  await page.close()
}

// H3 + B4: Roadmap demo enableColumnResize works + actions col NOT resizable
{
  const URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--roadmap-all-in-one&viewMode=story'
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(800)
  const stats = await page.evaluate(() => {
    // Find resize handles count in Roadmap
    const handles = document.querySelectorAll('[role="separator"][aria-orientation="vertical"]')
    // Find __actions__ col header (row actions) — should not have resize handle
    const actionsHeader = document.querySelector('[role="columnheader"][data-column-id="__actions__"]')
    const actionsHandle = actionsHeader?.querySelector('[role="separator"][aria-orientation="vertical"]')
    // Find __select__ — should not have resize handle
    const selectHeader = document.querySelector('[role="columnheader"][data-column-id="__select__"]')
    const selectHandle = selectHeader?.querySelector('[role="separator"][aria-orientation="vertical"]')
    return {
      totalResizeHandles: handles.length,
      actionsHasHandle: !!actionsHandle,
      selectHasHandle: !!selectHandle,
      actionsHeaderExists: !!actionsHeader,
      selectHeaderExists: !!selectHeader,
    }
  })
  results.push({
    label: 'H3+B4: Roadmap enableColumnResize + system cols not resizable',
    stats,
    pass: stats.totalResizeHandles >= 5 && !stats.actionsHasHandle && !stats.selectHasHandle,
  })
  await page.close()
}

await browser.close()
console.log('\n=== Round 2 H1/H2/H3+B4 audit ===\n')
let allPass = true
for (const r of results) {
  const mark = r.pass ? '✓' : '✗'
  if (!r.pass) allPass = false
  console.log(`${mark} ${r.label}`)
  console.log(`   ${JSON.stringify(r.stats)}`)
}
console.log(allPass ? '\n✅ ALL PASS' : '\n❌ SOME FAIL')
process.exit(allPass ? 0 : 1)
