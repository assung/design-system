import { chromium } from 'playwright'

const STORY_URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--cell-errors&viewMode=story'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(800)

const checks = await page.evaluate(() => {
  const out = {}
  // Cell with single error
  const c1 = document.querySelector('[data-cell-id="PRD-001:name"]')
  if (c1) {
    out.c1HasAriaDescribedBy = !!c1.getAttribute('aria-describedby')
    out.c1HasAriaInvalid = c1.getAttribute('aria-invalid') === 'true'
    const errSpan = c1.querySelector('[role="alert"]')
    out.c1ErrorText = errSpan?.textContent?.trim()
  }
  // Cell with multi-error (array)
  const c2 = document.querySelector('[data-cell-id="PRD-002:qty"]')
  if (c2) {
    const ul = c2.querySelector('ul')
    out.c2HasUl = !!ul
    out.c2ErrorItems = Array.from(ul?.querySelectorAll('li') ?? []).map((li) => li.textContent?.trim())
  }
  // Cell without error (sku is readonly, no errors set for PRD-001:sku)
  const c4 = document.querySelector('[data-cell-id="PRD-001:sku"]')
  if (c4) {
    out.c4AriaInvalid = c4.getAttribute('aria-invalid')
  }
  return out
})

await browser.close()
console.log(JSON.stringify(checks, null, 2))

const allPass =
  checks.c1HasAriaDescribedBy === true &&
  checks.c1HasAriaInvalid === true &&
  checks.c1ErrorText?.includes('必填') &&
  checks.c2HasUl === true &&
  checks.c2ErrorItems?.length === 2 &&
  (checks.c4AriaInvalid == null || checks.c4AriaInvalid === '')
console.log(allPass ? '\n✅ ALL PASS' : '\n❌ SOME FAIL')
process.exit(allPass ? 0 : 1)
