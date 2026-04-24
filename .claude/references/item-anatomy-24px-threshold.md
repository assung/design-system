# Item Anatomy 24px 閾值對齊規則(完整公式 + 對照)

從 `patterns/element-anatomy/item-anatomy.spec.md`(2026-04-24 prune)抽出的 24px 閾值對齊規則完整展開。Row primitive 結構 / slot 定義 / 選擇狀態視覺等走 item-anatomy.spec.md;本檔專放 prefix/suffix 對齊公式的全部細節。

## 24px 閾值對齊規則(Prefix 與 Suffix 共用同一條公式)

**核心原則**:每個 slot 的對齊容器高度由**自己內容物的大小**決定。Prefix 和 suffix 用的是**完全一樣**的公式,只是各自獨立判斷,不互相同步。

### 公式

| 內容物高度 | 對齊容器 | 對齊目標 |
|---|---|---|
| ≤ 24px | `h-[1lh]` | 第一行 label 的垂直中心 |
| > 24px(+ 有 description) | `h-[calc(1lh + 2px + desc_1lh)]` | label + gap + description 文字塊的垂直中心 |
| > 24px(無 description) | `h-[1lh]` | 強制 inline(沒有文字塊可對齊) |

### 為什麼 prefix 和 suffix 各自獨立(不互相同步)

之前的版本說「suffix 永遠跟 prefix 使用相同的對齊容器高度」是錯的。Prefix 和 suffix **各自反映自己內容物的視覺重量**,不應該被綁在一起。

**1. Slot 內容物的本質不同**

- **Prefix** 是「item 的視覺主體」(avatar = 這個人是誰、icon = 這個東西是什麼)。當 prefix 是大 avatar 時,它的視覺重量平衡整個文字塊,所以對齊文字塊中心。
- **Suffix** 是「label 的 metadata」(Tag = 屬於哪一類、Chevron = 可展開、Time = 何時)。它修飾的對象是 label 第一行,所以對齊第一行。

兩個 slot 的視覺角色不同,被強迫同步反而違反它們各自的對齊邏輯。

**2. 業界 convention 全部如此**

Apple Mail / Gmail / iOS Settings / Material 3 / Atlassian DSP / Polaris ResourceItem——**全部**是「prefix 跟 suffix 各自獨立對齊」。沒有任何一個把小 suffix 強迫對齊到大 avatar 中心。

| 系統 | Prefix(大 avatar) | Suffix(小元素) |
|---|---|---|
| Apple Mail | Avatar 40px → 文字塊中心 | Date → Subject 第一行 |
| Gmail | Star icon → 第一行 | Time → Subject 第一行 |
| iOS Settings | Icon ≤24px → 第一行 | Chevron → Label 第一行 |
| Material 3 List | Leading icon → 第一行 | Trailing icon → top-aligned |

**3. 視覺重量平衡**

把小 suffix 強迫對齊大 avatar 中心,小 suffix 會「下沉」到 description 行,**視覺上跟 label 失聯**。對齊 label 第一行則讓 suffix 跟它修飾的對象在同一條基準線上,視覺重量自然分配。

### 大塊 suffix 的對待方式(symmetric 規則)

`suffix > 24px` 的場景雖然罕見,但**完全套用同一條公式**——當 suffix 是 thumbnail、stacked badge 等大塊內容時,自己的對齊容器走 block calc,對齊文字塊中心。

| 場景 | Prefix | Suffix | 結果 |
|---|---|---|---|
| 標準選單(MenuItem 大宗) | icon 16px / avatar 24px | Tag / Chevron(≤24px) | 兩邊都 inline |
| 用戶選單(avatar + name + role) | avatar 32px(block) | Chevron(≤24px) | Prefix block,suffix inline ← **各自獨立** |
| 帶縮圖列表(thumbnail + title + 縮圖) | icon 16px(inline) | thumbnail 40px(block) | Prefix inline,suffix block ← **各自獨立** |
| 雙視覺重的卡片 | avatar 40px(block) | thumbnail 40px(block) | 兩邊都 block |

**沒有「prefix 跟 suffix 必須同步」的情況。** 每個 slot 反映自己內容物的視覺重量,各自走公式。

### Avatar 尺寸選擇

