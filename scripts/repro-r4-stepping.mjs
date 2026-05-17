#!/usr/bin/env node
/**
 * R4 stepping reproduce script(2026-05-09)
 *
 * 量 body.clientHeight per requestAnimationFrame,偵測 stepping(unique heights > 10 = bug)。
 * 跑法:確認 storybook 已啟動 → `node scripts/repro-r4-stepping.mjs`
 */

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const STORY_URL =
  process.env.STORY_URL ||
  'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--with-bulk-actions&viewMode=story'

const OUT_DIR = 'tmp/r4-repro'
mkdirSync(OUT_DIR, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

await page.goto(STORY_URL, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-data-table-outer], [data-datatable-hscroll]', { timeout: 15000 })
await page.waitForTimeout(200)

async function sample(label, frames = 150) {
  const result = await page.evaluate(async ({ label, frames }) => {
    const body = document.querySelector('[data-datatable-hscroll]')
    const outer = document.querySelector('[data-data-table-outer]')
    const out = []
    for (let i = 0; i < frames; i++) {
      const b = body?.getBoundingClientRect()
      const o = outer?.getBoundingClientRect()
      const cs = body ? getComputedStyle(body) : null
      out.push({
        label,
        frame: i,
        t: performance.now(),
        bodyClientHeight: body?.clientHeight ?? null,
        bodyRectHeight: b?.height ?? null,
        bodyMaxHeight: cs?.maxHeight ?? null,
        outerHeight: o?.height ?? null,
      })
      await new Promise(requestAnimationFrame)
    }
    return out
  }, { label, frames })
  writeFileSync(`${OUT_DIR}/${label}.json`, JSON.stringify(result, null, 2))
  return result
}

const initial = await sample('initial-mount', 120)
console.log('--- Phase 1 initial mount ---')
const initHeights = initial.map(x => x.bodyClientHeight).filter(h => h != null)
const initUnique = [...new Set(initHeights)]
console.log(`unique: ${initUnique.length}`)
console.log(`first 5: ${initHeights.slice(0, 5).join(',')}`)
console.log(`last 5: ${initHeights.slice(-5).join(',')}`)

await page.setViewportSize({ width: 1440, height: 900 })
await page.waitForTimeout(50)
const resized = await sample('after-viewport-resize', 120)
console.log('--- Phase 2 after viewport resize ---')
const resizeHeights = resized.map(x => x.bodyClientHeight).filter(h => h != null)
const resizeUnique = [...new Set(resizeHeights)]
console.log(`unique: ${resizeUnique.length}`)
console.log(`first 5: ${resizeHeights.slice(0, 5).join(',')}`)
console.log(`last 5: ${resizeHeights.slice(-5).join(',')}`)

await browser.close()

const STEPPING_THRESHOLD = 10
const initStepping = initUnique.length > STEPPING_THRESHOLD
const resizeStepping = resizeUnique.length > STEPPING_THRESHOLD
console.log('---')
console.log(`Phase 1 stepping: ${initStepping ? 'YES (BAD)' : 'NO (good)'} (${initUnique.length} unique)`)
console.log(`Phase 2 stepping: ${resizeStepping ? 'YES (BAD)' : 'NO (good)'} (${resizeUnique.length} unique)`)

if (initStepping || resizeStepping) {
  console.log('R4 stepping bug REPRODUCED')
  process.exitCode = 1
} else {
  console.log('No stepping detected')
  process.exitCode = 0
}
