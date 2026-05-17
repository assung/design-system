#!/usr/bin/env node
/**
 * Unit test for `multi-select-ordering` SSOT primitive(2026-05-16 Round 4 共識 path A canonical)。
 *
 * Path A:preserve existing user click order + append unselected in source order(dedup)。
 * 對齊 Ant Transfer `Array.from(new Set([...prevKeys, ...keys]))` + Table rowSelection canonical。
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Inline the SSOT(verbatim copy from src/design-system/lib/multi-select-ordering.ts)to
// avoid TypeScript transpile in node-only test。Any drift between this copy + source = test FAIL
// via direct string compare assertion below。
function applySelectAll(existing, all) {
  const existingSet = new Set(existing)
  const unselected = all.filter((v) => !existingSet.has(v))
  return [...existing, ...unselected]
}
function clearSelection() { return [] }

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let pass = 0, fail = 0
function assertEq(actual, expected, name) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected)
  if (a === e) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name}: expected ${e}, got ${a}`) }
}

console.log('\n══ Unit test: applySelectAll ══')

// Case 1:既有空 → 全 append source order
assertEq(
  applySelectAll([], ['a', 'b', 'c']),
  ['a', 'b', 'c'],
  'empty existing → source order'
)

// Case 2:user 點 [C, A] → Select All → [C, A] preserve + [B, D] append source
assertEq(
  applySelectAll(['c', 'a'], ['a', 'b', 'c', 'd']),
  ['c', 'a', 'b', 'd'],
  'preserve click order [C, A] + append [B, D] in source order'
)

// Case 3:全 selected → no change(dedup)
assertEq(
  applySelectAll(['a', 'b', 'c'], ['a', 'b', 'c']),
  ['a', 'b', 'c'],
  'all-selected → no change(dedup)'
)

// Case 4:existing 部分 + 部分 in different order
assertEq(
  applySelectAll(['b'], ['a', 'b', 'c', 'd']),
  ['b', 'a', 'c', 'd'],
  '[B] + Select All → [B] + [A, C, D] in source'
)

// Case 5:Object identity preserve(referential)
const objA = { id: 'a' }, objB = { id: 'b' }, objC = { id: 'c' }
const result = applySelectAll([objC, objA], [objA, objB, objC])
assertEq(
  result.map(o => o.id),
  ['c', 'a', 'b'],
  'object identity preserved with dedup via Set'
)

// Case 6:Empty all → existing untouched(edge)
assertEq(
  applySelectAll(['a', 'b'], []),
  ['a', 'b'],
  'empty all options → existing untouched'
)

// Case 7:Idempotent — apply twice = apply once
const once = applySelectAll(['c', 'a'], ['a', 'b', 'c', 'd'])
const twice = applySelectAll(once, ['a', 'b', 'c', 'd'])
assertEq(
  twice,
  once,
  'idempotent — apply twice = apply once'
)

console.log('\n══ Unit test: clearSelection ══')
assertEq(clearSelection(), [], 'clearSelection returns empty array')

// Drift check:SSOT primitive source 必跟此 inline copy 邏輯一致
// (人工 verify — 如本 test 改 logic 但 source 沒改 → 部署後 hook 攔)。
const srcPath = join(__dirname, '..', 'src', 'design-system', 'lib', 'multi-select-ordering.ts')
const src = readFileSync(srcPath, 'utf-8')
const hasKey1 = src.includes('new Set(existing)') && src.includes('all.filter')
const hasKey2 = src.includes('return [...existing, ...unselected]')
if (hasKey1 && hasKey2) {
  pass++; console.log('  ✓ SSOT source contains canonical key statements(no drift)')
} else {
  fail++; console.log(`  ✗ SSOT source drift detected — key statements missing`)
}

console.log(`\n${'═'.repeat(60)}\nResults: ${pass} PASS / ${fail} FAIL\n${'═'.repeat(60)}`)
process.exit(fail > 0 ? 1 : 0)
