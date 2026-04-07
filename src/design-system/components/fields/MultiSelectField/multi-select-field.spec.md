# MultiSelectField 設計原則

## 定位

MultiSelectField 是多選的輸入與顯示元件。選中值以 Tag 陣列呈現，支援單行溢出和多行換行兩種版面。

共用規則見 `field.spec.md`。本文件只記錄 MultiSelectField 特有的原則。

---

## 版面模式（`wrap` prop）

| 模式 | 行為 | 適用場景 |
|------|------|---------|
| 單行（預設） | 固定高度，溢出的 Tag 隱藏，顯示 +N 指示器 | Table cell、空間受限的 Form |
| 多行（`wrap`） | 高度隨內容展開，Tag 自然換行 | 空間充裕的 Form |

### 單行溢出

- 以量測為基礎：計算可用寬度，依序放入 Tag，放不下的隱藏
- 溢出指示器 `+N` 顯示被隱藏的數量
- Hover 溢出指示器時，popover 顯示完整的隱藏 Tag 清單

---

## Tag 操作

### 個別移除

每個 Tag 有 dismiss 按鈕（X），點擊移除該選項。

### 全部清除

`clearable` 在有值時顯示 clear all 按鈕，一次清除所有選項。位於最右側，ChevronDown 左邊。

### 新增選擇

原生 `<select>` 只顯示**未選中**的選項——已選中的不重複出現在下拉。

---

## readonly / disabled 的 Tag

- 沒有 dismiss 按鈕——不可操作
- 沒有 ChevronDown——不可新增
- 沒有 clear 按鈕——不可清除
- 溢出行為與 edit 模式相同（+N 指示器）

---

## 禁止事項

- ❌ 不在已選中的選項上再顯示 dismiss 以外的互動——Tag 只能被移除，不能被編輯或重新排序
- ❌ 溢出指示器 `+N` 不可省略——使用者需要知道有多少被隱藏的項目
- ❌ 不自建 dropdown——使用原生 `<select>` 保證無障礙
