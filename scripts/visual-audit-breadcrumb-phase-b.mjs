// Breadcrumb Phase B audit(2026-05-10):declarative items + auto-collapse + flex-shrink
// hierarchy + truncate-tooltip。
import { chromium } from 'playwright'

const URL = 'http://localhost:6006/iframe.html?id=design-system-components-breadcrumb-展示--declarative-auto-collapse&viewMode=story'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(800)

const results = await page.evaluate(() => {
  const out = []

  // 1. declarative items < maxItems → 全顯
  const nav1 = document.querySelectorAll('nav[aria-label="Breadcrumb"]')[0]
  if (nav1) {
    const items = nav1.querySelectorAll('li[data-bc-role]')
    out.push({
      label: '≤ maxItems 全顯',
      itemCount: items.length,
      roles: Array.from(items).map(i => i.getAttribute('data-bc-role')),
      pass: items.length === 3,
    })
  }

  // 2. items > maxItems → auto-collapse(should have ellipsis role)
  const nav2 = document.querySelectorAll('nav[aria-label="Breadcrumb"]')[1]
  if (nav2) {
    const items = nav2.querySelectorAll('li[data-bc-role]')
    const roles = Array.from(items).map(i => i.getAttribute('data-bc-role'))
    out.push({
      label: 'items > maxItems auto-collapse',
      itemCount: items.length,
      roles,
      hasEllipsis: roles.includes('ellipsis'),
      hasRoot: roles.includes('root'),
      hasCurrent: roles.includes('current'),
      pass: roles.includes('ellipsis') && roles.includes('root') && roles.includes('current'),
    })
  }

  // 3. ellipsis is button (ItemInlineActionButton wrapped in DropdownMenuTrigger)
  const ellipsisBtn = nav2?.querySelector('li[data-bc-role="ellipsis"] button[aria-label="顯示折疊路徑"]')
  out.push({
    label: 'ellipsis is interactive button',
    btnExists: !!ellipsisBtn,
    hasInlineActionGroupClass: ellipsisBtn ? /group\/action/.test(ellipsisBtn.className) : false,
    pass: !!ellipsisBtn && /group\/action/.test(ellipsisBtn.className),
  })

  // 4. flex-shrink hierarchy verified via computed style
  if (nav2) {
    const root = nav2.querySelector('li[data-bc-role="root"]')
    const current = nav2.querySelector('li[data-bc-role="current"]')
    const ellipsis = nav2.querySelector('li[data-bc-role="ellipsis"]')
    const rootShrink = root ? window.getComputedStyle(root).flexShrink : 'na'
    const currentShrink = current ? window.getComputedStyle(current).flexShrink : 'na'
    const ellipsisShrink = ellipsis ? window.getComputedStyle(ellipsis).flexShrink : 'na'
    out.push({
      label: 'flex-shrink hierarchy(root:3 / current:1 / ellipsis:0)',
      rootShrink,
      currentShrink,
      ellipsisShrink,
      pass: rootShrink === '3' && currentShrink === '1' && ellipsisShrink === '0',
    })
  }

  // 5. Narrow-container scenario:long labels should actually truncate(scrollWidth > clientWidth)
  //    + no overflow outside container(li.right ≤ container.right)
  const nav4 = document.querySelectorAll('nav[aria-label="Breadcrumb"]')[3]
  if (nav4) {
    const container = nav4.parentElement
    const containerRect = container.getBoundingClientRect()
    const items = Array.from(nav4.querySelectorAll('li[data-bc-role]'))
    const truncSpans = Array.from(nav4.querySelectorAll('span.truncate'))
    const allTruncated = truncSpans.every(s => s.scrollWidth > s.clientWidth)
    // No item should overflow the container right edge(+1px tolerance for sub-pixel)
    const lastLi = items[items.length - 1]
    const lastRight = lastLi.getBoundingClientRect().right
    const noOverflow = lastRight <= containerRect.right + 1
    out.push({
      label: 'narrow container long labels → all actually truncated + no overflow',
      itemCount: items.length,
      truncSpanCount: truncSpans.length,
      allActuallyTruncated: allTruncated,
      lastLiRight: lastRight,
      containerRight: containerRect.right,
      noOverflow,
      pass: items.length >= 3 && truncSpans.length === items.length && allTruncated && noOverflow,
    })
  }

  return out
})

await browser.close()
console.log('\n=== Breadcrumb Phase B audit ===\n')
let allPass = true
for (const r of results) {
  const mark = r.pass ? '✓' : '✗'
  if (!r.pass) allPass = false
  console.log(`${mark} ${r.label}`)
  console.log(`   ${JSON.stringify(r)}`)
}
console.log(allPass ? '\n✅ ALL PASS' : '\n❌ SOME FAIL')
process.exit(allPass ? 0 : 1)
