# HoverCard 設計原則

## 定位

Hover 觸發的**可互動浮層**，基於 Radix HoverCard。

**實作基礎**：基於 Radix HoverCard——純行為 primitive，只提供觸發邏輯、定位、動畫，不含視覺樣式。

- **是**：hover 顯示可互動內容（按鈕、連結、可選取文字）的浮層容器
- **不是**：Tooltip（純文字提示、不可互動、hover 離開即消失）

**Layout Family**：非上述 family — composite / multi-section（多區塊組合，自 own layout）。

---

## 何時用

- **人員資訊卡**：Avatar hover 顯示 NameCard（姓名、角色、聯絡按鈕）
- **溢出項目展開**：人員列表 `+N` hover 展示完整清單
- **內容預覽**：連結 / 文件 hover 顯示標題 / 縮圖 / 摘要預覽
- **不破壞當前畫面的補充資訊**：hover 可看細節，不 hover 也能使用主要介面

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 純文字提示（icon 用途、shortcut）| `Tooltip` | 見下「與 Tooltip 的分界」 |
| 點擊觸發（非 hover） | `Popover` | HoverCard 觸發是 hover，點擊用 Popover |
| 需要阻斷背景的流程 | `Dialog` | HoverCard 非阻斷、hover 離開自動消失 |
| 關鍵資訊（必須被看到）| 直接顯示在畫面上 | 觸控裝置無法 hover，關鍵資訊不可只靠 HoverCard |

---

## 與 Tooltip 的分界

兩者都是 hover 觸發，判斷用**互動性**和**內容性質**：

| | HoverCard | Tooltip |
|---|---|---|
| 觸發 | hover | hover |
| **內容可互動** | 是（按鈕、連結、hover 子元素） | 否（純文字） |
| 停留行為 | 滑鼠移到浮層上不消失 | 滑鼠離開 trigger 即消失 |
| 視覺樣式 | 由 consumer 決定（亮色 card 或深色 tooltip 風格皆可） | 統一深色背景 |
| 典型用例 | NameCard、內容預覽、溢出清單 | icon 用途、shortcut、截斷文字補全 |

**Fallback**：需要放按鈕 / 連結 → HoverCard；一句話純文字 → Tooltip。

**本節是 HoverCard vs Tooltip 的 SSOT**，Tooltip spec 指回本節。

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

---

## 相關

- `../Tooltip/tooltip.spec.md` — 純文字 hover 提示（HoverCard vs Tooltip 的分界 SSOT 在本 spec）
- `../NameCard/name-card.spec.md` — 人員資訊卡（HoverCard 最常見 content）
- `../Avatar/avatar.spec.md` — 人員 Avatar 自動 hoverCard 整合
- Popover（`components/Popover/`，shadcn passthrough 無 spec）— 點擊觸發的浮層
