# Toast 設計原則

## 定位

Toast 是**短暫的浮動通知，自動消失**。用於操作結果回饋（成功 / 失敗 / 警告）。不阻斷使用者操作。

**實作基礎**：基於 sonner（浮動管理）+ 消費 Notice primitive（layout + icon + theme 策略，與 Alert 共用）。

**Layout Family**：CLAUDE.md 4-Family Model **Family 2（List item layout）** 消費者。結構繼承 `patterns/item-layout/item-layout.spec.md`「List item layout」章節的 reading-mode 規格。Toast 透過 Notice 繼承 Family 2 結構。

---

## 何時用

- **操作結果短暫回饋**：儲存成功、訊息已送出、已複製到剪貼簿、刪除失敗
- **背景非同步動作完成**：檔案上傳完成、資料同步完成、通知已寄出
- **需要「復原」按鈕的操作**：刪除後 4 秒內可 Undo（sonner action 模式）
- **非關鍵資訊**：訊息即使使用者沒看到也不影響流程

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 關鍵錯誤或警告（使用者必須看到）| `Alert` + `Dialog` | Toast 會自動消失，關鍵訊息必須 persistent |
| 欄位級驗證錯誤 | Field error message | Toast 是頁面級，欄位錯誤靠在欄位下方 |
| 需要使用者確認的訊息（「是否繼續？」）| `Dialog` | Toast 非阻斷且自動消失，無法承載確認流程 |
| 持久性系統狀態（方案過期、帳戶未驗證）| `Alert` | Toast 短暫，狀態需要 persistent |

---

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

## 相關

- `../Notice/notice.spec.md` — Toast 消費的 layout primitive（與 Alert 共用）
- `../Alert/alert.spec.md` — 持久性通知（同一套視覺策略）
- `../Dialog/dialog.spec.md` — 需要阻斷或確認的通知改用 Dialog
- [sonner](https://sonner.emilkowal.ski/) — 浮動管理 library
