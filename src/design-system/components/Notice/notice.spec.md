# Notice 設計原則

**Toast / Alert 共用的視覺佈局層**——跟 MenuItem 為 SelectMenu / DropdownMenu 共用是同一個架構概念。Notice 只負責 layout 和 icon 選擇，色彩由消費者透過 `data-theme` 控制。

## 定位

Notice 是純視覺 primitive，不是獨立使用的元件。消費者：
- **Toast**：浮動 + 自動消失（Sonner）
- **Alert**：inline / fixed 持久通知

## Typography

md tier，固定不隨 density 變：
- title: `text-body`（14px）`leading-compact`（1.3）— 有 description 時加 `font-medium`
- description: `text-body`（14px）`leading-compact` + `text-fg-secondary`（neutral-8）

14px 配 14px — 視覺層級靠 font-weight + color 區分。

## Padding（固定）

| 屬性 | 值 | 理由 |
|---|---|---|
| px | `px-4`（16px） | 世界級系統共識（Atlassian/GitHub/Material/Linear 都是 16px） |
| py | `py-3`（12px） | 介於 row（7px）和 section（16px）之間，通知的 sweet spot |
| gap | `gap-2`（8px） | 跟 item-layout icon-text gap 一致 |

不隨 density 變——Toast/Alert 是通知，不是工作區域元件。

## Layout

item-layout 4-slot：
```
[status icon?]  [title + description?]  [endContent?]  [dismiss X?]
```

- Icon: 16px，`h-[1lh]` inline 對齊 first line
- Dismiss X: inline action pattern（16px icon / 18px hover bg / rounded-md）
- endContent: 通常放 `<Button variant="tertiary" size="xs">`

## Variant

| Variant | Icon | 語意 |
|---|---|---|
| neutral | 無 | 一般訊息 |
| info | Info（ℹ） | 資訊提示 |
| success | CircleCheck（✓） | 操作成功 |
| warning | TriangleAlert（⚠） | 警告 |
| error | XCircle（✕） | 錯誤 |

## Theme 策略

Notice **不設** bg 和 text color。消費者在 container 設 `data-theme` + `text-foreground`，Notice 內所有 token 自然適配。

消費者的 data-theme 策略：

| 場景 | data-theme | text 結果 |
|---|---|---|
| 有色相 solid（info/success/error） | `"dark"` | neutral-9 = 白 |
| warning solid | `"light"`（永遠） | neutral-9 = 黑 |
| neutral solid | `{inverse}`（跟頁反） | 跟隨翻轉 |
| subtle | 不設（跟隨頁面） | 跟隨頁面 |

### 為什麼 data-theme 要搭配 text-foreground

CSS `color` 從 body 繼承的是**已解析的計算值**，不是 `var(--foreground)` 表達式。`data-theme` 改變 `--foreground` 的值，但不改 `color` 屬性。在 theme boundary 設 `text-foreground` class 強制 `color: var(--foreground)` 在正確 context 重新解析。

## 反向引用

- item-layout → `patterns/item-layout/item-layout.spec.md`
- color tokens → `tokens/color/color.spec.md`
- primitives nested theme → `tokens/color/primitives.css`（`:root, [data-theme]` pattern）
