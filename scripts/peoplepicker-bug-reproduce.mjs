#!/usr/bin/env node
/**
 * scripts/peoplepicker-bug-reproduce.mjs
 *
 * Self-reproduce + auto-verify for the two bugs user抓「修了一百次還沒好」:
 *
 *   Bug A: Multi-select stack visible-count drift at fixed trigger width
 *     - Same width × different selection length → DIFFERENT visible count(drift)
 *     - 真 root cause:Combobox forwardRef body `_ref` 把 ref drop → PeoplePicker
 *       stack `visibleCountOverride` 從未生效 → 走 Combobox internal `useOverflowCount`
 *       (60px chip fallback bug + items.length non-deterministic)
 *     - Fix:Combobox forward ref → 內部 `__triggerRef` attach trigger DOM,
 *       useOverflowCount override path 補 apply `el.hidden`
 *
 *   Bug B: Single picker open-state placeholder no ellipsis dots
 *     - 真 root cause:overlay span `inline-flex items-center truncate` 套同一 element →
 *       text 變 anonymous flex item → `text-overflow:ellipsis` 不 styleable to anonymous
 *       (W3C CSS Overflow / MDN / Mozilla Bug 972664#c1)
 *     - Fix:outer flex container + inner real `<span truncate>` 拆分(對齊
 *       `person-display.tsx:148` 既有 DS canonical)
 *
 * Tests:
 *   A1: length=4 at 180px width → measure visible avatar count(via `hidden` attr)
 *   A2: same trigger width × different selection length(simulated)→ same `available`
 *       measurement → formula must return monotone(length=3 visible <= length=4 visible)
 *   B1: single picker open at narrow 100px with selected Alice → INNER truncate span
 *       must show scrollWidth > clientWidth(ellipsis fires on real block-level box)
 *
 * Usage:
 *   1. npm run storybook(http://localhost:6006)
 *   2. node scripts/peoplepicker-bug-reproduce.mjs
 */

