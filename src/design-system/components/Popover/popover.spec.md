# Popover 設計原則

## 定位

Popover 是**點擊觸發的浮層容器**——提供定位、動畫、焦點管理，內容由 consumer 決定。

**實作基礎**：shadcn passthrough——基於 Radix Popover。本 DS 保留 shadcn 原結構 + 橋接 DS token（elevation / radius / border）。

---

## 何時用

- **點擊觸發的輕量浮層**：filter panel、date picker 展開、設定 mini panel
- **需要放互動元素的浮層**：按鈕、輸入框、checkbox 群組
- **非 modal 的補充 UI**：使用者可以忽略並繼續主流程，不阻斷背景互動

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| hover 觸發（非點擊）| `HoverCard` | HoverCard 觸發是 hover，Popover 是點擊 |
| 純文字提示 | `Tooltip` | Tooltip 更輕量，適合純文字 |
| 需要阻斷背景的流程 | `Dialog` | Dialog 是 modal，Popover 非 modal |
| 操作選單（複製 / 刪除）| `DropdownMenu` | DropdownMenu 有 menu 語意 + 鍵盤導覽 |
| 選值下拉 | `Select` / `Combobox` | 下拉選單用專用元件，不自組 Popover + list |

---

## 相關

- `../HoverCard/hover-card.spec.md` — hover 觸發的對應浮層
- `../Tooltip/tooltip.spec.md` — 純文字提示
- `../Dialog/dialog.spec.md` — 需要阻斷的 modal
- `../DropdownMenu/dropdown-menu.spec.md` — 有 menu 語意的操作選單
- `../SelectMenu/select-menu.spec.md` — SelectMenu 消費 Popover 作為浮層容器
- Radix Popover primitive — `@radix-ui/react-popover`
