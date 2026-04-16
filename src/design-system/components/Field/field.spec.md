# Field 設計原則

## 定位

Field 是**表單欄位的佈局容器**。只負責排版（label / control / description / error 的空間關係）與**狀態 context**（把 mode / disabled / required / invalid / id 傳給子元件），**不擁有任何資料型別邏輯**。

與資料相關的一切（格式化、驗證、readonly 呈現、DataTable cell 顯示）住在各個資料型別的 Control 元件本身（Input、NumberInput、Checkbox、Switch 等）。Field 不 wrap、不代理、不轉換它們的行為。

---

## 與 Input 家族的職責切分

Field 和 Input 家族（Input / NumberInput / DatePicker / Select / Combobox / LinkInput / PeoplePicker / Textarea）是兩件事：

- **Field**（本元件）：只管佈局 + 狀態 context
- **Input 家族 / Checkbox / Switch / RadioGroup**：管自己的資料型別 + edit/readonly/disabled 三態 + 格式化（XxxDisplay 供 DataTable 共用）

這麼拆的理由：**Checkbox 在 table cell、form field、settings row 應該是同一個 primitive**，不該為了進到 form 就被包一層 CheckboxField；form 的高度對齊由 Field 的 control area 負責，不由 primitive 本身負責。Input 家族的詳細共用規則見 `components/Field/field.spec.md`。

---

## 結構

```tsx
<Field orientation="vertical | horizontal" labelWidth="120px">
  <FieldLabel>姓名</FieldLabel>
  <Input value={name} onChange={setName} />
  <FieldDescription>會顯示在專案列表標題</FieldDescription>
  <FieldError>{errors.name}</FieldError>
</Field>
```

子元件有四種 slot：

| Slot | 元件 | 職責 |
|---|---|---|
| label | `<FieldLabel>` | 欄位名稱，handles required 星號、disabled 灰化、htmlFor 連結 |
| control | 任何非 label/desc/error 的 child | 輸入元件本體（Input、Checkbox、Switch...） |
| description | `<FieldDescription>` | 次要說明文字，fg-secondary |
| error | `<FieldError>` | 錯誤訊息，error-text 色，`role="alert"`，無內容時不渲染 |

子元件寫法採**扁平結構**（直接作為 Field children），Field 內部用 `displayName` 判別 slot 類型並自動組合。consumer 不需要包 wrapper。

---

## 樣式規範（全部 codify 在 field.tsx，不依賴 consumer）

| 元素 | Token / 值 |
|---|---|
| FieldLabel（一般） | `text-body`（14px）/ `text-foreground`（neutral-9） |
| FieldLabel（disabled） | `text-body` / `text-fg-disabled`（neutral-6） |
| FieldLabel 的 required `*` | `text-fg-muted`（neutral-7），**貼齊 label 文字無 gap**，disabled 時 `text-fg-disabled` |
| FieldDescription（一般） | `text-body`（14px）/ `text-fg-secondary`（neutral-8） |
| FieldDescription（disabled） | `text-body` / `text-fg-disabled` |
| FieldError | `text-body`（14px）/ `text-error-text` / `role="alert"` |
| Field 內部 gap（vertical） | `gap-1`（4px） |
| Field 內部 gap（horizontal，content 欄） | `gap-1`（4px） |
| Horizontal 模式 label 與 control 的 gap | `gap-x-3`（12px） |
| Control area（任何 size） | `min-h-field-{size}` + `flex items-center` |

**lg size 的字體**：`FieldLabel` / `FieldDescription` / `FieldError` 會自動切換為 `text-body-lg`，對齊 Input 的 lg 字體。

---

## Orientation

### vertical（預設）

Label 在上、control 在下、description 和 error 往下堆疊。垂直節奏 `gap-1`（4px）。

```
[Label]
[Control]       ← min-h-field-md，control 垂直置中於此 box
[Description]
[Error]
```

適用：標準表單、密集欄位。

### horizontal

Label 在左、control + description + error 在右欄垂直堆疊。Label 與 control **垂直對齊於第一行中線**（見下一段）。

