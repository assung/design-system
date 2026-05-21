// Screenshot proof: open dropdown menu on "更多" tab inline action.
import { chromium } from 'playwright'
const b = await chromium.launch()
const c = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await c.newPage()
await p.goto('http://localhost:6006/iframe.html?id=design-system-components-tabs-展示--with-suffix&viewMode=story', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
await p.screenshot({ path: 'snapshots/2026-05-21-session/tab-withsuffix-closed.png', clip: { x: 0, y: 0, width: 800, height: 200 } })

const moreTab = await p.locator('[role="tab"]:has-text("更多")').first()
const inlineActionBtn = await moreTab.locator('button').first()
await inlineActionBtn.click()
await p.waitForTimeout(400)
await p.screenshot({ path: 'snapshots/2026-05-21-session/tab-withsuffix-dropdown-open.png', clip: { x: 0, y: 0, width: 800, height: 400 } })

const state = await p.evaluate(() => ({
  triggerState: document.querySelector('[aria-label="更多選項"]')?.getAttribute('data-state'),
  menuExists: document.querySelector('[role="menu"][data-state="open"]') != null,
  menuItems: Array.from(document.querySelectorAll('[role="menu"] [role="menuitem"]')).map(i => i.textContent?.trim()),
  selectedTab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
}))
console.log(JSON.stringify(state, null, 2))
await b.close()
