#!/usr/bin/env node
// verify-consumer-css-entry.mjs — 機械保證 consumer CSS 入口完整,防 globals.css「掉東掉西」drift
//
// Why(2026-05-29,user「為何 globals.css 老讓 template 掉東西?怎麼永遠避免?」):
//   consumer(apps + storybook)的 CSS 入口必須含 3 片段才能正確消費 DS,缺任一就 drift:
//     1. `@import 'tailwindcss'`            — Tailwind v4 引擎(缺 → 完全沒 utility class)
//     2. `@import '@qijenchen/design-system/styles/tokens'` — tokens + base 層(缺 → 字體/底色/間距退預設,即字體 drift bug)
//        (base 層 2026-05-29 已併入 tokens aggregator,故單一 import 即拿 tokens+base)
//     3. `@source '...design-system...src...'` — Tailwind scan DS 元件原始碼產對應 utility(缺 → DS 元件 unstyled「沒吃到元件」bug)
//   過去這 3 個都各 drift 過(font / 沒吃到元件)。本 script = 那層缺失的機械保證。
//
// Scan:apps/<app>/src/globals.css + <root>/.storybook/*.css(consumer-facing 入口)。
//   不檢 DS repo 自己的 src/globals.css(它用個別 token import,非 consumer 路徑)。
// 用法:node scripts/verify-consumer-css-entry.mjs(CI / 手動)。fork repo 同 script 自驗。

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// Consumer CSS 入口候選(DS repo + fork repo 通用)。
const candidates = [
  ...globSync('apps/*/src/globals.css', { cwd: ROOT }),
  ...globSync('.storybook/*.css', { cwd: ROOT }),
  // DS repo 內 template scaffold(會 mirror 到 published)
  'template/ds-product-template/.storybook/storybook.css',
].filter((p) => existsSync(join(ROOT, p)))

const REQUIRED = [
  { name: "@import 'tailwindcss'", re: /@import\s+['"]tailwindcss['"]/ },
  { name: "@import '@qijenchen/design-system/styles/tokens'", re: /@import\s+['"]@qijenchen\/design-system\/styles\/tokens['"]/ },
  { name: "@source '...design-system...src...'", re: /@source\s+['"][^'"]*@qijenchen\/design-system\/src/ },
]

let failed = false
for (const rel of candidates) {
  const css = readFileSync(join(ROOT, rel), 'utf8')
  const missing = REQUIRED.filter((r) => !r.re.test(css))
  if (missing.length) {
    failed = true
    console.error(`❌ ${rel} 缺 consumer CSS 必要片段:`)
    for (const m of missing) console.error(`   - ${m.name}`)
  } else {
    console.log(`✓ ${rel}(tailwind + tokens+base + @source 齊全)`)
  }
}

if (candidates.length === 0) {
  console.log('（無 consumer CSS 入口可檢 — 非 consumer repo 或無 apps/storybook）')
  process.exit(0)
}
if (failed) {
  console.error('\n消費端 CSS 入口不完整 → DS 元件會 drift(字體/底色/unstyled)。補齊上述片段。')
  process.exit(1)
}
console.log('\n✅ 所有 consumer CSS 入口完整(tailwind + tokens+base + DS @source）— globals.css drift 防線通過')
