# SegmentedControl 設計原則

## 定位

SegmentedControl 是**互斥多選一的 compact control**——從 2–5 個選項裡挑恰好一個，視覺上是一排連體的分段按鈕。基於 Radix ToggleGroup（`type="single"`），橋接設計系統 token。

**SegmentedControl 的選值可以驅動下方內容變化**——這是正當用法，不要誤以為它只能當表單輸入（「切 value 不能切 view」是錯的二分法）。

**何時用**：
- 表單內的互斥選項（對齊：左 / 中 / 右；檢視模式：清單 / 看板 / 行事曆）
- Filter / toolbar 的分段切換（全部 / 進行中 / 已完成、日 / 週 / 月）
- Chart 的資料維度切換（本週 / 本月 / 本季）
- 付款方式 / 配送方式這類「選了之後下方欄位跟著變」的 form section

**何時不用**：
- 選項 > 5 個 → `Select` / `RadioGroup`
- 只有 1 個 → `Button pressed`
- 切換的是 container 結構（整塊 view 有自己的 header / toolbar / filters）→ `Tabs`
- 選項需要描述文字 / 複雜排版 → `RadioGroup`

## 與 Tabs 的分界（詳見 `tabs.spec.md`）

兩者都能「切換下方顯示的內容」，分界不是「切 view vs 切 value」，而是三個角度：

1. **規模**：SegmentedControl 切換的是 **局部內容的變體**（一個 chart、一個 list、一段 form section）；Tabs 切換的是 **整塊 container**（可能有自己的 header / toolbar / 多個 section）
2. **結構角色**：SegmentedControl 是 **control**（可跟 Button / Input 並排），Tabs 是 **container 的結構元件**（跨越父容器整行）
3. **值生命週期**：SegmentedControl 的值常綁 form state / URL param / 會被持久化，Tabs 的切換通常不進表單狀態

**Fallback**：跟 Input / Button 並排不違和 → SegmentedControl；必須佔一整行當 section header → Tabs。

**完整灰色地帶對照表在 `tabs.spec.md` 的「Tabs 與 SegmentedControl 的分界」段落**——以該段為 single source of truth，此處不重複列舉。

---

## 與 Button 的血緣

SegmentedControl item 的**內部結構、padding、字體、icon size 全部鏡射 Button**，這是刻意的一致性——使用者對 Button 的視覺肌肉記憶可以直接套用到 SegmentedControl。

**但兩者是獨立元件，不共用 `buttonVariants`**：
- Button 的 variant 語意（primary / secondary / tertiary / text / link）在 SegmentedControl 不適用——SegmentedControl 只有「選中 / 未選」兩種狀態，沒有強調層級
- Button 的 `danger` / `pressed` / `loading` 在 SegmentedControl 全部不適用——SegmentedControl 是 value 選擇器，不是 action button

---

## 內部結構

```
SegmentedControl (root, role="radiogroup")
  ├─ Item  [startIcon?] [label?] [suffix: badge?]
  ├─ Item  ...
  └─ Item  ...
```

**單個 Item 內部**（與 Button 完全對齊）：

```
[startIcon?]  [<span px-1>label</span>]  [<span gap-1>suffix?</span>]
  ↑             ↑                           ↑
  16/20px       text                        badge (未來可能: endIcon)
  │─── gap-1 ─│─── gap-1 ─────────────────│
```

- Slot 間 **gap-1**（4px），與 Button size sm/md/lg 的 `gap-1` 一致
- Label 用 `<span className="px-1">` 包覆，與 Button label 一致
- Suffix 是 `<span className="inline-flex items-center gap-1">` 容器，**即使目前只有 badge，wrapper 也要從第一天存在**——未來若開放 endIcon，gap-1 已烤在 wrapper 上，零漂移風險

### Slot 支援與不支援