**用於 prefix slot**。Avatar 尺寸是 **consumer 依視覺重量意圖決定**的——有兩組預設可選,對齊模式跟著 size 走,**不跟著 description 的有無走**。

**兩組預設尺寸**(依 row size):

| 預設組 | sm | md | lg | 視覺重量 | 典型用途 |
|---|---|---|---|---|---|
| **`AVATAR_SIZE.inline`** | 20 | 24 | 24 | 輕 | 扁平 row、footer user、單行選項、**小 avatar + 短 desc** |
| **`AVATAR_SIZE.block`** | 32 | 32 | 40 | 重 | 人物卡、顯著身份辨識、avatar 是 item 的主體 |

**對齊模式由 size 決定**(24px 閾值):

| Avatar size | 有無 description | 對齊容器 | 說明 |
|---|---|---|---|
| ≤ 24 | 無 | `h-[1lh]` inline | 單行,對齊第一行 label |
| **≤ 24** | **有** | **`h-[1lh]` inline** | **小 avatar 視覺輕,仍對齊第一行**——不強迫跨越兩行 |
| > 24 | 無 | `h-[1lh]` inline | 大 avatar 但無 desc,仍對齊第一行(block 沒意義) |
| > 24 | 有 | `h-[block calc]` block | 大 avatar 視覺重,平衡 label + desc 整個文字塊 |

**關鍵**:consumer 可以自由選擇「小 avatar + description」——那是完全合法的組合,此時 avatar inline 對齊第一行 label,description 從第二行自然往下。沒有「有 desc 就必須用 block 尺寸」的規則。

**程式化規則**:consumer **必須**用 `<ItemAvatar>` / `<ItemIcon>` helper 元件,**禁止** `import { AVATAR_SIZE }` 手動查表,更**禁止**硬寫 `<Avatar size={N} />`。

```tsx
import { ItemAvatar, ItemIcon } from "@/design-system/patterns/element-anatomy/item-anatomy"

// 案例 A:扁平 row,無 desc → ItemAvatar 預設 inline,自動查 AVATAR_SIZE.inline[rowSize]
<ItemAvatar alt="Alan" color="blue" />

// 案例 B:avatar 是 item 主體(人物卡)→ mode="block",跨文字塊對齊
<ItemAvatar mode="block" alt="Alan" color="blue" />
<span>Alan Chen</span>
<span className="text-caption">Design lead</span>

// 案例 C:icon prefix → ItemIcon 自動查 ICON_SIZE[rowSize]
<ItemIcon icon={Folder} />
```

`<ItemAvatar>` / `<ItemIcon>` 會:
1. 從 `RowSizeContext` 讀取當前 row size(由 row primitive 例如 `SidebarProvider` / `SelectMenu` 內部 propagate)
2. 查對應常數(`AVATAR_SIZE[mode][size]` / `ICON_SIZE[size]`)
3. 自動包在 `ItemPrefix`(`h-[1lh] shrink-0 flex items-center`)wrapper 內

**Consumer 完全看不到 size 數字、看不到 AVATAR_SIZE 常數、看不到 ItemPrefix wrapper——不可能寫錯。**

Canonical 對齊模式判斷:`MenuItem` 的 `isBlockAlign = avatarPx > 24 && !!description`——元件根據 24px 閾值**自動決定**對齊容器高度,不需要 consumer 額外指定 align prop。

### ❌ 為什麼不能硬寫 `size={24}`

硬寫會造成兩種漂移,兩種都是**真實發生過的 bug**:

1. **跨 size 漂移**:寫死 24 僅與 md 規格相符;sm 應為 20、lg 為 24,硬寫讓 sm 渲染出 24(比規格大 4px),Row size 變體 story 三欄並排時 sm 欄的 avatar 尺寸違反 canonical。
2. **跨 consumer 漂移**:每個 asChild consumer 各自硬寫,未來改 inline sm 從 20→18 就要全域搜改,漏一個就漂移。

**這條規則跟 `ICON_SIZE` 的程式化邏輯一致**——icon / avatar / inline action hover bg 都從 `item-layout` module 單一來源 import,row primitive 的任何尺寸常數永遠不在 consumer 側重新定義。

### asChild pattern 的責任——用 helper 元件免除全部負擔

