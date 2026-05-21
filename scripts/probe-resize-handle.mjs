// Verify ResizeHandle primitive: hit zone size + cursor + role / aria / line color states.
import { chromium } from 'playwright'
const b = await chromium.launch()
const c = await b.newContext({ viewport: { width: 1440, height: 900 } })

const probe = async (storyId, label) => {
  const p = await c.newPage()
  await p.goto(`http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(800)
  const data = await p.evaluate(({ label }) => {
    const handle = document.querySelector('[role="separator"], [aria-hidden="true"]+span, .group\\/resize')
      || Array.from(document.querySelectorAll('span')).find(s => s.classList.contains('group/resize'))
    if (!handle) return { label, error: 'handle not found' }
    const r = handle.getBoundingClientRect()
    const cs = window.getComputedStyle(handle)
    const line = handle.querySelector('[aria-hidden="true"]')
    const lineCs = line ? window.getComputedStyle(line) : null
    return {
      label,
      className: handle.className,
      handleRect: { w: Math.round(r.width), h: Math.round(r.height) },
      cursor: cs.cursor,
      userSelect: cs.userSelect,
      role: handle.getAttribute('role'),
      ariaOrientation: handle.getAttribute('aria-orientation'),
      ariaLabel: handle.getAttribute('aria-label'),
      lineBgColor: lineCs?.backgroundColor,
    }
  }, { label })
  await p.close()
  return data
}

const results = {
  default: await probe('design-system-patterns-resizehandle--default', 'Default(idle)'),
  dragging: await probe('design-system-patterns-resizehandle--dragging', 'Dragging'),
  disabled: await probe('design-system-patterns-resizehandle--disabled', 'Disabled'),
  vertical: await probe('design-system-patterns-resizehandle--vertical', 'Vertical'),
}
console.log(JSON.stringify(results, null, 2))
await b.close()
