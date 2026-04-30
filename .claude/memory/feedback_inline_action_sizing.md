---
name: Inline Action sizing + same-row consistency discipline
description: Panel list / row 內 icon action 必統一 ItemInlineActionButton(16+18 hover bg);禁止混 Button iconOnly(28 chrome size)違 same-row consistency canonical
type: feedback
originSessionId: 7fa6c876-f1f7-4537-8cb3-1c97212e5a80
---
寫 panel list / row 內 icon action(Eye toggle / Trash / drag handle / 任何 row-internal icon button)時必走:

1. **判 Inline Action vs Button**(per inline-action.spec.md 決策樹 Q2):
   - Host 內部(content flow / row inline)→ **Inline Action**(`ItemInlineActionButton`)
   - Action group region(toolbar / chrome corner / dedicated action column)→ **Button**

2. **Same-row consistency canonical**(L152):
   - 同 action row 所有 icon action **必同一類**(全 InlineAction OR 全 Button,**不混**)
   - Box size 不一致(InlineAction 16+18 vs Button text sm 28)會 row gap 斷裂

3. **Panel list row(visibility / sort / filter panel)→ ItemInlineActionButton size="md"**:
   - 16 icon + 18 hover bg overlay(對齊 TreeItem sm/md 同 tier)
   - 對齊 inline-action.spec.md「尺寸對照」L60-64「Panel list row」row(2026-04-29 codified)

**How to apply**:
- 寫 row 內 icon action 前先想:這是 host 內部 inline 還是 chrome action group?
- 若同 row 已有 `<ItemInlineActionButton>`,**禁止再加 `<Button iconOnly>` 在同 row**
- Hook `check_overlay_handcraft.sh` Check 5(2026-04-29)— 同檔混 InlineAction + Button iconOnly 觸發 warn(file-level coarse,跨 row 用法可加 `// same-row-mixed-allow: <reason>` allowlist)

**歷史教訓 2026-04-29**:DataTable visibility row Eye Button text sm(28x28)+ drag handle ItemInlineActionButton md(16x16)= 同 row 混用,違 L152 canonical。User 抓「item 尺寸不對?」我才發現。修:Eye + Trash 全改 ItemInlineActionButton md。

**SSOT pointer**:`patterns/element-anatomy/inline-action.spec.md`「尺寸對照」+「Same-row consistency rule」+ `.claude/hooks/check_overlay_handcraft.sh` Check 5。