普通 consumer(`<SidebarMenuButton startIcon={X}>{label}</SidebarMenuButton>`)不處理 prefix——元件內部自己渲染。

`asChild` pattern(Radix Slot)要求 consumer 自己組 children。**過去這代表 consumer 要處理全部尺寸查表**——曾發生 bug:三欄 sm/md/lg 並排時 avatar 全部寫 24,sm 欄應為 20 卻顯示 24。

**現在透過 `<ItemAvatar>` / `<ItemIcon>` helper,asChild consumer 零尺寸責任**:

```tsx
// ✅ 正確:helper 從 RowSizeContext 自動拿 size
<SidebarMenuButton asChild>
  <button type="button">
    <ItemAvatar alt="Alan Chen" color="blue" />
    <ItemLabel>Alan Chen</ItemLabel>
  </button>
</SidebarMenuButton>

// ❌ 錯誤:手動 Avatar + 硬寫 size,sm 欄會顯示錯誤尺寸
<SidebarMenuButton asChild>
  <button type="button">
    <span className="h-[1lh] shrink-0 flex items-center">
      <Avatar size={24} alt="Alan Chen" color="blue" />
    </span>
    <span data-sidebar="menu-label">Alan Chen</span>
  </button>
</SidebarMenuButton>
```

**Row primitive 實作者的責任**:元件內部必須用 `<RowSizeProvider value={size}>` 包裹整個子樹(包含 Slot children 的路徑),確保 descendant helper 能讀到 context。`SidebarProvider` 已內建這個——其他 row primitive 新增 asChild 支援時必須跟進。

**禁止事項**(違反的話 review 會擋):
- ❌ asChild consumer 裡出現 `<Avatar size={N} />`(用 `<ItemAvatar>`)
- ❌ asChild consumer 裡出現 `<Icon size={N} />`(用 `<ItemIcon>`)
- ❌ asChild consumer 裡出現 `import { AVATAR_SIZE, ICON_SIZE }` 手動查表(helper 已封裝)
- ❌ asChild consumer 裡手刻 `h-[1lh] shrink-0 flex items-center` wrapper(helper 內部已包)

Avatar 元件自身的規格(icon 模式、fallback、內部 icon 尺寸)見 `Avatar/avatar.spec.md`。

### Prefix 類型對齊:作用域是「同一 group 內」,不是整個元件

Label x 位置受 prefix 尺寸影響(icon 16 vs avatar 24,差 8px)。**對齊只在同一 group 內的多個 items 之間成立**——跨 group 本來就不該強求,每個 group 的 prefix 反映自己的語意重量。

| 情境 | 對齊要求 | 理由 |
|---|---|---|
| **同 group 多 items** | Prefix 類型必須一致(全 icon 或全 avatar) | 多個 label 需要齊左掃視,prefix 類型混用會讓 label x 跳動,破壞 row rhythm |
| **同 group 單一 item** | **無對齊負擔**,用 prefix 自然尺寸 | 沒有相鄰 label 可參照,縮小 prefix 只是為了對齊一個不存在的東西 |
| **跨 group** | **永不強求對齊** | 不同 group 的語意本來就不同(主導覽 icon / user identity avatar / thumbnail list),各自反映視覺重量 |

**範例**:Sidebar footer 只有一個 user row(Alan Chen)→ 用 inline avatar 24px 的自然預設,不需要縮成 16px 去對齊上方 main nav 的 icon。Main nav 和 footer 是不同 group,本來就該各自獨立。

**業界 convention**:Apple HIG list section、Material 3 list、Atlassian DSP 全部採用「section-scoped consistency」——同一 section 內 leading element 類型一致,跨 section 變化是正常的。沒有任何世界級系統要求整個 sidebar / menu 所有 prefix 強迫同尺寸。

❌ **錯誤示範**:為了讓 footer avatar 跟 main nav icon 齊左,把 avatar 從 24 改成 16——這是用錯誤方向修了一個根本不存在的問題,且違反 Avatar 尺寸公式。

### Uniform prefix slot

