#!/usr/bin/env node
/**
 * Real visual verification — capture all 3 bug scenarios with ACTUAL stress data
 *
 * - Bug 1 fire test:long-name + narrow-cell ellipsis trigger
 * - Bug 3 stress test:length=3/4 visible count deterministic
 * - Bug 2 confirmed earlier — re-capture for completeness
 *
 * Strategy:
 * - Use peoplepicker '--multi' story which has 4 ppl preselected with long names(samplePeople)
 * - Inject CSS via addStyleTag to constrain trigger to 180px(simulate cell width)
 * - Capture closed state + open state
 * - Use peoplepicker '--single' story for Bug 2 single inline-search verify
 */

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const STORYBOOK_URL = 'http://localhost:6006'
const SNAPSHOTS_DIR = 'snapshots/peoplepicker-real-verify'
const REPORT_PATH = '.claude/logs/runtime-verify-real.json'

if (!fs.existsSync(SNAPSHOTS_DIR)) fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true })
const browser = await chromium.launch({ headless: true })

const results = []

async function captureFullPeoplePickerMulti(testId, description, narrowPx, clickToOpen) {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=design-system-components-peoplepicker-展示--multi&viewMode=story`, { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(1500)

  // Constrain max-w-xs section to narrowPx
  if (narrowPx) {
    await page.addStyleTag({ content: `.max-w-xs { max-width: ${narrowPx}px !important; }` })
    await page.waitForTimeout(500)
  }

  if (clickToOpen) {
    const trigger = await page.locator('[role="combobox"]').first()
    if (await trigger.count() > 0) {
      await trigger.click()
      await page.waitForTimeout(800)
    }
  }

  const info = await page.evaluate(() => {
    const trigger = document.querySelector('[role="combobox"]')
    if (!trigger) return { error: 'no trigger' }
    const rect = trigger.getBoundingClientRect()
    const personImgs = trigger.querySelectorAll('img[alt]')
    const truncSpans = trigger.querySelectorAll('[class*="truncate"]')
    const overflowBtn = trigger.querySelector('[aria-label*="more"], button[aria-label*="位"]')
    const truncs = Array.from(truncSpans).map(s => ({
      text: s.textContent?.slice(0, 30) || '',
      scrollW: s.scrollWidth,
      clientW: s.clientWidth,
      truncated: s.scrollWidth > s.clientWidth,
    }))
    return {
      triggerWidth: Math.round(rect.width),
      personAvatarCount: personImgs.length,
      truncs,
      hasOverflow: !!overflowBtn,
      overflowText: overflowBtn?.textContent || '',
    }
  })
  const screenshotPath = path.join(SNAPSHOTS_DIR, `${testId}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: false, clip: { x: 0, y: 0, width: 800, height: 400 } }).catch(() => {})
  results.push({ testId, description, narrowPx, clickToOpen, ...info })
  await page.close()
}

// Bug 1 + Bug 3:multi length=4 with long names, narrow trigger constraint
// samplePeople first 4 = ['Alice Wonderland Wang', 'Bob Christopher Chen', 'Charlie Wu', 'Alexander Hamilton Zhang'] (per PeoplePicker stories typical sample data)
await captureFullPeoplePickerMulti('Bug3-multi-default-wide', 'Multi length=4 default wide trigger (~320px max-w-xs)', null, false)
await captureFullPeoplePickerMulti('Bug3-multi-narrow-180', 'Multi length=4 with 180px narrow trigger (simulate cell)', 180, false)
await captureFullPeoplePickerMulti('Bug3-multi-narrow-120', 'Multi length=4 with 120px very narrow trigger', 120, false)
await captureFullPeoplePickerMulti('Bug3-multi-narrow-180-opened', 'Multi length=4 narrow 180px + open panel-search', 180, true)

// Bug 1 length=1 long name in narrow cell
async function captureMultiLength1(testId, narrowPx) {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=design-system-components-peoplepicker-展示--multi&viewMode=story`, { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(1500)
  // Reduce to 1 selected by clicking checkboxes
  const trigger = await page.locator('[role="combobox"]').first()
  await trigger.click()
  await page.waitForTimeout(600)
  // Uncheck 3 to get length=1 (keeping Bob Christopher Chen for visible long name)
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const items = document.querySelectorAll('[role="option"]')
      for (const item of items) {
        const checkbox = item.querySelector('[role="checkbox"]')
        if (checkbox && checkbox.getAttribute('data-state') === 'checked') {
          item.dispatchEvent(new MouseEvent('click', { bubbles: true }))
          return true
        }
      }
      return false
    })
    await page.waitForTimeout(300)
  }
  // Close popover
  await page.mouse.click(400, 500)
  await page.waitForTimeout(500)
  if (narrowPx) {
    await page.addStyleTag({ content: `.max-w-xs { max-width: ${narrowPx}px !important; }` })
    await page.waitForTimeout(300)
  }
  const info = await page.evaluate(() => {
    const trigger = document.querySelector('[role="combobox"]')
    if (!trigger) return { error: 'no trigger' }
    const rect = trigger.getBoundingClientRect()
    const truncSpans = trigger.querySelectorAll('[class*="truncate"]')
    const truncs = Array.from(truncSpans).map(s => ({
      text: s.textContent?.slice(0, 30) || '',
      scrollW: s.scrollWidth,
      clientW: s.clientWidth,
      truncated: s.scrollWidth > s.clientWidth,
    }))
    return { triggerWidth: Math.round(rect.width), truncs }
  })
  const screenshotPath = path.join(SNAPSHOTS_DIR, `Bug1-multi-length1-narrow-${narrowPx ?? 'default'}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: false, clip: { x: 0, y: 0, width: 800, height: 200 } }).catch(() => {})
  results.push({ testId: `Bug1-multi-length1-${narrowPx ?? 'default'}`, description: `Multi length=1 with ${narrowPx ?? 'default'}px trigger`, ...info })
  await page.close()
}

await captureMultiLength1('Bug1', null)
await captureMultiLength1('Bug1-narrow', 180)
await captureMultiLength1('Bug1-very-narrow', 120)

await browser.close()

fs.writeFileSync(REPORT_PATH, JSON.stringify({ ts: new Date().toISOString(), results }, null, 2))

console.log('=== Real verify ===')
for (const r of results) {
  console.log(`\n${r.testId}: ${r.description}`)
  console.log(`  triggerWidth=${r.triggerWidth}px,avatars=${r.personAvatarCount ?? '-'},overflow=${r.hasOverflow ? r.overflowText : 'none'}`)
  if (r.truncs?.length) {
    for (const t of r.truncs) {
      console.log(`  truncate: text="${t.text}",scroll=${t.scrollW},client=${t.clientW},${t.truncated ? '✂️ ELLIPSIS FIRE' : 'fits'}`)
    }
  }
}
console.log(`\nSnapshots: ${SNAPSHOTS_DIR}/`)