```
[Label]   [Control       ]
          [Description]
          [Error]
```

適用：settings 面板、寬螢幕 form、iOS-style 欄位。

Horizontal 模式下 label 的欄寬由 `labelWidth` prop 控制（任何 CSS length 值），預設 `auto` 由 label 內容撐開。內部用 CSS variable `--field-label-width` 傳給 grid template column。

---

## Horizontal 模式的 label 垂直對齊（重要）

### 規則（依 controlLayout 分兩套策略）

Label 的對齊策略依 `controlLayout`（Field 自動偵測 / consumer 可覆寫）分兩套，分別對應 control 語意模型的差異：

#### A. Inline control（`Input` / `Button` / `Switch` / `SegmentedControl` 等）

Control 有固定單行高度 = `--field-height-{size}`，可以談「中線對齊」。依 label 總高度分兩段：

| 情境 | 對齊方式 |
|---|---|
| **label 總高 ≤ field-height**（單行或很短）| label 第一行中線對齊 control 中線（視覺置中於 control）|
| **label 總高 > field-height**（多行超出 control）| label **齊頂**對齊 control top——整個 label 從 control 上緣往下長 |

切換點自動發生在 label 高度 = field-height 時。

**實作**：`min-h-field-{size} + flex flex-col + justify-content: center`

```css
min-height: var(--field-height-{size});
display: flex;
flex-direction: column;
justify-content: center;
```

原理：

| Label 高度 | 容器行為 |
|---|---|
| 1 行 21px in min-h 32px | min-h 生效容器固定 32px，`justify-center` 把 label 垂直置中 → 第一行 top 在 `(32-21)/2 = 5.5px` → 第一行中線對齊 control 中線 ✓ |
| 2 行 42px in min-h 32px | 內容超過 min-h，容器被撐大到 42px，`justify-center` 沒有多餘空間 → label top 在 0 → 對齊 control top ✓ |

#### B. Block control（`RadioGroup` / `CheckboxGroup`）

Control 是多行群組，**沒有「整體中線」可以對齊**；錨點是「第一個 item 的第一行中線永遠在 `field-height/2`」，由 SelectionItem 的 `py = calc((field-height - 1lh)/2)` 維持。

**對齊策略**：label 第一行永遠與第一個 item 第一行對齊，不論 label 長短。

**實作**：`padding-top: calc((field-height - 1lh)/2)`（把 label 第一行推到跟第一個 item 第一行同位置）

這個策略對任何 label 長度都正確：短 label 視覺置中於第一個 item；長 label 從第一個 item 的位置往下延伸超過 control，不會出現 inline 情境那種「label 卡在下半部」的問題，因為 block control 本身就多行。

### 為什麼不能只用一套策略

曾經嘗試用 `min-h + flex-center` 統一處理所有情境，**在 block + 長 label 的組合下會 regression**：label 被撐大超過 min-h 後 `justify-center` 失效、label top 跳到 y=0；但第一個 radio item 仍在 `y = (field-height - 1lh)/2 = 5.5px` 位置，兩者錯開 5.5px 不對齊。

根因：inline 和 block control 是**不同的對齊語意模型**（control 中線 vs 第一個 item 第一行中線），必須分兩套策略。

### 為什麼不用 JS 測量

- 兩套策略都是純 CSS，size / density / 字體切換時自動連動，不需 ResizeObserver
- 符合 CLAUDE.md「可推導的值用 `calc()` 或公式表達，不硬寫結果」原則

### 為什麼不用 JS 測量

- 策略純 CSS，size / density / 字體切換時自動連動，不需 ResizeObserver
- 符合 CLAUDE.md「可推導的值用 calc() 或公式表達，不硬寫結果」原則

### 為什麼不用 JS 測量

- 公式純 CSS，size / density / 字體切換時自動連動，不需 ResizeObserver
- 符合 CLAUDE.md「可推導的值用 calc() 或公式表達，不硬寫結果」原則
- 跨 Atlassian / Salesforce Lightning / Polaris 等世界級系統的共通做法

