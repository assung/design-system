# UiSize 設計原則

元件高度的語義 token，rem 單位。透過 `data-density`（或 `data-ui-size`）切換。

## Field Height

Button、Input、Checkbox/Radio SelectionItem 等互動元件。

| Token | md density | lg density |
|-------|-----------|-----------|
| `--field-height-xs` | 1.5rem (24px) | 1.5rem (24px) — 固定 |
| `--field-height-sm` | 1.75rem (28px) | 2rem (32px) |
| `--field-height-md` | 2rem (32px) | 2.25rem (36px) |
| `--field-height-lg` | 2.25rem (36px) | 2.5rem (40px) |

### Field-height family 清單與共享 default（SSOT）

**消費 `--field-height-*` token 的元件組成「field-height family」。這個 family 必須共享同一個 default size = `md`——違反即設計 bug。**

#### Family 成員

| 元件 | size prop | Default | 預設 token |
|------|-----------|---------|-----------|
| `Button` | xs / sm / md / lg | **`md`** | `--field-height-md` |
| `Input` | sm / md / lg | **`md`** | `--field-height-md` |
| `NumberInput` | sm / md / lg | **`md`** | `--field-height-md` |
| `DatePicker` | sm / md / lg | **`md`** | `--field-height-md` |
| `Select` | sm / md / lg | **`md`** | `--field-height-md` |
| `Combobox` | sm / md / lg | **`md`** | `--field-height-md` |
| `LinkInput` | sm / md / lg | **`md`** | `--field-height-md` |
| `Textarea` | sm / md / lg | **`md`** | `--field-height-md` |
| `Switch` | sm / md / lg | **`md`** | `--field-height-md` |
| `Slider` | sm / md / lg | **`md`** | `--field-height-md`（只控容器外高，thumb/track 不變） |
| `SegmentedControl` | xs / sm / md / lg | **`md`** | `--field-height-md` |
| `Checkbox` | sm / md / lg | **`md`** | `--field-height-md`（控件 16/20px 對應） |
| `RadioGroup` | sm / md / lg | **`md`** | `--field-height-md`（控件 16/20px 對應） |
| `Rating` | sm / md / lg | **`md`** | `--field-height-md`(container 對齊,icon 走 icon tier 16/16/20) |
| `TimePicker` | sm / md / lg | **`md`** | `--field-height-md`(Ant-style 時間選擇,對齊 DatePicker 家族) |
| `Tag` | sm / md / lg | **`md`** | 自帶尺寸，透過 Field size 配對 |

#### 單一尺寸消費者（不在 default-md 規則內）

| 元件 | 固定 size | 理由 |
|------|----------|------|
| `Chip` | 固定 `h-field-sm`（28/32px） | Material 3 / Atlassian / Polaris 共識：filter chips 使用單一高度。不暴露 size prop |

#### 偏離 field-height family 的 rationale 格式(canonical)

任何元件的 size prop **偏離 field-height 對齊**(例:Checkbox 控件 sm/md 都是 16px、Rating 控件非 field-height、Switch 的 thumb 不跟 field-height 成比例等)或 **偏離 default md**(例:Chip 固定 sm),**必須在自己 spec.md 的「尺寸」章節下寫一個子標題固定格式**:

```markdown
### 為什麼不完全對齊 `--field-height-*`(或:為什麼不 default md)

- **現況**:{sm/md/lg 實際數值或 token,e.g. sm=16px / md=16px / lg=20px(Checkbox)}
- **Rationale**:{一句話說明偏離理由,指向世界級或 token spec 或 UX 約束}
- **世界級對照**:{Polaris / Material / Ant / Atlassian 等中至少一個同樣這樣做的 DS}
```

