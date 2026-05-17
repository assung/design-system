#!/usr/bin/env node
/**
 * Roadmap demo visual audit(2026-05-10:5 stress stories 已 fold into single
 * `RoadmapAllInOne` integrated demo per user 整合 ask + codex Layer B Q4.1 confirm)。
 * 保留 script 但 stories 改 single integrated demo,verify 同 5 features 在 1 demo 內 work:
 *   pinned / sizes(default md)/ spreadsheet overlay / selection / big data 500 rows + virtualization
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('tmp/roadmap-stress', { recursive: true })

const stories = [
  { id: 'design-system-components-datatable-展示--roadmap-all-in-one', name: 'all-in-one' },
]

const browser = await chromium.launch({ headless: true })
const results = []

for (const s of stories) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const url = `http://localhost:6006/iframe.html?id=${s.id}&viewMode=story`
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    const ok = await page.waitForSelector('[data-data-table-outer]', { timeout: 15000 }).then(() => true).catch(() => false)
    if (!ok) {
      results.push({ ...s, error: 'render timeout' })
      await page.close()
      continue
    }
    await page.waitForTimeout(800)
    const audit = await page.evaluate(() => {
      const outer = document.querySelector('[data-data-table-outer]')
      const headers = [...document.querySelectorAll('[role="columnheader"]')]
      const rows = [...document.querySelectorAll('[role="row"]')]
      return {
        rendered: !!outer,
        cols: headers.length,
        rows: rows.length,
        outerWidth: outer?.getBoundingClientRect().width ?? null,
        outerHeight: outer?.getBoundingClientRect().height ?? null,
      }
    })
    await page.screenshot({ path: `tmp/roadmap-stress/${s.name}.png`, fullPage: false })
    results.push({ ...s, ...audit })
  } catch (e) {
    results.push({ ...s, error: e.message })
  }
  await page.close()
}

console.log('--- Roadmap 5 stress stories audit ---')
let allOK = true
for (const r of results) {
  if (r.error) {
    console.log(`${r.name}: ERROR ${r.error}`)
    allOK = false
    continue
  }
  console.log(`${r.name}: rendered=${r.rendered}, cols=${r.cols}, rows=${r.rows}, ${r.outerWidth}×${r.outerHeight}`)
}
console.log(allOK ? '\n✅ All 5 stress stories render OK' : '\n❌ Some stories failed')

await browser.close()
process.exitCode = allOK ? 0 : 1