### 其他世界級系統的對照

| 系統 | 作法 |
|---|---|
| **Atlassian DSP** | 相同公式（`align-items: flex-start` + `padding-top`） |
| **Salesforce Lightning** | 相同（`slds-form-element__label` 有 `padding-top` 對齊） |
| **Polaris (Shopify)** | 類似（`align-items: baseline` + baseline 修正） |

---

## Control area:Inline vs Block

Field 的 control area 有兩種佈局模型,涵蓋所有 control 類型。**核心原則:無論哪一種,「control 第一行內容的中線」都錨在 `field-height/2`**——這是維持 FieldGroup 垂直韻律的關鍵錨點,也讓 horizontal 模式的 label 公式對 inline / block 都成立。

| Layout | Control area 樣式 | 適用 control |
|---|---|---|
| **inline**(預設) | `min-h-field-{size}` + `flex items-center` | Input / NumberInput / DatePicker / Select / Combobox / LinkInput / Textarea(單行使用)、Checkbox / Switch / 單一 Button(如 upload picker) |
| **block** | `flex flex-col items-start` + `padding-top: calc((field-height - 1lh) / 2)`,**不設 min-h** | RadioGroup / CheckboxGroup / FileDropzone / RichTextEditor / inline DataTable 等多行/任意高度區塊 |

### 兩種模式的對齊幾何

```
Inline                            Block
┌────┬───────────────┐           ┌────┬───────────────┐
│    │               │           │Lbl │ ● Option A    │ ← 第一行中線 = field-height/2
│Lbl │ [Input      ] │ ← 中線    │    │ ● Option B    │
│    │               │           │    │ ● Option C    │
└────┴───────────────┘           └────┴───────────────┘
```

兩個 Field 放在同一個 FieldGroup 時,Lbl 第一行中線完全對齊——Input 的中線與 Option A 的中線都落在同一條水平線上。

### 為什麼 block 不是「整組垂直置中」

直覺上會想說 control area 多行時整組 vertical center,但這會讓:
1. 第一個 Radio 往下掉,跟 label 第一行中線錯位
2. FieldGroup 裡 inline / block field 並排時節奏斷掉

正確做法是「**第一行對齊**」——後續 item 從第一行往下流,label 公式錨在第一行中線。Atlassian DSP / Polaris / Material 都是這個模型。

### 為什麼 primitive 不自己變高

**Checkbox / Switch / RadioGroupItem 的 primitive 保持原生尺寸**(16-20px),不為了 form 而被拉高。世界級系統(shadcn、Radix、Material、Atlassian)全部這樣做。理由:

1. **Primitive 保持單一職責**——Checkbox 在 table cell、toolbar、menu 裡仍然是 16px,不受 form 高度污染
2. **高度節奏由 Field 容器提供**——一次設定,所有 primitive 在任何 size / density 都自動對齊
3. **DataTable cell 共用同一個 min-h 機制**——不需為 cell 另發明對齊邏輯

### 水平排列 Field 時的垂直對齊

多個 Field 並排時,每個 Field 的 control area 都依公式錨在 `field-height/2`,不論 inline 還是 block,**「控件第一行中線」都落在同一條線上**——Input、Checkbox、Switch、RadioGroup 第一個 option 並列時視覺上完全對齊。

---

## 如何宣告 block primitive(程式化機制)

block / inline 不是 consumer 決定的——是**元件本身的固有性質**(RadioGroup 永遠是 block,Input 永遠是 inline)。所以由 primitive 自己宣告,Field 自動偵測。

### Convention

block primitive 在自己的 `.tsx` 檔案掛一個 static 屬性:

```tsx
const RadioGroup = React.forwardRef(...)
RadioGroup.displayName = 'RadioGroup'
;(RadioGroup as unknown as { fieldLayout: 'block' }).fieldLayout = 'block'
```

Field 在 render 時讀第一個 control child 的 `type.fieldLayout`,沒宣告就視為 `'inline'`。**Consumer 完全無感**:

