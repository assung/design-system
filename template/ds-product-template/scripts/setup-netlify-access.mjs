#!/usr/bin/env node
// scripts/setup-netlify-access.mjs — fork-and-go Netlify setup automation
//
// 2026-05-29 重寫:flip default from Identity → Basic Password。
//
// Why Identity removed:
//   - Netlify 2024 公告 Identity service deprecated;新帳號可能看不到 Identity menu
//   - `netlify api provisionSiteIdentity` 在新 site 已不穩定 / 不可用
//   - Team protection (proper SSO) 鎖 Pro plan $19/mo,fork user 不該被迫付費
//   - Free-tier 唯一真擋陌生人方法 = Basic Password protection
//
// What's automated:
//   1. Install Netlify CLI(若未裝)
//   2. `gh auth status` pre-check
//   3. `netlify login`(瀏覽器 OAuth)
//   4. Auto `netlify sites:create` + `netlify link`(non-interactive)
//
// What's NOT automatable(Netlify CLI 不提供 password protection API,2026-05-29 verified):
//   5. 設 Basic Password — script 印 dashboard URL + step-by-step,user 點 2 radio button + 輸 password
//   6. 分享 password 給 stakeholder — team Slack / DM 私訊
//
// Usage:
//   npm run setup:netlify
//   npm run setup:netlify -- --skip-prompts   # CI / 老手:跳過 confirmation prompt

import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const rl = readline.createInterface({ input: stdin, output: stdout })

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', encoding: 'utf8', ...opts })
}

function shOut(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim() } catch { return '' }
}

const args = new Set(process.argv.slice(2))
const skipPrompts = args.has('--skip-prompts')

console.log('🔒 Netlify access control setup(2026-05-29 — Basic Password 為 free-tier 唯一可用方案)')
console.log('')
console.log('━━━ 流程概覽 ━━━')
console.log('  自動: CLI install + gh check + OAuth login + site 建 + 連 repo')
console.log('  手動: 開 dashboard URL → 點 2 radio button + 輸 password + Save(30 秒)')
console.log('  分享: 把 site URL + password 私訊 stakeholder')
console.log('')
console.log('Netlify = 免費 deploy 平台(100GB bandwidth / per-branch preview / 0 maintenance)')
console.log('因為 fork 本 repo 必有 GitHub 帳號,Netlify 走 GitHub OAuth 自動建 account(<5 秒)')
console.log('')

// Step 0: gh CLI pre-check
const ghOut = shOut('gh auth status 2>&1')
if (ghOut.includes('Logged in')) {
  const userMatch = ghOut.match(/account\s+(\S+)/)
  const ghUser = userMatch ? userMatch[1] : '(unknown)'
  console.log(`✓ GitHub CLI 已 login(account: ${ghUser})`)
} else {
  console.log('⚠️ GitHub CLI 未 login(影響後續 Netlify 連 fork repo)')
  console.log('  建議先跑:gh auth login(瀏覽器 OAuth,1 分鐘)')
  if (!skipPrompts) {
    const proceed = await rl.question('  繼續 setup?(y/N)> ')
    if (!/^y/i.test(proceed)) { console.log('Aborted by user'); rl.close(); process.exit(1) }
  }
}
console.log('')

// Step 1: Netlify CLI(robust: global → npx fallback for locked-down env like Codespaces / sandbox / non-sudo Mac)
let netlifyCmd = 'netlify'
if (!shOut('which netlify')) {
  console.log('▶ Installing Netlify CLI globally...')
  try {
    sh('npm install -g netlify-cli')
  } catch (e) {
    console.log('  ⚠️ Global install failed(無 sudo / 鎖權限環境 — Codespaces 非 root user / 本地 macOS root-owned /usr/local 等)')
    console.log('  Fall back to `npx -y netlify-cli`(首次稍慢,後續 cache)')
    netlifyCmd = 'npx -y netlify-cli'
  }
}
console.log(`✓ Netlify CLI available(via "${netlifyCmd}")`)
console.log('')

