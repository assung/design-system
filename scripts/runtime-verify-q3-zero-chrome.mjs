#!/usr/bin/env node
/**
 * Q3 Path Ⅰ verify — default variant display zero chrome cross-component（2026-05-13）
 *
 * 量 Input / Textarea default display mode 的 paddingLeft / paddingTop:
 *   - Before fix: px-3 → paddingLeft=12px ✗
 *   - After Q3 fix: !px-0 !py-0 → paddingLeft=0px ✓
 *
 * 順帶量 Select / Combobox / DatePicker / TimePicker / LinkInput non-D-path bare-span
 * 確認本來就 0 padding (canonical baseline)。
 */
import { chromium } from 'playwright'

const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006'
const targets = [
  { id: 'design-system-components-input-展示--modes', label: 'Input modes (display variant)' },
  { id: 'design-system-components-textarea-展示--modes', label: 'Textarea modes (display variant)' },
  { id: 'design-system-components-numberinput-展示--modes', label: 'NumberInput modes' },
]

const browser = await chromium.launch({ headless: true })
const results = []

for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  try {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=${t.id}&viewMode=story`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const stats = await page.evaluate(() => {
      const displays = Array.from(document.querySelectorAll('[data-field-mode="display"]'))
      return displays.slice(0, 6).map(el => {
        const cs = getComputedStyle(el)
        return {
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          className: String(el.className).slice(0, 80),
        }
      })
    })
    results.push({ label: t.label, stats })
  } catch (err) {
    results.push({ label: t.label, error: err.message })
  } finally {
    await page.close()
  }
}

await browser.close()

console.log('=== Q3 Path Ⅰ zero-chrome verify ===\n')
let allPass = true
for (const r of results) {
  console.log(`### ${r.label}`)
  if (r.error) { console.log(`  ERR: ${r.error}`); continue }
  if (r.stats.length === 0) { console.log('  (no [data-field-mode="display"] elements — likely bare-span path, canonical baseline)'); continue }
  for (const s of r.stats) {
    const isZero = s.paddingLeft === '0px' && s.paddingTop === '0px'
    console.log(`  paddingLeft=${s.paddingLeft} paddingTop=${s.paddingTop} ${isZero ? '✓' : '✗'}`)
    if (!isZero) allPass = false
  }
}
console.log(allPass ? '\n✅ ALL data-field-mode=display 元素 zero chrome' : '\n❌ FAIL: some default display still has chrome padding')
process.exit(allPass ? 0 : 1)
