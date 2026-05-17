#!/usr/bin/env node
/**
 * 重現 user 抓 2026-05-16 真 bug:
 *   路徑 A(逐個 click 滿 6)→ trigger visible=X chip=+Y
 *   路徑 B(取消全選 → 再全選)→ trigger visible=X' chip=+Y'
 *   X ≠ X' 即為 race 真 bug
 *
 * Hypothesis:Combobox `useOverflowCount` internal rAF/ResizeObserver 跟 PeoplePicker
 * `useLayoutEffect` override race。length=0 中間態 disable override,internal calc 排隊,
 * length 跳 6 後 stale rAF 跑 internal measurement 覆寫 `el.hidden`。
 */
import { chromium } from 'playwright'
import { mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUT_DIR = join(__dirname, '..', 'snapshots', 'peoplepicker-twopath')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newContext({ viewport: { width: 1280, height: 800 } }).then(c => c.newPage())

// Use Multi story (init length=4) — narrow to 100px cell to force overflow boundary
await page.goto('http://localhost:6006/iframe.html?id=design-system-components-peoplepicker-展示--multi&viewMode=story')
await page.waitForLoadState('networkidle')
await page.waitForTimeout(1000)
await page.addStyleTag({ content: '.max-w-xs { max-width: 140px !important; width: 140px !important; }' })
await page.waitForTimeout(500)

async function probe(label) {
  const data = await page.evaluate(() => {
    const trig = document.querySelector('[role="combobox"]')
    if (!trig) return { err: 'no trigger' }
    const tagArea = trig.querySelector('div[class*="flex-1"][class*="min-w-0"]')
    const overflowSpan = tagArea?.querySelector('span.contents')
    const directChildren = overflowSpan ? Array.from(overflowSpan.children) : []
    const overflowWrapper = directChildren[directChildren.length - 1]
    const avatarWrappers = directChildren.slice(0, -1)
    const visibleAvatars = avatarWrappers.filter(w => !w.hidden && w.offsetParent !== null)
    let chipText = null
    if (overflowWrapper && !overflowWrapper.hidden && overflowWrapper.offsetParent !== null) {
      const text = overflowWrapper.textContent?.trim()
      if (text?.match(/^\+\d+$/)) chipText = text
    }
    return {
      triggerWidth: trig.clientWidth,
      tagAreaWidth: tagArea?.clientWidth,
      visibleAvatarCount: visibleAvatars.length,
      chipText,
      totalCircles: visibleAvatars.length + (chipText ? 1 : 0),
    }
  })
  console.log(`  [${label}]`, JSON.stringify(data))
  return data
}

// ─────────── 路徑 A: 逐個 click 滿 6 ───────────
console.log('\n══ 路徑 A:逐個 click 把全部 6 人選齊 ══')
// Init = 4 selected (Alice-Diana). Need to add Eric + Fiona one by one.
await page.locator('[role="combobox"]').first().click()
await page.waitForTimeout(500)

for (const name of ['Eric', 'Fiona']) {
  const idx = await page.evaluate((n) => {
    const opts = Array.from(document.querySelectorAll('[role="option"]'))
    for (let i = 0; i < opts.length; i++) {
      if (opts[i].textContent?.includes(n) && opts[i].getAttribute('aria-selected') === 'false') return i
    }
    return -1
  }, name)
  if (idx >= 0) {
    await page.locator('[role="option"]').nth(idx).click({ force: true })
    await page.waitForTimeout(400)
  }
}
await page.keyboard.press('Escape')
await page.waitForTimeout(500)

const pathA = await probe('A:逐個 click 滿 6')
await page.screenshot({ path: join(OUT_DIR, 'pathA-onebyone-len6.png'), fullPage: false, clip: { x: 0, y: 0, width: 800, height: 200 } })

// ─────────── 路徑 B: 全選 → 取消全選 → 再全選 ───────────
console.log('\n══ 路徑 B:取消全選 → 再點全選 ══')
await page.locator('[role="combobox"]').first().click()
await page.waitForTimeout(500)

// Click 「全部」 — toggle off (length 6 → 0)
const allBtn = page.locator('[role="option"]').filter({ hasText: '全部' }).first()
await allBtn.click({ force: true })
await page.waitForTimeout(600)
const intermediate = await probe('intermediate length=0')

// Click 「全部」 again — toggle on (length 0 → 6 via applySelectAll)
await allBtn.click({ force: true })
await page.waitForTimeout(600)
await page.keyboard.press('Escape')
await page.waitForTimeout(500)

const pathB = await probe('B:取消→再全選 → len 6')
await page.screenshot({ path: join(OUT_DIR, 'pathB-clearselectall-len6.png'), fullPage: false, clip: { x: 0, y: 0, width: 800, height: 200 } })

// ─────────── Compare ───────────
console.log('\n══ Compare ══')
console.log(`  Path A: tagArea=${pathA.tagAreaWidth} visible=${pathA.visibleAvatarCount} chip=${pathA.chipText} totalCircles=${pathA.totalCircles}`)
console.log(`  Path B: tagArea=${pathB.tagAreaWidth} visible=${pathB.visibleAvatarCount} chip=${pathB.chipText} totalCircles=${pathB.totalCircles}`)

let bugConfirmed = false
if (pathA.tagAreaWidth === pathB.tagAreaWidth) {
  if (pathA.visibleAvatarCount !== pathB.visibleAvatarCount || pathA.chipText !== pathB.chipText) {
    console.log('\n🚨 BUG CONFIRMED: same tagArea width different visible/chip — formula non-deterministic / race condition')
    bugConfirmed = true
  } else {
    console.log('\n✓ same width same output — deterministic, no bug')
  }
} else {
  console.log(`\n  ℹ tagArea width 不同(A=${pathA.tagAreaWidth} vs B=${pathB.tagAreaWidth})— `)
  if (pathA.visibleAvatarCount !== pathB.visibleAvatarCount) {
    console.log('  → formula at different widths returns different visible. Could be (a) responsive correct OR (b) intermediate state leak.')
    bugConfirmed = true
  }
}

await browser.close()
process.exit(bugConfirmed ? 1 : 0)
