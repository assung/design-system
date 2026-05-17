#!/usr/bin/env node
/**
 * Runtime interactive verify — BulkActionBar `totalSelected` click flow(2026-05-13)
 *
 * 驗 user 抓的 regression:Alert 點「點此選取全部 5370」→ BulkActionBar count 真同步成 5370,不再卡 50。
 *
 * 跑法:
 *   1. `npm run build-storybook`(若未 build)
 *   2. `node scripts/runtime-verify-bulk-action-bar.mjs`
 *
 * Exit:0 = pass;1 = fail
 */

import { chromium } from 'playwright'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const STATIC = join(ROOT, 'storybook-static')

if (!existsSync(STATIC)) {
  console.error('[bulk-action-bar runtime] storybook-static missing — run `npm run build-storybook` first')
  process.exit(2)
}

const STORY_ID = 'design-system-components-bulkactionbar-展示--with-extend-dataset-hint'
// 2026-05-13:HTTP URL canonical(file:// 因 Storybook 7+ ES code-split CORS-blocked iframe-XYZ.js chunks)。
// 對齊 visual-audit.mjs STORYBOOK_URL pattern。env override 支援(env STORYBOOK_URL=http://...)。
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006'
const url = `${STORYBOOK_URL}/iframe.html?id=${STORY_ID}&viewMode=story`

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
let exitCode = 0

try {
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForTimeout(500)  // allow React mount

  // Check initial count(2026-05-13 fix:bulk-action-bar 用 Tailwind `.tabular-nums` 但 storybook iframe
  //   渲 build 後 class 可能被 hash/compose,改用 toolbar.textContent regex 比 robust)
  const initialText = await page.evaluate(() => {
    const bar = document.querySelector('[role="toolbar"][aria-label="批次操作"]')
    return bar?.textContent?.trim() ?? null
  })
  console.log(`[step 1] initial bulk-action-bar count text: "${initialText}"`)
  if (!initialText?.includes('50')) {
    console.error(`FAIL: expected initial count "已選 50 項", got "${initialText}"`)
    exitCode = 1
  }

  // Click「點此選取全部 5370 個項目」button(within Alert)
  const clickedSelectAll = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const btn = btns.find(b => b.textContent?.includes('5370'))
    if (!btn) return false
    btn.click()
    return true
  })
  if (!clickedSelectAll) {
    console.error('FAIL: cannot find「選取全部 5370」button')
    exitCode = 1
  } else {
    await page.waitForTimeout(200)  // React state propagation
  }

  // Verify count updated to 5370
  const updatedText = await page.evaluate(() => {
    const bar = document.querySelector('[role="toolbar"][aria-label="批次操作"]')
    return bar?.textContent?.trim() ?? null
  })
  console.log(`[step 2] after click select-all, bulk-action-bar count text: "${updatedText}"`)
  if (!updatedText?.includes('5370')) {
    console.error(`FAIL: expected count to update to 5370,got "${updatedText}"`)
    exitCode = 1
  } else {
    console.log('PASS: BulkActionBar totalSelected click-flow runtime verified')
  }
} catch (err) {
  console.error('[bulk-action-bar runtime] ERROR:', err.message)
  exitCode = 1
} finally {
  await browser.close()
}

process.exit(exitCode)
