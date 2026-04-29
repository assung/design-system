# LayoutSpace 設計原則

Layout Space 定義頁面與容器的巨觀間距 token,隨 density 自動縮放(透過 `data-density` 或 `data-layout-space`)。

## Token 表

| Token | md | lg | 語意 |
|-------|----|----|------|
| `--layout-space-loose` | 16px | 24px | 主間距:容器水平 padding、inline 之間 gap、block 呼吸空間 |
| `--layout-space-tight` | 12px | 16px | 緊湊間距:Header → inline、與 block 相鄰 |
| `--layout-space-bottom` | 48px | 48px | 結論留白:內容到 action buttons |

**為什麼 bottom 不隨 density 變**:48px 是「結論前的留白」— content 到 action buttons 的視覺暫停。跟 density 無關(不論 compact 或 comfortable,使用者都需要「表單結束了」的節奏)。

---

## 元件角色:`block` 與 `inline`

**沒有元件級固定分類** — `block` / `inline` 是元件在「該層 layout」裡扮演的角色,不是元件本質。同一元件放不同層 layout 角色不同。CSS display 跟此分類無關。

### Scope-relative 判斷

每進一層 layout container 重新判斷該層的子元件:

| 情境 | 元件 | 該層角色 | 為什麼 |
|------|------|---------|------|
| Page body 直接放 Table | Table | block | 該層 = page-body,Table 占滿是畫布 |
| Field 內包 Textarea | Field(整體) | inline | 對 form 而言 Field 是 row;Textarea 是 Field 的 internal control,不獨立分類 |
| Card 內 mini Table | Table | 看 Card 怎 layout | Card chrome 是包裝 |
| `placement="fixed"` Alert 在 page 底 | Alert | chrome band | 角色 ≈ Toolbar / Footer,非 inline notification |

**判斷 3 題**(對該層該位置回答):
1. 它在該層占滿容器寬度嗎?
2. 它在該層的視覺重量是「畫布」還是「控件」?
3. 跟該層的相鄰元件之間,你期待 loose 還是 tight?(tight = block 角色)

**不要把角色寫進元件 spec**,寫進該層 layout 的 pattern / consumer code。

---

## 6 條 Layout 規則

### 規則 1:水平 padding

任何內容左右 padding = `loose`。**`block` 元件本身的左右 padding 也是 `loose`**(讓內容邊緣跟 inline 元件對齊,視覺對稱)。

```
✓ <Container px-loose>      ✓ <Table mx-loose>
  [Inline element]              ╔══════╗
                                ║ rows ║
                                ╚══════╝
```

### 規則 2:頂部(Header → 第一個元素)

| 第一個元素 | Header → 該元素 | 為什麼 |
|---|---|---|
| `block`(table / editor) | `loose` | 視覺重、需要呼吸空間 |
| `inline`(input / button / alert) | `tight` | 元素輕、header 邊界已提供分離 |

### 規則 3:元素間 gap

**核心**:跟 `block` 相鄰一律 `tight`(避免「double spacing」感,因為 block 自帶視覺重量已是分隔)。只有 `inline ↔ inline` 用 `loose`。

| 轉場 | 間距 |
|---|---|
| `inline ↔ inline` | `loose` |
| `inline → block` / `block → inline` | `tight` |
| `block ↔ block` | `tight` |

#### Caveat:`flex-col gap-*` 單值容器

CSS `gap` 只能套單一值,form 含混合元件時:

| Form 組成 | 統一 gap | rationale |
|----------|---------|----------|
| 全 `inline` | `loose` | 所有 transition 都 inline ↔ inline |
| 混合 `inline` + `block` | `loose`(保守) | inline ↔ inline 用 tight 太緊(視覺貼邊感)>> block-adjacent 微 loose 視覺差(< 4px md density) |
| 全 `block` | `tight` | 所有 transition 都 block-adjacent |

**禁止**:單純因為 form 含一個 `block` 就把 container 整體 `tight`(會讓多數 inline ↔ inline 視覺擠壓)。

### 規則 4:底部

| 情境 | 間距 |
|---|---|
| 最後一個內容 → action buttons | `bottom`(48px) |
| `block` → 容器底 / viewport 底 / 底部 chrome band(無 action buttons) | `loose` |
| `inline` → 容器底 / viewport 底 | `tight` |

**「底部 chrome band」定義**:Alert 提示、BulkActionBar、Status bar、Footer 等附著於容器底部的 chrome elements。它們算「容器底邊」的一部分,table → 它們的距離 = `block → 容器底`。

### 規則 5:橫排 Input Gap(固定,不隨 density 變)

橫排並列的 input fields **固定 gap,不走 layout-space token**:

| 關聯性 | Gap | 範例 |
|---|---|---|
| 緊密相關(同一組值的起迄) | `gap-2`(8px) | Sleep start ↔ Sleep end |
| 非緊密(不同組值並列) | `gap-4`(16px) | Sleep 時段 ↔ Work 時段 |

**為什麼固定**:這是 field 級 micro-spacing,跟容器級 macro-spacing 是不同維度。Field gap 由**內容語意**決定(緊密 vs 獨立),不由 density 決定。