**Row-primitive 全域對齊(opt-in)**。機制:CSS `:has()` selector 在 row-primitive **頂層容器**(`<SidebarProvider uniformPrefix>` / 未來其他 row primitive 的 root)偵測整個子樹同時存在 `data-prefix-type="icon"` 和 `"avatar"` 後代(由 `<ItemIcon>` / `<ItemAvatar>` 自動標記)時,**全域**套用固定 prefix 槽——跨 menu / 跨 group 所有 label x 統一對齊。

**世界級兩派,我們把 A 設為預設、B 提供 opt-in**:

| School | 代表 | 行為 | 我們的預設? |
|---|---|---|---|
| A | Slack / VS Code Explorer / Discord | Per-section 獨立 prefix 寬度 | **✅ 預設** |
| B | Notion / Linear / Atlassian Confluence | 全域對齊 | 🟡 Opt-in via `uniformPrefix` |

兩派都是世界級慣例,沒有絕對對錯。**選 A 作為預設的理由**:

1. **Explicit > implicit**:auto-detect 是 CSS `:has()` 魔法,consumer 沒主動要求就在背後動排版,違反「程式行為應該從 source code 一眼看出」原則
2. **保留分組視覺語意**:不同 group / menu 在概念上代表不同層級,獨立的視覺節奏是 sectioning 的訊號
3. **Opt-in 成本極低**:想要 Notion 風格的 consumer,加 `uniformPrefix` 一個字就好

**Auto-detect 開啟後零成本**:CSS `:has()` 在不混用時完全 no-op,單一 prefix 類型的 sidebar 行為跟以前完全一樣。所以 opt-in 的代價只是「打那個 prop」,沒有 runtime perf 成本。

### 機制細節

- `<ItemIcon>` 渲染的 `<ItemPrefix>` 自動帶 `data-prefix-type="icon"`
- `<ItemAvatar>` 渲染的 `<ItemPrefix>` 自動帶 `data-prefix-type="avatar"`
- Row-primitive 頂層容器(`SidebarProvider` 的 wrapper div)在 inline style 預設一個 `--mixed-prefix-slot` 候選值(= `AVATAR_SIZE.inline[size]`,20/24/24 @ sm/md/lg)
- 同一個 wrapper 用 Tailwind variant `has-[[data-prefix-type=icon]]:has-[[data-prefix-type=avatar]]:[--item-prefix-slot:var(--mixed-prefix-slot)]` 條件化把候選值賦給 `--item-prefix-slot`
- `<ItemPrefix>` 讀取 `--item-prefix-slot`(預設 `auto`,有值則套槽 + center),自動套用

**單一類型時**:沒有任何一個後代有 `data-prefix-type=avatar`(或反過來),`:has()` 不命中,`--item-prefix-slot` 維持 `auto`,prefix 縮到自然寬度。**完全沒有 ghost spacing**。

### Per-row-primitive override(罕見 escape hatch)

`SidebarMenu` 的 `uniformPrefix` prop:

| 值 | 行為 |
|---|---|
| 不傳(預設) | 繼承 SidebarProvider 的全域 auto |
| `true` | 強制這個 menu 套槽,即使單一類型 |
| `false` | 強制關閉這個 menu 的對齊,即使全域偵測到混用 |

`uniformPrefix={false}` 用法極罕見——為「我刻意要這個 menu 跟其他 menu 視覺上不同步」的場景保留。

### 其他 row primitive 怎麼接

要對齊 Notion 模式,在 row primitive 的頂層 wrapper(例如 `<TreeView>` 的 root)加:

```tsx
const slotStyle = getUniformPrefixSlotStyle(size)
<div
  style={{ "--mixed-prefix-slot": slotStyle["--item-prefix-slot"], ...style }}
  className="has-[[data-prefix-type=icon]]:has-[[data-prefix-type=avatar]]:[--item-prefix-slot:var(--mixed-prefix-slot)]"
>
  {children}
</div>
```

`<ItemIcon>` / `<ItemAvatar>` 已自動標記 `data-prefix-type`,row primitive 實作者不用處理。

**禁止**:

- ❌ 拿 escape hatch `uniformPrefix={false}` 配合 mixed prefix 沒有設計理由——這違反使用者視覺直覺,只在「刻意製造視覺斷層」時才該用
- ❌ 在 row primitive 的某個中層元件再做一次 `:has()` 偵測——應該由頂層容器一次處理,中層不該重複 logic