**必須同時滿足**:
1. 子標題必含「為什麼」三字(而非被動「尺寸不同」這類寫法),這樣 audit 可以 mechanical grep 「`### 為什麼不完全對齊`」或「`### 為什麼不 default md`」
2. 三個欄位(現況 / Rationale / 世界級對照)**都要填**,缺一不可——特別是「世界級對照」不能省,mindset #1 要求對標
3. 位置:必須在 spec 的「尺寸」主章節之下(不是埋在「何時不用」或「禁止事項」等其他章節)

**現有已遵循此格式的元件**:Chip(本檔上表已寫,Material 3 / Atlassian / Polaris 共識)/ Checkbox / RadioGroup / Switch / Slider / Textarea / Rating(2026-04-21 批次補齊,五欄格式統一)
**需補齊 rationale 段的元件**:(無 — Phase 2 已全部補齊)。未來新增偏離 field-height 的元件 → 必須按本格式寫,`/design-system-audit` 會 enforce。

**audit hook 未來擴展**:若 cva `defaultVariants.size` 不是 `md`,或 `size` variants 的數值不命中 `--field-height-*`,hook 可要求 spec.md 必有符合格式的 rationale 段,否則 block merge(列為 post-Phase-2 可考慮加上的 mechanical gate)。

#### 為什麼必須共享 default

Consumer 寫 Form 或 Toolbar 時並排多個 field-height 元件：

```tsx
<Button>送出</Button>
<Input />
<Select options={...} />
<SegmentedControl>...</SegmentedControl>
```

**所有元件不傳 size 時就自動對齊**——這是 consumer 的核心體驗。若 SegmentedControl 預設 sm 而 Button 預設 md，consumer 放著不管就會高度不一致，每個 consumer 都要記得手動傳 size，破壞「默認對齊」的承諾。

#### 硬規則

- **新增 field-height 消費者** → 必須 default `md`
- **修改既有 `defaultVariants.size`** → 必須同步更新本表 + 元件 spec.md + tsx docblock + anatomy story 的 default 標記
- **`defaultVariants.size` 跟 spec 聲稱不一致 = 設計 bug**，優先修 code 或 spec 使其對齊本表

#### 歷史錯誤

本專案曾發生 SegmentedControl 的 code defaults 是 `md`、spec + docblock 寫 `sm ★default` 的三方不一致（2026-04-18 修正）。避免方式：改 cva `defaultVariants` 前先讀本表，確認新值仍符合 family 約束。

## Table Row

DataTable 行高。density 切換統一 +0.5rem (+8px)。

| Token | md density | lg density |
|-------|-----------|-----------|
| `--table-row-sm` | 2rem (32px) | 2.5rem (40px) |
| `--table-row-md` | 2.5rem (40px) | 3rem (48px) |
| `--table-row-lg` | 3rem (48px) | 3.5rem (56px) |

---

## 元件尺寸對應系統

**`field-height-lg` 是尺寸切換點。** xs/sm/md 用同一組內部尺寸，lg 切換到較大的一組。

| | xs / sm / md | **lg** |
|---|---|---|
| **Field 高度** | 24 / 28 / 32px | **36px** |
| **Icon 尺寸** | 16px | **20px** |
| **Checkbox / Radio** | sm/md (16px) | **lg (20px)** |
| **字體** | text-body (14px) | **text-body-lg (16px)** |

### 子元件補齊原則

當子元件被父元件透過 size prop 消費時，子元件必須補齊父元件的所有 size 選項，即使值重複。消費端直接透傳 size，不做 mapping。

已套用此原則的元件：Checkbox（sm=md=16px）、Radio（sm=md=16px）、Tag（lg=md=24px）。

### 元件高度地板

**field-height-xs（24px）是獨立互動元件的最小高度。** 任何可獨立存在的互動元件（Button、Input 等）不得使用比 field-height-xs 更小的高度。若空間不足以容納 24px，應重新檢視容器佈局，而非縮小元件。

比 24px 更小的互動區域只存在於元件內部的 Inline Action（如 Tag dismiss、Field endAction），由宿主元件的 spec 定義規格。

