// USER #43 pinned column resize sanity — structural verify(active drag 待 user 真機驗)
// M31 Step 3 視覺稽核 part of post-Issue-batch audit。
import { chromium } from 'playwright'

const STORY_URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--column-resize&viewMode=story'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(800)

const results = await page.evaluate(() => {
  // 找第二個 DataTable(pinned + resize 那個)
  const tables = document.querySelectorAll('[data-data-table-outer]')
  if (tables.length < 2) return { error: `expected 2 tables, got ${tables.length}` }
  const pinnedTable = tables[1]
  // Header panels:`data-datatable-header-panel`(2026-05-10 added for SSOT consistency)
  const leftHeaderPanel = pinnedTable.querySelector('[data-datatable-header-panel="left"]')
  if (!leftHeaderPanel) return { error: 'no left header panel — pinned not wired' }
  const centerHeaderPanel = pinnedTable.querySelector('[data-datatable-header-panel="center"]')
  // Body panels for cell verification
  const leftBodyPanel = pinnedTable.querySelector('[data-datatable-panel="left"]')
  // SKU header 應在 left header panel
  const skuHeader = leftHeaderPanel.querySelector('[role="columnheader"][data-column-id="sku"]')
  const skuHeaderText = skuHeader?.textContent?.trim()
  // resize handle on SKU header(non-system col 在 pinned 仍可 resize)
  const skuResizeHandle = skuHeader?.querySelector('[role="separator"][aria-orientation="vertical"]')
  // center panel data cols should also have resize handles
  const centerHeaderResizeHandles = centerHeaderPanel?.querySelectorAll('[role="separator"][aria-orientation="vertical"]').length
  return {
    leftHeaderPanelExists: !!leftHeaderPanel,
    leftBodyPanelExists: !!leftBodyPanel,
    skuInLeftPanel: skuHeaderText,
    skuResizeHandleExists: !!skuResizeHandle,
    skuResizeHandleAriaLabel: skuResizeHandle?.getAttribute('aria-label'),
    centerHandleCount: centerHeaderResizeHandles ?? 0,
  }
})

await browser.close()
console.log('\n=== USER #43 pinned + resize sanity ===\n')
console.log(JSON.stringify(results, null, 2))

const allPass =
  !results.error &&
  results.leftHeaderPanelExists &&
  results.leftBodyPanelExists &&
  results.skuInLeftPanel?.toLowerCase().includes('sku') &&
  results.skuResizeHandleExists &&
  results.skuResizeHandleAriaLabel?.includes('拖') &&
  results.centerHandleCount > 0
console.log(allPass ? '\n✅ ALL PASS(structure)— active drag 仍待 user 真機驗' : '\n❌ SOME FAIL')
process.exit(allPass ? 0 : 1)
