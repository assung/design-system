---
component: BulkActionBar
family: null
variants: {}
sizes: {}
traits:
  - hasActions
---

# BulkActionBar 設計原則

## 定位

選取多項 item(table row / list item)後浮現的批次操作列。**不獨立於選取狀態存在**——`selection.length === 0` 時隱藏,`> 0` 時浮現。

**Layout Family**:非 1-4 family — composite / multi-section(自 own layout,batch action 區 + count 區 + page-action 區 + hint banner)。

**世界級對照**:Linear bulk action toolbar / Polaris IndexTable bulk actions / Material DataGrid `<GridToolbar>` selection mode / Notion database row selection bar / Gmail / GitHub Issues 多選 toolbar。

---

## 何時用

- DataTable / list / Combobox(multi)/ TreeView 的 batch operation
- 多項 item 選取後需要對全部執行同一操作(Delete / Archive / Move / Tag / Assign / Export 等)
- 提供「批次 → 個別」的 dataset 全選 escape hatch(對 large dataset 提供「點此選取全部 M 個」)

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 對單一 item 操作 | Inline Action(item-anatomy)| 單項操作不該升 batch toolbar |
| Page-level primary CTA(Save / Submit / Publish)| 一般 button + page footer | Page-level 不依賴 selection 狀態 |
| 永遠顯示的 toolbar(filter / sort / search)| Action Bar pattern + Toolbar | 不依賴 selection,沒「批次」語意 |
| 系統 notification | Notice / Toast / Alert | 通知 ≠ batch action |

---

## 近親元件分界

| 元件 | 觸發 | 內容 | 視覺權重 |
|---|---|---|---|
| **BulkActionBar** | `selection.length > 0` | 批次 actions + count + dataset escape hatch | 高(selection 期間取代 toolbar 或 fixed 浮起)|
| **Action Bar pattern** | 永遠 | 業務 actions + 工具 actions | 中(常駐 chrome) |
| **Toolbar**(action-bar 變體)| 永遠 | filter / sort / search 等資料操作 | 中 |
| **Notice / Toast** | 系統訊息 | 訊息 + 1-2 actions | 低-中 |

判斷:**「沒選取就消失嗎?」** 是 → BulkActionBar;否 → Action Bar / Toolbar。

---

## 結構

BulkActionBar 是 horizontal 容器:

```
┌──────────────────────────────────────────────────────────────┐
│ [Action 1] [Action 2] [Action ...]   |   {N} selected · M hidden by filter  ✕ │
│  ↑ 批次 actions (consumer 提供)         ↑ count + filter status      ↑ clear │
└──────────────────────────────────────────────────────────────┘
```

### Hint banner(只在「擴 dataset」場景出現)

**顯示條件**(全部成立才顯示):
- consumer 提供 `dataset` prop
- `dataset.total > 可見 row 數量`(單頁看不完)
- 本頁所有可見 row 已全選

兩 state 切換:

```
ℹ 已選取本頁全部 N 個。點此選取全部 M 個項目          ← state 1: page selected,可擴 dataset
ℹ 已選取全部 M 個項目。清除選取項目                    ← state 2: dataset 全選
```

**位置**(視 placement scenario):
- Top inline replace 模式 → hint banner 顯示在主 bar **下方**(往 table 方向延伸),避免跟 page chrome 衝突
- Bottom footer form 模式 → hint banner 在主 bar **上方**(對齊 ref 圖)

**永不顯示 hint banner 的場景**:
- 小 dataset 全可見(沒「擴 dataset」需求,顯示是 noise)
- consumer 沒提供 `dataset` prop
- 本頁尚未全選(user 還在挑選)

### Slot 結構

- **`actions` slot**:批次 actions(Button variant=`tertiary` 為主,destructive 用 `tertiary` + `danger`,**不用 primary** — primary 留給 dialog 確認的最終 action);consumer 提供
- **count 區**:`{N} selected`(內建)+ filter hidden status `· {M} hidden by filter` inline(`preserveSelectionOnFilter=true` + 有 hidden 時)
- **dismiss 區**:`X` icon-only Button(內建,觸發 `onClear`)
- **hint banner**(條件顯示,見上):2-state 切換,獨立區塊

### 不含 page-level primary

BulkActionBar **不含 page-level Submit / Save 按鈕**。Page-level primary 由 consumer 在 page footer 自行提供(不論 BulkActionBar 在 top 或 bottom)。**理由**:Page-level action 跟 selection 無關,不該耦合 BulkActionBar 生命週期。

範例(footer 模式 = consumer 自組 layout):
```tsx
<footer className="...">
  <BulkActionBar selection={...} actions={...} />
  <Button variant="primary">Submit</Button>  {/* consumer 自擺 */}
</footer>
```

---

## Placement(2 canonical scenarios)

BulkActionBar 不限定 placement,consumer 看 context 自擺:

### Scenario A:Top inline replace(table-as-page)
- 場景:Linear / Notion / Polaris IndexTable / Material DataGrid 風 — 整頁就是 table
- placement:取代既有 toolbar 同位置(無 layout shift)
- 對齊 Linear / Notion / Polaris IndexTable / Material / Stripe / Airtable / Salesforce / GitHub Issues 共識(8/8)

### Scenario B:Bottom footer(table-in-form)
- 場景:File picker / member picker / form 內含 table — 有 page-level Submit
- placement:固定 footer bar,BulkActionBar 在左,consumer page-Submit 在右
- 對齊 iOS Mail batch / 標準 form footer 慣例

兩個 scenario 在 BulkActionBar showcase stories 提供完整範例。

---

## API 草案

