---
name: Story Auto-Compile 系統(C)
description: Stories canonical 部分由 spec.md + tsx 自動編譯衍生,人只寫 real-product scenarios。4-phase plan(tsx componentMeta / spec frontmatter / compile script / hook integration)。完整 spec `.claude/planning/story-auto-compile.md`。對齊 user 原始「可程式化→code / 不可→spec / stories auto-derive」願景。
type: project
originSessionId: 7fa6c876-f1f7-4537-8cb3-1c97212e5a80
---

# Story Auto-Compile 系統 — 速查

**完整規格**:`.claude/planning/story-auto-compile.md`(on-disk,git tracked)

## 快速 anchor

- **Goal**:stories 的 variant 矩陣 / token 對照 / do-don't 列表自動 compile,零漂移
- **人只寫**:real-product scenarios(Jira / Stripe / Notion 劇情)
- **4 phase**:tsx `componentMeta` export → spec YAML frontmatter → `compile-stories.mjs` → hook integration
- **時間**:Phase 1-3 約 2 天 focused(10 元件 pilot);Phase 4 migration 9 週漸進
- **root principle**:實踐 user「spec + tsx 自動舉一反三產生 stories」原始願景

## 開工 trigger

User 說「做 C / story auto-compile / 開工」→ 讀 planning doc → 從 Phase 1 開始。
