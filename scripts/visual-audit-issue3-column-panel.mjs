import { chromium } from 'playwright'

const ROADMAP_URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--roadmap-all-in-one&viewMode=story'
const BULK_URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--with-bulk-actions&viewMode=story'

const browser = await chromium.launch({ headless: true })
const results = []

async function checkPanel(url, label, openClick = '欄位顯示') {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(800)
  await page.locator(`button[aria-label="${openClick}"]`).first().click()
  await page.waitForTimeout(500)
  const panel = await page.evaluate(() => {
    const popover = document.querySelector('[role="dialog"]')
    if (!popover) return null
    const title = popover.querySelector('h2, h3, [data-popover-title], [class*="font-bold"]')?.textContent?.trim()
    const searchInput = popover.querySelector('input[placeholder*="搜尋"]')
    const rows = popover.querySelectorAll('[class*="ROW_PADDING"], [class*="flex items-start"]')
    const eyeIcons = popover.querySelectorAll('button[aria-label*="顯示"], button[aria-label*="隱藏"]')
    const footer = popover.querySelector('button:not([aria-label])')?.textContent?.trim()
    return {
      hasPanel: true,
      title,
      hasSearch: !!searchInput,
      eyeIconCount: eyeIcons.length,
      footerText: footer,
    }
  })
  results.push({ label, panel, pass: panel != null && panel.eyeIconCount > 0 })
  await page.close()
}

await checkPanel(ROADMAP_URL, 'Roadmap demo column panel')
await checkPanel(BULK_URL, 'WithBulkActions column panel')

await browser.close()
console.log('\n=== Issue 3 Column Visibility Panel Audit ===\n')
let allPass = true
for (const r of results) {
  const mark = r.pass ? '✓' : '✗'
  if (!r.pass) allPass = false
  console.log(`${mark} ${r.label}`)
  if (r.panel) console.log(`   ${JSON.stringify(r.panel)}`)
}
console.log(allPass ? '\n✅ ALL PASS' : '\n❌ SOME FAIL')
process.exit(allPass ? 0 : 1)
