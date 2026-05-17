#!/usr/bin/env node
/**
 * 重現 user path A vs path B 用 keyboard navigation 繞 Radix popover force-click 攔。
 *
 * Path A:逐個 click 全部選齊(via 鍵盤逐個 toggle)
 * Path B:全選 → 取消全選 → 再全選(via 「全部」 footer click)
 *
 * 兩 path 最終都 length=6。同 width tagArea → 同 visible/chip 才表示 race 修好。
 */
import { chromium } from 'playwright'
import { mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUT_DIR = join(__dirname, '..', 'snapshots', 'peoplepicker-twopath-keyboard')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const browser = await chromium.launch()

async function probeTrigger(page) {
  return await page.evaluate(() => {
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
    // selected count in dropdown (verify length state)
    const checkedOptions = Array.from(document.querySelectorAll('[role="option"][aria-selected="true"]')).filter(o => !o.textContent?.includes('全部'))
    return {
      triggerWidth: trig.clientWidth,
      tagAreaWidth: tagArea?.clientWidth,
      visibleAvatarCount: visibleAvatars.length,
      chipText,
      totalCircles: visibleAvatars.length + (chipText ? 1 : 0),
      checkedDropdownCount: checkedOptions.length,
    }
  })
}

async function setupPage() {
  const page = await browser.newContext({ viewport: { width: 1280, height: 800 } }).then(c => c.newPage())
  await page.goto('http://localhost:6006/iframe.html?id=design-system-components-peoplepicker-展示--multi&viewMode=story')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await page.addStyleTag({ content: '.max-w-xs { max-width: 140px !important; width: 140px !important; }' })
  await page.waitForTimeout(500)
  return page
}

// ─── Path A:starting from init length=4,逐個 keyboard toggle 加 Eric, Fiona ───
console.log('\n══ Path A:keyboard 逐個 toggle 滿 6 ══')
{
  const page = await setupPage()
  // Open dropdown
  await page.locator('[role="combobox"]').first().click()
  await page.waitForTimeout(500)
  // Init = 4 selected(Alice/Bob/Charlie/Diana)。Navigate to Eric(idx 4 in options)+ toggle
  // cmdk default highlights first item. Use ArrowDown to move highlight.
  await page.keyboard.press('Home')  // top
  await page.waitForTimeout(100)
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(80)
  }
  // Now on Eric(idx 4). Toggle.
  await page.keyboard.press('Enter')
  await page.waitForTimeout(400)
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(80)
  // Now on Fiona(idx 5). Toggle.
  await page.keyboard.press('Enter')
  await page.waitForTimeout(400)

  // Close dropdown to settle layout
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)

  const stateA = await probeTrigger(page)
  console.log(`  Path A final:`, JSON.stringify(stateA))
  await page.screenshot({ path: join(OUT_DIR, 'pathA-keyboard-len6.png'), fullPage: false, clip: { x: 0, y: 0, width: 800, height: 200 } })
  await page.close()

  // Save
  globalThis.pathAState = stateA
}

// ─── Path B:starting from init length=4,「全部」 toggle off + on twice ───
console.log('\n══ Path B:「全部」 toggle off → on ══')
{
  const page = await setupPage()
  await page.locator('[role="combobox"]').first().click()
  await page.waitForTimeout(500)
  // 「全部」 footer click — first toggle: length=4 → 6(applySelectAll 加 Eric+Fiona)
  const allBtn = page.locator('[role="option"]').filter({ hasText: '全部' }).first()
  await allBtn.click({ force: true })
  await page.waitForTimeout(500)
  // 二次 toggle: length=6 → 0(clearSelection)
  await allBtn.click({ force: true })
  await page.waitForTimeout(500)
  const intermediate = await probeTrigger(page)
  console.log(`  Path B intermediate(length=0):`, JSON.stringify(intermediate))
  // 三次 toggle: length=0 → 6(applySelectAll 全 source)
  await allBtn.click({ force: true })
  await page.waitForTimeout(500)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)

  const stateB = await probeTrigger(page)
  console.log(`  Path B final:`, JSON.stringify(stateB))
  await page.screenshot({ path: join(OUT_DIR, 'pathB-keyboard-len6.png'), fullPage: false, clip: { x: 0, y: 0, width: 800, height: 200 } })
  await page.close()

  globalThis.pathBState = stateB
}

await browser.close()

console.log('\n══ Compare ══')
const A = globalThis.pathAState, B = globalThis.pathBState
console.log(`  Path A: width=${A?.tagAreaWidth} visible=${A?.visibleAvatarCount} chip=${A?.chipText} length=${A?.checkedDropdownCount}`)
console.log(`  Path B: width=${B?.tagAreaWidth} visible=${B?.visibleAvatarCount} chip=${B?.chipText} length=${B?.checkedDropdownCount}`)

if (A?.tagAreaWidth === B?.tagAreaWidth && A?.checkedDropdownCount === B?.checkedDropdownCount) {
  const sameVis = A.visibleAvatarCount === B.visibleAvatarCount
  const sameChip = A.chipText === B.chipText
  if (sameVis && sameChip) {
    console.log('\n✓ PASS — same width + same length(6)+ same visible + same chip → race CLOSED')
    process.exit(0)
  } else {
    console.log(`\n🚨 FAIL — same width(${A.tagAreaWidth})+ same length(${A.checkedDropdownCount})but different visible(${A.visibleAvatarCount} vs ${B.visibleAvatarCount})OR chip(${A.chipText} vs ${B.chipText})→ race STILL OPEN`)
    process.exit(1)
  }
} else {
  console.log(`\n⚠ inconclusive — different widths OR different lengths`)
  console.log(`   length A=${A?.checkedDropdownCount} B=${B?.checkedDropdownCount}(both 應該 6)`)
  process.exit(2)
}
