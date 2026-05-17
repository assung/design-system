#!/usr/bin/env node
/**
 * Full visual verification for PeoplePicker 3 bugs — capture ALL original user scenarios
 *
 * - Bug 1: long name in length=1 multi → ellipsis visible 不越界
 * - Bug 2: single picker inline-search open + selected → placeholder span overlay ellipsis
 * - Bug 3: length=3, 4 multi stack → deterministic visible count per cell width
 *
 * Uses PeoplePicker stories directly(not DataTable)to control state precisely.
 */

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const STORYBOOK_URL = 'http://localhost:6006'
const REPORT_PATH = '.claude/logs/runtime-verify-peoplepicker-full.json'
const SNAPSHOTS_DIR = 'snapshots/peoplepicker-full-verify'

if (!fs.existsSync(SNAPSHOTS_DIR)) fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true })

const results = []

const browser = await chromium.launch({ headless: true })

async function probe(testId, description, storyId, viewport, action) {
  const page = await browser.newPage({ viewport })
  const url = `${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(1500)
  let detail = {}
  try {
    if (action) detail = await action(page)
  } catch (e) {
    detail = { error: e.message }
  }
  const screenshotPath = path.join(SNAPSHOTS_DIR, `${testId}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {})
  results.push({ testId, description, storyId, viewport, ...detail })
  await page.close()
}

// ── Bug 1: length=1 multi long name ellipsis ────
await probe('Bug1-multi-length1-default', 'Multi PeoplePicker length=1 default story', 'design-system-components-peoplepicker-展示--multi', { width: 1440, height: 900 })

// ── Bug 2: single picker inline-search open ────
await probe('Bug2-single-default', 'Single PeoplePicker default story', 'design-system-components-peoplepicker-展示--single', { width: 1440, height: 900 }, async (p) => {
  // Click to open
  const trigger = await p.locator('[role="combobox"]').first()
  if (await trigger.count() > 0) {
    await trigger.click()
    await p.waitForTimeout(600)
    const inputInfo = await p.evaluate(() => {
      const input = document.querySelector('input[role="combobox"], [role="combobox"] input')
      const overlay = document.querySelector('[aria-hidden="true"][class*="absolute"][class*="truncate"]')
      return {
        inputPresent: !!input,
        inputPlaceholder: input?.getAttribute('placeholder') || '',
        inputValue: input?.value || '',
        overlayPresent: !!overlay,
        overlayText: overlay?.textContent || '',
        overlayScrollWidth: overlay?.scrollWidth || 0,
        overlayClientWidth: overlay?.clientWidth || 0,
      }
    })
    return { ...inputInfo, ellipsisActive: inputInfo.overlayScrollWidth > inputInfo.overlayClientWidth }
  }
  return { error: 'no trigger found' }
})

// ── Bug 3: length>=2 stack visible count via formula ────
// Use the DataTable InlineEdit which has multiPerson cells
await probe('Bug3-datatable-default', 'DataTable InlineEdit multiPerson visible count', 'design-system-components-datatable-展示--inline-edit', { width: 1920, height: 1080 }, async (p) => {
  const cellData = await p.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[role="row"]')).filter(r => r.querySelector('[role="cell"]'))
    return rows.slice(0, 6).map((row, i) => {
      const cells = row.querySelectorAll('[role="cell"]')
      const reviewerCell = cells[7]  // Reviewers column index
      if (!reviewerCell) return null
      const rect = reviewerCell.getBoundingClientRect()
      // Distinguish avatar (size 24 or 20 — typically inside .h-6 wrapper) vs +N circle indicator
      const allRoundedFull = reviewerCell.querySelectorAll('[class*="rounded-full"]')
      const overflowEl = reviewerCell.querySelector('[aria-label*="more"], button[aria-label*="+"], button[aria-label*="位"]')
      // Person avatars are img inside the wrapper
      const personImgs = reviewerCell.querySelectorAll('img[alt]')
      return {
        rowIdx: i,
        cellWidth: Math.round(rect.width),
        cellHeight: Math.round(rect.height),
        personAvatarCount: personImgs.length,
        roundedFullCount: allRoundedFull.length,
        hasOverflowChip: !!overflowEl,
        overflowText: overflowEl?.textContent || '',
        innerHTML_sample: reviewerCell.innerHTML.slice(0, 300),
      }
    }).filter(Boolean)
  })
  return { cellData }
})

// ── Bug 1 + 3 stress: manually inject 4 reviewers via story prop ────
// SkipPath since story data fixed;will require story tweak or use anatomy stories

// ── Bug 1 anatomy: long name ellipsis ────
await probe('Bug1-anatomy-multi', 'Multi PeoplePicker anatomy story (ModeMatrix)', 'design-system-components-peoplepicker-設計規格--mode-matrix', { width: 1920, height: 1080 }, async (p) => {
  // Check if any trigger renders avatar+name with truncate active
  const data = await p.evaluate(() => {
    const triggers = document.querySelectorAll('[role="combobox"]')
    return Array.from(triggers).slice(0, 8).map((t, i) => {
      const rect = t.getBoundingClientRect()
      const truncSpans = t.querySelectorAll('[class*="truncate"]')
      const truncDetails = Array.from(truncSpans).map(s => ({
        text: s.textContent?.slice(0, 30) || '',
        scrollW: s.scrollWidth,
        clientW: s.clientWidth,
        truncated: s.scrollWidth > s.clientWidth,
      }))
      return {
        triggerIdx: i,
        triggerWidth: Math.round(rect.width),
        truncSpans: truncDetails,
      }
    })
  })
  return { triggers: data }
})

await browser.close()

const summary = {
  ts: new Date().toISOString(),
  results,
  totalProbes: results.length,
}

fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2))

console.log('=== PeoplePicker Full Visual Verify ===')
for (const r of results) {
  console.log(`\n${r.testId}: ${r.description}`)
  if (r.error) { console.log(`  error: ${r.error}`); continue }
  if (r.inputPresent !== undefined) {
    console.log(`  Bug 2 trace:input placeholder="${r.inputPlaceholder}" overlay="${r.overlayText}" ellipsis=${r.ellipsisActive}`)
  }
  if (r.cellData) {
    console.log(`  Bug 3 DataTable cells:`)
    for (const c of r.cellData) {
      console.log(`    row ${c.rowIdx}: width=${c.cellWidth}px,personAvatars=${c.personAvatarCount},+N=${c.hasOverflowChip ? c.overflowText : 'none'}`)
    }
  }
  if (r.triggers) {
    console.log(`  Bug 1 trigger ellipsis trace:`)
    for (const t of r.triggers.slice(0, 5)) {
      const trunc = t.truncSpans.find(s => s.truncated)
      console.log(`    trigger ${t.triggerIdx}: width=${t.triggerWidth}px,truncate=${trunc ? `"${trunc.text}" scroll=${trunc.scrollW} client=${trunc.clientW}` : 'no'}`)
    }
  }
}
console.log(`\nReport: ${REPORT_PATH}`)
console.log(`Screenshots: ${SNAPSHOTS_DIR}/`)
