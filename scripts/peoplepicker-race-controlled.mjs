#!/usr/bin/env node
/**
 * Controlled race verify(per Codex Round 5 Q3 propose + user verbatim「你一定有辦法自己驗證」):
 *
 * Story `RaceTest` 暴露 `window.__raceTestSetVal` deterministic setter,Playwright 透過此 API
 * 模擬 path A(逐個 setValue)vs path B(取消全選 → 再全選)— 繞 Radix popover force-click 限制。
 *
 * Pass criteria:
 *   同 cell width / 同 final length=6 → 同 visible / 同 chip(race CLOSED)
 *   不同 → race STILL OPEN(fix incomplete or wrong hypothesis)
 */
import { chromium } from 'playwright'

const STORY_URL = 'http://localhost:6006/iframe.html?id=design-system-components-peoplepicker-展示--race-test&viewMode=story'

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
    return {
      triggerWidth: trig.clientWidth,
      tagAreaWidth: tagArea?.clientWidth,
      visibleAvatarCount: visibleAvatars.length,
      chipText,
      totalCircles: visibleAvatars.length + (chipText ? 1 : 0),
    }
  })
}

async function waitTwoFrames(page) { await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))) }

async function setupPage() {
  const page = await browser.newContext({ viewport: { width: 1280, height: 800 } }).then(c => c.newPage())
  await page.goto(STORY_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  await page.addStyleTag({ content: '.max-w-xs { max-width: 140px !important; width: 140px !important; }' })
  await page.waitForTimeout(500)
  // Wait for setter to be exposed
  await page.waitForFunction(() => Boolean(window.__raceTestSetVal))
  return page
}

// ─── Path A:incremental setValue 1→2→3→4→5→6 ───
console.log('\n══ Path A:incremental setValue length=1 → 6 ══')
const pageA = await setupPage()
const people = await pageA.evaluate(() => window.__raceTestPeople)
for (let n = 1; n <= 6; n++) {
  await pageA.evaluate((slice) => window.__raceTestSetVal(slice), people.slice(0, n))
  await waitTwoFrames(pageA)
}
await pageA.waitForTimeout(500)
const stateA = await probeTrigger(pageA)
console.log(`  Path A final(length=6):`, JSON.stringify(stateA))
await pageA.close()

// ─── Path B:bulk setValue 6 → 0 → 6 ───
console.log('\n══ Path B:bulk setValue 6 → 0 → 6 ══')
const pageB = await setupPage()
await pageB.evaluate((slice) => window.__raceTestSetVal(slice), people.slice(0, 6))
await waitTwoFrames(pageB)
const interLen6 = await probeTrigger(pageB)
console.log(`  Path B intermediate length=6:`, JSON.stringify(interLen6))

await pageB.evaluate(() => window.__raceTestSetVal([]))
await waitTwoFrames(pageB)
const interLen0 = await probeTrigger(pageB)
console.log(`  Path B intermediate length=0:`, JSON.stringify(interLen0))

await pageB.evaluate((slice) => window.__raceTestSetVal(slice), people.slice(0, 6))
await waitTwoFrames(pageB)
await pageB.waitForTimeout(500)
const stateB = await probeTrigger(pageB)
console.log(`  Path B final(length=6):`, JSON.stringify(stateB))
await pageB.close()

await browser.close()

// ─── Compare ───
console.log('\n══ Compare ══')
console.log(`  Path A: width=${stateA?.tagAreaWidth} visible=${stateA?.visibleAvatarCount} chip=${stateA?.chipText} totalCircles=${stateA?.totalCircles}`)
console.log(`  Path B: width=${stateB?.tagAreaWidth} visible=${stateB?.visibleAvatarCount} chip=${stateB?.chipText} totalCircles=${stateB?.totalCircles}`)

if (stateA?.err || stateB?.err) {
  console.log('\n⚠ inconclusive — probe error')
  process.exit(2)
}
if (stateA.tagAreaWidth !== stateB.tagAreaWidth) {
  console.log(`\n⚠ inconclusive — different widths(A=${stateA.tagAreaWidth} vs B=${stateB.tagAreaWidth})`)
  process.exit(2)
}
if (stateA.visibleAvatarCount === stateB.visibleAvatarCount && stateA.chipText === stateB.chipText) {
  console.log('\n✓ PASS — same width + same visible + same chip → race CLOSED')
  process.exit(0)
}
console.log(`\n🚨 FAIL — race STILL OPEN:visible(${stateA.visibleAvatarCount} vs ${stateB.visibleAvatarCount})OR chip(${stateA.chipText} vs ${stateB.chipText})`)
process.exit(1)