```tsx
<Field>
  <FieldLabel>性別</FieldLabel>
  <RadioGroup>...</RadioGroup>   {/* Field 自動切 block,不用傳任何 prop */}
</Field>
```

### 為什麼選這個機制(不是 Field 內部寫死白名單,也不是 consumer 傳 prop)

| 候選 | 缺點 |
|---|---|
| Consumer 每次傳 `<Field controlLayout="block">` | consumer 要記得;忘了就 layout 歪掉;非世界級設計系統的做法 |
| Field 內部寫死白名單 `['RadioGroup', 'CheckboxGroup', ...]` | Field 耦合一堆它不該知道的元件名稱;新增 block primitive 都要回來改 Field |
| **Primitive 自我宣告 `static fieldLayout`**(採用) | 元件對自己的性質負責;Field 零耦合;新增 block primitive 只要在自己檔案加一行 |

### 逃生艙

`Field` 有 `controlLayout?: 'inline' | 'block'` prop 覆寫自動偵測,只在兩種情況使用:

1. Consumer 把自己手寫的 JSX(`<div>` / 函式元件)當 control,系統無法偵測——強制 `block`
2. 想覆寫 primitive 預設(罕見)

### Block primitive 的第一行對齊責任(重要)

Field 的 block control area **不加額外 paddingTop**——信任 primitive 自己把第一行 content 推到正確位置。

**正確位置** = `(field-height - 1lh) / 2`(跟 label 在 horizontal 模式的 paddingTop 公式一致,兩邊第一行中線都落在 field-height/2)。

需要視覺對齊的 block primitive 自行保證第一行位置:
- **RadioGroup / CheckboxGroup**:子元件 SelectionItem 自帶 `py = calc((field-height - 1lh) / 2)`,第一個 item 的文字自然在正確位置 ✓
- **其他 block primitive**(FileDropzone / RichTextEditor 等):如果需要 label 第一行對齊,自己加對應 padding;如果不需要視覺對齊(例如填滿容器的 drop zone),不加即可

**為什麼 Field 不自己加 paddingTop?** 因為已有 py 的 primitive(RadioGroup)會 double padding。讓 primitive 自己負責更可靠——primitive 知道自己的內部結構,Field 不知道。

### 已宣告為 block 的 primitive

- `RadioGroup`(`components/RadioGroup/radio-group.tsx`)

未來新增 `CheckboxGroup` / `FileDropzone` / `RichTextEditor` / inline `DataTableField` 時,在元件檔案加一行 `;(X as any).fieldLayout = 'block'` 即可,Field 不需要任何修改。

---

## FieldContext — 子元件如何讀 Field 狀態

Field 透過 Context 暴露以下狀態給子元件（Primitive 可以透過 `useFieldContext()` 讀取）：

| 欄位 | 用途 |
|---|---|
| `id` | FieldLabel 自動 `htmlFor`、Input 自動 `id` |
| `descriptionId` | FieldDescription 的 id，Input 自動 `aria-describedby` |
| `errorId` | FieldError 的 id，Input 自動 `aria-errormessage` |
| `mode` | `edit` / `readonly` / `disabled`，Control 決定自己的視覺形態 |
| `disabled` | Control 顯示 disabled 樣式 |
| `required` | FieldLabel 自動渲染 `*`；Input 自動 `aria-required` |
| `invalid` | Control 顯示 error 邊框；Input 自動 `aria-invalid` |
| `size` | Control 自動同步尺寸（sm / md / lg） |
| `orientation` | FieldLabel 的垂直對齊策略（horizontal 模式套用 padding-top 公式） |
| `hasFieldWrapper` | Primitive 讀到此旗標時應忽略自己的 label / description prop，由 FieldLabel / FieldDescription 接管 |

### Primitive 的 Field-aware 行為

**Checkbox / Switch / RadioItem** 等 primitive 自己有 `label` / `description` props 可用於**獨立使用場景**（不在 Field 內），但在 Field context 內時：

