import { chromium } from 'playwright'

const STORY_URL = 'http://localhost:6006/iframe.html?id=design-system-components-datepicker-展示--typed-input&viewMode=story'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto(STORY_URL, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(800)

const results = []

// 1. Initial render — input should have current value formatted
const inputCount = await page.locator('input[type="text"]').count()
results.push({ label: 'typed input renders', value: { inputCount }, pass: inputCount >= 1 })

// 2. Type new date + press Enter → value changes
const firstInput = page.locator('input[type="text"]').first()
await firstInput.click()
await firstInput.fill('2026-12-25')
await firstInput.press('Enter')
await page.waitForTimeout(400)
// 找含 "(empty)" pattern 或 YYYY-MM-DD 的 code(後者更精準)
const value1 = await page.evaluate(() => {
  const codes = Array.from(document.querySelectorAll('code'))
  const found = codes.find((el) => /\d{4}-\d{2}-\d{2}/.test(el.textContent ?? ''))
  return found?.textContent?.trim()
})
results.push({ label: 'Enter commits valid date', value: value1, pass: value1?.includes('2026-12-25') })

// 3. Type invalid → aria-invalid set
await firstInput.click()
await firstInput.fill('not-a-date')
await firstInput.press('Enter')
await page.waitForTimeout(300)
const ariaInvalid = await firstInput.getAttribute('aria-invalid')
results.push({ label: 'invalid input sets aria-invalid', value: { ariaInvalid }, pass: ariaInvalid === 'true' })

// 4. Esc reset
await firstInput.press('Escape')
await page.waitForTimeout(200)
const ariaInvalidAfterEsc = await firstInput.getAttribute('aria-invalid')
results.push({ label: 'Escape clears aria-invalid', value: { ariaInvalidAfterEsc }, pass: ariaInvalidAfterEsc !== 'true' })

await browser.close()
console.log('\n=== Issue 10 typed input audit ===\n')
let allPass = true
for (const r of results) {
  const mark = r.pass ? '✓' : '✗'
  if (!r.pass) allPass = false
  console.log(`${mark} ${r.label} ${JSON.stringify(r.value)}`)
}
console.log(allPass ? '\n✅ ALL PASS' : '\n❌ SOME FAIL')
process.exit(allPass ? 0 : 1)
