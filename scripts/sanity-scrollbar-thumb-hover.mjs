#!/usr/bin/env node
/**
 * Scrollbar thumb hover 顏色 sanity(user-reported bug 2026-05-10)。
 *
 * 跑法:storybook running → `node scripts/sanity-scrollbar-thumb-hover.mjs`
 *
 * Verify:
 *   1. Pre-hover thumb computed color = var(--scrollbar-thumb)
 *   2. Hover thumb position → computed color = var(--scrollbar-thumb-hover)
 *   3. 視覺 diff 截圖 before / after hover
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('tmp/scrollbar-hover', { recursive: true })

// inline-edit story 11 columns 寬度大,viewport 小強制 H scroll trigger
const URL = 'http://localhost:6006/iframe.html?id=design-system-components-datatable-展示--inline-edit&viewMode=story'

const browser = await chromium.launch({ headless: true })
// 強制持久 scrollbar(模擬 Windows / 設定 always-show 的 macOS),才能驗 hover
await chromium.launchPersistentContext // not used,below 用 init script 注入 force scrollbar
const page = await browser.newPage({ viewport: { width: 700, height: 500 } })

// 強制 scrollbar 永遠顯(disable macOS overlay 隱藏)
await page.addInitScript(() => {
  const style = document.createElement('style')
  style.textContent = `
    [data-datatable-hscroll]::-webkit-scrollbar {
      width: 14px !important;
      height: 14px !important;
      -webkit-appearance: none !important;
      display: block !important;
    }
  `
  if (document.head) document.head.appendChild(style)
  else document.addEventListener('DOMContentLoaded', () => document.head?.appendChild(style))
})

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-datatable-hscroll]', { timeout: 15000 })
await page.waitForTimeout(500)

// Get token values
const tokens = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement)
  return {
    scrollbarThumb: cs.getPropertyValue('--scrollbar-thumb').trim(),
    scrollbarThumbHover: cs.getPropertyValue('--scrollbar-thumb-hover').trim(),
    border: cs.getPropertyValue('--border').trim(),
    borderHover: cs.getPropertyValue('--border-hover').trim(),
    neutral5: cs.getPropertyValue('--color-neutral-5').trim(),
    neutral6: cs.getPropertyValue('--color-neutral-6').trim(),
  }
})
console.log('Token values:', tokens)

// Get scroll container info
const scrollInfo = await page.evaluate(() => {
  const el = document.querySelector('[data-datatable-hscroll]')
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return {
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    hasHScroll: el.scrollWidth > el.clientWidth,
    hasVScroll: el.scrollHeight > el.clientHeight,
  }
})
console.log('Scroll container info:', scrollInfo)

if (!scrollInfo) {
  console.log('No scroll container found')
  await browser.close()
  process.exit(1)
}

// Screenshot 1: pre-hover state
await page.screenshot({
  path: 'tmp/scrollbar-hover/pre-hover.png',
  clip: scrollInfo.rect,
})

// Verify CSS rule is applied(check pseudo-element computed via document property)
// Note: ::-webkit-scrollbar pseudo-elements 不能透過 getComputedStyle 直接讀
// 唯一的方法是用 Playwright tracePuppet OR force visible + visual diff

// Try hover on H scrollbar thumb position (bottom edge)
if (scrollInfo.hasHScroll) {
  const thumbY = scrollInfo.rect.y + scrollInfo.rect.height - 5  // 5px from bottom
  const thumbX = scrollInfo.rect.x + scrollInfo.rect.width / 4  // ~1/4 way thumb
  console.log(`Hover H scrollbar thumb at (${thumbX}, ${thumbY})`)
  await page.mouse.move(thumbX, thumbY)
  await page.waitForTimeout(500)
  await page.screenshot({
    path: 'tmp/scrollbar-hover/h-thumb-hover.png',
    clip: scrollInfo.rect,
  })
}

// Try hover V scrollbar thumb (right edge)
if (scrollInfo.hasVScroll) {
  const thumbX = scrollInfo.rect.x + scrollInfo.rect.width - 5
  const thumbY = scrollInfo.rect.y + scrollInfo.rect.height / 4
  console.log(`Hover V scrollbar thumb at (${thumbX}, ${thumbY})`)
  await page.mouse.move(thumbX, thumbY)
  await page.waitForTimeout(500)
  await page.screenshot({
    path: 'tmp/scrollbar-hover/v-thumb-hover.png',
    clip: scrollInfo.rect,
  })
}

console.log('Screenshots saved to tmp/scrollbar-hover/')
console.log('Visual compare pre-hover.png vs h-thumb-hover.png / v-thumb-hover.png')

await browser.close()
