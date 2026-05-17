#!/usr/bin/env node
/**
 * Slice D Step 1C sanity:hover editable cell → overlay layer 出現 1px border。
 * 跑法:storybook running → `node scripts/sanity-spreadsheet-overlay.mjs`
 */

import { chromium } from 'playwright'

const URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit-with-spreadsheet-overlay&viewMode=story'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-data-table-outer]', { timeout: 15000 })
await page.waitForTimeout(500)

// Verify layer rendered
const layerExists = await page.evaluate(() => {
  return Boolean(document.querySelector('[data-data-table-outer] > div[aria-hidden]'))
})
console.log(`Interaction layer rendered: ${layerExists}`)

// Get first editable cell (`name` column row 0)
const firstNameCell = await page.locator('[data-cell-id$=":name"]').first()
const cellBox = await firstNameCell.boundingBox()
console.log('first name cell rect:', cellBox)

if (cellBox) {
  // Hover → check overlay div appears at same position
  await page.mouse.move(cellBox.x + cellBox.width / 2, cellBox.y + cellBox.height / 2)
  await page.waitForTimeout(200)

  const overlayInfo = await page.evaluate(() => {
    const layer = document.querySelector('[data-data-table-outer] > div[aria-hidden]')
    const ringDivs = layer?.querySelectorAll('div[style*="border"]')
    if (!ringDivs || ringDivs.length === 0) return { rings: 0 }
    const r = ringDivs[0]
    const rect = r.getBoundingClientRect()
    return {
      rings: ringDivs.length,
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      cssBorder: r.style.border,
      zIndex: r.style.zIndex,
    }
  })
  console.log('overlay ring info:', overlayInfo)

  if (overlayInfo.rings > 0) {
    const dx = Math.abs(overlayInfo.x - cellBox.x)
    const dy = Math.abs(overlayInfo.y - cellBox.y)
    const dw = Math.abs(overlayInfo.width - cellBox.width)
    const dh = Math.abs(overlayInfo.height - cellBox.height)
    console.log(`pixel diff: dx=${dx} dy=${dy} dw=${dw} dh=${dh}`)
    const within = dx <= 1 && dy <= 1 && dw <= 1 && dh <= 1
    console.log(`Contract 8 0.5px invariant: ${within ? 'PASS' : 'NEAR-MISS / FAIL'}`)
  }
}

await browser.close()
