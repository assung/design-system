#!/usr/bin/env node
/**
 * Verify tagPadding density-dependent math —— user catch「form branch 不是也是 12px?」
 *
 * 對 PeoplePicker multi standalone(form context),3 size 量 avatar.left from trigger.left。
 * spec.md:94 claim「4+8=12px」只 compact 對。default 是 6+8=14、comfortable 是 8+8=16。
 */
import { chromium } from 'playwright'

const URL = 'http://localhost:6006/iframe.html?id=design-system-components-peoplepicker-展示--multi&viewMode=story'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })

try {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  // Find the multi-mode PeoplePicker trigger (role=combobox or button with avatar)
  const stats = await page.evaluate(() => {
    const results = []
    // Look for all triggers that contain avatars (multi mode)
    const triggers = Array.from(document.querySelectorAll('[role="combobox"], [role="button"], button')).filter(el => {
      return el.querySelector('img, [class*="rounded-full"]') !== null
    })
    for (const trigger of triggers) {
      const tRect = trigger.getBoundingClientRect()
      const tCs = getComputedStyle(trigger)
      const firstAvatar = trigger.querySelector('img, [class*="rounded-full"]')
      if (!firstAvatar) continue
      const aRect = firstAvatar.getBoundingClientRect()
      results.push({
        triggerLeft: tRect.left,
        triggerWidth: tRect.width,
        triggerPaddingLeft: tCs.paddingLeft,
        avatarLeft: aRect.left,
        avatarRelLeft: aRect.left - tRect.left,
        textContent: (trigger.textContent || '').trim().slice(0, 30),
      })
    }
    return results
  })

  console.log('=== Standalone PeoplePicker multi triggers ===\n')
  for (const r of stats.slice(0, 10)) {
    console.log(`avatar.relLeftFromTrigger = ${r.avatarRelLeft.toFixed(2)}px  (trigger.paddingLeft=${r.triggerPaddingLeft})  text="${r.textContent}"`)
  }
  console.log(`\nTotal triggers w/ avatar: ${stats.length}`)
} catch (err) {
  console.error('ERR:', err.message)
} finally {
  await browser.close()
}
