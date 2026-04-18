# DescriptionList 設計原則

唯讀 label + value 展示元件，用於呈現結構化的屬性資訊。HTML 語義為 `dl` + `dt` + `dd`，對齊 Atlassian、Shopify Polaris 慣例。

## 定位

- **是**：唯讀資訊展示（profile card 的欄位、detail panel 的屬性列表）
- **不是**：表單輸入——需要編輯的 label + value 用 Field 系統（Input / Select 等）

**Layout Family**：非上述 family — composite / multi-section（多區塊組合，自 own layout）。

---

## 何時用

- **Profile / detail panel 的屬性列表**：使用者資料（Email / Phone / Role / Created at）
- **NameCard 的 info fields**：HoverCard 內的次要資訊展示
- **固定資訊展示**：產品規格、訂單明細、設定值（唯讀）
- **HTML 語義為 `dl` + `dt` + `dd`**：對 screen reader 明確表達「屬性-值」關係

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 需要編輯的 label + value | `Field` 系統（`Input` / `Select` / `DatePicker` 等）| DescriptionList 是唯讀，編輯用 Field |
| Table 式資料展示（多 row 相同結構）| `DataTable` | DescriptionList 是單實體屬性，Table 是多筆同結構 |
| 單一 label + value（只有一組）| 自訂 layout | DescriptionList 設計為多組屬性；單組殺雞用牛刀 |
| 需要 cell 編輯的表格 | `DataTable` + inline edit | DescriptionList 無 cell 編輯 |

## 結構

- `DescriptionList`：外層 `dl`，CSS grid 容器
- `DescriptionItem`：一組 `dt`（label）+ `dd`（value），包在 `div` 內作為 grid item

## Typography（閱讀模式）

層級靠色彩區分，不靠字體大小：

- **label (dt)**：`text-body`（14px）`text-fg-secondary`（neutral-8）
- **value (dd)**：`text-body`（14px）`text-foreground`（neutral-9）
- 兩者行高均為 1.5（閱讀模式）

## 間距

- **label → value**（同 item 內）：`mt-0.5`（2px）——極小間距，視覺上 label 與 value 緊密配對
- **items 之間垂直 gap**：`gap-y-[var(--layout-space-tight)]`——density-aware，跟隨系統密度設定
- **columns 之間水平 gap**：`gap-x-4`（16px）

## Props

### `cols`：grid 欄數

| 值 | 用途 |
|---|---|
| `1`（預設） | 垂直堆疊，適合窄容器（NameCard、sidebar detail） |
| `2` | 兩欄並排，適合中等寬度（NameCard info fields） |
| `3` | 三欄，適合寬容器（detail panel） |

## vs Field 系統

| | DescriptionList | Field |
|---|---|---|
| 用途 | 唯讀展示 | 表單輸入（含 read-only mode） |
| 語義 | `dl/dt/dd` | `label` + input control |
| 互動 | 無 | 輸入、驗證、提交 |
| 密度感知 | 垂直 gap 跟隨 layout-space | 高度、padding 跟隨 ui-size |

---

## 相關

- `../Field/field.spec.md` — 表單輸入（需要編輯的對應元件）
- `../DataTable/data-table.spec.md` — 多筆同結構資料（table 對應）
- `../NameCard/name-card.spec.md` — NameCard info fields 的消費者
- `../../tokens/layoutSpace/layoutSpace.spec.md` — 垂直 gap 的 density 感知 token
