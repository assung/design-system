#!/usr/bin/env node
/**
 * Slice D Step 1C 完整 visual audit:6 cell type × hover state 截圖 + Contract 8/9 invariant verify。
 */

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('tmp/step-1c-audit', { recursive: true })

const URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit-with-spreadsheet-overlay&viewMode=story'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-data-table-outer]', { timeout: 15000 })
await page.waitForTimeout(500)

// 6 cell types tested(per RFC Contract 15 expectOverlay matrix,2026-05-10 codex red light fix)
const cells = [
  { col: 'name', editable: true, expectOverlay: true, label: '可編輯-text' },
  { col: 'category', editable: true, expectOverlay: true, label: '可編輯-select' },
  { col: 'sku', editable: false, expectOverlay: false, label: '唯讀(no editable flag)' },
  { col: 'inStock', editable: true, expectOverlay: false, label: 'boolean → directAction,no overlay(Contract 15)' },
  { col: 'qty', editable: true, expectOverlay: true, label: '可編輯-number' },
  { col: 'url', editable: true, expectOverlay: false, label: 'url → openAction,no overlay(Contract 15)' },
]

const results = []
for (const cellInfo of cells) {
  const handle = await page.locator(`[data-cell-id$=":${cellInfo.col}"]`).first()
  const box = await handle.boundingBox().catch(() => null)
  if (!box) {
    results.push({ ...cellInfo, error: 'cell not found' })
    continue
  }
  // Move mouse 走遠後再 hover,確認 overlay 起 transition
  await page.mouse.move(0, 0)
  await page.waitForTimeout(150)
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.waitForTimeout(200)

  const overlayInfo = await page.evaluate(() => {
    const layer = document.querySelector('[aria-hidden][style*="position: fixed"]')
    if (!layer) return { rings: 0 }
    const ringDivs = [...layer.querySelectorAll('div[style*="border"]')]
    const ring = ringDivs[0]
    if (!ring) return { rings: 0 }
    const rect = ring.getBoundingClientRect()
    return {
      rings: ringDivs.length,
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
    }
  })

  const dx = overlayInfo.rings > 0 ? Math.abs(overlayInfo.x - box.x) : null
  const dy = overlayInfo.rings > 0 ? Math.abs(overlayInfo.y - box.y) : null
  // Contract 8 visual alignment acceptance: ≤ 1px(per codex review wording fix)
  const visualAlignPass = dx != null && dy != null && dx <= 1 && dy <= 1
  // Contract 15 predicate match expectation
  const overlayMatchExpect = cellInfo.expectOverlay
    ? overlayInfo.rings > 0
    : overlayInfo.rings === 0
  const overall = cellInfo.expectOverlay ? (overlayMatchExpect && visualAlignPass) : overlayMatchExpect
  const result = {
    ...cellInfo,
    cellRect: { x: box.x, y: box.y, w: box.width, h: box.height },
    overlay: overlayInfo,
    diff: { dx, dy },
    contract8VisualAlign: cellInfo.expectOverlay ? visualAlignPass : 'N/A',
    contract15PredicateMatch: overlayMatchExpect,
    overallPass: overall,
  }
  results.push(result)

  await page.screenshot({
    path: `tmp/step-1c-audit/${cellInfo.col}-hover.png`,
    clip: { x: Math.max(0, box.x - 4), y: Math.max(0, box.y - 4), width: box.width + 8, height: box.height + 8 },
  })
}

writeFileSync('tmp/step-1c-audit/results.json', JSON.stringify(results, null, 2))

console.log('--- Step 1C Visual Audit ---')
let allPass = true
for (const r of results) {
  if (r.error) {
    console.log(`${r.col}: ERROR ${r.error}`)
    allPass = false
    continue
  }
  const c8 = r.contract8VisualAlign === 'N/A' ? 'N/A' : (r.contract8VisualAlign ? 'PASS' : 'FAIL')
  const c15 = r.contract15PredicateMatch ? 'PASS' : 'FAIL'
  const overall = r.overallPass ? 'PASS' : 'FAIL'
  console.log(`${r.col} (${r.label}): rings=${r.overlay.rings}, dx=${r.diff.dx} dy=${r.diff.dy}, C8=${c8} C15=${c15} → ${overall}`)
  if (!r.overallPass) allPass = false
}
console.log(allPass ? '\n✅ Step 1C OVERALL PASS' : '\n❌ Step 1C OVERALL FAIL')
process.exitCode = allPass ? 0 : 1

await browser.close()