- 讀到 `hasFieldWrapper === true` 就**忽略自己的 `label` / `description` props**（若 consumer 誤傳，開發環境可 warn）
- 改由 `<FieldLabel>` 和 `<FieldDescription>` 接管這兩個 slot
- 避免「雙層 label」

這個機制讓**同一個 primitive 可以在兩種情境下正確呈現**：

```tsx
// 情境 A：獨立使用（toolbar / settings row / dashboard widget）
<Checkbox label="訂閱電子報" description="每週一封" />

// 情境 B：form 內（Field 接管 label）
<Field>
  <FieldLabel>訂閱電子報</FieldLabel>
  <Checkbox />
  <FieldDescription>每週一封</FieldDescription>
</Field>
```

兩種情境用同一個 primitive，一份樣式規範。

---

## Required 星號

- Field 的 `required` prop 透過 context 傳給 FieldLabel 自動渲染 `*`
- 星號 `text-fg-muted`（neutral-7），**緊貼 label 文字無 gap**（不用 `margin-right`）
- Disabled 時星號改為 `text-fg-disabled`（neutral-6），與 label 同步降色
- 個別 FieldLabel 可用 `required` prop 覆寫 context 值

**為什麼貼齊無 gap**：星號是 label 語意的一部分（WCAG 友善——screen reader 先讀 required 再讀 label），不是獨立視覺元素，所以不需要間距。

---

## 驗證與 aria 屬性

- `invalid` 透過 context 讓 Control 顯示 error 邊框、自動 `aria-invalid`
- `errorId` 讓 Control 自動 `aria-errormessage`
- `descriptionId` 讓 Control 自動 `aria-describedby`
- `<FieldError>` 自帶 `role="alert"` 並有 id = `errorId`
- 無 children 的 `<FieldError>` 不渲染，不佔位

---

## FieldGroup — 多 Field 垂直堆疊

```tsx
<FieldGroup gap="normal">
  <Field><FieldLabel>姓名</FieldLabel><Input /></Field>
  <Field><FieldLabel>email</FieldLabel><Input /></Field>
  <Field orientation="horizontal" labelWidth="120px">
    <FieldLabel>訂閱</FieldLabel>
    <Switch />
  </Field>
</FieldGroup>
```

gap 三個選項：

| gap | 值 | 用途 |
|---|---|---|
| `compact` | `gap-3`（12px） | 密集表單、dialog 內 |
| `normal`（預設） | `gap-4`（16px） | 標準表單 |
| `loose` | `gap-6`（24px） | 寬鬆大表單、settings 頁 |

---

## Button 作為 control 的判斷標準

Field 的 control 是「**承載這個欄位 value 的輸入介面**」。Button 在某些場景就是這個介面——例如 upload button(點擊開檔案選擇器,結果寫回 field)、picker opener(連結 OAuth、開選人對話框)。這類 Button **可以**作為 control:

```tsx
<Field orientation="horizontal" labelWidth="120px">
  <FieldLabel>合約附件</FieldLabel>
  <Button startIcon={Upload} variant="secondary">上傳檔案</Button>
  <FieldDescription>PDF / DOCX,最大 10 MB</FieldDescription>
</Field>
```

Button 的 height 與 `field-height` 共用同一組 token,放進 inline control area 自然對齊 Input 中線,horizontal 模式的 label 公式也自然對到——不需要任何特例。

**判斷標準**:點擊這顆 Button 是否產生 / 修改此欄位的 value?

| 是 | 否 |
|---|---|
| ✅ Upload(產生 file value) | ❌ 表單 submit / cancel(form action,放到 form footer) |
| ✅ Picker opener(開對話框選 value) | ❌ 「重設此欄位」(可放到 endAction 或 description 旁,不是 control) |
| ✅ Connect OAuth(產生 token value) | ❌ 頁面導覽、刪除整筆資料(page action) |

**規則**:Button 是 control 時通常 inline(高度 = field-height);若是 block 類的「上傳區塊」(FileDropzone),則該元件本身宣告為 block primitive。

