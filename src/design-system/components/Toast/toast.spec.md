# Toast 設計原則

**非阻斷式浮動通知**——消費 Notice primitive + Sonner。

## 定位

Toast 是短暫的浮動通知，自動消失。用於操作結果回饋（成功/失敗/警告）。不阻斷使用者操作。

## Container 架構

三層結構（所有 variant 統一）：

1. **Shadow wrapper**：`rounded-lg`（8px）+ `elevation-200`（浮層陰影）。永遠在頁面 theme 解析。
2. **Bg layer**：`bg-{color}`。有色相 variant 在頁面 theme 解析。
3. **Theme layer**：`data-theme` + `text-foreground`。content token 在此 re-resolve。

### 為什麼分三層

陰影 token（`--elevation-200`）在 dark mode = 45% black，light mode = 4% black。如果陰影跟 `data-theme="dark"` 在同一層，light 頁面上的 dark toast 會有過重的 dark 陰影。分開讓陰影永遠用頁面 theme 的輕陰影。

## Variant × Theme 策略

| Variant | Bg | data-theme | 視覺 |
|---|---|---|---|
| neutral | `bg-surface-raised`（同層翻轉） | `{inverse}` | light 頁→暗底, dark 頁→亮底 |
| success | `bg-surface-raised`（同層翻轉） | `{inverse}` | 同上 + 綠色 icon |
| info | `bg-info`（outer） | `"dark"`（inner） | 藍底白字 |
| warning | `bg-warning`（outer） | `"light"`（inner） | 黃底深字 |
| error | `bg-error`（outer） | `"dark"`（inner） | 橘底白字 |

neutral/success 的 bg + data-theme 在同一層，因為 `bg-surface-raised` 需要跟 data-theme 一起翻轉。

## API

```tsx
toast({
  variant: 'success',
  title: '操作成功',
  description: '變更已儲存至伺服器',
  action: { label: '復原', onClick: handleUndo },
  duration: 4000,
})
```

- `title`（必填）：主要訊息
- `description`（選填）：補充說明，自然換行
- `action`（選填）：tertiary xs 按鈕
- `duration`（選填）：自動關閉時間，預設 4000ms

## 反向引用

- Notice primitive → `components/Notice/notice.spec.md`
- Sonner → `sonner` package
