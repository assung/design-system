// Verify: (1) sidebar default 240px (2) pressedTone emphasis/neutral renders correctly.
import { chromium } from 'playwright'
const b = await chromium.launch()
const c = await b.newContext({ viewport: { width: 1440, height: 900 } })

const r = (el) => el ? { x: Math.round(el.getBoundingClientRect().x), w: Math.round(el.getBoundingClientRect().width) } : null
const css = (el, ...props) => el ? Object.fromEntries(props.map(p => [p, window.getComputedStyle(el).getPropertyValue(p)])) : null

// (1) Sidebar width = 240
const p1 = await c.newPage()
await p1.goto('http://localhost:6006/iframe.html?id=design-system-components-appshell-展示--primary-sidebar&viewMode=story', { waitUntil: 'networkidle' })
await p1.waitForTimeout(1200)
const sb = await p1.evaluate(({}) => {
  const r = (el) => el ? { x: Math.round(el.getBoundingClientRect().x), w: Math.round(el.getBoundingClientRect().width) } : null
  const css = (el, ...props) => el ? Object.fromEntries(props.map(p => [p, window.getComputedStyle(el).getPropertyValue(p)])) : null
  const outer = document.querySelector('[data-state] > div:nth-child(2)')
  const html = document.documentElement
  return {
    sidebarOuter: { ...r(outer), ...css(outer, 'width') },
    cssVarSidebarWidth: css(html, '--sidebar-width')['--sidebar-width'],
    cssVarSidebarWidthMin: css(html, '--sidebar-width-min')['--sidebar-width-min'],
  }
}, {})
await p1.close()

// (2) Pressed tone — load Button story
const p2 = await c.newPage()
await p2.goto('http://localhost:6006/iframe.html?id=design-system-components-button-設計規格--state-behavior&viewMode=story', { waitUntil: 'networkidle' })
await p2.waitForTimeout(1200)
// Probe pressed states' bg color (find buttons with aria-pressed=true)
const pressedRender = await p2.evaluate(() => {
  const css = (el, ...props) => el ? Object.fromEntries(props.map(p => [p, window.getComputedStyle(el).getPropertyValue(p)])) : null
  const allButtons = Array.from(document.querySelectorAll('button[aria-pressed="true"]'))
  return allButtons.slice(0, 6).map(btn => ({
    label: btn.textContent?.trim().slice(0, 30),
    variantClass: Array.from(btn.classList).filter(c => /^(bg|text|border)-/.test(c)).slice(0, 5),
    bgColor: window.getComputedStyle(btn).getPropertyValue('background-color'),
    color: window.getComputedStyle(btn).getPropertyValue('color'),
    ariaPressed: btn.getAttribute('aria-pressed'),
    dataState: btn.getAttribute('data-state'),
  }))
})
await p2.close()

console.log(JSON.stringify({ sb, pressedRender }, null, 2))
await b.close()
