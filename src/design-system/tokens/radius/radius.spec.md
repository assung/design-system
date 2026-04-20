# Radius 設計原則

圓角系統提供四個語意層級，對應不同元件類型。

## 圓角選項

| Tailwind class | Token | 值 | 用途 |
|----------------|-------|----|------|
| `rounded-xs`   | `--radius-xs` | 2px | 極小視覺 indicator(Chart legend swatch 8×8 色塊等 ≤ 10px 元素) |
| `rounded-md`   | `--radius-md` | 4px | 一般元件(Button、Input、Card、Tag、hover bg) |
| `rounded-lg`   | `--radius-lg` | 8px | 浮層(Dialog、Popover、Dropdown) |
| `rounded-full` | `--radius-full` | 9999px | Pill 形狀(Avatar、Switch、Progress) |

### `rounded-sm` 保留未使用

CSS 定義了 `--radius-sm`(目前 = 4px,與 md 同值),但**不在元件中使用**。保留給未來「介於 md 和 xs 之間」的需求(如更密集的 UI 模式)。所有 4px 圓角一律用 `rounded-md`。


## 使用規則

### `rounded-xs`(2px)— 極小 indicator

適用於直徑 ≤ 10px 的視覺 indicator,視覺效果需要「微圓而非完全方」:

- Chart legend swatch(8×8 色塊)
- 未來其他 micro indicator(若尺寸 ≥ 12px 請改 `rounded-md`,不要為了「更圓」使用 xs)

**判斷**:`rounded-md`(4px)在 8×8 元素上接近 50% 填滿,視覺變成 pill。2px 才維持「色塊」而非「膠囊」語意。≥ 12px 時 4px 比例適當,不需 xs。

### `rounded-md`(4px)— 一般元件

適用於大多數互動元件，視覺上「有圓角但不搶眼」：

- Button、Input、Select、Checkbox、Tag
- Card（非浮層，不需 elevation 層級感）
- Table cell、list item 的 hover 背景
- Tooltip

### `rounded-lg`（8px）— 浮層

適用於浮在頁面上層的元件：

- Modal、Dialog
- Popover、Dropdown menu、Command palette

### `rounded-full`（9999px）— Pill

適用於需要完全膠囊形狀的元件：

- Avatar（圓形）
- Toggle switch 外框
- Progress bar


## 禁止事項

```tsx
// ❌ 不要用非 token 的圓角（包含 rounded-md、rounded 等）
<div className="rounded" />        // 4px，但意圖不明
<div className="rounded-xl" />     // 12px，超出 token 範圍
<div className="rounded-2xl" />    // 16px，超出 token 範圍

// ❌ 不要硬寫圓角值
<div className="rounded-[6px]" />
<div style={{ borderRadius: '8px' }} />

// ❌ 不要用 CSS 變數語法（Tailwind class 已夠用）
<div className="rounded-[var(--radius-md)]" />
```

```tsx
// ✅ 一般元件
<button className="rounded-md" />

// ✅ 浮層
<div className="rounded-lg" />

// ✅ Pill
<span className="rounded-full" />
```
