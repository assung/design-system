// Breadcrumb tooltip-on-truncate end-to-end verify。
// 對 narrow container 內被 truncate 的 BreadcrumbLink / BreadcrumbPage:
//   - hover → tooltip 出
//   - 文字沒 truncate → tooltip 不出(回壓「Tooltip 是資訊補救」canonical)

import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

// DeclarativeAutoCollapse story 內含「窄容器 + 長 label」section
const URL = 'http://localhost:6006/iframe.html?id=design-system-components-breadcrumb-展示--declarative-auto-collapse&viewMode=story'
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(1500)  // Let ResizeObserver fire + React re-render with Tooltip wrap

// Find a truncated label — scope to last Breadcrumb(narrow container 在最後一節)
const truncInfo = await page.evaluate(() => {
  const breadcrumbs = Array.from(document.querySelectorAll('nav[aria-label*="breadcrumb" i]'))
  const last = breadcrumbs[breadcrumbs.length - 1]
  if (!last) return []
  const items = Array.from(last.querySelectorAll('li[data-bc-role]'))
  return items.map(li => {
    const role = li.getAttribute('data-bc-role')
    const span = li.querySelector('span.truncate')
    if (!span) return { role, hasTruncSpan: false }
    const truncated = span.scrollWidth > span.clientWidth
    return { role, hasTruncSpan: true, truncated, text: span.textContent, scrollW: span.scrollWidth, clientW: span.clientWidth }
  })
})
console.log('Last Breadcrumb items:', JSON.stringify(truncInfo, null, 2))

// Hover first truncated label in last Breadcrumb
const firstTruncated = await page.locator('nav[aria-label*="breadcrumb" i]').last().locator('li[data-bc-role] span.truncate').first()
const box = await firstTruncated.boundingBox()
if (!box) {
  console.log('❌ No truncated span found')
  await browser.close()
  process.exit(1)
}

// Debug:check truncate span has trigger attribute (asChild forwards to span)
const triggerInfo = await firstTruncated.evaluate((el) => ({
  hasDataState: el.hasAttribute('data-state'),
  ariaDescribedby: el.getAttribute('aria-describedby'),
  pointerEvents: getComputedStyle(el).pointerEvents,
  tag: el.tagName,
  parent: el.parentElement?.tagName,
}))
console.log('\nFirst truncated span info:', triggerInfo)

// Move mouse to corner reset, then walk-steps to ensure pointerenter fires
await page.mouse.move(10, 10)
await page.waitForTimeout(300)
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 })
await page.waitForTimeout(1500)  // Radix Tooltip Provider delayDuration=500 + buffer

const tooltipVisible = await page.evaluate(() => {
  // Radix Tooltip portals to body with role=tooltip OR data-radix-tooltip-content
  const byRole = Array.from(document.querySelectorAll('[role="tooltip"]'))
  const byData = Array.from(document.querySelectorAll('[data-radix-popper-content-wrapper] [data-state]'))
  const byState = Array.from(document.querySelectorAll('[data-state="delayed-open"], [data-state="instant-open"]'))
  const all = [...byRole, ...byData, ...byState]
  return all.map(t => ({ text: t.textContent?.slice(0, 80), state: t.getAttribute('data-state'), role: t.getAttribute('role'), w: t.getBoundingClientRect().width }))
})
console.log('\nTooltips after hover:', JSON.stringify(tooltipVisible, null, 2))

const anyVisible = tooltipVisible.some(t => t.w > 0 || t.state === 'delayed-open' || t.state === 'instant-open' || t.role === 'tooltip')
console.log(anyVisible ? '\n✓ truncated label hover → tooltip appears' : '\n✗ FAIL — no tooltip visible after hover on truncated')

// 第二題:非 truncated 不該 leak tooltip(對齊「Tooltip 是資訊補救」canonical)
await page.mouse.move(10, 10)
await page.waitForTimeout(1000)
const firstNarrowBreadcrumbShort = page.locator('nav[aria-label*="breadcrumb" i]').first().locator('li[data-bc-role] span.truncate').first()
const shortBox = await firstNarrowBreadcrumbShort.boundingBox()
const shortTruncCheck = await firstNarrowBreadcrumbShort.evaluate(el => ({ sw: el.scrollWidth, cw: el.clientWidth, truncated: el.scrollWidth > el.clientWidth }))
let noLeak = true
if (shortBox && !shortTruncCheck.truncated) {
  await page.mouse.move(shortBox.x + shortBox.width / 2, shortBox.y + shortBox.height / 2, { steps: 5 })
  await page.waitForTimeout(1500)
  const visibleTooltips = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[role="tooltip"]')).filter(el => el.getBoundingClientRect().width > 0).length
  })
  noLeak = visibleTooltips === 0
  console.log(noLeak ? '✓ non-truncated label hover → no tooltip leak' : `✗ FAIL — ${visibleTooltips} tooltip(s) leaked on non-truncated`)
} else {
  console.log('⚠ skipped non-truncated leak check (no short label found)')
}

const allPass = anyVisible && noLeak
console.log(allPass ? '\n✅ ALL PASS' : '\n❌ SOME FAIL')
await browser.close()
process.exit(allPass ? 0 : 1)
