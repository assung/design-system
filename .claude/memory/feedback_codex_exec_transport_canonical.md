---
name: Codex exec transport canonical(地端 path + visual audit bypass + large-brief 死局)
description: 地端 codex 走 node_modules/.bin/codex(3-test discovery)+ visual audit 必加 --dangerously-bypass-approvals-and-sandbox(user authorize)+ 大 brief 拆 N 個 focused 小 brief 才不死局
type: feedback
originSessionId: 41fa83c2-f951-431e-911e-ed3ceb185903
---
# Codex exec mode 完整 transport canonical

## Rule 1 — 地端 transport = `node_modules/.bin/codex`(3-test discovery)

**啟 codex collab 前必跑 3-test discovery,順序固定**(per `.claude/skills/codex-collab/SKILL.md` Step 0.4):

```bash
ls -la node_modules/.bin/codex && node_modules/.bin/codex --version   # 1 Local CLI(primary)
which codex 2>/dev/null && codex --version 2>/dev/null                 # 2 Global(罕見)
ls -la ~/.codex/auth.json                                              # 3 Auth(sanity)
```

**Why**:`@openai/codex` 是 npm dep(`package.json` 已含),正規 binary 在 `node_modules/.bin/codex`(symlink to `@openai/codex/bin/codex.js`)。**全域 `which codex` 通常找不到**(npm 不自動 link 進 PATH),**這是預期的,不代表 codex unreachable**。

**Decision tree**:1 ✅ → local exec / 1 ❌ + 2 ✅ → global / 1+2 ❌ + 3 ✅ → `npm install` 補 / 全 ❌ → 報 user。**絕禁 fallback Explore agent 當 codex 替身**(Explore 是同模型,不滿 M31 dual-track bias)。

**Anchor 2026-05-17**:user verbatim「你他媽你難道不知道這裡是地端?跟你說過地端要怎樣跟codex協作?講百次要你遵循原則了」。我犯錯:`which codex` 失敗就斷言 unreachable + 嘗試 `sudo npm i -g @openai/codex` + 嘗試繞 M28 + fallback Explore 替身。

## Rule 2 — Visual audit MCP via `--dangerously-bypass-approvals-and-sandbox`(user authorize 才用)

**Rule**:`codex exec` + Playwright MCP visual audit → 必加 `--dangerously-bypass-approvals-and-sandbox` 才能 auto-approve MCP browser tool calls。Codex CLI 0.134.0 feature `exec_permission_approvals` 仍 under-development,試過全部 sandbox/approval 組合都被 cancel。

**唯一 working path**:
```bash
# @codex-brief-invariant-skip: user authorized --dangerously-bypass for visual audit
cat brief.md | node_modules/.bin/codex exec --skip-git-repo-check \
  --dangerously-bypass-approvals-and-sandbox \
  > output.txt 2>&1 &
```

**How to apply**:
1. **User explicit authorize required first** — Claude Code default safety blocks。需 user verbatim「授權 codex bypass」/「照建議 dangerously」trigger
2. **Brief MUST forbid edit/delete/write source code** — bypass 解 codex 內部 sandbox(不解 host OS),但 codex 仍能寫 file。限 read-only
3. **MUST sequential MCP not batch**:`browser_run_code_unsafe` disallows dynamic import / fs / batch。Per-component sequential `browser_navigate → wait → screenshot → evaluate`
4. **Codex saves screenshots at repo root** — `.gitignore` 必加 per-comp PNG OR `mv` to `/tmp/codex-screenshots/`

**Anchor 2026-05-27**:User 要求「ensure codex 把所有元件都驗證過並截圖」+ explicit authorize「codex 並不會動到你的檔案，對吧？那就照你建議做」。Final 62/62 PASS,artifact `.claude/snapshots/codex-visual-audit-2026-05-27/audit-report.json`。

## Rule 3 — 大型 brief 死局 / Success pattern = 小 focused brief + low reasoning + bypass(2026-05-29 new)

**Anti-pattern**:DISCUSS-ONLY 大型 6+ 軸 brief + xhigh / medium reasoning effort = 模型在 plan turn 燒掉 budget,沒輸出 verdict。Anchor 2026-05-29 turn:r1 / r2(xhigh)/ r3(medium)/ r4(medium + bypass)全失敗,只 echo brief 0 substantive output。

**Success pattern**(r5/r6 verified):
1. `--dangerously-bypass-approvals-and-sandbox`
2. `-c model_reasoning_effort=low`
3. **拆 N 個 single-axis focused brief 並行**(每 brief 1 軸,各 25k tokens 真完成)
4. Brief 含「禁寫 plan」/「直接從 ### A1 verdict 開始輸出」directive

```bash
# parallel dispatch pattern
echo "<focused single-axis brief>" | node_modules/.bin/codex exec \
  --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -c model_reasoning_effort=low > /tmp/codex-r6a.md 2>&1 &
# ... repeat for r6b, r6c
```

## Mechanical enforcement

`stop_self_audit.sh` 偵測「本 turn 含 codex/dual-track/比稿 keyword + 無 `node_modules/.bin/codex` cmd trace」→ BLOCKER inject。

## 反 pattern(永久 ban)

- ❌ `which codex` 失敗斷言 unreachable + 嘗試 `sudo npm i -g`
- ❌ Fallback Explore agent 當 codex 替身(同模型,不滿 dual-track)
- ❌ AI auto-invoke `--dangerously-bypass` without user explicit authorize
- ❌ Brief allow batch `browser_run_code_unsafe`(已驗 fail)
- ❌ Skip capability smoke 直接 full run
- ❌ Brief 允許 codex edit / delete / write source code under bypass mode
- ❌ 大型 6+ 軸 brief + high reasoning(2026-05-29 r1-r4 anchor)
