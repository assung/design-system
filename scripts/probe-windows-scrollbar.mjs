// Probe — Windows-like persistent scrollbar 在 DataTable rounded outer 是否仍溢出
//
// 環境:macOS overlay scrollbar(0px),不能直接看 Windows 17px persistent。
// 策略:Playwright + Chromium + 注入 CSS 強制 17px persistent V+H scrollbar(關 -webkit-appearance: none),
//       模擬 Win/Linux native 視覺,截圖 + 量 bounding rect 偵測溢出。
//
// 跑法:確認 storybook 已啟動 → `node scripts/probe-windows-scrollbar.mjs`
//
// 輸出:
//   - tmp/scrollbar-probe/{story-id}-baseline.png       — DS 原樣(macOS overlay)
//   - tmp/scrollbar-probe/{story-id}-windows-sim.png    — 強制 17px 後
//   - tmp/scrollbar-probe/{story-id}-corner-zoom.png    — 右下角 zoom(scrollbar corner 區)
//   - tmp/scrollbar-probe/report.json                   — 數值報告

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// 預設地端 dev `npm run storybook`(:6006);CI 改 `STORYBOOK_URL=http://localhost:8000` 指 static serve
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006'
const OUT_DIR = resolve('tmp/scrollbar-probe')

// 4 個有 V+H scroll 的 story（涵蓋 type 多樣 / 多 size / pinned / virtual)
const STORIES = [
  { id: 'design-system-components-datatable-展示--column-types', label: 'column-types' },
  { id: 'design-system-components-datatable-展示--all-sizes', label: 'all-sizes' },
  { id: 'design-system-components-datatable-展示--pinned-columns', label: 'pinned-columns' },
  { id: 'design-system-components-datatable-展示--virtual-scroll', label: 'virtual-scroll' },
]

// 注入「Windows 風格」scrollbar CSS（chromium webkit pseudo-elements）
const WIN_SCROLLBAR_CSS = `
  * {
    /* 強制顯持久 17px V/H scrollbar（取消 macOS overlay） */
    scrollbar-width: auto !important;
  }
  *::-webkit-scrollbar {
    width: 17px !important;
    height: 17px !important;
    -webkit-appearance: none !important;
    background: #f0f0f0;
  }
  *::-webkit-scrollbar-thumb {
    background: #888;
  }
  *::-webkit-scrollbar-corner {
    background: #f0f0f0;
  }
`

async function probeStory(page, story) {
  const url = `${STORYBOOK_URL}/iframe.html?id=${story.id}&viewMode=story`
  console.log(`\n── ${story.label} ──`)
  console.log(`url: ${url}`)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1000)

  // 確認 DataTable 渲出來
  const dataTable = await page.$('[data-datatable-hscroll]')
  if (!dataTable) {
    console.log('  ⚠ no [data-datatable-hscroll] found — skip')
    return null
  }

  // baseline (macOS overlay)
  await page.screenshot({ path: resolve(OUT_DIR, `${story.label}-baseline.png`), fullPage: false })

  // 注入 Windows-sim CSS
  await page.addStyleTag({ content: WIN_SCROLLBAR_CSS })
  await page.waitForTimeout(500)
  // 強制 reflow
  await page.evaluate(() => document.body.getBoundingClientRect())

  // 拿關鍵 element rect
  const measurements = await page.evaluate(() => {
    const datatable = document.querySelector('[data-datatable-hscroll]')
    if (!datatable) return null
    const outer = datatable.closest('.rounded-md, [class*="rounded-md"]') || datatable.parentElement
    const dRect = datatable.getBoundingClientRect()
    const oRect = outer.getBoundingClientRect()
    const scrollbarBoxV = {
      // V scrollbar 視覺 box（內 padding-box right edge → outer right edge）
      right: dRect.right,
      bottom: dRect.bottom,
      width: datatable.offsetWidth - datatable.clientWidth,   // V scrollbar 真實寬
      height: datatable.offsetHeight - datatable.clientHeight, // H scrollbar 真實高
    }
    const outerStyles = window.getComputedStyle(outer)
    return {
      datatable: { left: dRect.left, top: dRect.top, right: dRect.right, bottom: dRect.bottom, w: dRect.width, h: dRect.height },
      outer: { left: oRect.left, top: oRect.top, right: oRect.right, bottom: oRect.bottom, w: oRect.width, h: oRect.height, borderRadius: outerStyles.borderRadius, overflow: outerStyles.overflow },
      scrollbar: scrollbarBoxV,
      // 關鍵指標:scrollbar 物理位置是否在 outer rounded corner 之內
      gapToOuterRight: oRect.right - dRect.right,
      gapToOuterBottom: oRect.bottom - dRect.bottom,
    }
  })

  console.log('  measurements:', JSON.stringify(measurements, null, 2))

  // Windows-sim screenshot
  await page.screenshot({ path: resolve(OUT_DIR, `${story.label}-windows-sim.png`), fullPage: false })

  // 右下角 corner zoom(scrollbar corner 區)
  const cornerClip = measurements ? {
    x: Math.max(0, measurements.outer.right - 60),
    y: Math.max(0, measurements.outer.bottom - 60),
    width: 120,
    height: 120,
  } : null
  if (cornerClip) {
    await page.screenshot({ path: resolve(OUT_DIR, `${story.label}-corner-zoom.png`), clip: cornerClip })
  }

  return { story: story.label, ...measurements }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    // 關 macOS Chromium overlay scrollbar → 強制 always-visible 17px persistent bar
    // 模擬 Windows / Linux native(同 Chromium engine,scrollbar 視覺接近 Win)
    args: [
      '--disable-features=OverlayScrollbar',
      '--disable-features=OverlayScrollbars',
      '--enable-features=ForceWebContentsDarkMode=false',
    ],
  })
  // 縮小 viewport(900×600)強迫 column-types(內容寬 ~1400)+ virtual(高 500+) overflow
  // 從而真的看到 V+H scrollbar 一起出現的 corner 區
  const ctx = await browser.newContext({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  const report = []
  for (const story of STORIES) {
    try {
      const r = await probeStory(page, story)
      if (r) report.push(r)
    } catch (e) {
      console.error(`  ✗ ${story.label} error:`, e.message)
    }
  }

  await writeFile(resolve(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`\n✓ probe complete — ${report.length} stories captured`)
  console.log(`output: ${OUT_DIR}/`)

  await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
