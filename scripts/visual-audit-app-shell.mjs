// Visual audit for AppShell pattern — pixel-quantified per M32.
// 6 cases: 4 desktop + 2 mobile.
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = 'snapshots/app-shell-2026-05-19'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const mobile = await browser.newContext({ viewport: { width: 375, height: 667 } })

const cases = [
  { id: 'design-system-patterns-appshell-展示--primary-sidebar', label: 'primary-sidebar', ctx: desktop },
  // primary-header story retired pending Sidebar SSOT extension (2026-05-19)
  { id: 'design-system-patterns-appshell-展示--aside-modal-on-mobile', label: 'aside-mobile-open', ctx: mobile },
  { id: 'design-system-patterns-appshell-設計規格--layout-mode-diagram', label: 'anatomy-mode-diagram', ctx: desktop },
  { id: 'design-system-patterns-appshell-設計規格--overview', label: 'anatomy-overview', ctx: desktop },
  { id: 'design-system-patterns-appshell-設計規格--accessibility', label: 'anatomy-a11y', ctx: desktop },
  { id: 'design-system-patterns-appshell-設計規格--state-behavior', label: 'anatomy-state-behavior', ctx: desktop },
]

const results = []
for (const { id, label, ctx } of cases) {
  const page = await ctx.newPage()
  const url = `http://localhost:6006/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  // Pixel-quantified probe
  const probe = await page.evaluate(() => {
    const r = (el) => el ? { x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y, w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height } : null
    const main = document.querySelector('#app-shell-main')
    const header = document.querySelector('header')
    const sidebars = [...document.querySelectorAll('[data-sidebar="sidebar"], [data-state="expanded"]')]
    const sidebar = sidebars.find(el => el.tagName !== 'BUTTON') || document.querySelector('aside[aria-label="Primary navigation"]')
    const asides = [...document.querySelectorAll('aside')]
    const aside = asides.find(el => el.getAttribute('aria-label') !== 'Primary navigation')
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      url: location.href.slice(0, 200),
      bodyText: document.body.innerText.slice(0, 200),
      sidebar: r(sidebar),
      header: r(header),
      main: r(main),
      aside: r(aside),
    }
  })

  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: false })
  results.push({ label, probe })
  await page.close()
}

console.log(JSON.stringify(results, null, 2))
await browser.close()
