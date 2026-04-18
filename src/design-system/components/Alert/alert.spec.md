# Alert 設計原則

**inline / fixed 持久通知**——消費 Notice primitive。

## 定位

Alert 是持久性通知，嵌入在頁面中。用於系統狀態提示、警告、錯誤訊息。使用者需要主動 dismiss 或處理。

## Appearance

### Subtle

淺底色 + 四邊 1px border（色相 hover 色）：

| Variant | Bg | Border | Icon 色 |
|---|---|---|---|
| neutral | `bg-muted` | `border-border` | `text-fg-muted` |
| info | `bg-info-subtle` | `border-[var(--info-hover)]` | `text-info-text` |
| success | `bg-success-subtle` | `border-[var(--success-hover)]` | `text-success-text` |
| warning | `bg-warning-subtle` | `border-[var(--warning-hover)]` | `text-warning-text` |
| error | `bg-error-subtle` | `border-[var(--error-hover)]` | `text-error-text` |

不設 `data-theme`，元素跟隨頁面 theme。Subtle bg 在 light/dark 都有足夠對比。

### Solid

飽和底色，跟 Toast 完全相同的 theme 策略：

| Variant | Bg | data-theme | 視覺 |
|---|---|---|---|
| neutral | `bg-surface-raised` | `{inverse}` | 跟頁面相反 |
| info | `bg-info` | `"dark"` | 藍底白字 |
| success | `bg-success` | `"dark"` | 綠底白字 |
| warning | `bg-warning` | `"light"` | 黃底深字 |
| error | `bg-error` | `"dark"` | 橘底白字 |

## Placement

| 值 | 圓角 | Border | 用途 |
|---|---|---|---|
| `inline`（預設） | `rounded-md`（4px） | 有 | 頁面內嵌 |
| `fixed` | 無（`rounded-none`） | 無 | header 底下全域警告 |

Alert 是 inline 容器（不是浮層），用 `rounded-md`（4px）。Toast 是浮層用 `rounded-lg`（8px）。

## API

```tsx
<Alert variant="warning" title="即將到期" description="您的方案將在 3 天後到期" />
<Alert variant="error" appearance="solid" title="系統錯誤" />
<Alert variant="info" placement="fixed" title="系統維護中，部分功能暫停" />
```

## 反向引用

- Notice primitive → `components/Notice/notice.spec.md`
- Toast（同一套視覺） → `components/Toast/toast.spec.md`
