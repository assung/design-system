#!/usr/bin/env node
/**
 * Comprehensive DataTable visual audit — 全功能 cross-scenario(2026-05-10)。
 *
 * Per codex Q-C1 verdict:既有 visual-audit-step-1c.mjs 只測 1280x800 hover predicate /
 * alignment。需要補 RWD × scroll × pinned × editor × range 矩陣。
 *
 * Scenarios(15):
 *   1. viewport 375  + click cell → overlay align
 *   2. viewport 768  + click cell → overlay align
 *   3. viewport 1280 + click cell → overlay align(baseline)
 *   4. viewport 1920 + click cell → overlay align
 *   5. viewport 1280 + scroll vertical 100px → overlay align after scroll
 *   6. viewport 1280 + scroll horizontal 200px → overlay align after scroll
 *   7. viewport 1280 + viewport resize during selection → overlay align
 *   8. viewport 1280 + pinned left cell click → overlay align
 *   9. viewport 1280 + pinned right cell click → overlay align
 *  10. viewport 1280 + range Shift+click → outer ring + fill render
 *  11. viewport 1280 + Enter → edit mode → portal align
 *  12. viewport 1280 + Esc exit edit → no portal
 *  13. viewport 1280 + ArrowDown nav → selection follow
 *  14. viewport 1280 + ArrowRight nav → selection follow
 *  15. viewport 768  + range cross pinned column → range outer ring continuity
 *
 * Pass criteria:每 scenario overlay rect dx <= 0.5 dy <= 0.5(sub-pixel rendering tolerance)。
 * 對應 codex Q-C verdict「scroll/resize 後 overlay rect 與 target cell rect 仍一致」。
 */

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('tmp/comprehensive-audit', { recursive: true })

// Issue 7(2026-05-10):RoadmapAllInOne 不再啟 spreadsheet flags。Comprehensive audit 改用
// InlineEditWithSpreadsheetOverlay story 驗 spreadsheet semantics(click select / range / portal
// edit / arrow nav)。Pinned column tests 改測該 story 內 readonly sku 是否仍 render(雖無 pin)。
const STORY_URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit-with-spreadsheet-overlay&viewMode=story'
const TOLERANCE = 0.5

const browser = await chromium.launch({ headless: true })
const results = []

async function ensureRender(page) {
  await page.waitForSelector('[data-data-table-outer]', { timeout: 30000 })
  await page.waitForTimeout(800)
}

async function clickCellAndMeasure(page, cellId, label) {
  const cell = await page.locator(`[data-cell-id="${cellId}"]`).first()
  const cBox = await cell.boundingBox()
  if (!cBox) return { label, error: `cell ${cellId} not found` }
  await page.mouse.click(cBox.x + 20, cBox.y + 10)
  await page.waitForTimeout(300)
  const sel = await page.evaluate(() => {
    const el = document.querySelector('[data-selected-cell-id]')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  })
  const cellRect = await cell.boundingBox()
  if (!sel || !cellRect) return { label, error: 'sel or cell rect missing' }
  return {
    label,
    cell: cellRect,
    sel,
    dx: Math.abs(sel.x - cellRect.x),
    dy: Math.abs(sel.y - cellRect.y),
    pass: Math.abs(sel.x - cellRect.x) <= TOLERANCE && Math.abs(sel.y - cellRect.y) <= TOLERANCE,
  }
}

// ── Scenarios 1-4: RWD viewport sizes ─────────────────────────────────────────
for (const w of [375, 768, 1280, 1920]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)
  const r = await clickCellAndMeasure(page, 'PRD-001:name', `viewport ${w}px click`)
  results.push(r)
  await page.close()
}

// ── Scenario 5: vertical scroll ───────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)
  await clickCellAndMeasure(page, 'PRD-001:name', 'pre-scroll')
  await page.evaluate(() => {
    const scroller = document.querySelector('[data-data-table-outer] [class*="overflow-y-auto"], [data-data-table-outer] [class*="overflow-x-auto"]')
    if (scroller) scroller.scrollTop = 100
  })
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => {
    const sel = document.querySelector('[data-selected-cell-id]')
    const cell = document.querySelector('[data-cell-id="PRD-001:name"]')
    return {
      sel: sel ? { x: sel.getBoundingClientRect().x, y: sel.getBoundingClientRect().y, w: sel.getBoundingClientRect().width, h: sel.getBoundingClientRect().height } : null,
      cell: cell ? { x: cell.getBoundingClientRect().x, y: cell.getBoundingClientRect().y, w: cell.getBoundingClientRect().width, h: cell.getBoundingClientRect().height } : null,
    }
  })
  const dx = after.sel && after.cell ? Math.abs(after.sel.x - after.cell.x) : null
  const dy = after.sel && after.cell ? Math.abs(after.sel.y - after.cell.y) : null
  results.push({
    label: 'vertical scroll 100px',
    cell: after.cell,
    sel: after.sel,
    dx, dy,
    pass: dx != null && dy != null && dx <= TOLERANCE && dy <= TOLERANCE,
  })
  await page.close()
}