```ts
interface BulkActionBarProps {
  /** 已選 ID,length === 0 時自動隱藏 */
  selection: string[] | readonly string[]
  /** Clear 觸發,user 點 X icon 或 ESC */
  onClear?: () => void
  /** 批次 actions(Button / DropdownMenu 等;consumer 提供) */
  actions?: React.ReactNode
  /** 大 dataset escape hatch — total / onSelectAll / onClearAll / 是否已 dataset 全選 */
  dataset?: {
    total: number
    visibleCount: number      // 本頁可見 row 數,內部判斷 visible-fully-selected
    onSelectAll: () => void
    onClearAll: () => void
    isAllSelected: boolean    // hint 切 state 1 ↔ state 2
  }
  /** Filter 模式:傳入 hidden 數量,顯示在 count 區 inline 「{N} selected · {M} hidden by filter」 */
  hiddenByFilter?: number
  /** Placement(影響 hint banner 位置上 / 下),default 'top' */
  placement?: 'top' | 'bottom'
  /** i18n labels(對齊 Material `localeText` / Polaris `i18n` 慣例) */
  labels?: {
    count?: (n: number) => string                              // default 「{n} 已選」
    clear?: string                                              // default 「清除選取」(X icon aria-label)
    hiddenSuffix?: (hidden: number) => string                   // default 「· {hidden} 個被 filter 隱藏」
    hintPageSelected?: (page: number, total: number) => string  // default 「已選取本頁全部 {page} 個。」
    hintExtendCTA?: (total: number) => string                   // default 「點此選取全部 {total} 個」
    hintDatasetSelected?: (total: number) => string             // default 「已選取全部 {total} 個。」
    hintClearCTA?: string                                       // default 「清除選取項目」
    toolbarAriaLabel?: string                                   // default 「批次操作」
  }
  className?: string
}
```

完整 default labels 由 component 內 export 為 `BULK_ACTION_BAR_DEFAULT_LABELS` constant,consumer 可 spread 後 override 部分 key(對齊 Material `defaultLocale` 模式)。

---

## a11y 預設

- BulkActionBar 整體用 `role="toolbar"` + `aria-label`(default `"Bulk actions"`,可 override)
- count 文字用 `aria-live="polite"` 通知 selection 變更(SR 讀「3 selected」)
- Clear button:`aria-label="Clear selection"`
- Hint banner 用 `role="status"` + `aria-live="polite"`(state 切換時通知)
- 鍵盤:Esc → `onClear()`(consumer 應監聽 page-level keydown 觸發);Tab 序按 actions → count → clear
- Disabled action(無權限等)用 Button `disabled` + tooltip 解釋,**不藏 action**(避免 user 困惑)

---

## 視覺與動畫

- **出現 / 消失**:`selection.length` 0→>0 時 fade in(< 200ms);>0→0 時 fade out。**不 layout shift**(預留位置或 absolute / fixed)
- **底色**:**無底色 contrast**,跟 page 同色(`bg-canvas` / `bg-surface` 視 placement 繼承)。對齊 Notion / Linear minimalist — 用文字內容切換呈現「mode」,**不**用底色 highlight。**不像 Polaris 那種顯著底色變化**
- **邊界**:**無外框邊界**(融入 page chrome)— Top 模式跟 toolbar 共位置;Footer 模式 **`border-top` border-divider 切割 layout**(因 footer 是 page 結構,不是 floating overlay,不用 box-shadow 製造「浮層」誤導)
- **與 table 的關係**:Top scenario 跟 toolbar 共邊;Footer scenario 是 page 結構性 footer,純 border-top 切
- **Action variant**:`tertiary`(主)+ `tertiary danger`(destructive)— **不用 primary**(留給 dialog 確認最終 action)
- **respects `motion-reduce`**:fade 動畫 disable

---

## 禁止事項

- ❌ 不內建 page-level Submit / Save / page primary CTA(consumer 自擺,不耦合 selection)
- ❌ 不直接擴 dataset 全選(必須 2-step:本頁全選 → hint 點擊 → 擴 dataset)
- ❌ 不在 selection.length === 0 仍佔 layout(必須完全藏 OR consumer 自擺 placeholder)
- ❌ 不藏 disabled action(顯示 disabled 比藏起來易理解,user 知道為何不能用)
- ❌ 不替代既有 toolbar 永久(只在 selection > 0 期間,clear 後恢復)
- ❌ 批次 action **不用 variant="primary"**(留給 dialog 確認最終 action);批次用 `tertiary`,destructive 用 `tertiary` + `danger`(對齊 button.spec.md 「Inline destructive 不用 primary」 canonical)
- ❌ 不用 contrast 底色 / box-shadow 製造「浮層」感(footer 是 layout 結構切割,不是 overlay)
- ❌ Hint banner 不在「全可見已選 + dataset 還有更多」之外的場景顯示(小 dataset 顯示 hint 是 noise)
- ❌ Filter hidden status 不獨立開 hint banner(進主 bar count 區 inline 即可)

---

## 為何無 SizeMatrix

BulkActionBar 高度由消費者所在 placement 決定(top 模式 = toolbar 高度;footer 模式 = footer 高度),元件內部不提供 size prop。對齊 anatomy-standard.md 的 N/A 例外。

`@anatomy-rationale: SizeMatrix N/A — 高度繼承 placement 的 toolbar/footer 容器`

---

## 相關

- `../DataTable/data-table.spec.md`「L2 選取」段 — DataTable 端 selection state + 整合方式
- `../../patterns/action-bar/action-bar.spec.md` — toolbar 操作排列規則,本元件繼承 batch action 排序原則
- `../Button/button.spec.md` — Action button variant 規則
- `../Notice/notice.spec.md` — hint banner 視覺繼承(role / aria-live 同源)
- `../../tokens/color/color.spec.md` — toolbar bg / divider semantic token
