#!/usr/bin/env node
/**
 * ensure-playwright-browsers — 裝完 node_modules 後自動確保 Chromium binary 已下載。
 * postinstall 呼叫,idempotent(已存在則 skip)。
 *
 * 為什麼放 postinstall:
 *   Playwright npm package 只裝 lib,chromium binary 需另走 `playwright install chromium`。
 *   沒這步 `npm run visual-audit` 會報「Executable doesn't exist」。
 *   postinstall 自動處理,developer `npm install` 一次就 ready。
 *
 * 跳過條件:
 *   - CI 環境且 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1(用戶自管)
 *   - 無 playwright(尚未裝 devDep,第一次 npm install 可能在 postinstall 就執行,但 playwright 已 resolved)
 */

import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import os from 'node:os'
import { join } from 'node:path'

if (process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === '1') {
  console.log('[ensure-playwright-browsers] SKIP via env var')
  process.exit(0)
}

const require_ = createRequire(import.meta.url)
let playwrightPkg
try {
  playwrightPkg = require_('playwright/package.json')
} catch {
  // playwright 還沒裝好(第一次 `npm install` 時 postinstall 可能比 devDep link 早?安全起見 exit 0)
  console.log('[ensure-playwright-browsers] playwright not yet installed — skipping')
  process.exit(0)
}

// Chromium cache path — Playwright 1.x default
// macOS: ~/Library/Caches/ms-playwright/chromium-*
// Linux: ~/.cache/ms-playwright/chromium-*
// Win:   %USERPROFILE%\AppData\Local\ms-playwright\chromium-*
const cacheDir =
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
  (process.platform === 'darwin'
    ? join(os.homedir(), 'Library/Caches/ms-playwright')
    : process.platform === 'win32'
      ? join(process.env.LOCALAPPDATA || '', 'ms-playwright')
      : join(os.homedir(), '.cache/ms-playwright'))

// 粗檢:cache dir 存在且非空 → 視為已裝
if (existsSync(cacheDir)) {
  const { readdirSync } = require_('node:fs')
  const entries = readdirSync(cacheDir).filter((n) => n.startsWith('chromium'))
  if (entries.length > 0) {
    console.log(`[ensure-playwright-browsers] OK (${entries.length} chromium variant in cache)`)
    process.exit(0)
  }
}

console.log(`[ensure-playwright-browsers] 下載 chromium(playwright v${playwrightPkg.version})...`)
const res = spawnSync('npx', ['playwright', 'install', 'chromium'], {
  stdio: 'inherit',
})
process.exit(res.status ?? 1)