// Step 2: Login
const whoami = shOut(`${netlifyCmd} status --json`)
if (!whoami.includes('"User"') && !whoami.includes('"name"')) {
  console.log('▶ Login to Netlify(browser 自動開啟,Codespaces 內走 VS Code port forward;點「Continue with GitHub」→ Authorize)...')
  sh(`${netlifyCmd} login`)
}
console.log('✓ Netlify logged in')
console.log('')

// Step 3: Link site(auto-create with predictable name)
if (!existsSync('.netlify/state.json')) {
  const repoName = JSON.parse(readFileSync('package.json', 'utf8')).name || 'ds-product-template'
  const ghUser = shOut('gh api user --jq .login') || 'user'
  const autoSiteName = `${ghUser}-${repoName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  console.log(`▶ Auto-create Netlify site "${autoSiteName}" + link this repo...`)
  try {
    sh(`${netlifyCmd} sites:create --name="${autoSiteName}" --account-slug=$(${netlifyCmd} api listAccountsForUser --json 2>/dev/null | jq -r '.[0].slug // "personal"' 2>/dev/null || echo personal)`)
    sh(`${netlifyCmd} link --name=${autoSiteName}`)
  } catch {
    console.log('⚠️ Auto-create failed(site name 可能已存在)。Fall back to interactive netlify init...')
    sh(`${netlifyCmd} init`)
  }
}
const state = JSON.parse(readFileSync('.netlify/state.json', 'utf8'))
const siteId = state.siteId
const siteSlug = state.siteSlug || siteId
console.log(`✓ Linked site: ${siteId}`)
console.log('')

// Step 4: Print dashboard URL + Basic Password guidance(無法自動 — Netlify CLI 不提供 password API)
const dashboardUrl = `https://app.netlify.com/projects/${siteSlug}/configuration/visitor-access`
const siteUrl = `https://${siteSlug}.netlify.app`

console.log('━━━ 🔒 Basic Password Protection 設定(30 秒手動,無法 CLI 自動)━━━')
console.log('')
console.log('Netlify CLI 不提供 password protection 的 API(2026-05-29 verified)。')
console.log('以下 3 step 在 browser 完成:')
console.log('')
console.log(`  Step 1. 開啟 dashboard:`)
console.log(`          ${dashboardUrl}`)
console.log('')
console.log('  Step 2. Password Protection 區塊:')
console.log('          • Protected by: 選「Basic protection」')
console.log('          • 輸入 password(建議 ≥12 字,團隊好記)')
console.log('          • Access restricted to: 預設「All deploys」')
console.log('          • 點 Save')
console.log('')
console.log('  Step 3. 把以下兩條私訊 stakeholder(Slack / team chat / DM):')
console.log(`          • Site URL: ${siteUrl}`)
console.log('          • Password: <你剛才設的>')
console.log('')
console.log('Free-tier 鎖住的選項(不用點):')
console.log('  • Team protection 🔒 — 要 Pro plan $19/mo')
console.log('  • Non-production deploys only 🔒 — 要 Pro plan')
console.log('')

if (!skipPrompts) {
  const done = await rl.question('已在 browser 設好 Basic Password?(y/N)> ')
  if (!/^y/i.test(done)) {
    console.log('⚠️ Site 目前公開(任何人有 URL 即可看)。再跑一次 script 或自己回 dashboard 設。')
  } else {
    console.log('✅ Basic Password 設好')
  }
}
console.log('')

console.log('━━━ 後續驗證 ━━━')
console.log(`  1. push main 後 2-3 min,Netlify Dashboard 看 ${siteUrl} 部署狀態`)
console.log('  2. 試開 site URL(無痕視窗)→ 應該見 password prompt')
console.log('  3. 輸入剛才設的 password → 看 storybook')
console.log('')
console.log('━━━ Defense-in-depth(已 ship in netlify.toml)━━━')
console.log('  • X-Robots-Tag: noindex — Google 不收錄 URL')
console.log('  • X-Frame-Options: SAMEORIGIN — 防 iframe 嵌入')
console.log('  • Referrer-Policy: strict-origin-when-cross-origin')
console.log('  ⚠️ Header 只防 SEO + iframe 嵌入,**真擋陌生人靠 Basic Password 那層**')
console.log('')

console.log('✅ Setup complete!')

rl.close()
