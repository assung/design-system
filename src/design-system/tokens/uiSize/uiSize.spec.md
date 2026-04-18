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
| `Tag` | sm / md / lg | **`md`** | 自帶尺寸，透過 Field size 配對 |

**單一尺寸消費者（不在 default-md 規則內）**：

| 元件 | 固定 size | 理由 |
|------|----------|------|
| `Chip` | 固定 `h-field-sm`（28/32px） | Material 3 / Atlassian / Polaris 共識：filter chips 使用單一高度。不暴露 size prop |

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

應用程式 chrome 區域（Sidebar header、top bar）的高度。定義在 `globals.css`（不在 uiSize.css），因為它是佈局層級的 token，不是元件層級的。

| Token | md | lg | 消費者 |
|-------|----|----|--------|
| `--chrome-header-height` | 48px | 56px | Sidebar header/footer、`--sidebar-width-icon` |

---

## Inline Action

詳見 `patterns/item-layout/item-layout.spec.md`「Inline Action 設計規格」節。

---

## Icon-only 元件的 padding 原則

所有互動元件的 icon-only 模式（Button、SegmentedControl 等）共用同一套 calc-based padding 公式，取代舊的 `aspect-square p-0` 做法。

### 公式

```
padding-inline = (field-height - icon-size) / 2
```

### 為什麼用 calc 而不是 aspect-square

- **純 icon**：`width = 2 * padding + icon = field-height` → 自然正方形，不需要 `aspect-square`
- **Icon + suffix**（badge、endIcon）：`width = 2 * padding + icon + gap + suffix > field-height` → 自然長方形，startIcon 到左邊距離不變
- `aspect-square` 會強制正方形，加 suffix 時必須放棄或另寫覆蓋邏輯；calc padding 讓形狀由內容自然決定

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
