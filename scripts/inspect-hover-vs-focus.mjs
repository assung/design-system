// 抓 cell display hover ring vs edit focus border 真實 box position
// User report: hover 比 focus 凸出 1px(右邊),focus 內縮 1px = field+cell 兩層緊貼
import { chromium } from 'playwright'

const url = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit&viewMode=story'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

// 用 string 列(category)— 簡單 cell 不被 picker 結構複雜化
const cellSel = `[role="row"]:nth-child(2) [data-column-id="name"]`

const probe = async (label, action) => {
  if (action) await action()
  await page.waitForTimeout(250)
  return await page.evaluate((sel) => {
    const cell = document.querySelector(sel)
    if (!cell) return { err: 'no cell' }
    const cellRect = cell.getBoundingClientRect()
    const cellStyle = getComputedStyle(cell)
    const editingField = cell.querySelector('[data-field-mode="edit"]')
    const displayField = cell.querySelector('[data-field-mode="display"]')
    const f = editingField || displayField
    const fieldData = f ? {
      mode: f.getAttribute('data-field-mode'),
      rect: { x: f.getBoundingClientRect().x - cellRect.x, y: f.getBoundingClientRect().y - cellRect.y, w: f.getBoundingClientRect().width, h: f.getBoundingClientRect().height },
      borderWidth: getComputedStyle(f).borderRightWidth,
      borderColor: getComputedStyle(f).borderRightColor,
    } : null
    return {
      cellRect: { w: cellRect.width, h: cellRect.height },
      cellBorderRightW: cellStyle.borderRightWidth,
      cellBorderRightColor: cellStyle.borderRightColor,
      cellOutline: cellStyle.outline,
      cellOutlineOffset: cellStyle.outlineOffset,
      cellOutlineColor: cellStyle.outlineColor,
      cellPadding: { l: cellStyle.paddingLeft, r: cellStyle.paddingRight, t: cellStyle.paddingTop, b: cellStyle.paddingBottom },
      field: fieldData,
    }
  }, cellSel)
}

const idle = await probe('display-idle', null)
console.log('=== display-idle ===\n', JSON.stringify(idle, null, 2))

const hover = await probe('display-hover', async () => {
  const cell = await page.$(cellSel)
  await cell.hover()
})
console.log('\n=== display-hover ===\n', JSON.stringify(hover, null, 2))

const edit = await probe('edit-focus', async () => {
  const cell = await page.$(cellSel)
  await cell.click()
})
console.log('\n=== edit-focus ===\n', JSON.stringify(edit, null, 2))

await browser.close()
