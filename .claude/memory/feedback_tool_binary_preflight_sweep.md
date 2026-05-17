---
name: tool-binary-preflight-sweep
description: 引入 / 使用 CLI binary 前必跑 4-test discovery,禁止「which X 找不到 → claim 沒裝」假警報
type: feedback
originSessionId: a689a78e-f264-4c1f-b881-0859a7a12135
---
# Tool / Binary preflight sweep canonical

引入或使用 CLI / binary 前**必跑 4-test discovery**,禁止短路。

## 4-test discovery sequence(順序不可顛倒)

1. **`which <binary>`** — system PATH
2. **`npx <binary> --version`** — npm-local (`node_modules/.bin/`)
3. **`grep "<package>" package.json`** + **`ls node_modules/@<scope>/<pkg>/bin/`** — dependency declared
4. **Check `~/.<binary>/auth.json` or known config path** — auth state

任一通過即 available。**禁止只跑 step 1 就 claim 「not installed」**。

## User 原話 SSOT(2026-05-15)

> 「到底要怎麼確實避免你下次又失憶？？？你每次都會失憶啊？？是我們path讓你很難找？？？？」

## Anti-pattern 錨例

**2026-05-15**:User 問 codex collab transport,我跑 `which codex` 沒結果 → claim「local codex CLI not installed locally」→ 跑去找 GitHub PR 不存在 → 提「3 transport 選項」要 user 決策。**真實**:`@openai/codex@0.128.0` 已在 package.json,`npx codex --version` work,`~/.codex/auth.json` 已存在。所有 4 step check 漏 3 個。User 抓「我兩個 turn 之前已經 echo『local codex CLI not installed』就應該知道是 install 問題不是 transport 選擇問題」+「為何又再次跟白癡一樣要把問題送到 github 去？」+「path 讓你很難找?」

## Codified mechanical strength

- M32(e) 既有 split home(`/bug-fix-rhythm` skill Phase 0 / **本檔**)
- **Per session 開頭**:若需任何 CLI tool → 直跑 4-test sweep,結果存 session-local note(不 grep 跨 session)

## How to apply

- 任何 codex / playwright / mcp / 第三方 CLI 前必跑 4-test
- 若 step 1 失敗,**不要立刻 escalate 給 user**,跑完 step 2-4
- Honest failure 才告知 user「真的找不到」+ 列 4 個檢查結果

## Related M-rules

- M28(grep canonical pre-ops)
- M32(e)(tool preflight sweep)
- M33(不 conditioned-defer)