| Slot | 狀態 | 說明 |
|------|------|------|
| `startIcon` | ✅ 支援 | `LucideIcon`，最多一個，放 label 左側 |
| `label` | ✅ 支援 | `iconOnly` 為 true 時可省略 |
| `badge` | ✅ 支援 | 通常是計數指示器（「全部 12」「進行中 3」）|
| `endIcon` | ❌ 不支援 | Button 的 endIcon 是「會展開下一層」的訊號（chevron），SegmentedControl 既不下拉也不跳出，加了會誤導 |
| `danger` | ❌ 不支援 | SegmentedControl 是選值，不是動作，沒有破壞性語意 |
| `loading` | ❌ 不支援 | 載入的應是 SegmentedControl 背後的資料區，不是 item 本身 |

---

## Size — 直接複用 `--field-height-*`

SegmentedControl 必須能塞進 `Field` 容器（就像 `Input` / `Button` / `Select`），因此 **size 完全對齊 Button / Field**：

| Size | md density | lg density | token | padding | 字體 |
|------|-----------|-----------|-------|---------|------|
| `xs` | 24 | 24（固定）| `h-field-xs` | `px-2` | `text-caption` (12) |
| `sm` ★default | 28 | 32 | `h-field-sm` | `px-3` | `text-body` (14) |
| `md` | 32 | 36 | `h-field-md` | `px-3` | `text-body` (14) |
| `lg` | 36 | 40 | `h-field-lg` | `px-3` | `text-body-lg` (16) |

**在 Field 內自動讀 size**：透過 `useFieldContext()`，SegmentedControl 在 Field 內時 size 跟著 Field 的 size 走，不需 consumer 重複指定——機制與 Button 完全相同。

**Icon size**：sm/md = 16、lg = 20、xs = 14，跟 Button 一致。

---

## fullWidth

`fullWidth` prop（boolean，預設 `false`）：

- **false（hug content）★default**：SegmentedControl 寬度由 item 總寬決定，items 各自照內容寬度排列
- **true**：SegmentedControl 撐滿父容器，所有 item 等分該寬度

> **不論 `fullWidth` 為何，items 之間永遠等寬或全由內容決定，不存在「撐滿但各自不同寬」的混血模式**。這是 SegmentedControl 的身份特徵，對齊 Apple HIG、Material 3 Segmented Button、Carbon ContentSwitcher 等世界級系統：「all segments have the same width」是 segmented 的視覺定義之一。

### fullWidth 的判準：**跟著容器尺度走，跟 label 長度無關**

- ✅ **小容器 / 狹窄上下文** → `fullWidth = true`
  - Mobile viewport
  - 窄 Sidebar 面板
  - Dialog / Sheet 內
  - Field 表單 row（搭配 Field 容器寬度）
  - 原因：在小容器內，SegmentedControl 通常是該區塊的主要寬度元件，留白反而浪費
- ✅ **寬容器 / toolbar / 跟其他 control 並排** → `fullWidth = false`（hug）
  - Desktop 一般頁面 toolbar
  - Filter bar 跟其他 Button / Select 並排
  - Chart 上方 density 切換
  - 原因：若 fullWidth，它會搶走同行其他元素的空間；hug 保持 compact 尺寸才能融入 toolbar

### 常見誤解

**誤解**：「label 長度差異大時不該用 fullWidth，會視覺失衡」。
**事實**：fullWidth 永遠等分空間，各 item 視覺上等寬，不存在「短 label 周圍空白失衡」的問題。唯一需要留意的是：若 label 太長導致在狹小容器內被截斷，那是 **content overflow**（應該換 Select / 減少選項），不是 fullWidth 的問題。

---

## iconOnly 是 group-level，不是 item-level

與 Button 不同：Button 的 `iconOnly` 是 **per-instance** prop，SegmentedControl 的 `iconOnly` 是 **group-level** prop。

**理由**：SegmentedControl 作為整體，要嘛全都是 icon-only（純視覺 toolbar，如對齊左中右），要嘛全都帶 label。混搭會讓使用者無法預測哪個 item 有 tooltip、哪個沒有，也破壞 segmented 的對稱感。

