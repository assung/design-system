# Sheet 設計原則

## 定位

Sheet 是**從畫面邊緣滑入的浮層面板**——上 / 下 / 左 / 右四個方向，用於側邊操作、暫時性 panel、mobile fullscreen 編輯。

**實作基礎**：shadcn passthrough——基於 Radix Dialog（`side` variant，非居中 modal）。本 DS 保留 shadcn 原結構 + 橋接 DS token。

---

## 何時用

- **側邊操作面板**：filter panel、detail pane、task 編輯 side sheet
- **暫時性內容展示**：notification drawer、cart summary、activity history
- **Mobile fullscreen 編輯**：桌機用 Dialog 的場景在手機改用 Sheet bottom / fullscreen
- **跟主頁面平行的工作流程**：使用者在主頁看清單，sheet 編輯某一項，不離開清單 context

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 需要集中注意力的確認 / 破壞性動作 | `Dialog` | Dialog 是居中 modal，視覺更聚焦；Sheet 靠邊較輕 |
| 短暫的回饋訊息（成功 / 失敗）| `Toast` | Toast 自動消失，Sheet 需使用者明確關閉 |
| 持久性頁面通知 | `Alert` | Alert 是 inline，Sheet 是浮層 |
| 主導覽外殼 | `Sidebar` | Sidebar 持續存在，Sheet 是暫時浮層 |
| Hover 補充資訊 | `HoverCard` / `Tooltip` | Sheet 觸發是點擊、體積大 |
| 選值 / 選單 | `Select` / `DropdownMenu` | Sheet 太重，選單用專用元件 |

---

## Sheet vs Dialog 的分界

| | Sheet | Dialog |
|---|---|---|
| 位置 | 畫面邊緣滑入（上/下/左/右） | 畫面居中 |
| 視覺重量 | 較輕（單邊） | 較重（四周 overlay） |
| 典型用途 | 側邊工作流程、detail panel | 確認流程、複雜表單 |
| 阻斷感 | 較弱（使用者視線可繼續掃主頁） | 強（完全聚焦 modal） |
| 手機體驗 | 自然（從底部 / 全螢幕滑入符合 mobile pattern） | 桌機導向（中央 modal 在手機不舒服） |

**判準**：
- **需要聚焦決策（刪除、確認、複雜表單）→ Dialog**
- **主頁面平行的側邊工作 / mobile 編輯 → Sheet**

---

## 相關

- `../Dialog/dialog.spec.md` — 居中 modal 的對應元件（共用 Radix Dialog base）
- `../Sidebar/sidebar.spec.md` — 持久性導覽（非暫時浮層）
- `../Toast/toast.spec.md` — 短暫自動消失的浮動通知
- `../DropdownMenu/dropdown-menu.spec.md` — 選單類浮層
- Radix Dialog primitive — `@radix-ui/react-dialog`（Sheet 是 side variant）