---

## 禁止事項

- ❌ 不得在 Field 內再包 Field——Field 不支援巢狀
- ❌ 不得在 Field 內同時放 `<FieldLabel>` 和給 primitive 傳 `label` prop——Field context 會讓 primitive 忽略自己的 label,但語意上仍是重複宣告,避免誤導
- ❌ 不得跳過 `<FieldLabel>` 直接寫 `<label>`——失去 required 星號、disabled 處理、size 連動等 codified 樣式
- ❌ 不得為了「讓 Checkbox 與 Input 同高」而修改 Checkbox primitive——高度對齊由 Field control area 負責
- ❌ Horizontal 模式下不得對 FieldLabel 自訂 `padding-top`——會打破公式對齊
- ❌ 不得把**與此欄位 value 無關的 action**(form submit/cancel、頁面導覽、刪除整筆資料)放進 control area——Field 是資料輸入容器,不是 action container。Button 是否能當 control,看上一節的判斷標準
- ❌ 不得在 block control area 自訂 `min-height` 或改 `items-start`——會打破第一行對齊公式
- ❌ 不得在 block primitive 的 `.tsx` 漏掉 `fieldLayout = 'block'` 宣告——Field 會誤判成 inline 導致 layout 歪掉

---

# Input 家族共用設計原則

> **注意**：此文件是 Input 家族（Input / NumberInput / DatePicker / Select / Combobox / LinkInput / PeoplePicker 等）**共用**的設計原則，與 `components/Field/field.spec.md`（表單 Layout 容器）**不是同一個東西**。
>
> - **Input 家族**（本文件）：具體的資料型別輸入元件，內部含 edit/readonly/disabled 三態 + 格式化 + DataTable Display 共用
> - **Field**（`Field/field.spec.md`）：shadcn 風格的表單 Layout 容器（label + description + error），wrap 上述 Input 家族元件

## 定位

Input 家族是資料輸入與顯示的基礎元件。每種資料類型（text、number、date、select...）對應一個元件，同時服務 Form 和 DataTable：

- **Form**：用 Input 家族的 edit / readonly / disabled 三態（在 Field 容器內）
- **DataTable**：用 Input 家族的 Display 子元件渲染 cell

每個元件擁有該類型的格式化邏輯（唯一真實來源），Form 和 DataTable 消費同一份 code。

---

## 架構

```
components/
├── fields/                  ← 共用工具與型別
│   ├── field-types.ts       ← FieldMode 共用型別
│   ├── field-wrapper.tsx    ← 共用 wrapper 樣式、bareInputStyles、EMPTY_DISPLAY
│   └── field.spec.md ← 本文件
├── Input/                   ← Input + InputDisplay
├── NumberInput/             ← NumberInput + NumberInputDisplay + formatNumber
├── DatePicker/              ← DatePicker + DatePickerDisplay + formatDate
├── Select/                  ← Select + SelectDisplay
├── Combobox/                ← Combobox + ComboboxDisplay
├── LinkInput/               ← LinkInput + LinkInputDisplay
├── PeoplePicker/            ← PeoplePicker
└── Textarea/                ← Textarea（多行）
```

每個元件 export 兩樣東西：
1. **主元件**（如 `Input`）— Form 用，有 edit / readonly / disabled 三種模式
2. **Display 子元件**（如 `InputDisplay`）— DataTable cell 用，純格式化顯示

---

## Mode — 三種模式

| Mode | 底色 | 邊框 | 文字色 | 用途 |
|------|------|------|--------|------|
| `edit` | surface | border（hover 深一階、focus primary） | foreground | 表單可編輯欄位 |
| `readonly` | neutral-2 | 無 | foreground | 表單中不可編輯但可見的欄位 |
| `disabled` | neutral-2 | 無 | fg-disabled | 表單中被停用的欄位 |

三種模式共用同一個 wrapper 結構（`fieldWrapperStyles`），只有底色、邊框、文字色不同。

### disabled 的停用原因

