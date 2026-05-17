#!/usr/bin/env node
// audit-data-table-row-mode-ssot.mjs — Per-row state SSOT canonical mechanical enforcement
//
// 2026-05-12 Round 4.5 codify(per user 拍板「下次遇到類似場景可以完美使用」):
//   任何 cell-render wrapper(items-X / row-conditional class)必 consume `effectiveAutoRowForCell`
//   per-row state,**禁** consume global `autoRowHeight` prop。
//
//   為何:`autoRowHeight` 是 table 級 prop;row 可能 per-row 撐高(rowHasAnyError → effectiveAutoRow=true),
//   此時該 row 內所有 cells 該全 top-align,不論 global autoRowHeight 設啥。
//   Round 4 修了 line 1559 non-error wrapper;Round 4.5 補修 line 1512 error-cell flex-col 內部 wrapper
//   (codex M31 dual-track 抓漏)。本 audit script 機械化攔未來再 regress。
//
// 對齊 Material X-DataGrid `getRowHeight` per-row override priority(https://mui.com/x/react-data-grid/row-height/)
// + AG Grid `rowHeight: 'auto'` per-row dynamic — per-row state 永遠 override global table-level prop。
//
// Run: `node scripts/audit-data-table-row-mode-ssot.mjs`

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FILE = join(__dirname, '..', 'src/design-system/components/DataTable/data-table.tsx')

const src = readFileSync(FILE, 'utf8')
const lines = src.split('\n')

// Cell render scope:line 1000 (cellEl start) ~ line 1700 (header before)
// 在此 scope 內 `autoRowHeight ?` 三元式 = cell-level alignment 決策 = 應改 `effectiveAutoRowForCell`
const CELL_RENDER_START = 1000
const CELL_RENDER_END = 1700

// 允許 exception:row outer level(line 2000+)真用 global autoRowHeight 是合法
// 因為 row outer mode 是整 row 設定,不是 cell-level

const violations = []
for (let i = CELL_RENDER_START; i < Math.min(CELL_RENDER_END, lines.length); i++) {
  const ln = i + 1
  const line = lines[i]
  // Detect `autoRowHeight ?` ternary in cell render scope
  if (/\bautoRowHeight\s*\?\s*'/.test(line)) {
    // Allow if explicit @row-mode-global-allow marker on same/prev line
    const prevLine = lines[i - 1] || ''
    if (!/@row-mode-global-allow/.test(line) && !/@row-mode-global-allow/.test(prevLine)) {
      violations.push({ ln, line: line.trim().slice(0, 120) })
    }
  }
}

console.log('=== DataTable per-row state SSOT audit ===\n')
if (violations.length === 0) {
  console.log('✓ No violations — all cell-render wrappers consume per-row state correctly')
  process.exit(0)
} else {
  console.log(`✗ ${violations.length} violation(s) — cell-render scope using global \`autoRowHeight\` instead of \`effectiveAutoRowForCell\`:\n`)
  for (const v of violations) {
    console.log(`  data-table.tsx:${v.ln}`)
    console.log(`    > ${v.line}`)
  }
  console.log(`\n  Fix: replace \`autoRowHeight ?\` with \`effectiveAutoRowForCell ?\`(per-row state SSOT)`)
  console.log(`  Exception: add \`// @row-mode-global-allow: <reason>\` comment on prev or same line if row-outer level真用 global`)
  process.exit(1)
}