```tsx
// ✅ 全部 icon-only
<SegmentedControl iconOnly value={align} onValueChange={setAlign}>
  <SegmentedControlItem value="left" startIcon={AlignLeft} aria-label="靠左" />
  <SegmentedControlItem value="center" startIcon={AlignCenter} aria-label="置中" />
  <SegmentedControlItem value="right" startIcon={AlignRight} aria-label="靠右" />
</SegmentedControl>

// ❌ 混搭（禁止）
<SegmentedControl>
  <SegmentedControlItem value="a" startIcon={Home}>首頁</SegmentedControlItem>
  <SegmentedControlItem value="b" startIcon={Settings} aria-label="設定" />
</SegmentedControl>
```

`iconOnly` 為 true 時：
- 每個 item 變正方形（`aspect-square p-0`）
- 每個 item 必須設定 `aria-label`（必要 prop，TS 層強制）
- 每個 item 自動以 `aria-label` 渲染 tooltip（與 Button icon-only 一致）

---

## 狀態

### 選中 / 未選

- **選中**：`bg-surface text-primary border-primary z-10`
  - `z-10` 讓 selected item 的邊框浮在相鄰 item 之上，避免被重疊的 border 切掉
- **未選**：`bg-surface text-fg-secondary border-border`
  - hover：`text-foreground`（不改 bg，避免 hover 狀態與 selected 搶戲）

### Item 連體手法

Items 之間 `-ml-px`（除了第一個）讓相鄰 border 重疊、視覺上只有一條線。第一個 item `rounded-l-md`，最後一個 `rounded-r-md`，中間 `rounded-none`。

### disabled

- **整個 SegmentedControl disabled**：所有 item 變灰，不可互動
- **個別 item disabled**：該 item 灰化，其他仍可選
- Disabled item 不得是當前 value——consumer 必須確保 value 永遠落在可選 item 上

### focus-visible

由 Radix ToggleGroup 原生處理——左右箭頭在 items 間移動 focus，空白/Enter 選取。Focus ring 對齊 Button：`ring-2 ring-ring ring-offset-1`。

---

## 規模限制

- **最少 2 個 item**——只有 1 個沒有選擇語意，應直接用 `Button pressed`
- **最多 5 個 item**——超過 5 個視覺會過窄、label 被截斷，改用 `Select` / `RadioGroup`
- **不支援 overflow / scroll**——若選項可能超出容器寬度，代表選錯元件了

---

## 禁止事項

- ❌ 只有 1 個 item——用 Button pressed
- ❌ 超過 5 個 item——用 Select / RadioGroup
- ❌ `iconOnly` 與帶 label 的 item 混搭——必須全組一致
- ❌ 使用 `endIcon` 或 `danger` / `loading` prop——不在支援範圍
- ❌ 用 SegmentedControl 切換整塊 content view——應用 Tabs
- ❌ 用 SegmentedControl 做表單多選（multi-select）——應用 CheckboxGroup
- ❌ 未傳 `value` 時預設「全都未選」——SegmentedControl 必須有 default value，這是 radio 語意
- ❌ `iconOnly` 時省略 item 的 `aria-label`——tooltip 由元件自動產生，但 label 是必要輸入
- ❌ 直接暴露 Radix `ToggleGroup` 的 `type="multiple"`——SegmentedControl wrapper 固定 single，不開放切換

---

## 相關

- `../Button/button.spec.md` — item 內部結構與 size 系統的來源
- `../Tabs/tabs.spec.md` — container 切換 vs control 切換的判斷（完整分界 SSOT 在 Tabs spec「Tabs 與 SegmentedControl 的分界」段落）
- `../Field/field-controls.spec.md` — SegmentedControl 作為 Field control 時的 size 繼承機制
- `../Checkbox/checkbox.spec.md` — RadioGroup 共用規則（選項數量多或需要描述文字時的替代）
