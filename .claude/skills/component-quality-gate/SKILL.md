---
name: component-quality-gate
description: Pre-merge quality gate for new or significantly refactored design-system components. Walks through Spec / Code / Stories / Ship checklist (45+ items) to ensure world-class discipline before a component enters `src/design-system/components/`. Invoke when user says「元件做完了」「這元件可以收工了嗎」「元件 ready 嗎」「check 這個 element」「要 merge 進 DS 了」or before closing a component PR.
---

# Component Quality Gate

Purpose: 元件進 `src/design-system/components/` 前的最終 checklist。防止「code 寫完但 spec / stories / token 消費紀律有漂移」的半成品進入系統。

## When to run

- 新元件即將合入 design-system
- 既有元件大改(variant / size / token 結構重構)
- Code review 前的自審
- `/design-system-audit` 發現某元件偏離 checklist 後的修復驗證

**不 invoke 的情境**:小改(typo / 單 bug fix),走 spec 本身的 sync hook 即可。

## Preconditions

- 元件 folder 存在於 `src/design-system/components/{Name}/`
- 該元件的 `.spec.md` / `.tsx` / `.stories.tsx` / `.anatomy.stories.tsx` / `.principles.stories.tsx` 已完成初稿
- 已讀 CLAUDE.md 相關章節(`# Spec 規則` / `# UI 開發規則` / `# shadcn 元件規範` / `# Tailwind 使用規則` / `# Token 命名原則` / `# Props 命名原則` / `# Story`)

## Workflow

### Phase 1 — Spec 審查(先於 code,spec 是 judgment home)

逐條走 `references/checklist.md` 的 **Spec section**(12 項):定位明確 / 實作基礎宣告 / 每個 prop/variant 有何時用何時不用 / 互斥規則 / 為什麼不只是什麼 / 術語一致 / 無視覺描述 / 禁止事項列出 / 邊界案例覆蓋 / 近親 SSOT pointer / 對標世界級 7 維度。

任一不過 → 停下補 spec。**不往下跑 Phase 2**。

### Phase 2 — Code 審查

走 **Code section**(13 項):shadcn 基底完整 / cva() 不條件字串 / data-* selector / 無硬寫 token / Tailwind v4 var() 正確 / 無自包 Provider / Props 命名按「是什麼」/ ARIA 齊 / defaultVariants size=md 若屬 field-height family。

cva `defaultVariants` 異動 → 強制 grep 該元件所有檔案確認三方同步(見 `.claude/skills/story-writing/references/anatomy-standard.md` → 高風險漂移點)。

### Phase 3 — Stories 審查

走 **Stories section**(6 項):展示 / 設計規格 5-story 齊全 / TOKEN_MAP 對得上 cva / Rule note 傳達原則 / title 命名對齊 / Internal vs Components 判斷正確。

範例品質問題 → invoke `/story-writing` skill 做深度審。

### Phase 4 — Ship 審查(最後驗證)

走 **Ship section**(4 項):`npm run storybook` 本地渲染正常 / `npx tsc --noEmit` 無錯 / import 路徑 `@/design-system/...` / 分類標註(Internal vs public)正確。

### Phase 5 — 簽結(Checkpoint — STOP 點)

全部打勾後,回報 user:
- 「元件 {Name} 已過 quality gate,45 項全綠」
- 列出 Phase 1-4 各 section 打勾結果
- 若任一 phase 有合理例外(documented 在 spec),列出例外清單

**STOP 條件**:任一項不過 + 原因不清楚 → 停下問 user,不默默放行。

## References

- `references/checklist.md` — 完整 45 項 checklist(Spec 12 / Code 13 / Stories 6 / Ship 4 + 各項的 CLAUDE.md pointer)

## 相關

- `.claude/skills/design-system-audit/` — 本 skill focus 在單元件進 DS 的 gate;design-system-audit 是系統級 18 維 sweep,兩者互補
- `.claude/skills/story-writing/` — Phase 3 story 深審可 chain 進去
- `.claude/hooks/pre_edit_spec_check.sh` — 編輯 tsx 前提醒讀 spec(session 級)
