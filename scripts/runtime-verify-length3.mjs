#!/usr/bin/env node
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const SNAPSHOTS_DIR = 'snapshots/peoplepicker-real-verify'
if (!fs.existsSync(SNAPSHOTS_DIR)) fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 800, height: 600 } })

const results = []

async function reduceTo(targetLength, narrowPx) {
  await page.goto('http://localhost:6006/iframe.html?id=design-system-components-peoplepicker-展示--multi&viewMode=story', { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(1200)
  // Default is 4 selected. Click trigger to open, uncheck (4 - targetLength) items.
  await page.locator('[role="combobox"]').first().click()
  await page.waitForTimeout(500)
  const toRemove = 4 - targetLength
  for (let i = 0; i < toRemove; i++) {
    await page.evaluate(() => {
      const items = document.querySelectorAll('[role="option"]')
      for (const item of items) {
        const cb = item.querySelector('[role="checkbox"]')
        if (cb && cb.getAttribute('data-state') === 'checked') {
          item.dispatchEvent(new MouseEvent('click', { bubbles: true }))
          return true
        }
      }
      return false
    })
    await page.waitForTimeout(300)
  }
  // Close popover
  await page.mouse.click(500, 500)
  await page.waitForTimeout(500)
  if (narrowPx) {
    await page.addStyleTag({ content: `.max-w-xs { max-width: ${narrowPx}px !important; }` })
    await page.waitForTimeout(500)
  }
  const info = await page.evaluate(() => {
    const trigger = document.querySelector('[role="combobox"]')
    if (!trigger) return { error: 'no trigger' }
    const rect = trigger.getBoundingClientRect()
    // Count avatars + +N specifically in trigger (not readonly section)
    const triggerImgs = trigger.querySelectorAll('img[alt]')
    const overflowBtn = trigger.querySelector('[aria-label*="more"], button[aria-label*="位"], button[aria-label*="overflow"]')
    return {
      triggerWidth: Math.round(rect.width),
      triggerAvatars: triggerImgs.length,
      overflowText: overflowBtn?.textContent || '',
    }
  })
  return info
}

async function runCase(testId, length, narrowPx) {
  const info = await reduceTo(length, narrowPx)
  const screenshotPath = path.join(SNAPSHOTS_DIR, `${testId}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: false, clip: { x: 0, y: 0, width: 800, height: 200 } }).catch(() => {})
  results.push({ testId, length, narrowPx, ...info })
}

// Same 180px cell + length=1, 2, 3, 4
await runCase('Bug3-180-len1', 1, 180)
await runCase('Bug3-180-len2', 2, 180)
await runCase('Bug3-180-len3', 3, 180)
await runCase('Bug3-180-len4', 4, 180)

await browser.close()

console.log('=== Length determinism at 180px ===')
for (const r of results) {
  console.log(`  length=${r.length}: triggerW=${r.triggerWidth}px,avatars=${r.triggerAvatars},+N="${r.overflowText}"`)
}
fs.writeFileSync('.claude/logs/runtime-verify-length3.json', JSON.stringify(results, null, 2))
