/**
 * Issue 6 viewport clip audit(2026-05-10)
 *
 * 驗證 H/V scroll 把 cell 滾出 panel viewport 後,overlay(hover/selected)
 * 不會再 paint 出 panel 邊界 — 即 overlay 視覺被 ClipMask 限制在 panel rect 內。
 *
 * 邏輯:
 *   1. spreadsheetMode story 點 PRD-001:name → selected
 *   2. 量 selected overlay 的 boundingClientRect
 *   3. 量 cell 的 panel(`[data-datatable-panel="center"]`)的 boundingClientRect
 *   4. H scroll 把 selected cell 滾出 panel 左邊外
 *   5. 重量 overlay 的 boundingClientRect:
 *      - 應在 panel.x 內(被 ClipMask 裁切)
 *      - OR overlay rect width = 0 / 不存在
 *
 * Per codex 13-issues verdict L11335-11337 + Issue 6 spec。
 */

import { chromium } from 'playwright'

// Issue 7(2026-05-10):RoadmapAllInOne 不再啟 spreadsheet flags — Issue 6 viewport clip
// 改在 InlineEditWithSpreadsheetOverlay story 驗(就地編輯 + Spreadsheet Overlay)。
const STORY_URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit-with-spreadsheet-overlay&viewMode=story'

const browser = await chromium.launch({ headless: true })

async function ensureRender(page) {
  await page.locator('[data-cell-id]').first().waitFor({ state: 'visible', timeout: 8000 })
  await page.waitForTimeout(300)
}

const results = []

