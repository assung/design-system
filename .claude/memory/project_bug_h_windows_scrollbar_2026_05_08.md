---
name: Bug H — Windows scrollbar overflow（DataTable rounded outer + native scrollbar mask）
description: PR #7 codex 討論結論 + 2026-04-30 interim CSS parity 落地 + 完整 ScrollArea 遷移仍 deferred(post-v1 RFC,需 dual-track 評估 7 個 architectural concern)
type: project
---

# Bug H — Windows DataTable scrollbar 一半溢出 rounded outer

**狀態**：interim fix landed,full migration deferred(本 entry 是被遺忘的 deferred decision tracker)
**第一次討論**：PR #7 codex thread(2026-04-30 ish)
**Why this exists**：之前 codex 討論完只 ship interim,沒人 codify「ScrollArea migration 還欠」進 memory → 這次 user 第 2 次提才挖出來。M14 violation,本 entry 補。

## Symptom（user-reported）
Windows Chromium：DataTable 水平 + 垂直 scrollbar 各有一半超出 `rounded-md overflow-hidden` outer 範圍,V/H corner 顯系統灰格(跟 table surface 不一致)。macOS overlay scrollbar(0px)看不到 → 跨 OS 不一致。

## Root cause（codex confirmed,2026-04-30 PR #7 thread）
1. **Primary**：rounded ancestor clip(`overflow-hidden`)+ native scrollbar corner rendering on child scroller(Windows persistent bars)
2. **Secondary**：H-only customization(10px)vs V default width(~17px Windows)→ asymmetric chrome
3. **Not primary**：generic box-sizing interaction

## Interim fix landed（v15.13,`data-table.css` lines 26-72）
- V scrollbar customize width=10px(對稱 H)
- `::-webkit-scrollbar-corner` themed neutral-2(消 Windows default 灰)
- Firefox `scrollbar-width: thin` + `scrollbar-color`
- 2026-04-30 關鍵 scope fix：限 `:horizontal` only,V 軸跟 native auto-show
- Wired up：`globals.css:9` import + `data-table.tsx:1885` set `data-datatable-hscroll`

**對齊**：AG Grid theme-level scrollbar customization / MUI DataGrid scrollbar override / Polaris IndexTable native+CSS pattern(world-class native+CSS 派,非 ScrollArea 派)

## Why NOT ScrollArea migration（記在 `data-table.spec.md:249`）
DataTable 是 AG-Grid 派 3-region synced scroll(left-pinned overflow:hidden / center-body overflow-x-auto + overflow-y-auto / right-pinned overflow:hidden)。Radix ScrollArea = single viewport contract,**不支援多 viewport synced scroll API**。User PR #7 列了 7 個 architectural concern(C1-C7)送 codex 評估,結論:遷移風險高 → 留 native + CSS parity。

## Deferred — post-v1 RFC（**未啟動**,本 entry 提醒）
完整 ScrollArea-based 重構是 spec 標的「post-v1 tech debt」(`data-table.spec.md:251`),需要 codex dual-track 評估:
1. C1 multi-viewport synced scroll(left/right pinned 跟 ScrollArea 內部 viewport)
2. C2 TanStack Virtual `getScrollElement` contract 兼容 Radix viewport ref?
3. C3 centerHeader↔body H scroll JS sync 在 Radix wrapper 內仍 work?
4. C4 H scrollbar always-visible canonical(AR44)vs Radix fade-in
5. C5 cell inline-edit popover anchor 在 ScrollArea viewport 內定位是否破?
6. C6 DragOverlay portal Z-stack vs ScrollArea mask
7. C7 future cell range-select drag vs ScrollArea event capture

## Trigger to revisit
- User 再提 Windows scrollbar 不滿意
- Future feature(cell range select / column resize 重做)順道升級
- 季度 audit Phase 4.5(`/design-system-audit --deep` Phase F self-improvement)

## 為何 user 這次再提
Interim fix 也許還沒完全消除偏移(我猜:10px 仍跨過圓角,只是不那麼明顯),或截圖跟 spec 視覺差異 user 仍可感。**下一步**：跑 Windows VM(or 請 user 給 Windows 截圖)visual verify 現狀 → decide:(a) interim 再加強(eg. 加 inner padding 抵 scrollbar 寬度),(b) 啟動 ScrollArea full RFC,(c) 接受現狀 + 文件化 known limitation。
