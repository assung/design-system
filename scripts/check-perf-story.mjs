import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })

for (const id of ['design-system-components-datatable-展示--roadmap-all-in-one', 'design-system-components-datatable-展示--roadmap-perf-budget']) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
  const url = `http://localhost:6006/iframe.html?id=${id}&viewMode=story`
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  const stats = await page.evaluate(() => {
    const center = document.querySelector('[data-datatable-panel="center"]')
    const cr = center?.getBoundingClientRect()
    const cs = center ? getComputedStyle(center) : null
    return {
      centerHeight: cr?.height,
      centerMaxHeight: cs?.maxHeight,
      centerOverflowY: cs?.overflowY,
      visibleRows: center?.querySelectorAll('[role="row"][data-row-index]').length ?? 0,
      docHeight: document.documentElement.scrollHeight,
    }
  })
  console.log(`\n${id}:`)
  console.log(JSON.stringify(stats, null, 2))
  await page.close()
}
await browser.close()
