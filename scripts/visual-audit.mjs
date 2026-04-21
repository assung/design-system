#!/usr/bin/env node
/**
 * visual-audit — 全自動視覺稽核(Layer A mechanical + screenshot 給 Layer B /visual-audit skill 用)
 *
 * ── Layer 分工 ──
 * Layer A(本 script,mechanical)
 *   1. 截圖每個關鍵 story(retina PNG,snapshots/*.png)
 *   2. WCAG 對比度掃描:每個 story 找可見文字 / icon 和底色對比,flag AA 不過(< 4.5:1 for text)
 *   3. 幾何 assertion:讀 `scripts/visual-assertions.json` 定義的 DOM 測量 per story
 *      (例:FileViewer toolbar 4 slot 等高 / DatePicker 四邊 12px 對稱 / Calendar cell 等寬)
 *   4. 產出 snapshots/report.json:{ snapshots: [...], contrastViolations: [...], geometryViolations: [...] }
 *
 * Layer B(`/visual-audit` skill,AI judgement)
 *   讀 snapshots/ PNG 做「設計合理性」判斷(箭頭不壓文字 / Badge 位置合理 / typography 選對 level)——
 *   這類 pattern recognition mechanical 做不到。
 *
 * ── 使用 ──
 *   npm run visual-audit               # 自動啟 storybook + 跑 Layer A + 關閉(headless)
 *   npm run visual-audit:headed        # 同上但帶 browser UI(debug)
 *   node scripts/visual-audit.mjs      # 假設 storybook 已在 :6006 跑
 *
 * ── Exit code ──
 *   0 = 無 violation
 *   1 = 有 contrast / geometry violation(CI 可用此 gate commit)
 */

import { chromium } from 'playwright'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const OUT_DIR = join(PROJECT_ROOT, 'snapshots')
const ASSERTIONS_PATH = join(PROJECT_ROOT, 'scripts/visual-assertions.json')
const STORYBOOK_URL = 'http://localhost:6006'

const ARGS = new Set(process.argv.slice(2))
const AUTO_START = ARGS.has('--auto-start')
const HEADED = ARGS.has('--headed')

// ── 主 scenario 清單 ────────────────────────────────────────────────────────
// 先讀 assertions.json 取 scenario,fallback 到 hardcoded
let ASSERTIONS = {}
try {
  const raw = await readFile(ASSERTIONS_PATH, 'utf-8')
  ASSERTIONS = JSON.parse(raw)
} catch {
  console.warn('[visual-audit] scripts/visual-assertions.json 缺失,用內建 fallback')
  ASSERTIONS = {
    scenarios: [
      { id: 'design-system-components-datepicker-展示--basic', file: 'datepicker-basic.png' },
      { id: 'design-system-components-datepicker-展示--range-picker', file: 'datepicker-range.png' },
      { id: 'design-system-components-calendar-展示--團隊行事曆', file: 'calendar-event-team.png' },
      { id: 'design-system-components-timepicker-展示--會議時段', file: 'timepicker-meeting.png' },
      { id: 'design-system-components-fileviewer-展示--default', file: 'fileviewer-default.png' },
      { id: 'design-system-components-rating-展示--default', file: 'rating-default.png' },
      { id: 'design-system-components-coachmark-展示--tipsmultistep', file: 'coachmark-tips.png' },
      { id: 'design-system-components-carousel-展示--default', file: 'carousel-default.png' },
    ],
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function ensureOutDir() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })
}

async function waitForStorybook(url, maxWaitMs = 120_000) {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(url + '/iframe.html')
      if (res.ok) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 1000))
  }
  return false
}

// WCAG 2.1 相對亮度公式
function relativeLuminance([r, g, b]) {
  const channel = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
function contrastRatio(rgb1, rgb2) {
  const L1 = relativeLuminance(rgb1)
  const L2 = relativeLuminance(rgb2)
  const [lighter, darker] = L1 > L2 ? [L1, L2] : [L2, L1]
  return (lighter + 0.05) / (darker + 0.05)
}
function parseRgb(str) {
  const m = /rgba?\(([^)]+)\)/.exec(str)
  if (!m) return null
  const parts = m[1].split(',').map((s) => parseFloat(s.trim()))
  if (parts.length < 3) return null
  return [parts[0], parts[1], parts[2]]
}