// ── Scenario 6: horizontal scroll ─────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)
  await clickCellAndMeasure(page, 'PRD-001:name', 'pre-h-scroll')
  await page.evaluate(() => {
    const scrollers = document.querySelectorAll('[data-data-table-outer] [class*="overflow-x-auto"]')
    scrollers.forEach(s => { s.scrollLeft = 200 })
  })
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => {
    const sel = document.querySelector('[data-selected-cell-id]')
    const cell = document.querySelector('[data-cell-id="PRD-001:name"]')
    return {
      sel: sel ? { x: sel.getBoundingClientRect().x, y: sel.getBoundingClientRect().y } : null,
      cell: cell ? { x: cell.getBoundingClientRect().x, y: cell.getBoundingClientRect().y } : null,
    }
  })
  const dx = after.sel && after.cell ? Math.abs(after.sel.x - after.cell.x) : null
  const dy = after.sel && after.cell ? Math.abs(after.sel.y - after.cell.y) : null
  results.push({
    label: 'horizontal scroll 200px',
    cell: after.cell, sel: after.sel,
    dx, dy,
    pass: dx != null && dy != null && dx <= TOLERANCE && dy <= TOLERANCE,
  })
  await page.close()
}

// ── Scenario 7: viewport resize during selection ─────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)
  await clickCellAndMeasure(page, 'PRD-001:name', 'pre-resize')
  await page.setViewportSize({ width: 1024, height: 768 })
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => {
    const sel = document.querySelector('[data-selected-cell-id]')
    const cell = document.querySelector('[data-cell-id="PRD-001:name"]')
    return {
      sel: sel ? { x: sel.getBoundingClientRect().x, y: sel.getBoundingClientRect().y } : null,
      cell: cell ? { x: cell.getBoundingClientRect().x, y: cell.getBoundingClientRect().y } : null,
    }
  })
  const dx = after.sel && after.cell ? Math.abs(after.sel.x - after.cell.x) : null
  const dy = after.sel && after.cell ? Math.abs(after.sel.y - after.cell.y) : null
  results.push({
    label: 'viewport resize during selection',
    cell: after.cell, sel: after.sel,
    dx, dy,
    pass: dx != null && dy != null && dx <= TOLERANCE && dy <= TOLERANCE,
  })
  await page.close()
}

// ── Scenarios 8-9: readonly + boolean 渲染存在(Issue 7 後 InlineEditWithSpreadsheetOverlay
//     story 無 pinned cols;改驗 readonly sku + boolean inStock 渲染。原 RDM-100:id /
//     RDM-100:shipped 替換為 PRD-001:sku / PRD-001:inStock,語意對應)。──
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)
  // Verify pinned left cell rendered + has expected cellId
  const leftPinned = await page.evaluate(() => {
    const el = document.querySelector('[data-cell-id="PRD-001:sku"]')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height, text: el.textContent?.slice(0, 10) }
  })
  results.push({
    label: 'readonly sku cell rendered',
    cell: leftPinned,
    pass: leftPinned != null && leftPinned.w > 0 && leftPinned.h > 0,
  })
  // Verify pinned right cell rendered
  const rightPinned = await page.evaluate(() => {
    const el = document.querySelector('[data-cell-id="PRD-001:inStock"]')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  })
  results.push({
    label: 'boolean inStock cell rendered',
    cell: rightPinned,
    pass: rightPinned != null && rightPinned.w > 0 && rightPinned.h > 0,
  })
  await page.close()
}

// ── Scenario 10: range Shift+click ───────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)
  const anchor = await page.locator('[data-cell-id="PRD-001:name"]').first()
  const aBox = await anchor.boundingBox()
  await page.mouse.click(aBox.x + 20, aBox.y + 10)
  await page.waitForTimeout(300)
  const focus = await page.locator('[data-cell-id="PRD-002:qty"]').first()
  const fBox = await focus.boundingBox()
  await page.keyboard.down('Shift')
  await page.mouse.click(fBox.x + 20, fBox.y + 10)
  await page.keyboard.up('Shift')
  await page.waitForTimeout(500)
  const counts = await page.evaluate(() => {
    // Phase 9 Issue 1(2026-05-10):range fill 從 layer overlay 改 cell wrapper bg attribute
    // `data-range-cell`(via dtCellGrid + CSS `[data-range-cell] { background: --primary-subtle }`),
    // 不再從 layer 渲 RangeFill div(舊 `data-range-cell-id`)。
    const fills = document.querySelectorAll('[data-range-cell]').length
    const selDataCount = document.querySelectorAll('[data-selected-cell-id]').length
    return { fills, selDataCount }
  })
  results.push({
    label: 'range Shift+click 2x2',
    counts,
    pass: counts.fills === 4 && counts.selDataCount === 1,
  })
  await page.close()
}

