#!/usr/bin/env node
/**
 * Compare 「審核」 cell trigger width + visible/chip 在 Storybook localhost vs Netlify preview。
 * User抓 SAME row 「結帳流程改版 v2 子任務 A」 全選後 兩處 chip 不同(+3 vs +4)。
 * 若 cell 寬度 same → real bug;若 cell 寬度 different → responsive 行為(non-bug)。
 */
import { chromium } from 'playwright'

const STORY_PATH = '/iframe.html?id=design-system-components-datatable-展示--roadmap-%E5%85%A8%E5%8A%9F%E8%83%BD%E6%95%B4%E5%90%88-demo&viewMode=story'
const LOCAL_URL = `http://localhost:6006${STORY_PATH}`
const NETLIFY_URL = `https://claude-cleanup-codex-deploy-2026-05-08--ajenchen-design-system.netlify.app${STORY_PATH}`

const browser = await chromium.launch()

async function probe(url, label) {
  console.log(`\n── ${label} ──`)
  console.log(`URL: ${url}`)
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } })
  const page = await ctx.newPage()
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  } catch (e) {
    console.log(`  goto error: ${e.message}`)
  }
  await page.waitForTimeout(2000)

  // Find the row with 「子任務 A」 in title
  const rowData = await page.evaluate(() => {
    // Look for cell containing '子任務 A'
    const cells = Array.from(document.querySelectorAll('[role="row"] [role="cell"], tr td, [role="gridcell"]'))
    const matchingRow = cells.find(c => c.textContent?.includes('子任務 A'))?.closest('[role="row"], tr')
    if (!matchingRow) return { err: 'row not found' }
    // Find the 審核 cell (multiPerson trigger) — look for [role=combobox] in same row
    const triggerInRow = matchingRow.querySelector('[role="combobox"]')
    if (!triggerInRow) {
      // Try sibling rows or specific column index
      const allTriggers = document.querySelectorAll('[role="combobox"]')
      return { err: 'trigger not in row', allTriggers: allTriggers.length, rowFound: true }
    }
    const tagArea = triggerInRow.querySelector('div[class*="flex-1"][class*="min-w-0"]')
    const overflowSpan = tagArea?.querySelector('span.contents')
    const directChildren = overflowSpan ? Array.from(overflowSpan.children) : []
    const overflowWrapper = directChildren[directChildren.length - 1]
    const avatarWrappers = directChildren.slice(0, -1)
    const visibleAvatars = avatarWrappers.filter(w => !w.hidden && w.offsetParent !== null)
    let chipText = null
    if (overflowWrapper && !overflowWrapper.hidden && overflowWrapper.offsetParent !== null) {
      chipText = overflowWrapper.textContent?.trim().match(/^\+\d+$/)?.[0] ?? null
    }
    // Cell wrapping the trigger
    const cell = triggerInRow.closest('[role="cell"], td, [role="gridcell"]')
    return {
      triggerWidth: triggerInRow.clientWidth,
      tagAreaWidth: tagArea?.clientWidth,
      cellWidth: cell?.clientWidth,
      visibleAvatarCount: visibleAvatars.length,
      chipText,
      totalCircles: visibleAvatars.length + (chipText ? 1 : 0),
      overflowChipMarginLeft: overflowWrapper ? getComputedStyle(overflowWrapper).marginLeft : 'n/a',
    }
  })
  console.log(' ', JSON.stringify(rowData, null, 2))
  await ctx.close()
  return rowData
}

const local = await probe(LOCAL_URL, 'Storybook localhost (latest code)')
const remote = await probe(NETLIFY_URL, 'Netlify preview (deployed)')

console.log('\n══ Compare ══')
console.log(`  local cellWidth: ${local.cellWidth} tagArea: ${local.tagAreaWidth} visible: ${local.visibleAvatarCount} chip: ${local.chipText}`)
console.log(`  netlify cellWidth: ${remote.cellWidth} tagArea: ${remote.tagAreaWidth} visible: ${remote.visibleAvatarCount} chip: ${remote.chipText}`)

if (local.err || remote.err) {
  console.log('  ⚠️ probe error — manual inspect needed')
} else if (local.tagAreaWidth === remote.tagAreaWidth) {
  if (local.visibleAvatarCount !== remote.visibleAvatarCount || local.chipText !== remote.chipText) {
    console.log('  🚨 SAME width DIFFERENT visible/chip — real bug,formula non-deterministic or code drift')
  } else {
    console.log('  ✓ SAME width SAME output — deterministic')
  }
} else {
  console.log(`  ℹ️ DIFFERENT width(local ${local.tagAreaWidth} vs netlify ${remote.tagAreaWidth})— responsive 行為差異,non-bug。`)
}

await browser.close()