停用原因由外部承擔，不在 input 內放 info icon：
- **Tooltip**：包住整個 Field 元件（wrapper `<div>` 不是 disabled 元素，可正常接收 hover）
- **Form help text**：在 input 下方說明（Form 層負責）

### 原生屬性覆蓋

`disabled` 和 `readOnly` 原生 HTML 屬性會自動覆蓋 `mode` prop，避免衝突。

---

## Error — 正交於 mode

Error 是 boolean prop，獨立於 mode。只在 `edit` 模式下有視覺效果（`border-error`）。

- Error 視覺在 Field（input）層級：紅色邊框 + `aria-invalid`
- Error 訊息在 Form 層級：help text 顯示在 input 下方
- Field 不在尾部放狀態 icon（如 ⚠️）——邊框顏色已經傳達了 error 狀態

Form wrapper 可透過 context 注入 `error` prop，消費者不需要在每個 Field 上手動傳。

---

## Size — 與 Button 對齊

| Size | 高度 token | Tailwind | 字體 |
|------|-----------|----------|------|
| `sm` | `--field-height-sm` | `h-field-sm` | text-body |
| `md` | `--field-height-md` | `h-field-md` | text-body |
| `lg` | `--field-height-lg` | `h-field-lg` | text-body-lg |

高度使用 `--field-height-*` semantic token（rem 單位），與 Button 共用同一組 token，同 size 的 Field 和 Button 並排時高度一致。

---

## Focus 行為

`<input>` 元素在點擊和鍵盤 Tab 時都觸發 `:focus-visible`（瀏覽器規範：文字輸入永遠 focus-visible），CSS 無法區分。

統一使用 `border-primary`（1px），不加 ring、不加粗。

---

## 點擊與游標原則

### 點擊穿透

Field 內部所有不會觸發獨立 action 的元素必須 `pointer-events-none`，讓點擊穿透到底層的 input/select，確保使用者點擊 Field 內任何位置都能 focus/activate。

穿透（`pointer-events-none`）：startIcon、ChevronDown 下拉箭頭、tag 文字區域。
不穿透：endAction（clear、toggle password）、tag dismiss button——這些有自己的 action。

### 游標指引

可點擊的元素必須有明確的 cursor 變化：
- endAction、dismiss button → `cursor-pointer`
- input / select → `cursor-text` / `cursor-pointer`（原生行為）
- disabled → `cursor-not-allowed`

## Icon 色彩原則

跨元件統一規則（詳見 `item-layout.spec.md`）：**icon 代表內容/類別 → 與 label 同色；icon 純指示方向 → fg-muted（neutral-7）。**

Field 內的具體套用：

- **startIcon**（Search、Calendar）：`fg-muted`——指示 field 用途，不是 value
- **ChevronDown 下拉箭頭**：`fg-muted`——指示可下拉
- **代表 value 的 icon**（如狀態 icon）：**foreground**——icon 本身就是 value 的一部分
- **disabled 時**：所有 icon 統一 `fg-disabled`

## startIcon

左側靜態 icon，輔助使用者理解 input 的用途（如 Search icon）。屬於 input 的視覺提示，不屬於 value。

- 顏色 `fg-muted`（disabled 時 `fg-disabled`）
- `aria-hidden`——純裝飾
- 命名與 Button 的 `startIcon` 一致

## 下拉箭頭（Select / Combobox）

Select 和 Combobox 的最右側固定顯示 ChevronDown icon，指示可下拉選擇。

- 顏色 `fg-muted`——指示意圖，不是 value
- 不可互動（`pointer-events-none`）——下拉由 select 元素本身觸發
- clearable 有值時：clear X 在左，ChevronDown 在右
- 右側元素（clear + chevron）的 `paddingRight` 統一 12px（`0.75rem`），跟 Input 一致

## Select 顯示模式

Select 支援兩種顯示模式（`display` prop）：

