import { chromium } from 'playwright'
const b = await chromium.launch()
const c = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await c.newPage()
await p.goto('http://localhost:6006/iframe.html?id=design-system-components-tabs-展示--with-suffix&viewMode=story', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

const dom = await p.evaluate(() => {
  const moreTab = Array.from(document.querySelectorAll('[role="tab"]')).find(t => t.textContent?.includes('更多'))
  if (!moreTab) return { error: 'more tab not found' }
  // Print rendered HTML structure
  const html = moreTab.outerHTML
  // Walk children for nested buttons
  const nestedButtons = moreTab.querySelectorAll('button')
  const buttonCount = nestedButtons.length
  // Get parent context
  const parent = moreTab.parentElement
  const parentHtml = parent?.outerHTML?.slice(0, 2000)
  return {
    moreTabIsButton: moreTab.tagName === 'BUTTON',
    moreTabHtml: html.slice(0, 1500),
    nestedButtonCount: buttonCount,
    nestedButtonTags: Array.from(nestedButtons).map(b => ({ tag: b.tagName, ariaLabel: b.getAttribute('aria-label'), html: b.outerHTML.slice(0, 200) })),
    parentSnippet: parentHtml,
  }
})

console.log(JSON.stringify(dom, null, 2))
await b.close()
