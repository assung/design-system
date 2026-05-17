#!/usr/bin/env node
/**
 * Quick DOM probe to understand actual structure + ref attachment.
 */
import { chromium } from 'playwright'

const STORYBOOK_URL = 'http://localhost:6006'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newContext({ viewport: { width: 1280, height: 800 } }).then(c => c.newPage())

  await page.goto(`${STORYBOOK_URL}/iframe.html?id=design-system-components-peoplepicker-展示--multi&viewMode=story`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  await page.addStyleTag({ content: `.max-w-xs { max-width: 180px !important; width: 180px !important; }` })
  await page.waitForTimeout(500)

  const probe = await page.evaluate(() => {
    const trig = document.querySelector('[role="combobox"]')
    if (!trig) return { err: 'no trigger' }
    const tagArea = trig.querySelector('div[class*="flex-1"][class*="min-w-0"]')
    // Get OverflowTagList span.contents
    const overflowSpan = tagArea?.querySelector('span.contents')
    const directWrappers = overflowSpan ? Array.from(overflowSpan.children) : []
    const wrapperInfo = directWrappers.map((w, i) => ({
      idx: i,
      tagName: w.tagName,
      classes: w.className,
      hidden: w.hidden,
      hasHiddenAttr: w.hasAttribute('hidden'),
      offsetParent: w.offsetParent ? w.offsetParent.tagName : 'null',
      offsetWidth: w.offsetWidth,
      visibleText: w.textContent?.trim().slice(0, 40),
      hasAvatar: !!w.querySelector('img, [data-radix-avatar-fallback]'),
      hasButton: !!w.querySelector('button, [role="button"]'),
    }))
    return {
      triggerId: trig.id,
      tagAreaClass: tagArea?.className,
      tagAreaClientWidth: tagArea?.clientWidth,
      overflowSpanFound: !!overflowSpan,
      directChildCount: directWrappers.length,
      wrappers: wrapperInfo,
    }
  })

  console.log(JSON.stringify(probe, null, 2))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
