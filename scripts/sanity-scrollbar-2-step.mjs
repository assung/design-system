#!/usr/bin/env node
/**
 * 2-step scrollbar hover sanity:抓 idle thumb visible 後再 hover 量 color diff。
 * 對比 Slice D layer enabled vs disabled stories,test hypothesis 5(layer 干擾 scrollbar hover)。
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('tmp/scrollbar-2step', { recursive: true })

const stories = [
  { name: 'inline-edit-default', url: 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit&viewMode=story', layerEnabled: false },
  { name: 'inline-edit-spreadsheet-overlay', url: 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit-with-spreadsheet-overlay&viewMode=story', layerEnabled: true },
]

const browser = await chromium.launch({ headless: true })

for (const story of stories) {
  const page = await browser.newPage({ viewport: { width: 700, height: 500 } })
  await page.goto(story.url, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-datatable-hscroll]', { timeout: 15000 })
  await page.waitForTimeout(500)

  // Trigger scrollbar to be visible (scroll a bit then back)
  await page.evaluate(() => {
    const el = document.querySelector('[data-datatable-hscroll]')
    if (el) {
      el.scrollLeft = 50
      // Force scrollbar always visible via inline style override
      const style = document.createElement('style')
      style.textContent = `
        [data-datatable-hscroll]::-webkit-scrollbar {
          width: 14px !important; height: 14px !important;
          -webkit-appearance: none !important;
        }
      `
      document.head.appendChild(style)
    }
  })
  await page.waitForTimeout(300)

  const rect = await page.evaluate(() => {
    const el = document.querySelector('[data-datatable-hscroll]')
    return el ? el.getBoundingClientRect().toJSON() : null
  })
  if (!rect) continue

  // Step 1: capture WITHOUT hover (mouse 移走 outside) — 量 idle thumb
  await page.mouse.move(0, 0)
  await page.waitForTimeout(300)
  await page.screenshot({
    path: `tmp/scrollbar-2step/${story.name}-step1-idle.png`,
    clip: { x: rect.x, y: rect.y + rect.height - 16, width: rect.width, height: 16 },
  })

  // Step 2: hover thumb — center of thumb area
  const thumbX = rect.x + rect.width * 0.2
  const thumbY = rect.y + rect.height - 7
  await page.mouse.move(thumbX, thumbY)
  await page.waitForTimeout(500)
  await page.screenshot({
    path: `tmp/scrollbar-2step/${story.name}-step2-hover.png`,
    clip: { x: rect.x, y: rect.y + rect.height - 16, width: rect.width, height: 16 },
  })

  console.log(`${story.name} (layer=${story.layerEnabled}): screenshots saved`)
  await page.close()
}

await browser.close()

// Pixel diff each pair
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { readFileSync } from 'fs'

for (const story of stories) {
  const a = PNG.sync.read(readFileSync(`tmp/scrollbar-2step/${story.name}-step1-idle.png`))
  const b = PNG.sync.read(readFileSync(`tmp/scrollbar-2step/${story.name}-step2-hover.png`))
  const diff = new PNG({ width: a.width, height: a.height })
  const pxDiff = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.05 })
  console.log(`${story.name}: idle vs hover pixel diff = ${pxDiff} (${(pxDiff / (a.width * a.height) * 100).toFixed(2)}%)`)
}
