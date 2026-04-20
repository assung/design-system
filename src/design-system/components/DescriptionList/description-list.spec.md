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

## 禁止事項

- ❌ 不要把 DescriptionList 拿來做 Form field label——表單需要編輯的 label + control 對應關係由 `Field`(含 `FieldLabel`)承載;DL 是唯讀 `<dl>` 語意,沒有 `<label for>` 對 input 的綁定
- ❌ 不要在同一資料卡內混用 Field 和 DescriptionList——同一 section 的 label / value 語意必須一致,否則 screen reader 會讀出混淆的 term/description 對話。要編輯用全 Field,要唯讀全 DL
- ❌ 不要用 DescriptionList 展示多筆同結構資料(使用者清單、訂單清單)——DL 是單實體屬性列表,多筆用 `DataTable`
- ❌ 不要在 `<dt>` / `<dd>` 內嵌互動元件(Button / Input)——DL 是 `<dl>` 唯讀語意,塞互動會破壞 SR 敘事流;需要互動改用 Field 或 action row
- ❌ 不要覆寫 label / value typography token(例改 `<dt>` 成 `text-heading-sm`)——DL 層級靠色彩區分不靠 size,改 size 會破壞「屬性-值」對應感

---

## 無障礙

- **語意 HTML**:外層 `<dl>`,每組內 `<dt>` 為 term、`<dd>` 為 description——screen reader 會讀成「term X, description Y」對話,明確表達屬性-值關係
- **DT / DD 配對**:每個 `<dt>` 必須有對應的 `<dd>`(不可孤立),否則 SR 敘事會中斷;元件內建一組 `DescriptionItem` 強制配對,不分開暴露 `<dt>` / `<dd>` primitive
- **空值呈現**:value 空時以 `—` 占位(由 consumer 填入或於 DL 內 normalize),`text-fg-muted` 降低視覺重量;SR 會讀出「長破折號」,比空 `<dd>` 更明確
- **多欄 `cols > 1`**:視覺為 grid 欄位,但 DOM 順序為 item 順序——SR 仍依 DOM 敘事(term1 → desc1 → term2 → desc2),不依視覺欄位;設計時確保 DOM 順序符合語意分組
- **長值換行**:value 內長字串(URL / ID)以 `break-words` 處理,避免撐破 grid;不強制單行 truncate,長內容保留可讀完整性
- **列表識別**:預設 `<dl>` 有部分瀏覽器 SR 不視為 list,若需明確 list 語意,DL 根容器可搭配 `role="list"` + `<div role="listitem">`(目前預設不加,保留標準 `<dl>` 語意,consumer 可自行加 role 覆蓋)

---

## 為何無 Inspector / ColorMatrix / SizeMatrix

DescriptionList 是**唯讀 label / value 資料呈現**(非互動 / 非 variant 驅動):

- **無 Inspector**:DL 的決策維度是 columns(單欄 / 雙欄 / 多欄)已在 `ColsMatrix` 覆蓋。互動 Inspector 無進一步 prop(value 呈現由資料決定,非 prop 切換)。
- **無 ColorMatrix**:DL 固定 semantic token(label `text-fg-secondary` / value `text-foreground`),無自己的色彩變體,dark mode 由 semantic token 自動切換。加 color variant 不符語意(DL 是資訊展示,非狀態載體)。
- **無 SizeMatrix**:DL 無 size prop——垂直間距隨 `layout-space` token 感知 density(見「間距」段),但 label / value typography 走 reading mode 固定 tier,不提供 sm / md / lg 變體。不同 density 由 token 自動處理,非 prop 切換。

對應 anatomy story:保留 `Overview` + `ColsMatrix`(元件特有 1 / 2 / auto 欄對照) + `StateBehavior`(空值 `—` / 長值 / 多行)。

---

## 相關

- `../Field/field.spec.md` — 表單輸入（需要編輯的對應元件）
- `../DataTable/data-table.spec.md` — 多筆同結構資料（table 對應）
- `../NameCard/name-card.spec.md` — NameCard info fields 的消費者
- `../../tokens/layoutSpace/layoutSpace.spec.md` — 垂直 gap 的 density 感知 token
