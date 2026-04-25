#!/usr/bin/env node
/**
 * Self-verify DS Devmode addon — opens Storybook, toggles Live, clicks a Button,
 * screenshots full Storybook (panel + canvas + overlay), plus canvas-only.
 * Output → snapshots-devmode/.
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'snapshots-devmode')
const SB = 'http://localhost:6006'
const STORY = '/?path=/story/design-system-components-button-%E5%B1%95%E7%A4%BA--all-variants&viewMode=story'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 2 })
const page = await context.newPage()

console.log('[1/6] Load Storybook Button default story')
await page.goto(`${SB}${STORY}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

console.log('[2/6] Open DS Devmode panel tab')
// Storybook panels are rendered as tabs; find by text "DS Devmode"
const tabSelector = 'button[role="tab"]:has-text("DS Devmode")'
const tab = page.locator(tabSelector).first()
if (await tab.count()) {
  await tab.click()
  await page.waitForTimeout(400)
}

console.log('[3/6] Click Live toggle in panel')
const liveBtn = page.locator('button:has-text("Live")').first()
await liveBtn.click()
await page.waitForTimeout(300)

await page.screenshot({ path: join(OUT, '01-panel-off-live-toggled.png'), fullPage: false })

console.log('[4/6] Click a Button inside the canvas iframe')
const iframe = page.frameLocator('#storybook-preview-iframe')
const button = iframe.locator('#storybook-root button').first()
await button.waitFor({ state: 'visible', timeout: 8000 })
await button.click({ force: true })
await page.waitForTimeout(800)

console.log('[5/6] Full Storybook screenshot (panel + canvas + overlay)')
await page.screenshot({ path: join(OUT, '02-full-inspect.png'), fullPage: false })

console.log('[6/6] Canvas-only screenshot (show overlay)')
const canvasBox = await page.locator('#storybook-preview-iframe').boundingBox()
if (canvasBox) {
  await page.screenshot({
    path: join(OUT, '03-canvas-overlay.png'),
    clip: { x: canvasBox.x, y: canvasBox.y, width: canvasBox.width, height: canvasBox.height },
  })
}

// Panel-only screenshot
const panelSelectors = [
  '#storybook-panel-root',
  '[role="tabpanel"]',
]
for (const sel of panelSelectors) {
  const el = await page.locator(sel).first()
  if (await el.count()) {
    const box = await el.boundingBox()
    if (box && box.width > 100) {
      await page.screenshot({
        path: join(OUT, '04-panel.png'),
        clip: { x: box.x, y: box.y, width: box.width, height: box.height },
      })
      break
    }
  }
}

// Bonus: click a larger element (the whole button) for richer panel demo
console.log('[7/7] Click whole Button — demo CSS + tokens')
const wholeButton = iframe.locator('#storybook-root button').first()
// Element position:  click on the button's outer region (padding area) to select button itself
const bbox = await wholeButton.boundingBox()
if (bbox) {
  // Click on left-padding area where it's unambiguously the button
  await page.mouse.click(bbox.x + 3, bbox.y + bbox.height / 2)
  await page.waitForTimeout(600)
  await page.screenshot({ path: join(OUT, '05-button-inspect.png'), fullPage: false })
  // Panel-only for this state — full height
  for (const sel of panelSelectors) {
    const el = await page.locator(sel).first()
    if (await el.count()) {
      const box = await el.boundingBox()
      if (box && box.width > 100) {
        // Scroll panel content to show CSS sections
        await el.evaluate(n => { n.scrollTop = 0 })
        await page.screenshot({
          path: join(OUT, '06-button-panel.png'),
          clip: { x: box.x, y: box.y, width: box.width, height: box.height },
        })
        // Find our scrollable panel root (the div inside Storybook's panel-root)
        await page.evaluate(() => {
          const panels = document.querySelectorAll('#storybook-panel-root div[style*="overflow"]')
          panels.forEach(p => { p.scrollTop = p.scrollHeight })
        })
        await page.waitForTimeout(200)
        await page.screenshot({
          path: join(OUT, '07-button-panel-css.png'),
          clip: { x: box.x, y: box.y, width: box.width, height: box.height },
        })
        break
      }
    }
  }
}

// ── Stage 5: Sibling distance (Figma-style, 2026-04-25) ──
console.log('[8/8] Sibling distance — navigate to AllVariants(多按鈕同 row)')
const ALL_VARIANTS_STORY =
  '/?path=/story/design-system-components-button-%E5%B1%95%E7%A4%BA--all-variants&viewMode=story'
await page.goto(`${SB}${ALL_VARIANTS_STORY}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

// Re-open devmode panel + Live mode
const tab2 = page.locator('button[role="tab"]:has-text("DS Devmode")').first()
if (await tab2.count()) {
  await tab2.click()
  await page.waitForTimeout(400)
}
await page.locator('button:has-text("Live")').first().click()
await page.waitForTimeout(300)

// Pin first button
const buttons = iframe.locator('#storybook-root button')
const btnCount = await buttons.count()
console.log(`    found ${btnCount} buttons in AllVariants canvas`)
if (btnCount >= 2) {
  const first = buttons.nth(0)
  await first.waitFor({ state: 'visible', timeout: 8000 })
  const firstBox = await first.boundingBox()
  const secondBox = await buttons.nth(1).boundingBox()

  // Click first button → Pin
  if (firstBox) {
    await page.mouse.click(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2)
    await page.waitForTimeout(600)
  }

  // Move mouse over second button → sibling distance should appear
  if (secondBox) {
    await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2)
    await page.waitForTimeout(600)
  }

  // Full page screenshot(含 panel + overlay)
  await page.screenshot({ path: join(OUT, '08-sibling-distance-full.png'), fullPage: false })

  // Canvas-only 截 — 看 overlay 細節
  const canvasBox2 = await page.locator('#storybook-preview-iframe').boundingBox()
  if (canvasBox2) {
    await page.screenshot({
      path: join(OUT, '09-sibling-distance-canvas.png'),
      clip: { x: canvasBox2.x, y: canvasBox2.y, width: canvasBox2.width, height: canvasBox2.height },
    })
  }

  // Hover 3rd button(不同 sibling,驗距離會變)
  if (btnCount >= 3) {
    const thirdBox = await buttons.nth(2).boundingBox()
    if (thirdBox) {
      await page.mouse.move(thirdBox.x + thirdBox.width / 2, thirdBox.y + thirdBox.height / 2)
      await page.waitForTimeout(500)
      const canvasBox3 = await page.locator('#storybook-preview-iframe').boundingBox()
      if (canvasBox3) {
        await page.screenshot({
          path: join(OUT, '10-sibling-distance-canvas-3rd.png'),
          clip: { x: canvasBox3.x, y: canvasBox3.y, width: canvasBox3.width, height: canvasBox3.height },
        })
      }
    }
  }

  console.log('    ✓ sibling distance 截圖完成')
} else {
  console.log('    ✗ AllVariants 按鈕不足 2 個,跳過 sibling 測試')
}

await browser.close()
console.log('Done →', OUT)
