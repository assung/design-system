#!/usr/bin/env node
/**
 * Slice D Step 3 wire sanity:click editable cell → layer 顯示 ActiveEditorHost dashed rect。
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('tmp/step-3-wire', { recursive: true })

const URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit-with-spreadsheet-overlay&viewMode=story'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-data-table-outer]', { timeout: 15000 })
await page.waitForTimeout(500)

// Click editable text cell (name col)
const cell = await page.locator('[data-cell-id$=":name"]').first()
const box = await cell.boundingBox()
console.log('cell rect:', box)

await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
await page.waitForTimeout(300)

const editing = await page.evaluate(() => {
  const editor = document.querySelector('[data-field-mode="edit"]')
  const layerHost = document.querySelector('[data-active-editor-host-scaffold]')
  return {
    inlineEditActive: !!editor,
    layerHostActive: !!layerHost,
    layerHostRect: layerHost ? layerHost.getBoundingClientRect().toJSON() : null,
  }
})
console.log('After click:', editing)
await page.screenshot({ path: 'tmp/step-3-wire/editing.png', clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.width + 16, height: box.height + 16 } })

await browser.close()

const wireOK = editing.inlineEditActive && editing.layerHostActive
console.log(wireOK ? '\n✅ Step 3 wire PASS:click → inline edit + layer ActiveEditorHost rendered' : '\n❌ Step 3 wire FAIL')
process.exitCode = wireOK ? 0 : 1
