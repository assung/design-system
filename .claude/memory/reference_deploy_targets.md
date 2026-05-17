---
name: Deploy targets — Storybook(Pages + Netlify)+ Vite(Netlify)
description: Storybook GitHub Pages canonical URL + Netlify per-branch preview + Vite build target
type: reference
originSessionId: a689a78e-f264-4c1f-b881-0859a7a12135
---
# Deploy targets

## ⚠️ 永久 transport self-awareness(2026-05-15 user codify)

**Codex collab 前每次自動判斷地端 vs 雲端,選對 transport**:

| 我跑在哪 | Transport | 指令 |
|---|---|---|
| **地端 Claude Code**(local Mac,本 case) | **local `codex` CLI** | `npx codex exec --output-last-message <reply.md> "<brief>"` |
| 雲端 Claude Code(remote sandbox) | GitHub `@codex` mention | `mcp__github__add_issue_comment` 含 `@codex` |

**判斷 signal**(我自己 first principle 知道):
- 環境變數 `CLAUDE_PROJECT_DIR` 開頭含 `/Users/` / `/home/` = 地端
- 路徑含 `Library/CloudStorage/GoogleDrive` = macOS 本機 = 地端
- 反之 sandbox / docker / cloud → 雲端

**User 原話 SSOT**(2026-05-15):
> 「你應該每次在和 codex 協作前都會自己主動自動知道自己在地端還是雲端然後進而知道該以何種工作流程工作,對嗎」

**犯錯歷史**(本 session 2+ 次):
- 我地端跑卻提「3 transport 選項」要 user 決策
- 我地端跑卻說「codex CLI not installed」(沒 `npx codex` 驗證)
- 我地端跑卻誤用 GitHub PR 透傳(被 hook M28 攔)

---

## ⚠️ 永久 anti-pattern(2026-05-15 user N 次糾正,本 session 第 3 次犯)

**User 訊息含「Netlify」/「deploy 沒更新」/「沒部署」/「最新 deploy 看不到 fix」**:
→ ❌ **絕禁** `gh api repos/.../deployments`(那是 GitHub Pages,**只看 main**)
→ ❌ **絕禁** 結論「branch 沒 merge main → 所以沒 deploy」
→ ✅ **必檢查 Netlify per-branch preview URL**(任何 branch push 都自動 deploy)
→ ✅ 找 URL:`netlify.toml` site name + branch-slug,或請 user 提供 OR 跑 `npx netlify status`
→ ✅ 若 Netlify 真沒 update,check `git log origin/<branch>` SHA + Netlify build log

**User 原話 SSOT**(verbatim 2026-05-15):
> 「你又腦子壞了嗎?你不應該去檢查 GitHub 上的 page 吧?**你還記得我們白紙黑字寫在 infra 的工作流程嗎?所有你做的編輯都會直接部署到 netlify**,直到我驗證確認才會叫你 push 到 main(GitHub page),**你到底要怎樣才能記得這件事永遠不會再忘記**?所以表示你現在不應該去檢查 GitHub page 是否是最新,而是應該檢查 netlify 是否是最新才對吧?」

**犯錯歷史**(本 session 第 3 次):
- 2026-05-15:user 問「沒修好」→ 我跑 `gh api /deployments` 看 GitHub Pages SHA d9ec661 →
  結論「2 週前 main」→ user 糾「應該檢查 netlify 不是 github page」

## Storybook
- **GitHub Pages production**：`https://ajenchen.github.io/design-system/`(2026-05-08 ci.yml `deploy-storybook` job 補上,push:main 自動 deploy)
- **Netlify per-branch preview**：任何 branch push → 自動 preview URL(per `netlify.toml`,solo-work canonical 的 user-gate channel)
- **Netlify production**：main → production URL(也是 storybook,跟 GitHub Pages 平行)

## Vite app
- **Netlify**:`netlify.toml` 設 `npm run build-storybook`(目前主要產出 = storybook,非 Vite app build)。注意:netlify.toml `command = "npm run build-storybook"` → publish `storybook-static` → 表示 Netlify 也是 deploy storybook 不是 vite app

## Workflow gap codified（2026-05-08）
**之前 ci.yml 只 build storybook 不 deploy**,Pages 設 `build_type=workflow` 但無 `actions/deploy-pages` step → Pages 永遠空。本日加上 `deploy-storybook` job(needs: verify)解決。

## Solo-work canonical 對齊
1. AI commit/push working branch → Netlify 自動 preview(user gate)
2. user 拍板「push」→ squash merge to main
3. main push 觸發 ci.yml verify + deploy-storybook → GitHub Pages production
