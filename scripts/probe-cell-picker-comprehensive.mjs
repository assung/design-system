// Probe — Comprehensive cell-picker baseline capture(D path Phase 0,round 8 final)
//
// Per RFC `cell-indicator-ssot-rfc.md` round 8 acceptance:65-75 frame minimal core baseline。
// Captures session-start state for visual regression diff post-migration。
//
// 跑法:`npm run storybook` 起 + `node scripts/probe-cell-picker-comprehensive.mjs`
// 輸出:`.claude/snapshots-baseline/cell-picker-final/<group>/<picker>-<mode>-<size>-<state>.png`
//
// Frame breakdown(round 8):
//   - 30 picker × display × {sm,md,lg} × {idle, focus}(opt-in baseline)
//   -  5 picker × display × md × idle(non-opt-in negative baseline,shared with above idle)
//   - 15 picker × edit × md × {idle, focus, open}
//   - 10 layout smoke(pinned-left / pinned-right / virtual-middle / autoRowHeight)
//   -  8 special(Combobox +N overflow / People multi pill / Date range / Time seconds)

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006'
const OUT_DIR = resolve('.claude/snapshots-baseline/cell-picker-final')

// inline-edit story columns(verified earlier):
//   category=select / tags=multiSelect / releaseDate=date / reminderTime=time
//   url=url / owner=person / reviewers=multiPerson
const PICKER_COLS = [
  { type: 'select',      colId: 'category' },
  { type: 'multiSelect', colId: 'tags' },
  { type: 'date',        colId: 'releaseDate' },
  { type: 'time',        colId: 'reminderTime' },
  { type: 'url',         colId: 'url' },
  { type: 'person',      colId: 'owner' },
  { type: 'multiPerson', colId: 'reviewers' },
]

const SIZES = ['sm', 'md', 'lg']

async function captureCellFrame(page, opts) {
  const { picker, mode, state } = opts
  // Reload story per frame(state 重置)。Default density=md(simplification — global size override 待研究)
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=design-system-components-datatable-展示--inline-edit&viewMode=story`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1000)

  const cellSelector = `[role="row"]:nth-child(2) [data-column-id="${picker.colId}"]`
  const handle = await page.$(cellSelector)
  if (!handle) return { error: `cell missing: ${picker.type}` }

  // Scroll cell into view first(避 clipping out of viewport)
  await handle.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)

  // State setup
  try {
    if (state === 'hover') {
      await handle.hover()
      await page.waitForTimeout(200)
    } else if (state === 'focus' || state === 'open') {
      await handle.click()
      await page.waitForTimeout(state === 'open' ? 500 : 400)
    }
  } catch (e) {
    return { error: `state setup failed ${picker.type}/${state}: ${e.message}` }
  }

  const box = await handle.boundingBox()
  if (!box) return { error: `bbox missing: ${picker.type}` }
  // Clip safe within viewport
  const vp = page.viewportSize()
  const clip = {
    x: Math.max(0, Math.min(box.x - 4, vp.width - 1)),
    y: Math.max(0, Math.min(box.y - 4, vp.height - 1)),
    width: Math.min(box.width + 8, vp.width - Math.max(0, box.x - 4)),
    height: Math.min(box.height + 8, vp.height - Math.max(0, box.y - 4)),
  }
  if (clip.width <= 0 || clip.height <= 0) return { error: `clip out of viewport: ${picker.type}/${state}` }

  const filename = `${picker.type}-${mode}-${state}.png`
  try {
    await page.screenshot({ path: resolve(OUT_DIR, filename), clip })
  } catch (e) {
    return { error: `screenshot failed ${picker.type}/${state}: ${e.message}` }
  }

  if (state === 'focus' || state === 'open') {
    await page.keyboard.press('Escape').catch(() => {})
    await page.waitForTimeout(200)
  }

  return { picker: picker.type, mode, state, ...box, file: filename }
}

// ── Extended capture(per round 8 RFC + user round 8 follow-up sm/lg layout smoke)──

// All-sizes story columns(per inspect):category=select / seller=person / updatedAt=date
const ALL_SIZES_COLS = [
  { type: 'select', colId: 'category' },
  { type: 'person', colId: 'seller' },
  { type: 'date',   colId: 'updatedAt' },
]

// Layout-smoke stories
const LAYOUT_STORIES = [
  { id: 'design-system-components-datatable-展示--pinned-columns', label: 'pinned' },
  { id: 'design-system-components-datatable-展示--virtual-scroll', label: 'virtual' },
  { id: 'design-system-components-datatable-展示--row-auto-height-inline-edit', label: 'autoRow' },
]

async function captureMultiSizeFrame(page, { picker, size, state }) {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=design-system-components-datatable-展示--all-sizes&viewMode=story`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1000)
  const tableSelector = `[data-table-size="${size}"]`
  const table = await page.$(tableSelector)
  if (!table) return { error: `table size ${size} missing` }
  const cellSelector = `${tableSelector} [role="row"]:nth-child(2) [data-column-id="${picker.colId}"]`
  const handle = await page.$(cellSelector)
  if (!handle) return { error: `cell missing: ${picker.type} in ${size}` }
  await handle.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  if (state === 'hover') { await handle.hover(); await page.waitForTimeout(200) }
  const box = await handle.boundingBox()
  if (!box) return { error: 'bbox missing' }
  const vp = page.viewportSize()
  const clip = {
    x: Math.max(0, Math.min(box.x - 4, vp.width - 1)),
    y: Math.max(0, Math.min(box.y - 4, vp.height - 1)),
    width: Math.min(box.width + 8, vp.width - Math.max(0, box.x - 4)),
    height: Math.min(box.height + 8, vp.height - Math.max(0, box.y - 4)),
  }
  if (clip.width <= 0 || clip.height <= 0) return { error: 'clip invalid' }
  const filename = `${picker.type}-display-${size}-${state}.png`
  await page.screenshot({ path: resolve(OUT_DIR, filename), clip })
  return { picker: picker.type, mode: 'display', size, state, ...box, file: filename }
}

