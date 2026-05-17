// Breadcrumb Phase A audit(2026-05-10):
// (1) BreadcrumbEllipsis 消費 ItemInlineActionButton
// (2) BreadcrumbList flex-nowrap
// (3) AllSizes story 末位 BreadcrumbPage 文字 == title
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const results = []

async function check(label, url, fn) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(500)
  try {
    const r = await fn(page)
    results.push({ label, ...r })
  } catch (e) {
    results.push({ label, error: e.message, pass: false })
  }
  await page.close()
}

// (1) Interactive ellipsis → ItemInlineActionButton structure
await check(
  'BreadcrumbEllipsis is ItemInlineActionButton',
  'http://localhost:6006/iframe.html?id=design-system-components-breadcrumb-展示--interactive-ellipsis&viewMode=story',
  async (page) => {
    const stats = await page.evaluate(() => {
      // ItemInlineActionButton's button has `group/action` class
      const ellipsisBtn = document.querySelector('button[aria-label="顯示折疊路徑"]')
      if (!ellipsisBtn) return { btnExists: false }
      const className = ellipsisBtn.className
      const hasInlineActionGroup = /group\/action/.test(className)
      const hasOverlayTriggerData = ellipsisBtn.hasAttribute('data-state') || className.includes('data-[state=open]')
      return { btnExists: true, hasInlineActionGroup, classNamePreview: className.slice(0, 200) }
    })
    return { stats, pass: stats.btnExists && stats.hasInlineActionGroup }
  }
)

// (2) BreadcrumbList flex-nowrap
await check(
  'BreadcrumbList is flex-nowrap (single line)',
  'http://localhost:6006/iframe.html?id=design-system-components-breadcrumb-展示--deep&viewMode=story',
  async (page) => {
    const stats = await page.evaluate(() => {
      const list = document.querySelector('ol')
      if (!list) return { listExists: false }
      const cs = window.getComputedStyle(list)
      return { listExists: true, flexWrap: cs.flexWrap }
    })
    return { stats, pass: stats.listExists && stats.flexWrap === 'nowrap' }
  }
)

// (3) AllSizes story — last item is BreadcrumbPage with aria-current=page, text matches title
await check(
  'AllSizes: breadcrumb end = title text',
  'http://localhost:6006/iframe.html?id=design-system-components-breadcrumb-展示--all-sizes&viewMode=story',
  async (page) => {
    const stats = await page.evaluate(() => {
      // 3 breadcrumb groups, each has BreadcrumbList + h2/h3/h4 title
      const results = []
      const nav = document.querySelectorAll('nav[aria-label="Breadcrumb"]')
      const titles = document.querySelectorAll('h2, h3, h4')
      nav.forEach((n, i) => {
        const lastItem = n.querySelectorAll('li')
        // Walk from end, find first non-separator <li>(BreadcrumbItem 含 aria-current)
        let end = null
        for (let j = lastItem.length - 1; j >= 0; j--) {
          const item = lastItem[j]
          if (item.getAttribute('role') === 'presentation') continue  // separator
          end = item
          break
        }
        if (!end) { results.push({ idx: i, error: 'no end item' }); return }
        const endPage = end.querySelector('[aria-current="page"]')
        const endText = endPage?.textContent?.trim()
        // Find matching title (next h2/h3/h4 sibling area)
        const correspondingTitle = titles[i]?.textContent?.trim()
        results.push({
          idx: i,
          endText,
          titleText: correspondingTitle,
          match: endText === correspondingTitle,
        })
      })
      return results
    })
    const allMatch = Array.isArray(stats) && stats.every(s => s.match)
    return { stats, pass: allMatch }
  }
)

await browser.close()
console.log('\n=== Breadcrumb Phase A audit ===\n')
let allPass = true
for (const r of results) {
  const mark = r.pass ? '✓' : '✗'
  if (!r.pass) allPass = false
  console.log(`${mark} ${r.label}`)
  console.log(`   ${JSON.stringify(r.stats ?? r.error)}`)
}
console.log(allPass ? '\n✅ ALL PASS' : '\n❌ SOME FAIL')
process.exit(allPass ? 0 : 1)