// ── Scenario 1: H scroll out of viewport ─────────────────────────────────────
// Story 內容 ~870px + viewport 400px → H overflow ~470px,scrollLeft 大值才能把 cell 推出 panel
{
  const page = await browser.newPage({ viewport: { width: 400, height: 600 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)

  // Click center-panel cell (title is in center)
  const cell = await page.locator('[data-cell-id="PRD-001:name"]').first()
  const cBox = await cell.boundingBox()
  await page.mouse.click(cBox.x + 20, cBox.y + 10)
  await page.waitForTimeout(300)

  // Verify selected overlay is rendered
  const before = await page.evaluate(() => {
    const sel = document.querySelector('[data-selected-cell-id]')
    if (!sel) return null
    const r = sel.getBoundingClientRect()
    const panel = document.querySelector('[data-datatable-panel="center"]')
    if (!panel) return null
    const p = panel.getBoundingClientRect()
    return {
      sel: { x: r.x, y: r.y, w: r.width, h: r.height },
      panel: { x: p.x, y: p.y, w: p.width, h: p.height },
    }
  })

  results.push({
    label: 'pre-scroll: selected overlay inside panel',
    before,
    pass: before != null && before.sel.x >= before.panel.x - 1 && (before.sel.x + before.sel.w) <= (before.panel.x + before.panel.w + 1),
  })

  // H scroll center body so the cell scrolls out left
  await page.evaluate(() => {
    const center = document.querySelector('[data-datatable-panel="center"]')
    if (center) center.scrollLeft = 800
  })
  await page.waitForTimeout(400)

  // Selected overlay should be clipped to panel viewport (ClipMask overflow:hidden)
  // — or the cell itself may be outside panel rect, in which case overlay is fully clipped.
  const after = await page.evaluate(() => {
    const sel = document.querySelector('[data-selected-cell-id]')
    const panel = document.querySelector('[data-datatable-panel="center"]')
    if (!panel) return null
    const p = panel.getBoundingClientRect()
    if (!sel) return { selPresent: false, panel: { x: p.x, y: p.y, w: p.width, h: p.height } }
    const r = sel.getBoundingClientRect()
    return {
      selPresent: true,
      sel: { x: r.x, y: r.y, w: r.width, h: r.height },
      panel: { x: p.x, y: p.y, w: p.width, h: p.height },
    }
  })

  // Pass criteria(per Issue 6 architecture):
  //   - cell 滾出 panel(getBoundingClientRect 看得到 overlay 在 panel 外)— 證明 scroll 確實生效
  //   - overflow:hidden ClipMask 已就位(scenario 2 verify),所以視覺被 mask cut
  //   bounding rect 不感知 CSS overflow clipping,但只要 ClipMask 正確就保證視覺裁切
  const cellScrolledOut = after && after.selPresent
    ? ((after.sel.x + after.sel.w) < after.panel.x) || (after.sel.x > (after.panel.x + after.panel.w))
    : true // overlay 不存在 = 完全在 viewport 外,也合格
  results.push({
    label: 'post H-scroll: cell scrolled out of panel rect (mask responsibility)',
    after,
    pass: cellScrolledOut,
  })

  // Verify the ClipMask wrapper is positioned at the panel rect with overflow:hidden
  const maskPositioned = await page.evaluate(() => {
    const sel = document.querySelector('[data-selected-cell-id]')
    if (!sel) return null
    const parent = sel.parentElement
    if (!parent) return null
    const cs = window.getComputedStyle(parent)
    const r = parent.getBoundingClientRect()
    const panel = document.querySelector('[data-datatable-panel="center"]')
    if (!panel) return null
    const p = panel.getBoundingClientRect()
    return {
      maskRect: { x: r.x, y: r.y, w: r.width, h: r.height },
      panelRect: { x: p.x, y: p.y, w: p.width, h: p.height },
      overflow: cs.overflow,
      position: cs.position,
    }
  })
  const maskAlignsWithPanel = maskPositioned != null
    && maskPositioned.position === 'absolute'
    && (maskPositioned.overflow === 'hidden' || maskPositioned.overflow.startsWith('hidden'))
    && Math.abs(maskPositioned.maskRect.x - maskPositioned.panelRect.x) <= 1
    && Math.abs(maskPositioned.maskRect.y - maskPositioned.panelRect.y) <= 1
    && Math.abs(maskPositioned.maskRect.w - maskPositioned.panelRect.w) <= 1
    && Math.abs(maskPositioned.maskRect.h - maskPositioned.panelRect.h) <= 1
  results.push({
    label: 'ClipMask aligns with panel rect (visual cut guaranteed)',
    maskPositioned,
    pass: maskAlignsWithPanel,
  })

  await page.close()
}

// ── Scenario 2: ClipMask DOM presence ────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)

  const cell = await page.locator('[data-cell-id="PRD-001:name"]').first()
  const cBox = await cell.boundingBox()
  await page.mouse.click(cBox.x + 20, cBox.y + 10)
  await page.waitForTimeout(300)

  // Verify the layer wraps overlays in a `position: absolute; overflow: hidden` mask
  const mask = await page.evaluate(() => {
    const sel = document.querySelector('[data-selected-cell-id]')
    if (!sel) return null
    const parent = sel.parentElement
    if (!parent) return null
    const cs = window.getComputedStyle(parent)
    return {
      position: cs.position,
      overflow: cs.overflow,
      width: cs.width,
      height: cs.height,
    }
  })
  results.push({
    label: 'ClipMask wrapper exists (position:absolute + overflow:hidden)',
    mask,
    pass: mask != null && mask.position === 'absolute' && (mask.overflow === 'hidden' || mask.overflow.startsWith('hidden')),
  })

  await page.close()
}

await browser.close()

console.log('=== Issue 6 viewport clip audit ===\n')
let allPass = true
for (const r of results) {
  const mark = r.pass ? '✓' : '✗'
  if (!r.pass) allPass = false
  console.log(`${mark} ${r.label}`)
  if (r.before) console.log(`   before: ${JSON.stringify(r.before)}`)
  if (r.after) console.log(`   after:  ${JSON.stringify(r.after)}`)
  if (r.mask) console.log(`   mask:   ${JSON.stringify(r.mask)}`)
  if (r.maskPositioned) console.log(`   maskPositioned: ${JSON.stringify(r.maskPositioned)}`)
}
console.log(allPass ? '\n✅ ALL PASS' : '\n❌ SOME FAIL')
process.exit(allPass ? 0 : 1)