// ── Scenario 11: Enter to edit ───────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)
  const cell = await page.locator('[data-cell-id="PRD-001:name"]').first()
  const cBox = await cell.boundingBox()
  await page.mouse.click(cBox.x + 20, cBox.y + 10)
  await page.waitForTimeout(300)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(500)
  const portal = await page.evaluate(() => {
    const el = document.querySelector('[data-active-editor-host]')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  })
  const cellRect = await cell.boundingBox()
  const dx = portal && cellRect ? Math.abs(portal.x - cellRect.x) : null
  const dy = portal && cellRect ? Math.abs(portal.y - cellRect.y) : null
  results.push({
    label: 'Enter → edit portal align',
    cell: cellRect, portal,
    dx, dy,
    pass: dx != null && dy != null && dx <= TOLERANCE && dy <= TOLERANCE,
  })
  await page.close()
}

// ── Scenario 12: Esc exit edit ──────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)
  const cell = await page.locator('[data-cell-id="PRD-001:name"]').first()
  const cBox = await cell.boundingBox()
  await page.mouse.click(cBox.x + 20, cBox.y + 10)
  await page.waitForTimeout(300)
  await page.mouse.click(cBox.x + 20, cBox.y + 10)
  await page.waitForTimeout(500)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  const portal = await page.evaluate(() => !!document.querySelector('[data-active-editor-host]'))
  results.push({
    label: 'Esc exit edit → no portal',
    portalPresent: portal,
    pass: portal === false,
  })
  await page.close()
}

// ── Scenarios 13-14: keyboard nav ────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)
  const cell = await page.locator('[data-cell-id="PRD-001:name"]').first()
  const cBox = await cell.boundingBox()
  await page.mouse.click(cBox.x + 20, cBox.y + 10)
  await page.waitForTimeout(300)
  // ArrowDown
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(200)
  let sel = await page.evaluate(() => document.querySelector('[data-selected-cell-id]')?.getAttribute('data-selected-cell-id'))
  results.push({ label: 'ArrowDown nav', selected: sel, pass: sel === 'PRD-002:name' })
  // ArrowRight
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(200)
  sel = await page.evaluate(() => document.querySelector('[data-selected-cell-id]')?.getAttribute('data-selected-cell-id'))
  results.push({ label: 'ArrowRight nav', selected: sel, pass: sel === 'PRD-002:qty' })
  await page.close()
}

// ── Scenarios 15-17: 7 invariants(per codex Q-B5)playwright portion ────────
//   I1 Single active editor at any time(no duplicate portal host)
//   I2 Tab in edit → commit + next editable + auto-edit (portal moves to next cell)
//   I3 Display cell remains mounted under editor host (cell wrapper still in DOM)
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await ensureRender(page)
  const cell = await page.locator('[data-cell-id="PRD-001:name"]').first()
  const cBox = await cell.boundingBox()
  await page.mouse.click(cBox.x + 20, cBox.y + 10)
  await page.waitForTimeout(300)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(500)

  // I1: single editor
  const editorCount = await page.evaluate(() => document.querySelectorAll('[data-active-editor-host]').length)
  results.push({ label: 'I1 single active editor', count: editorCount, pass: editorCount === 1 })

  // I3: display cell still mounted under editor host
  const displayCellMounted = await page.evaluate(() => !!document.querySelector('[data-cell-id="PRD-001:name"]'))
  results.push({ label: 'I3 display cell mounted under portal', mounted: displayCellMounted, pass: displayCellMounted })

  // I2: Tab → next editable
  await page.keyboard.press('Tab')
  await page.waitForTimeout(500)
  const nextPortal = await page.evaluate(() => {
    const portal = document.querySelector('[data-active-editor-host]')
    if (!portal) return null
    const r = portal.getBoundingClientRect()
    return { x: r.x, y: r.y }
  })
  // Tab from PRD-001:name → next editable cell PRD-001:qty(sku readonly skipped)
  const qtyCell = await page.locator('[data-cell-id="PRD-001:qty"]').first().boundingBox()
  const i2Pass = nextPortal && qtyCell && Math.abs(nextPortal.x - qtyCell.x) <= TOLERANCE
  results.push({ label: 'I2 Tab → next editable + auto-edit', portal: nextPortal, qtyCell, pass: i2Pass })

  await page.close()
}

writeFileSync('tmp/comprehensive-audit/results.json', JSON.stringify(results, null, 2))

console.log('\n=== Comprehensive DataTable Visual Audit ===\n')
let allPass = true
for (const r of results) {
  const status = r.pass ? '✓' : '✗'
  if (!r.pass) allPass = false
  const dxdy = r.dx != null ? `dx=${r.dx.toFixed(2)} dy=${r.dy.toFixed(2)}` : ''
  const extra = r.counts ? ` ${JSON.stringify(r.counts)}` : (r.selected ? ` selected=${r.selected}` : (r.portalPresent != null ? ` portalPresent=${r.portalPresent}` : ''))
  console.log(`${status} ${r.label} ${dxdy}${extra}${r.error ? ' ERROR: ' + r.error : ''}`)
}
console.log(`\n${allPass ? '✅ ALL PASS' : '❌ SOME FAIL'}\n`)

await browser.close()
process.exit(allPass ? 0 : 1)
