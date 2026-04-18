# Alert 設計原則

## 定位

Alert 是**持久性通知**，嵌入在頁面中。用於系統狀態提示、警告、錯誤訊息。使用者需要主動 dismiss 或處理。

**實作基礎**：消費 Notice primitive（共享 Toast 的 layout + icon + theme 策略）。

**Layout Family**：CLAUDE.md 4-Family Model **Family 2（List item layout）** 消費者。結構繼承 `patterns/item-layout/item-layout.spec.md`「List item layout」章節的 reading-mode 規格。Alert 透過 Notice 繼承 Family 2 結構。

---

## 何時用

- **頁面內需要持續存在的狀態通知**：方案即將到期、帳戶驗證未完成、需要更新付款方式
- **頂部全域警告**（`placement="fixed"`）：系統維護中、服務降級、重要公告
- **表單 / Dialog 內的 inline 提示**：複雜動作的前置警告（刪除前的資料影響說明）
- **需要使用者處理才會消失的訊息**：有 CTA 可以解決問題、或需明確按下 dismiss

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 操作結果短暫回饋（儲存成功、刪除失敗）| `Toast` | Toast 自動消失，不佔頁面空間 |
| 需要阻斷背景互動 | `Dialog` | Alert 是 inline，不阻斷 |
| 欄位級驗證錯誤 | Field error message | Alert 是頁面級，欄位錯誤靠在欄位下方 |
| 成功訊息需要使用者確認 | `Toast`（非阻斷）/ `Dialog`（需確認）| Alert 的持久成本對成功訊息太高 |

---

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

## 相關

- `../Notice/notice.spec.md` — Alert 消費的 layout primitive（與 Toast 共用）
- `../Toast/toast.spec.md` — 非阻斷短暫通知（同一套視覺策略）
- `../Dialog/dialog.spec.md` — 需要阻斷背景的警告改用 Dialog
