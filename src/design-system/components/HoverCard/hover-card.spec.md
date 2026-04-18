# HoverCard 設計原則

Hover 觸發的可互動浮層，基於 Radix HoverCard。純行為 primitive——只提供觸發邏輯、定位、動畫，不含視覺樣式。

## 定位

- **是**：hover 顯示可互動內容（按鈕、連結、可選取文字）的浮層容器
- **不是**：Tooltip（純文字提示、不可互動、hover 離開即消失）

## vs Tooltip

| | HoverCard | Tooltip |
|---|---|---|
| 觸發 | hover | hover |
| 內容可互動 | 是（按鈕、連結、hover 子元素） | 否（純文字） |
| 停留行為 | 滑鼠移到浮層上不消失 | 滑鼠離開 trigger 即消失 |
| 視覺樣式 | 由 consumer 決定 | 統一深色背景 |

## 純行為 primitive

HoverCardContent 只提供：
- `z-50`（浮層層級）
- 進出場動畫（fade + zoom + slide，方向感知）
- `sideOffset`（與 trigger 的間距）

**不提供** `bg`、`border`、`shadow`、`padding`、`rounded`——consumer 根據場景自行決定：

| Consumer | 視覺風格 |
|---|---|
| NameCard | 亮色 card（`bg-surface-raised` + `elevation-200` + `rounded-lg` + `border`） |
| OverflowIndicator | 深色 tooltip 風格（`bg-tooltip` + `data-theme="dark"`） |

## sideOffset

預設 `8px`，與系統其他浮層（Tooltip、Popover）統一。

## 用途

- **NameCard**：人員 Avatar hover 顯示詳細資訊
- **Overflow person list**：溢出的人員列表 hover 展開
- **Preview card**：內容預覽（文件、連結）

## Avatar 整合

Avatar 元件的 `hoverCard` prop 接受 HoverCard content，自動將 Avatar 包在 HoverCardTrigger 內。人員類 Avatar 應統一使用此 pattern 提供 hover 資訊。
