# Layout Space Spec

頁面結構間距，隨 `data-density`（或 `data-layout-space`）切換。

## Token 表

| Token | md | lg | 語意 |
|-------|----|----|------|
| `--layout-space-loose` | 16px | 24px | 主間距:容器水平 padding、元素間 gap |
| `--layout-space-tight` | 12px | 16px | 緊湊間距:容器頂部 padding、full-width 轉場 gap |
| `--layout-space-bottom` | 48px | 48px | 結論留白:內容到 action buttons 的空間 |

### 為什麼 bottom 不隨 density 變

Bottom 是「結論前的留白」——content 到 action buttons 之間的視覺暫停。這個暫停跟 density 無關(不論 compact 或 comfortable,使用者都需要「表單結束了」的節奏),所以 md/lg 都固定 48px。

---

## 容器 Layout 規則

### 規則 1:水平 padding = `loose`

所有內容的左右 padding = `--layout-space-loose`。Full-width 元素(table / textarea / editor)的左右 padding **也是 `loose`**,讓它的內容邊緣跟非 full-width 元素對齊(視覺對稱)。

### 規則 2:頂部 padding = `tight`

容器頂部到第一個元素 = `--layout-space-tight`。頂部用 tight 而非 loose:容器的視覺邊界(dialog border / shadow / header bar)已經提供上方分離感,不需要額外的 loose 留白。

### 規則 3:底部 = `bottom`

最後一個內容元素到容器底部(或 action buttons 頂部)= `--layout-space-bottom`(48px)。這個「結論留白」讓使用者在按 action button 前有視覺暫停——「表單結束了,這是你的最終行動」。

### 規則 4:元素間 gap = `loose`

相鄰元素之間的垂直 gap = `--layout-space-loose`。這是預設 gap,適用於大部分 sibling 元素(input / button / text / alert 等)。

### 規則 5:Full-width 轉場例外 = `tight`

**當 full-width 元素在非 full-width 元素下方時,gap 從 `loose` 縮小為 `tight`。** Full-width 元素跟容器頂部(如果它是第一個元素)的距離也是 `tight`。

#### 為什麼

Full-width 元素(table / editor)的視覺重量很強(佔整個容器寬度)。如果跟上方非 full-width 元素之間用 loose gap,會出現「感覺太寬」的空白——full-width 元素的強視覺重量 + loose gap = 視覺斷裂。Tight gap 讓 full-width 元素跟上方元素**緊密銜接**,視覺上是「從控制區過渡到內容區」的連貫流程。

---

## Full-width vs 非 Full-width 判斷

| 歸類 | 典型元件 | 水平佈局 |
|------|---------|---------|
| **Full-width** | Table、Textarea、Editor、Code block | 佔滿容器寬度(扣掉容器 loose padding)|
| **非 Full-width** | Input、Button、Select、Alert、Text、Checkbox | 有自己的自然寬度或 max-width |

---

## 典型容器範例

### Dialog(表單型)

```
┌───────────────────────────────────┐
│← tight ─────────────────────────→│ ← top padding
│  ← loose →  Title     [X]  ← loose →│
│← loose gap ────────────────────→│
│  ← loose →  [Name input]  ← loose →│
│← loose gap ────────────────────→│
│  ← loose →  [Description] ← loose →│
│← bottom (48px) ────────────────→│
│  ← loose →  [Cancel] [Save] ← loose →│
└───────────────────────────────────┘
```

### Dialog(含 full-width table)

```
┌───────────────────────────────────┐
│← tight ─────────────────────────→│ ← top padding
│  ← loose →  [Tabs]       ← loose →│
│← tight gap ────────────────────→│ ← full-width 轉場例外
│╔═════════════════════════════════╗│
│║← loose → Table content  ← loose →║│
│╚═════════════════════════════════╝│
└───────────────────────────────────┘
```

### Dialog(alert + full-width table)

```
┌───────────────────────────────────┐
│← tight ─────────────────────────→│
│  ← loose →  [Tabs]       ← loose →│
│← loose gap ────────────────────→│
│  ← loose →  [Alert info] ← loose →│
│← tight gap ────────────────────→│ ← full-width 轉場
│╔═════════════════════════════════╗│
│║← loose → Table           ← loose →║│
│╚═════════════════════════════════╝│
└───────────────────────────────────┘
```

---

## 模式切換

Layout Space 與 UI Size 統一透過 `data-density` 控制：

```html
<html data-density="md">
```

```ts
document.documentElement.setAttribute('data-density', 'lg')
```

若需單獨控制版面間距而不影響元件尺寸:

```ts
document.documentElement.setAttribute('data-layout-space', 'lg')
```

---

## 容器持有 padding 原則

元件不貼齊容器邊緣——**容器負責提供內距(padding),元件本身不加外距(margin)來推開容器**。這讓同一個元件在不同容器中都有一致的行為,間距的控制權在容器端。

---

## 使用方式

```tsx
// 容器水平 padding
<div className="px-[var(--layout-space-loose)]" />

// 容器頂部 padding
<div className="pt-[var(--layout-space-tight)]" />

// 容器底部 padding(到 action buttons)
<div className="pb-[var(--layout-space-bottom)]" />

// 元素間 gap
<div className="flex flex-col gap-[var(--layout-space-loose)]" />

// Full-width 轉場 gap（例外）
<div className="mt-[var(--layout-space-tight)]" />
```