### 規則 1.1:Chrome inline padding canonical(2026-04-29 codified)

規則 1 specialization。**所有 chrome 表面**(SurfaceHeader / SurfaceFooter / SurfaceBody / Sidebar header / FileViewer toolbar + panel header + body / app top bar / page header)inline padding 統一 `px-[var(--layout-space-loose)]`(md=16 / lg=24,density-aware)。

**為何 loose 而非 tight**:Chrome 是 surface 視覺邊界 + 內容呼吸區;`tight`(12/16)足夠 inline list item,chrome 需更穩定 anchor 讓 title / dismiss / actions 不貼邊。

**M8 8 家世界級對照**(default density 共識 16px):

| DS / Lib | Chrome inline padding |
|---------|----------------------|
| Material 3 Top App Bar | 16dp |
| Carbon UI Shell Header | 16px(`$spacing-05`)|
| Polaris Page Header | space-400(16px) |
| Atlassian Page Header | space.200(16px) |
| Apple HIG macOS Toolbar | 16-20pt |
| Linear / Notion top bar | 16px(實測)|
| GitHub Primer PageHeader | 16-24px |
| Figma toolbar | 16px |

**禁止**:硬寫 `px-4` / 自創值(`px-5`)/ 用 tight 當 chrome inline / 同 surface header/body/footer inline padding 不一致(三層左邊界必對齊)。

**Verify(grep 2026-04-29)**:13+ chrome 處全用 `px-[var(--layout-space-loose)]`,無 drift。

### 規則 6:容器 padding 持有方

**容器負責 padding,元件本身不加 margin 推開容器**。同一個元件在不同容器中行為一致,間距控制權在容器端。

---

## 典型容器範例

### Form 情境(Field stack + footer,FormLayout 適用)

```
┌────────────────────────────────────┐
│  Title                        [X]  │
├────────────────────────────────────┤
│← tight(12) ──────────────────────→│ ← Header → inline(規則 2)
│  ← loose → [Name input]   ← loose →│
│← loose gap ──────────────────────→│ ← inline ↔ inline(規則 3)
│  ← loose → [Description]  ← loose →│
│← tight(12) ──────────────────────→│ ← inline → block(規則 3)
│╔══════════════════════════════════╗│
│║← loose → DataTable       ← loose →║│ ← block(規則 1 內 px = loose)
│╚══════════════════════════════════╝│
│← bottom(48) ────────────────────→│ ← 內容 → action buttons(規則 4)
│  ← loose → [Cancel] [Save] ← loose →│
└────────────────────────────────────┘
```

### Page 情境(全頁 list / dashboard,FormLayout 不適用)

```
┌────────────────────────────────────┐
│ ← loose → [Toolbar items] ← loose →│ ← Toolbar(自帶 py-tight,規則 3 提供 → table 間距)
│╔══════════════════════════════════╗│
│║← loose → DataTable       ← loose →║│ ← block(規則 1)
│╚══════════════════════════════════╝│
│← loose(16) ──────────────────────→│ ← block → 底部 chrome band / viewport(規則 4)
│ ← loose → [Alert hint]    ← loose →│ ← 底部 chrome band(扮演 chrome 角色)
│ ← loose → [BulkActionBar] ← loose →│
└────────────────────────────────────┘
```

### 橫排 Input Gap(規則 5)

```
[*Sleep start][8px][*Sleep end]  [16px]  [*Work start][8px][*Work end]
 └── 緊密相關 ──┘                └── 非緊密 ──┘ └── 緊密相關 ──┘
```

---

## 模式切換

```html
<html data-density="md">
```

```ts
document.documentElement.setAttribute('data-density', 'lg')
```

單獨控制版面間距而不影響元件尺寸:

```ts
document.documentElement.setAttribute('data-layout-space', 'lg')
```

---

## 為什麼不建 FormLayout primitive

之前曾考慮 `<FormLayout>` 自動套規則 1-4。後來確認**不建**:

- 規則 1-6 是 universal — Form / Page / Dashboard / Dialog / Card 全部吃同樣,不該為「form」單獨封裝
- 角色判斷是 scope-relative 業務情境,自動偵測會把固定假設寫死(eg 假設 Textarea 一律 block 是錯的)
- Consumer 直接套 className 反而透明、易 debug

**真正獨特、值得封裝的只有 action-button footer chrome**(border-t + px-loose + py-tight + 內部 button group canonical),已在 `overlay-surface.spec.md`(SurfaceFooter)+ `action-bar.spec.md` 處理。Footer 上方那 48px(`--layout-space-bottom`)是 body 自己的 `pb-bottom`,不屬 footer chrome。一般 layout 直接套規則 1-6 的 className 即可。

## 被引用(auto-maintained,Dim 3 reciprocal audit)

> 本節由 `scripts/add-reciprocal-pointers.mjs` 自動維護,列出在 SSOT 語境下指向本 spec 的其他 spec。若要手動補充,寫在本節之前。

- `description-list.spec.md`
- `empty.spec.md`
- `overlay-surface.spec.md`