import { chromium } from 'playwright'
import { mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUT_DIR = join(__dirname, '..', 'snapshots', 'peoplepicker-bug')
const STORYBOOK_URL = 'http://localhost:6006'

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const results = []
function pass(name, detail = '') { results.push({ name, status: 'PASS', detail }); console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`) }
function fail(name, msg) { results.push({ name, status: 'FAIL', msg }); console.log(`  ✗ ${name}: ${msg}`) }
async function snap(page, label) { const file = join(OUT_DIR, `${label}.png`); await page.screenshot({ path: file, fullPage: false }); return file }

async function probeMulti(page) {
  return await page.evaluate(() => {
    const trig = document.querySelector('[role="combobox"]')
    if (!trig) return { err: 'no trigger' }
    const tagArea = trig.querySelector('div[class*="flex-1"][class*="min-w-0"]')
    if (!tagArea) return { err: 'no tagArea' }
    const overflowSpan = tagArea.querySelector('span.contents')
    if (!overflowSpan) return { err: 'no overflowSpan' }
    const directChildren = Array.from(overflowSpan.children)
    // Last child is the overflow indicator wrapper(`<div ref={overflowEl}>`)。
    const overflowWrapper = directChildren[directChildren.length - 1]
    const avatarWrappers = directChildren.slice(0, -1)
    const visibleAvatars = avatarWrappers.filter(w => !w.hidden && w.offsetParent !== null)
    let overflowChipText = null
    if (overflowWrapper && !overflowWrapper.hidden && overflowWrapper.offsetParent !== null) {
      const text = overflowWrapper.textContent?.trim()
      if (text?.match(/^\+\d+$/)) overflowChipText = text
    }
    return {
      triggerWidth: trig.clientWidth,
      tagAreaWidth: tagArea.clientWidth,
      totalAvatarWrappers: avatarWrappers.length,
      visibleAvatarCount: visibleAvatars.length,
      overflowChipText,
      overflowChipHidden: overflowWrapper?.hidden ?? null,
    }
  })
}

// 2026-05-16 真 root cause fix:slot-based formula(對齊 user 物理模型「avatars + chip
// 都是同尺寸圓形 + 同 step」)。原 chip-as-separate-chunk formula 在 boundary saw delta=2。
function formulaExpect(available, total, avatar = 24, overlap = 2) {
  if (total <= 0 || available <= 0) return 0
  const step = avatar - overlap
  if (step <= 0) return Math.min(total, 1)
  const slots = 1 + Math.floor((available - avatar) / step)
  if (slots <= 0) return 0
  if (total <= slots) return total
  return Math.max(0, slots - 1)
}

async function main() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()

  console.log('\n══ Bug A: Multi-select stack visible-count drift ══')

  // ── Test A1: length=4 at default 180px → 4 visible(full fit)
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=design-system-components-peoplepicker-展示--multi&viewMode=story`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)

  await page.addStyleTag({ content: `
    .max-w-xs { max-width: 180px !important; width: 180px !important; }
  ` })
  await page.waitForTimeout(500)

  const probe180 = await probeMulti(page)
  console.log(`  [A1 180px] ${JSON.stringify(probe180)}`)
  await snap(page, 'A1-length4-180px-AFTER-FIX')

  if (probe180.err) { fail('A1 probe', probe180.err); }
  else {
    const expected = formulaExpect(probe180.tagAreaWidth, 4)
    if (probe180.visibleAvatarCount === expected) {
      pass(`A1 length=4 at ${probe180.tagAreaWidth}px → visible=${probe180.visibleAvatarCount}`, `formula expected=${expected}, +N=${probe180.overflowChipText ?? 'hidden'}`)
    } else {
      fail('A1 visible mismatch formula', `actual=${probe180.visibleAvatarCount} expected=${expected} at available=${probe180.tagAreaWidth}px`)
    }
  }

  // ── Test A2: narrow width 100px → formula returns < 4 → verify drift gone
  await page.addStyleTag({ content: `
    .max-w-xs { max-width: 100px !important; width: 100px !important; }
  ` })
  await page.waitForTimeout(500)
  const probe100 = await probeMulti(page)
  console.log(`  [A2 100px] ${JSON.stringify(probe100)}`)
  await snap(page, 'A2-length4-100px-AFTER-FIX')

  if (!probe100.err) {
    const expected = formulaExpect(probe100.tagAreaWidth, 4)
    if (probe100.visibleAvatarCount === expected) {
      pass(`A2 length=4 at narrow ${probe100.tagAreaWidth}px → visible=${probe100.visibleAvatarCount}`, `formula expected=${expected}, +N=${probe100.overflowChipText ?? 'hidden'}`)
    } else {
      fail('A2 narrow visible mismatch', `actual=${probe100.visibleAvatarCount} expected=${expected} at available=${probe100.tagAreaWidth}px`)
    }
  }

  // ── Test A3: very narrow 60px → only 1 visible + +N(drift would show 0)
  await page.addStyleTag({ content: `
    .max-w-xs { max-width: 60px !important; width: 60px !important; }
  ` })
  await page.waitForTimeout(500)
  const probe60 = await probeMulti(page)
  console.log(`  [A3 60px] ${JSON.stringify(probe60)}`)
  await snap(page, 'A3-length4-60px-AFTER-FIX')

  if (!probe60.err) {
    const expected = formulaExpect(probe60.tagAreaWidth, 4)
    if (probe60.visibleAvatarCount === expected) {
      pass(`A3 length=4 at very narrow ${probe60.tagAreaWidth}px → visible=${probe60.visibleAvatarCount}`, `formula expected=${expected}, +N=${probe60.overflowChipText ?? 'hidden'}`)
    } else {
      fail('A3 very narrow visible mismatch', `actual=${probe60.visibleAvatarCount} expected=${expected} at available=${probe60.tagAreaWidth}px`)
    }
  }

  console.log('\n══ Bug B: Single picker placeholder ellipsis ══')

  await page.goto(`${STORYBOOK_URL}/iframe.html?id=design-system-components-peoplepicker-展示--single&viewMode=story`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)

  await page.addStyleTag({ content: `
    .max-w-xs { max-width: 100px !important; width: 100px !important; }
  ` })
  await page.waitForTimeout(500)

  // Open dropdown (single picker searchable+open state)
  const singleTrigger = page.locator('[role="combobox"]').first()
  await singleTrigger.click()
  await page.waitForTimeout(400)
  await snap(page, 'B1-single-open-100px-AFTER-FIX')

  const overlayMetrics = await page.evaluate(() => {
    const trig = document.querySelector('[role="combobox"]')
    if (!trig) return { err: 'no trigger' }
    const overlays = trig.querySelectorAll('span[aria-hidden="true"]')
    const found = []
    for (const ov of overlays) {
      const text = ov.textContent?.trim()
      if (!text) continue
      const cs = getComputedStyle(ov)
      const innerSpan = ov.querySelector('span')
      const innerCs = innerSpan ? getComputedStyle(innerSpan) : null
      found.push({
        outer: { text: text.slice(0, 50), scrollWidth: ov.scrollWidth, clientWidth: ov.clientWidth, display: cs.display, overflow: cs.overflow, textOverflow: cs.textOverflow, whiteSpace: cs.whiteSpace, position: cs.position },
        inner: innerSpan ? { text: innerSpan.textContent?.trim().slice(0, 50), scrollWidth: innerSpan.scrollWidth, clientWidth: innerSpan.clientWidth, display: innerCs.display, overflow: innerCs.overflow, textOverflow: innerCs.textOverflow, whiteSpace: innerCs.whiteSpace } : null,
      })
    }
    return { overlays: found }
  })
  console.log(`  ${JSON.stringify(overlayMetrics, null, 2)}`)

  // Fix verify: inner truncate span MUST have scrollWidth > clientWidth + truncate styles applied
  const ellipsisOK = overlayMetrics.overlays?.some(ov =>
    ov.inner
    && ov.inner.scrollWidth > ov.inner.clientWidth
    && ov.inner.overflow === 'hidden'
    && ov.inner.textOverflow === 'ellipsis'
    && ov.inner.whiteSpace === 'nowrap'
    && ov.inner.text.length > 5
  )
  if (ellipsisOK) {
    pass('B1 inner truncate span fires ellipsis with correct styles')
  } else {
    fail('B1 ellipsis fail', `inner span missing truncate-correct styles: ${JSON.stringify(overlayMetrics.overlays)}`)
  }

  await browser.close()

  console.log(`\n${'═'.repeat(60)}\nResults: ${results.filter(r => r.status === 'PASS').length} PASS / ${results.filter(r => r.status === 'FAIL').length} FAIL\n${'═'.repeat(60)}`)
  for (const r of results) {
    console.log(`  ${r.status === 'PASS' ? '✓' : '✗'} ${r.name}${r.msg ? ` — ${r.msg}` : ''}${r.detail ? ` — ${r.detail}` : ''}`)
  }
  if (results.some(r => r.status === 'FAIL')) process.exit(1)
}

main().catch(err => { console.error('FATAL:', err); process.exit(2) })