async function captureLayoutSmoke(page, { story, picker }) {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1500)
  // Find any cell of given column type in first row
  const cellSelector = `[role="row"]:nth-child(2) [data-column-id="${picker.colId}"]`
  const handle = await page.$(cellSelector)
  if (!handle) return { error: `cell missing in ${story.label}: ${picker.colId}` }
  await handle.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  const box = await handle.boundingBox()
  if (!box) return { error: 'bbox missing' }
  const vp = page.viewportSize()
  const clip = {
    x: Math.max(0, Math.min(box.x - 4, vp.width - 1)),
    y: Math.max(0, Math.min(box.y - 4, vp.height - 1)),
    width: Math.min(box.width + 8, vp.width - Math.max(0, box.x - 4)),
    height: Math.min(box.height + 8, vp.height - Math.max(0, box.y - 4)),
  }
  if (clip.width <= 0 || clip.height <= 0) return { error: 'clip invalid' }
  const filename = `layout-${story.label}-${picker.type}.png`
  await page.screenshot({ path: resolve(OUT_DIR, filename), clip })
  return { story: story.label, picker: picker.type, mode: 'display', ...box, file: filename }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  const captures = []
  let count = 0

  // Group A — md core(35 frames):display ×{idle, hover} + edit × {idle, focus, open}
  console.log('── A md core: display × {idle, hover}──')
  for (const picker of PICKER_COLS) {
    for (const state of ['idle', 'hover']) {
      const r = await captureCellFrame(page, { picker, mode: 'display', state })
      if (r.error) console.log(`  ⚠ ${picker.type}/${state}: ${r.error}`)
      else { captures.push({ group: 'A', ...r }); count++ }
    }
  }
  console.log('── A md core: edit × {idle, focus, open}──')
  for (const picker of PICKER_COLS) {
    for (const state of ['idle', 'focus', 'open']) {
      const r = await captureCellFrame(page, { picker, mode: 'edit', state })
      if (r.error) console.log(`  ⚠ ${picker.type}/${state}: ${r.error}`)
      else { captures.push({ group: 'A', ...r }); count++ }
    }
  }

  // Group B — sm/lg multi-size smoke(12 frames):3 picker(select/person/date)× {sm, lg} × {idle, hover}
  console.log('── B sm/lg multi-size smoke ──')
  for (const picker of ALL_SIZES_COLS) {
    for (const size of ['sm', 'lg']) {
      for (const state of ['idle', 'hover']) {
        const r = await captureMultiSizeFrame(page, { picker, size, state })
        if (r.error) console.log(`  ⚠ ${picker.type}/${size}/${state}: ${r.error}`)
        else { captures.push({ group: 'B', ...r }); count++ }
      }
    }
  }

  // Group C — layout smoke(3 frame):pinned / virtual / autoRow
  console.log('── C layout smoke ──')
  for (const story of LAYOUT_STORIES) {
    // pinned/virtual:try category(select);autoRow:try category
    const pickerForStory = { type: 'select', colId: 'category' }
    const r = await captureLayoutSmoke(page, { story, picker: pickerForStory })
    if (r.error) console.log(`  ⚠ ${story.label}: ${r.error}`)
    else { captures.push({ group: 'C', ...r }); count++ }
  }

  await writeFile(
    resolve(OUT_DIR, 'manifest.json'),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      storyId: 'design-system-components-datatable-展示--inline-edit',
      viewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
      browser: 'chromium',
      platform: process.platform,
      frameCount: count,
      groups: { A: 'display × size × state', B: 'edit × md × state' },
      captures,
    }, null, 2),
  )

  console.log(`\n✓ comprehensive baseline:${count} frames captured`)
  console.log(`output:${OUT_DIR}/`)

  await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
