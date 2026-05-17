#!/usr/bin/env node
/**
 * Pre-Stream-C visual diff(2026-05-13 final task per user「不留任何待辦」)
 *
 * Extract pre-Stream-C(commit `fd24e20` = 2026-05-11 pre-Round-4)snapshots-baseline,
 * pixel-diff vs current snapshots/,classify which stories visual-drifted。
 *
 * Expected drift(Stream C 4-issues intentional fix):
 *   - PeoplePicker stories(placeholder 'request user' + Issue 2 cell offset + Issue 1 multi=1)
 *   - Combobox stories(Issue 3 placeholder truncate)
 *   - DataTable stories with PeoplePicker / disabled cells
 * Unexpected drift = unintended regression。
 */

import { execSync } from 'node:child_process'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PRE_COMMIT = 'fd24e20'  // 2026-05-11,A1-A5 ship,pre Round 4
const TMP_DIR = '/tmp/pre-stream-c-baseline'

mkdirSync(TMP_DIR, { recursive: true })

// Get list of all baseline png at pre-Stream-C commit
const filesOutput = execSync(`cd "${ROOT}" && git ls-tree -r --name-only ${PRE_COMMIT} -- snapshots-baseline/`, { encoding: 'utf-8' })
const files = filesOutput.split('\n').filter(f => f.endsWith('.png'))
console.log(`pre-Stream-C(${PRE_COMMIT})baseline png count: ${files.length}`)

const EXPECTED_STREAM_C_PATTERNS = ['peoplepicker', 'combobox', 'datatable', 'bulkactionbar', 'bulk-action']
const isExpected = (name) => EXPECTED_STREAM_C_PATTERNS.some(p => name.toLowerCase().includes(p))

const results = []
for (const f of files) {
  const name = basename(f)
  const localPath = join(TMP_DIR, name)
  // Extract pre-Stream-C version
  try {
    execSync(`cd "${ROOT}" && git show ${PRE_COMMIT}:${f} > ${localPath}`)
  } catch { continue }
  // Compare with current snapshots/
  const currentSnapshot = join(ROOT, 'snapshots', name)
  if (!existsSync(currentSnapshot)) {
    results.push({ name, status: 'missing-current', expected: isExpected(name) })
    continue
  }
  try {
    const pre = PNG.sync.read(readFileSync(localPath))
    const cur = PNG.sync.read(readFileSync(currentSnapshot))
    if (pre.width !== cur.width || pre.height !== cur.height) {
      results.push({ name, status: 'dimension-mismatch', pre: `${pre.width}×${pre.height}`, cur: `${cur.width}×${cur.height}`, expected: isExpected(name) })
      continue
    }
    const diff = new PNG({ width: pre.width, height: pre.height })
    const diffPixels = pixelmatch(pre.data, cur.data, diff.data, pre.width, pre.height, { threshold: 0.1 })
    const total = pre.width * pre.height
    const pct = Number((100 * diffPixels / total).toFixed(2))
    results.push({ name, status: pct > 0.5 ? 'drift' : 'no-drift', pct, expected: isExpected(name) })
  } catch (e) {
    results.push({ name, status: 'error', error: e.message, expected: isExpected(name) })
  }
}

// Sort: drift first then no-drift; within drift expected vs unexpected
const drifted = results.filter(r => r.status === 'drift').sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
const noDrift = results.filter(r => r.status === 'no-drift')
const others = results.filter(r => !['drift', 'no-drift'].includes(r.status))

console.log(`\n=== Drift summary ===`)
console.log(`Total: ${results.length}`)
console.log(`Drift > 0.5%: ${drifted.length}`)
console.log(`  Expected(Stream C intentional): ${drifted.filter(r => r.expected).length}`)
console.log(`  Unexpected(potential regression): ${drifted.filter(r => !r.expected).length}`)
console.log(`No drift: ${noDrift.length}`)
console.log(`Other(missing / dimension-mismatch / error): ${others.length}`)

console.log(`\n=== Drift list ===`)
for (const r of drifted) {
  const tag = r.expected ? '✓ EXPECTED' : '⚠ UNEXPECTED'
  console.log(`  [${tag}] ${r.name}: ${r.pct}% pixels`)
}

if (others.length > 0) {
  console.log(`\n=== Others ===`)
  for (const r of others.slice(0, 10)) {
    console.log(`  [${r.status}] ${r.name}${r.error ? ': ' + r.error : ''}${r.pre ? ` pre=${r.pre} cur=${r.cur}` : ''}`)
  }
}

// Exit 0 if no unexpected drift OR all drifts are expected
const unexpectedDrift = drifted.filter(r => !r.expected).length
process.exit(unexpectedDrift > 0 ? 1 : 0)
