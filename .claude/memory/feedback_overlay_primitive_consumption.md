---
name: Overlay primitive consumption discipline
description: 寫 Popover/Dialog/Sheet 內容前必先 grep ^export of primitive tsx + read overlay-surface.spec.md;禁止自刻 <div px-loose border-b/t> 取代 SurfaceHeader/Body/Footer
type: feedback
originSessionId: 7fa6c876-f1f7-4537-8cb3-1c97212e5a80
---
寫 Popover / Dialog / Sheet 內容(stories / app / DataTable panel helper / 任何 overlay consumer)前必走:

1. **grep `^export ` of the primitive tsx**(`Popover/popover.tsx` / `Dialog/dialog.tsx` / `Sheet/sheet.tsx`)— 列出可消費的 sub-component(PopoverHeader / PopoverBody / PopoverFooter / PopoverTitle 等)
2. **Read `patterns/overlay-surface/overlay-surface.spec.md`**「Consumer rule」段 — 確認 padding / close X / typography canonical
3. **必消費 primitive,禁止自刻 `<div className="px-loose ... border-(b|t)">`** 取代 chrome

**Why**:Primitive 自帶 padding token 一致 + 自動 close X(PopoverHeader)+ PopoverTitle typography + autofocus 標記。自刻 = 4 維 drift 起點(padding / border / close X / title 大小)。

**How to apply**:
- 一看到要寫 Popover/Dialog/Sheet 內容,先暫停寫,跑 grep + read spec,**然後才寫**
- 違反時 hook `check_overlay_handcraft.sh` write-time 攔(機械防線)
- 找到既有自刻 chrome 即視為 M10 violation,exhaustive scan + 全改

**歷史教訓 2026-04-29**:DataTable column visibility / SortManager / FilterPanel 三處自刻 chrome,user 抓到 4 個 spec 違反(left-align gap / 缺 close X / title typography 偏 / mindset #2)。User 需第二次催才做 M10 sweep — 該主動。

**SSOT pointer**:`patterns/overlay-surface/overlay-surface.spec.md`「Consumer rule」+ `.claude/hooks/check_overlay_handcraft.sh`(機械化)。