// ── Contrast scan:在 page 內跑,抓所有可見文字 node ────────────────────────

async function scanContrast(page) {
  // Page-side:蒐集所有文字節點的 computedStyle + 父層 bg(往上爬到第一個非透明 bg)
  const samples = await page.evaluate(() => {
    /** @type {{text:string,color:string,bg:string,fontSize:number,fontWeight:number,selector:string}[]} */
    const out = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null)
    while (walker.nextNode()) {
      const node = walker.currentNode
      const text = node.textContent?.trim()
      if (!text || text.length === 0) continue
      const parent = node.parentElement
      if (!parent) continue
      const style = getComputedStyle(parent)
      // find effective background(走 DOM parent 至第一個非透明)
      let bgEl = parent
      let bg = ''
      while (bgEl) {
        const bgStyle = getComputedStyle(bgEl)
        if (bgStyle.backgroundColor && bgStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && bgStyle.backgroundColor !== 'transparent') {
          bg = bgStyle.backgroundColor
          break
        }
        bgEl = bgEl.parentElement
      }
      if (!bg) bg = 'rgb(255,255,255)' // default canvas white
      // Skip hidden
      const rect = parent.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) continue
      const selPath = (() => {
        let s = parent.tagName.toLowerCase()
        if (parent.id) s += '#' + parent.id
        const cls = (parent.className || '').toString().split(' ').filter(Boolean).slice(0, 2).join('.')
        if (cls) s += '.' + cls
        return s
      })()
      out.push({
        text: text.slice(0, 40),
        color: style.color,
        bg,
        fontSize: parseFloat(style.fontSize),
        fontWeight: parseInt(style.fontWeight, 10) || 400,
        selector: selPath,
      })
    }
    return out
  })

  const violations = []
  for (const s of samples) {
    const fg = parseRgb(s.color)
    const bg = parseRgb(s.bg)
    if (!fg || !bg) continue
    const ratio = contrastRatio(fg, bg)
    // WCAG AA:regular text >= 4.5;large text (>= 18px or >= 14px bold) >= 3.0
    const large = s.fontSize >= 18 || (s.fontSize >= 14 && s.fontWeight >= 700)
    const threshold = large ? 3.0 : 4.5
    if (ratio < threshold) {
      violations.push({
        text: s.text,
        fg: s.color,
        bg: s.bg,
        ratio: Math.round(ratio * 100) / 100,
        threshold,
        fontSize: s.fontSize,
        selector: s.selector,
      })
    }
  }
  return { sampled: samples.length, violations }
}

// ── Geometry assertions ──────────────────────────────────────────────────────

async function runGeometryAssertions(page, assertions) {
  if (!assertions || assertions.length === 0) return []
  const violations = []
  for (const a of assertions) {
    try {
      if (a.type === 'equalHeight') {
        const heights = await page.$$eval(a.selector, (els) => els.map((el) => el.getBoundingClientRect().height))
        if (heights.length === 0) continue
        const first = heights[0]
        const mismatch = heights.filter((h) => Math.abs(h - first) > 0.5)
        if (mismatch.length > 0) {
          violations.push({
            assertion: a.name,
            type: 'equalHeight',
            expected: first,
            actual: heights,
            selector: a.selector,
          })
        }
      } else if (a.type === 'padding4Sided') {
        const padding = await page.$eval(a.selector, (el) => {
          const s = getComputedStyle(el)
          return {
            top: parseFloat(s.paddingTop),
            right: parseFloat(s.paddingRight),
            bottom: parseFloat(s.paddingBottom),
            left: parseFloat(s.paddingLeft),
          }
        })
        const vals = Object.values(padding)
        const first = vals[0]
        const mismatch = vals.some((v) => Math.abs(v - first) > 0.5)
        if (mismatch) {
          violations.push({
            assertion: a.name,
            type: 'padding4Sided',
            expected: `all = ${a.expected ?? first}`,
            actual: padding,
            selector: a.selector,
          })
        } else if (a.expected !== undefined && Math.abs(first - a.expected) > 0.5) {
          violations.push({
            assertion: a.name,
            type: 'padding4Sided',
            expected: a.expected,
            actual: first,
            selector: a.selector,
          })
        }
      } else if (a.type === 'gap') {
        const gap = await page.$eval(a.selector, (el) => parseFloat(getComputedStyle(el).gap) || 0)
        if (Math.abs(gap - a.expected) > 0.5) {
          violations.push({
            assertion: a.name,
            type: 'gap',
            expected: a.expected,
            actual: gap,
            selector: a.selector,
          })
        }
      }
    } catch (err) {
      // selector not found — 跳過不算 violation(story 可能沒 render 該元素)
    }
  }
  return violations
}

