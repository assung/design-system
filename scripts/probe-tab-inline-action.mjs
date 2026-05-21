// Verify Tab inlineAction split-click: clicking inline action opens dropdown without switching tab.
import { chromium } from 'playwright'
const b = await chromium.launch()
const c = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await c.newPage()
await p.goto('http://localhost:6006/iframe.html?id=design-system-components-tabs-展示--with-suffix&viewMode=story', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

// Initial: tab '通知' should be selected (defaultValue)
const initial = await p.evaluate(() => {
  const triggers = Array.from(document.querySelectorAll('[role="tab"]')).map(t => ({
    label: t.textContent?.trim().slice(0, 20),
    selected: t.getAttribute('aria-selected'),
    state: t.getAttribute('data-state'),
  }))
  return { triggers }
})

// Click the inline action (ChevronDown button) on '更多' tab — should NOT switch tab
const moreTab = await p.locator('[role="tab"]:has-text("更多")').first()
const inlineActionBtn = await moreTab.locator('button').first()
await inlineActionBtn.click()
await p.waitForTimeout(300)

const afterInlineClick = await p.evaluate(() => {
  const triggers = Array.from(document.querySelectorAll('[role="tab"]')).map(t => ({
    label: t.textContent?.trim().slice(0, 20),
    selected: t.getAttribute('aria-selected'),
    state: t.getAttribute('data-state'),
  }))
  const dropdownTrigger = document.querySelector('[aria-label="更多選項"]')
  const dropdownTriggerState = dropdownTrigger?.getAttribute('data-state')
  const dropdownTriggerExpanded = dropdownTrigger?.getAttribute('aria-expanded')
  const anyMenu = document.querySelector('[role="menu"]')
  const allDataStates = Array.from(document.querySelectorAll('[data-state]')).map(el => ({
    tag: el.tagName,
    role: el.getAttribute('role'),
    ariaLabel: el.getAttribute('aria-label'),
    dataState: el.getAttribute('data-state'),
  })).filter(x => x.dataState === 'open')
  return { triggers, dropdownTriggerState, dropdownTriggerExpanded, anyMenu: anyMenu?.outerHTML?.slice(0, 200), allOpenElements: allDataStates }
})

// Close dropdown by pressing Escape
await p.keyboard.press('Escape')
await p.waitForTimeout(200)

// Now click the tab body (text "更多" area, NOT the inline action) — should switch tab
await moreTab.click({ position: { x: 10, y: 10 } })  // Click far-left of tab (label area)
await p.waitForTimeout(300)

const afterBodyClick = await p.evaluate(() => {
  const triggers = Array.from(document.querySelectorAll('[role="tab"]')).map(t => ({
    label: t.textContent?.trim().slice(0, 20),
    selected: t.getAttribute('aria-selected'),
    state: t.getAttribute('data-state'),
  }))
  return { triggers }
})

console.log(JSON.stringify({ initial, afterInlineClick, afterBodyClick }, null, 2))
await b.close()