### Icon 尺寸 Tier

系統有兩個 icon tier，由元件引用的 field-height token 決定：

| 元件引用 | Icon | 控件（Checkbox/Radio） | 字體 |
|---|---|---|---|
| `field-height-xs / sm / md` | 16px | 16px（內部 icon 12px） | text-body |
| `field-height-lg` | 20px | 20px（內部 icon 16px） | text-body-lg |

這是離散的兩組配對，不存在中間值，不需要公式推導。判斷依據是元件自身的 size prop 對應到哪個 field-height token，與全域 density 設定無關（density 只負責等比放大 field-height 的 px 值）。

**Stroke icon 尺寸的下限是 12px**（出現在 Checkbox 等指示器容器內部）。Filled indicator（如 Radio 的實心圓點）不受此限制——實心形狀在任何尺寸都清晰可辨。

### Tag ↔ Field 配對

Tag 有自己的尺寸定義（見 `tag.spec.md`），與 Field 的配對透過 size 直接對應：

| Field size | Tag size | Tag 高度 | Tag padding (四邊等距) |
|---|---|---|---|
| sm | sm | 20px | (field-height-sm - 1.25rem) / 2 |
| md | md | 24px | (field-height-md - 1.5rem) / 2 |
| lg | lg | 24px | (field-height-lg - 1.5rem) / 2 |

---

## Tab Height

Tabs 導覽容器的高度。獨立於 field-height 和 table-row——tabs 是 navigation container，需要比 form control 更大的呼吸感。數值目前與 table-row 對齊，但概念獨立，未來任何一方調整都不牽動另一方。

| Token | md | lg | 消費者 |
|-------|----|----|--------|
| `--tab-height-sm` | 32px | 40px | Dialog / Sidebar 內的 dense tabs |
| `--tab-height-md` | 40px | 48px | **預設**，頁面主要 tabs |
| `--tab-height-lg` | 48px | 56px | Page-level hero tabs |

Tailwind：`h-tab-sm` / `h-tab-md` / `h-tab-lg`。

## Chrome Header Height

應用程式 chrome 區域(Sidebar header、app top bar、主內容 page header)的高度。定義在 `globals.css`(不在 uiSize.css),因為它是**佈局層級**的 token,不是元件層級。

| Token | md | lg | 消費者 |
|-------|----|----|--------|
| `--chrome-header-height` | 48px | 56px | Sidebar header/footer、主內容 page header、app top bar、`--sidebar-width-icon` |

### Canonical 意圖(AR47,2026-04-21)

**任何跨整個 app 的 chrome 區域(Sidebar header/footer、全域 top bar、主內容 page header)都用同一個 token,不自訂高度**。

| ❌ 反例 | ✓ canonical |
|---------|-------------|
| `<header className="h-16">`(64px 硬寫) | `<header className="h-[var(--chrome-header-height)]">` |
| Sidebar 48、top bar 56、page header 64(跨元件不一致) | 全部 `--chrome-header-height`(md=48 / lg=56),density 自動聯動 |

### 為什麼 48 跟 56 是「同一個 token 不同密度」不是不一致

**讀者常見誤解**:「Sidebar header 48px 但 XXX 56px → 沒共用?」
**正解**:48 / 56 都是**同一個 `--chrome-header-height` token**,只是 **density mode 不同**:
- 在 `<html data-density="md">`(預設)下 token resolve 到 48px
- 在 `<html data-density="lg">` 下 token resolve 到 56px
- 切換 density 時**整個 app 所有 chrome 高度同步變化**,不會有「Sidebar 48 但 top bar 56」的狀況
- 若同時看到 48 與 56,**兩個消費者必須在不同 density context 下渲染**(例如 app 主區 md、某個工具區 lg) — 這是刻意的 density context 切換,不是 bug

