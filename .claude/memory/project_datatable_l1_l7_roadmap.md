---
name: DataTable L1-L7 階段 roadmap(target = agGrid 級強大)
description: DataTable 朝 agGrid 級強大 table 的 7 層階段計畫,L1 完成,L2/L5 設計已定實作待做,L3/L4/L6/L7 設計待定
type: project
originSessionId: 7fa6c876-f1f7-4537-8cb3-1c97212e5a80
---
# DataTable 階段 roadmap(target = agGrid 級)

**目標**:DataTable 達到 agGrid 級強大表格能力,分 7 層循序實作。
**SSOT**:`src/design-system/components/DataTable/data-table.spec.md`「層級架構」段。

## 進度

| 層級 | 能力 | 狀態 |
|------|------|------|
| **L1 基礎結構** | 骨架、尺寸、border、色彩、高度模式、行高模式 | ✅ 完成 |
| **L2 選取** | row selection、checkbox、批次操作列 | ⏳ 設計決策已定(spec L2 段)、實作待做 |
| **L3 欄位互動** | 排序、resize、reorder、pin、顯示隱藏 | ❓ 待定 |
| **L4 資料操作** | 篩選、分組、搜尋(統一入口) | ❓ 待定 |
| **L5 Cell 能力** | custom renderer、inline edit、validation、copy/paste | ⏳ 設計決策已定、實作待做 |
| **L6 進階呈現** | 展開列、tree data | ❓ 待定 |
| **L7 匯出** | CSV/Excel、列印、context menu | ❓ 待定 |

## 下次 session 接續點

**優先順序**(2026-05-01 quit-session 時的判斷):
1. **L2 實作**(設計已定,直接 implement)— 最低 risk,接續最順
2. **L3 設計** OR **L4 設計**(spec 待定)— 需要先做 7-dim spec 再實作
3. **L5 實作**(設計已定,可跟 L2 平行)
4. L6/L7 後置(L4 OK 後再考慮)

**注意**:每階段都要走完整流程 = 7-dim spec → tsc → 3 stories → /component-quality-gate(對齊 `/new-component` skill workflow)。

## 技術基礎

- 底層:TanStack Table(邏輯)+ 自家 layout(視覺)
- DOM:`<div>` + ARIA role(非 `<table>`)— 為虛擬捲動 + frozen column 預留
- 簡單展示也用 DataTable(避免 maintain 第二個靜態 Table)

## 未做完的 risk

如果 session 直接結束 + 此 memory 沒寫,下次接續時 AI 不知道有這 roadmap,會誤判 DataTable 已完成或重新設計 — 此 memory file 防 drift。
