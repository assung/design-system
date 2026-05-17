// Verify PeoplePicker multi-mode dropdown rows have avatar (post Combobox schema unify)
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const results = []

async function check(label, url, openSelector = 'div[role="combobox"]') {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(600)
  const trigger = page.locator(openSelector).first()
  await trigger.click()
  await page.waitForTimeout(500)
  // Look for popover containing dropdown rows with img / role=img / [class*="avatar"]
  const stats = await page.evaluate(() => {
    const popovers = Array.from(document.querySelectorAll('[role="listbox"], [role="dialog"]'))
    let menuRowCount = 0
    let avatarInRowCount = 0
    let descriptionInRowCount = 0
    for (const pop of popovers) {
      const rows = pop.querySelectorAll('[role="option"], [data-radix-collection-item]')
      menuRowCount += rows.length
      for (const row of rows) {
        if (row.querySelector('img, [class*="rounded-full"]')) avatarInRowCount++
        // Description is rendered as smaller text below label - look for text-caption / multiple text children
        const texts = row.querySelectorAll('span, div')
        if (Array.from(texts).some(t => /text-caption|text-fg-muted/.test(t.className ?? ''))) descriptionInRowCount++
      }
    }
    return { menuRowCount, avatarInRowCount, descriptionInRowCount }
  })
  results.push({ label, stats, pass: stats.menuRowCount > 0 && stats.avatarInRowCount > 0 })
  await page.close()
}

await check(
  'PeoplePicker (single) dropdown rows have avatar',
  'http://localhost:6006/iframe.html?id=design-system-components-peoplepicker-展示--single&viewMode=story'
)

// Multi mode list — search for multi story
await check(
  'PeoplePicker (multi) dropdown rows have avatar',
  'http://localhost:6006/iframe.html?id=design-system-components-peoplepicker-展示--multi&viewMode=story'
)

await browser.close()
console.log('\n=== PeoplePicker multi avatar audit ===\n')
let allPass = true
for (const r of results) {
  const mark = r.pass ? '✓' : '✗'
  if (!r.pass) allPass = false
  console.log(`${mark} ${r.label} ${JSON.stringify(r.stats)}`)
}
console.log(allPass ? '\n✅ ALL PASS' : '\n❌ SOME FAIL')
process.exit(allPass ? 0 : 1)
