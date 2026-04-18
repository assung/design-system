# Command 設計原則

## 定位

Command 是**搜尋 + 鍵盤導覽的指令清單**——提供搜尋框、分組選項、鍵盤導覽、空狀態。多用於浮層選單內部（SelectMenu）或 Command Palette（Cmd+K）。

**實作基礎**：shadcn passthrough——基於 cmdk + Radix Dialog（Command Palette 模式）。本 DS 保留 shadcn 原結構 + 橋接 DS token 和 Empty / MenuItem primitive。

---

## 何時用

- **SelectMenu 內部搜尋**：Select / Combobox / PeoplePicker 的 searchable 模式底層
- **Command Palette（Cmd+K）**：全局跨頁搜尋、快速動作入口
- **需要搜尋過濾 + 鍵盤導覽的選項清單**

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 不需要搜尋的短選項清單（< 6 項）| `DropdownMenu` | DropdownMenu 是操作選單，不含搜尋 |
| 表單內的單選下拉 | `Select` | Select 自動判斷是否切到 SelectMenu 模式 |
| 表單內的多選下拉 | `Combobox` | 同上 |
| 人員選擇 | `PeoplePicker` | 專用人員選擇器（內部會消費 Command）|

---

## 消費者

Command 通常由 `SelectMenu` 或自訂 Command Palette 元件消費——直接使用 Command 很少見，除非建立全新的搜尋清單 UI。

---

## 相關

- `../SelectMenu/select-menu.spec.md` — 主要消費者（Select / Combobox / PeoplePicker 的 searchable 浮層）
- `../DropdownMenu/dropdown-menu.spec.md` — 不需搜尋的操作選單
- `../Popover/popover.spec.md` — Command Palette 的浮層容器
- cmdk library — 底層搜尋與鍵盤導覽實作
