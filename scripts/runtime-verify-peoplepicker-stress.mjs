#!/usr/bin/env node
/**
 * Interactive stress test:open DataTable Reviewers cell + select 1/2/3/4/5 reviewers
 * Capture screenshot per length state to verify Bug 1 + Bug 3 fix at high count.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const SNAPSHOTS_DIR = 'snapshots/peoplepicker-stress-verify'
if (!fs.existsSync(SNAPSHOTS_DIR)) fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true })
const REPORT_PATH = '.claude/logs/runtime-verify-peoplepicker-stress.json'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

const results = []

async function capture(testId, description) {
  await page.waitForTimeout(500)
  const cellInfo = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[role="row"]')).filter(r => r.querySelector('[role="cell"]'))
    return rows.slice(0, 4).map((row, i) => {
      const cells = row.querySelectorAll('[role="cell"]')
      const reviewerCell = cells[7]
      if (!reviewerCell) return null
      const rect = reviewerCell.getBoundingClientRect()
      const imgs = reviewerCell.querySelectorAll('img[alt]')
      const overflowBtn = reviewerCell.querySelector('[aria-label*="more"], [aria-label*="位"]')
      return {
        rowIdx: i,
        cellWidth: Math.round(rect.width),
        personImgs: imgs.length,
        overflowText: overflowBtn?.textContent || '',
      }
    }).filter(Boolean)
  })
  const screenshotPath = path.join(SNAPSHOTS_DIR, `${testId}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {})
  results.push({ testId, description, cellInfo })
}

await page.goto('http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit&viewMode=story', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
await page.waitForTimeout(1500)

// State 0: default (各 row 已有 1 or 2 reviewers)
await capture('state-0-default', 'Default story state')

// Click row 1 Reviewer cell (which has 1 reviewer: Alice)
// Add another person to make length=2
await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('[role="row"]')).filter(r => r.querySelector('[role="cell"]'))
  const cells = rows[1].querySelectorAll('[role="cell"]')
  const cell = cells[7]
  if (cell) cell.dispatchEvent(new MouseEvent('click', { bubbles: true }))
})
await page.waitForTimeout(800)
await capture('state-1-row1-cell-opened', 'Row 1 reviewer cell opened (popup visible)')

// Pick another person via popup checkbox
// Find first unchecked person row in popup
const clicked = await page.evaluate(() => {
  // Popover content typically has role="listbox" or specific class
  const popoverItems = document.querySelectorAll('[role="option"], [role="menuitem"]')
  for (const item of popoverItems) {
    const checkbox = item.querySelector('[role="checkbox"]') || item.querySelector('input[type="checkbox"]')
    if (checkbox && (checkbox.getAttribute('data-state') === 'unchecked' || !checkbox.checked)) {
      item.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      return { clickedPerson: item.textContent?.trim().slice(0, 30) }
    }
  }
  return { clickedPerson: null }
})
await page.waitForTimeout(600)
await capture('state-2-row1-2-selected', `Row 1 after add: clicked ${clicked.clickedPerson || 'none'}`)

// Add a 3rd
const clicked2 = await page.evaluate(() => {
  const popoverItems = document.querySelectorAll('[role="option"], [role="menuitem"]')
  for (const item of popoverItems) {
    const checkbox = item.querySelector('[role="checkbox"]') || item.querySelector('input[type="checkbox"]')
    if (checkbox && (checkbox.getAttribute('data-state') === 'unchecked' || !checkbox.checked)) {
      item.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      return { clickedPerson: item.textContent?.trim().slice(0, 30) }
    }
  }
  return { clickedPerson: null }
})
await page.waitForTimeout(600)
await capture('state-3-row1-3-selected', `Row 1 after 3rd add: ${clicked2.clickedPerson || 'none'}`)

// Add 4th
const clicked3 = await page.evaluate(() => {
  const popoverItems = document.querySelectorAll('[role="option"], [role="menuitem"]')
  for (const item of popoverItems) {
    const checkbox = item.querySelector('[role="checkbox"]') || item.querySelector('input[type="checkbox"]')
    if (checkbox && (checkbox.getAttribute('data-state') === 'unchecked' || !checkbox.checked)) {
      item.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      return { clickedPerson: item.textContent?.trim().slice(0, 30) }
    }
  }
  return { clickedPerson: null }
})
await page.waitForTimeout(600)
await capture('state-4-row1-4-selected', `Row 1 after 4th add: ${clicked3.clickedPerson || 'none'}`)

// Add 5th
const clicked4 = await page.evaluate(() => {
  const popoverItems = document.querySelectorAll('[role="option"], [role="menuitem"]')
  for (const item of popoverItems) {
    const checkbox = item.querySelector('[role="checkbox"]') || item.querySelector('input[type="checkbox"]')
    if (checkbox && (checkbox.getAttribute('data-state') === 'unchecked' || !checkbox.checked)) {
      item.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      return { clickedPerson: item.textContent?.trim().slice(0, 30) }
    }
  }
  return { clickedPerson: null }
})
await page.waitForTimeout(600)
await capture('state-5-row1-5-selected', `Row 1 after 5th add: ${clicked4.clickedPerson || 'none'}`)

// Click outside to close
await page.mouse.click(900, 900)
await page.waitForTimeout(500)
await capture('state-6-row1-closed-5-selected', 'Row 1 closed state after 5 selected')

await browser.close()

fs.writeFileSync(REPORT_PATH, JSON.stringify({ ts: new Date().toISOString(), results }, null, 2))

console.log('=== Stress test results ===')
for (const r of results) {
  console.log(`\n${r.testId}: ${r.description}`)
  for (const c of r.cellInfo) {
    console.log(`  row ${c.rowIdx}: cellWidth=${c.cellWidth}px,personImgs=${c.personImgs},overflow="${c.overflowText}"`)
  }
}
console.log(`\nSnapshots: ${SNAPSHOTS_DIR}/`)
