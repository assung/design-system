#!/usr/bin/env node
/**
 * RoadmapAllInOne demo visual audit:render check + 13 column 全 cell type 顯示驗 + screenshot。
 * 2026-05-10:RoadmapInteractive + 5 stress 合併成單一 RoadmapAllInOne(per user 整合 ask + codex Q4.1 confirm)。
 */

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('tmp/roadmap-demo-audit', { recursive: true })

const URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--roadmap-all-in-one&viewMode=story'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await page.goto(URL, { waitUntil: 'networkidle' })
const tableExists = await page.waitForSelector('[data-data-table-outer]', { timeout: 30000 })
  .then(() => true).catch(() => false)

if (!tableExists) {
  console.log('ERROR: Roadmap demo not rendered (storybook 可能還在 indexing)')
  await browser.close()
  process.exit(1)
}
await page.waitForTimeout(800)

// 量 column 數 + row 數
const audit = await page.evaluate(() => {
  const headers = [...document.querySelectorAll('[role="columnheader"]')]
  const rows = [...document.querySelectorAll('[role="row"]')]
  const dataRows = rows.filter(r => r.querySelector('[role="cell"]'))
  return {
    columnCount: headers.length,
    headers: headers.map(h => h.textContent?.trim() || '').slice(0, 20),
    rowCount: dataRows.length,
    firstRowCellCount: dataRows[0]?.querySelectorAll('[role="cell"]').length ?? 0,
  }
})

console.log('--- RoadmapAllInOne Demo Audit ---')
console.log(`Columns: ${audit.columnCount}`)
console.log(`Headers: ${audit.headers.join(' | ')}`)
console.log(`Rows: ${audit.rowCount}, first row cells: ${audit.firstRowCellCount}`)

// Full-table screenshot
const tableEl = await page.locator('[data-data-table-outer]')
const tableBox = await tableEl.boundingBox()
if (tableBox) {
  await page.screenshot({
    path: 'tmp/roadmap-demo-audit/full-table.png',
    clip: tableBox,
  })
  console.log(`Full-table screenshot: ${tableBox.width}×${tableBox.height} px`)
}

// Hover sample editable cell
const titleCell = await page.locator('[data-cell-id$=":title"]').first()
const tBox = await titleCell.boundingBox().catch(() => null)
if (tBox) {
  await page.mouse.move(tBox.x + tBox.width / 2, tBox.y + tBox.height / 2)
  await page.waitForTimeout(200)
  await page.screenshot({
    path: 'tmp/roadmap-demo-audit/title-cell-hover.png',
    clip: { x: Math.max(0, tBox.x - 4), y: Math.max(0, tBox.y - 4), width: tBox.width + 8, height: tBox.height + 8 },
  })
  console.log('Title cell hover screenshot saved')
}

// Try click editable cell to test inline edit
const titleCellBtn = await page.locator('[data-cell-id$=":title"]').first()
await titleCellBtn.click()
await page.waitForTimeout(300)
const editingDetected = await page.evaluate(() => {
  return Boolean(document.querySelector('[data-field-mode="edit"]'))
})
console.log(`Inline edit triggered: ${editingDetected}`)
await page.keyboard.press('Escape')
await page.waitForTimeout(200)

writeFileSync('tmp/roadmap-demo-audit/audit.json', JSON.stringify({
  ...audit,
  editingDetected,
  timestamp: new Date().toISOString(),
}, null, 2))

await browser.close()

// Acceptance:
// - 13 column(per demo design)
// - 8 row(per ROADMAP_DATA)
// - inline edit triggered ✓
const ok = audit.columnCount >= 13 && audit.rowCount >= 8 && editingDetected
console.log(ok ? '\n✅ Demo render PASS' : '\n❌ Demo render FAIL')
process.exitCode = ok ? 0 : 1