// ── Main ────────────────────────────────────────────────────────────────────

async function auditScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()
  const url = `${STORYBOOK_URL}/iframe.html?id=${scenario.id}&viewMode=story`

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })
    await page.waitForTimeout(600) // animations + font settle
    await page.screenshot({
      path: join(OUT_DIR, scenario.file),
      fullPage: false,
    })

    const contrast = await scanContrast(page)
    const geometry = await runGeometryAssertions(page, scenario.assertions)

    return {
      id: scenario.id,
      file: scenario.file,
      contrast,
      geometryViolations: geometry,
    }
  } catch (err) {
    return { id: scenario.id, file: scenario.file, error: err.message }
  } finally {
    await context.close()
  }
}

async function main() {
  await ensureOutDir()

  let storybookProc = null
  if (AUTO_START) {
    console.log('[visual-audit] 啟動 storybook...')
    storybookProc = spawn('npm', ['run', 'storybook', '--', '--ci', '--quiet'], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    storybookProc.stdout.on('data', () => {})
    storybookProc.stderr.on('data', () => {})

    const ready = await waitForStorybook(STORYBOOK_URL, 180_000)
    if (!ready) {
      console.error('[visual-audit] storybook 120s 未就緒')
      storybookProc.kill()
      process.exit(1)
    }
    console.log('[visual-audit] storybook 就緒')
  } else {
    const ready = await waitForStorybook(STORYBOOK_URL, 5_000)
    if (!ready) {
      console.error(`[visual-audit] storybook 未跑(${STORYBOOK_URL})。加 --auto-start 或先 npm run storybook`)
      process.exit(1)
    }
  }

  const browser = await chromium.launch({ headless: !HEADED })
  const results = []
  let totalContrastViolations = 0
  let totalGeometryViolations = 0

  for (const scenario of ASSERTIONS.scenarios) {
    console.log(`[visual-audit] 稽核 ${scenario.id}`)
    const r = await auditScenario(browser, scenario)
    results.push(r)
    if (r.contrast?.violations?.length) totalContrastViolations += r.contrast.violations.length
    if (r.geometryViolations?.length) totalGeometryViolations += r.geometryViolations.length
    if (r.error) console.error(`  ✗ ${r.error}`)
  }

  await browser.close()
  if (storybookProc) storybookProc.kill()

  const report = {
    generatedAt: new Date().toISOString(),
    totalContrastViolations,
    totalGeometryViolations,
    scenarios: results,
  }
  await writeFile(join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))

  console.log(`\n[visual-audit] 完成`)
  console.log(`  Contrast violations: ${totalContrastViolations}`)
  console.log(`  Geometry violations: ${totalGeometryViolations}`)
  console.log(`  Report: ${join(OUT_DIR, 'report.json')}`)
  console.log(`  Screenshots: ${OUT_DIR}/*.png`)
  console.log(`\n[Layer B:invoke /visual-audit 讀 snapshots/ 做 AI 設計合理性判斷]`)

  process.exit(totalContrastViolations > 0 || totalGeometryViolations > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