| 模式 | edit | readonly / disabled | 適用場景 |
|------|------|---------------------|---------|
| `text`（預設） | 原生 select 純文字 + ChevronDown | 跟 Input 一致（純文字 + 標準 padding） | 狀態、類別等文字選項 |
| `tag` | Tag + 隱藏 select overlay + ChevronDown | Tag + tagPadding | 需要視覺標記的選項（顏色標籤等） |

`text` 模式可搭配 `startIcon`（代表 value 的圖示，如狀態 icon）。

`tag` 模式的 edit 用 hidden select overlay（跟 Combobox 同模式），Tag 用 `pointer-events-none`，點擊穿透到 select。右側元素 `paddingRight: 12px`。

tagPadding 只在有 Tag 時才套用。Placeholder/空值狀態使用 fieldWrapper 的標準 px-3 padding，確保文字與邊框有足夠間距。

---

## endAction（Inline Action）

右側可互動元素，用於操作動作（清除內容、顯示密碼等）。

使用宣告式 API：

```tsx
<Input endAction={{ icon: X, label: '清除', onClick: handleClear }} />
```

Field 內部用 `<ItemInlineAction>`(`item-layout.tsx` 共用元件)渲染 — 跟 Sidebar / TreeView / DropdownMenu 的 inline action **完全同一套** canonical 實作,不再有「每個 host 自己複製 18 行 button JSX」的漂移。

- 共用規則見 `uiSize.spec.md` 的 Inline Action 段落
- Helper 規格與 API 見 `item-layout.spec.md` 的「Inline action 共用元件」節
- Field host 必須傳 `size={size}` 給 `<ItemInlineAction>`(field 不在 `RowSizeContext` 內,需明確覆寫)

Icon 色彩遵循 Inline Action 統一規則:預設 `fg-muted`,hover 時 `foreground`。

- disabled / readonly 模式不渲染 endAction
- 條件渲染即可——消失後不佔位,input 自然擴展
- 下拉箭頭不屬於 endAction,屬於 Select / Combobox

**特例:Tag dismiss**——Tag 的 dismiss button 需要 chromatic hover bg(跟 tag 的 solid variant 色相一致),不是中性的 neutral-hover,因此**沒有**用 `ItemInlineAction`,維持自己的內部 JSX。這是合理特例,見 `tag.tsx:104` 的詳細註解。

---

## Display — 格式化顯示

每個 Field 元件 export 一個 Display 子元件，負責把 raw value 格式化為可讀文字或 ReactNode。

Display 的消費者：
- **DataTable cell**：根據 `meta.type` 自動選擇對應的 Display 元件
- **Field readonly 模式**：內部使用相同的格式化邏輯

### null / undefined 值

Display 模式統一顯示 em dash `—`，顏色 `text-fg-muted`。edit 模式顯示空白。

此規則適用於所有 Field 類型，boolean 例外（顯示 unchecked 狀態）。

### DataTable 整合

DataTable 根據 column 的 `meta.type` 自動選擇 Display 元件：

```tsx
// 自動渲染——不需要手寫 cell
col.accessor('price', {
  header: 'Price',
  meta: { type: 'currency', prefix: '$' },
})

// 客製化——有自訂 cell 時完全跳過 type → Display
col.accessor('status', {
  header: 'Status',
  cell: (info) => <MyCustomBadge status={info.getValue()} />,
})
```

兩者可在同一張 table 混用。

---

## 表單驗證原則

詳見 `fields/form-validation.spec.md`。

## 禁止事項

- ❌ 不在 disabled input 內放 info icon——停用原因由外部 Tooltip 或 Form help text 承擔
- ❌ 不在 input 尾部放 error 狀態 icon——邊框顏色已傳達 error
- ❌ endAction 不可傳入 ReactNode——使用 InlineActionConfig 宣告式 API
- ❌ endAction 的 inline action 不可省略 `aria-label`（即 `label` 欄位）
- ❌ Display 的 null 值不可顯示空白——統一使用 `—`（em dash）+ `text-fg-muted`
- ❌ Field 的 readonly 模式不可用於 DataTable cell——readonly 有底色和 wrapper 開銷，table cell 用 Display 元件
