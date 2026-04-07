# SelectField 設計原則

## 定位

SelectField 是單選下拉的輸入與顯示元件。支援兩種顯示模式（text / tag），共用原生 `<select>`。

共用規則見 `field.spec.md`（含 SelectField 顯示模式段落）。本文件只記錄 SelectField 特有的原則。

---

## 顯示模式（`display` prop）

| 模式 | 何時使用 |
|------|---------|
| `text`（預設） | 狀態、類別等純文字選項 |
| `tag` | 需要視覺標記的選項（顏色標籤、優先級等） |

### text 模式

- 原生 select 純文字 + ChevronDown
- 可搭配 `startIcon`——代表 value 的圖示（如狀態 icon），不是裝飾
- startIcon 的語意是「描述目前選中的值」，不是「描述這個 field 的用途」

### tag 模式

- Tag 元件呈現選中值 + 隱藏的原生 select overlay
- Tag 設為 `pointer-events-none`，點擊穿透到底層 select
- edit 模式：Tag + ChevronDown + 可選 clear
- readonly / disabled：Tag 只顯示，無 ChevronDown

---

## Clearable

`clearable` 在有值時顯示 clear 按鈕。

- Clear 按鈕在 ChevronDown 左側
- 清除後回到 placeholder 狀態
- 只在 edit 模式顯示

---

## 禁止事項

- ❌ `startIcon` 不可用於 tag 模式——Tag 本身已有視覺標記，startIcon 是冗餘的
- ❌ 不自建 dropdown menu——使用原生 `<select>` 保證無障礙和行動裝置體驗