**驗證法**:在 DevTools 看兩個「似乎不一致」的 header,它們祖先 `html[data-density]` 值是否相同?
- 相同 → 真有 bug,硬寫了數字繞過 token
- 不同 → 其中一個元件在 density-override 情境,行為正確

**為什麼 48 不 56 / 64**:
- Material App Bar 56dp(mobile)/ 64dp(desktop);Airbnb 主站 header 80px;Shopify 64px
- 本 DS 選 **48px @ md / 56px @ lg** 取「密集工具型產品」的下限(Linear / Figma / Notion 主 chrome 40-52px),給主內容區留更多 vertical space
- 跟 Button-lg + Field-lg 高度(40 / 36)拉出視覺 hierarchy — chrome 高於任何 row control,但不壓迫內容
- Density lg 模式下 56px 對齊 Material 桌面 app bar 的舒適呼吸

---

## Inline Action

詳見 `patterns/element-anatomy/item-anatomy.spec.md`「Inline Action 設計規格」節。

---

## Icon-only 元件的 padding 原則

所有互動元件的 icon-only 模式（Button、SegmentedControl 等）共用同一套 calc-based padding 公式，取代舊的 `aspect-square p-0` 做法。

### 公式

```
padding-inline = (field-height - icon-size) / 2
```

### calc 不用 aspect-square

**讓形狀由內容自然決定,不強制正方形**:

- **純 icon**:`width = 2 * padding + icon = field-height` → 自然正方形,不需要 `aspect-square`
- **Icon + suffix**(badge、endIcon):`width = 2 * padding + icon + gap + suffix > field-height` → 自然長方形,startIcon 到左邊距離不變
- `aspect-square` 會強制正方形,加 suffix 時必須放棄或另寫覆蓋邏輯;calc padding 讓形狀由內容自然決定

### Density-aware

公式使用 CSS variable（`var(--field-height-sm)` 等），density 切換時 field-height 值改變，padding 自動重新計算，不需要 JavaScript。

### 各 size 的 icon-size 與 gap

| Size | Icon size | gap | 備註 |
|------|-----------|-----|------|
| xs | 16px（Button）/ 14px（SegmentedControl） | gap-1 | xs 空間極小，SegmentedControl 用 14px 更平衡 |
| sm | 16px | gap-1 | |
| md | 16px | gap-1 | |
| lg | 20px | gap-1 | lg 切換到大 icon tier |

**gap-1（4px）用於所有 iconOnly size**——正常模式的 label `<span className="px-1">` 自帶 4px 隱性間距，icon-only 移除 label 後需要顯式 gap 補回 icon 與 suffix 之間的呼吸空間。

### 實作模式

每個元件定義自己的 `ICON_ONLY_PX` 查表，在 render 時用 `cn()` 條件套用：

```tsx
const ICON_ONLY_PX: Record<string, string> = {
  xs: 'px-[calc((var(--field-height-xs)-16px)/2)]',
  sm: 'px-[calc((var(--field-height-sm)-16px)/2)]',
  md: 'px-[calc((var(--field-height-md)-16px)/2)]',
  lg: 'px-[calc((var(--field-height-lg)-20px)/2)]',
}

// render
className={cn(
  baseVariants({ size }),
  iconOnly && cn(ICON_ONLY_PX[resolvedSize], 'min-w-0 gap-1'),
)}
```

`min-w-0` 確保 flex 子元素不會被 min-content 撐寬。

### 適用元件

目前已套用此公式的元件：Button、SegmentedControl。任何新增的互動元件若有 icon-only 模式，必須使用同一套公式。

---

## Tailwind Bridge

透過 `@theme inline` 橋接到 Tailwind spacing：

```tsx
<div className="h-field-md" />       /* = var(--field-height-md) */
<div className="h-table-row-md" />   /* = var(--table-row-md) */
```

## 模式切換

初始狀態在 `index.html` 設定：

```html
<html data-density="md">
```

動態切換：

```ts
document.documentElement.setAttribute('data-density', 'lg')
```
