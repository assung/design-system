# DateField 設計原則

## 定位

DateField 是日期的輸入與顯示元件。Edit 模式用原生 `<input type="date">`，格式化邏輯用 `Intl.DateTimeFormat`。

共用規則見 `field.spec.md`。本文件只記錄 DateField 特有的原則。

---

## 原生 date picker

使用瀏覽器原生的 date picker，不自建 calendar。理由：

- 原生 picker 自動處理 locale、無障礙、鍵盤操作
- 行動裝置上原生 picker 體驗遠優於自建
- 視覺由 Field wrapper 統一，原生 picker 的「外觀」被完全覆蓋

### Calendar icon

左側固定顯示 Calendar icon（`startIcon`），取代原生 date input 的預設指示器（原生指示器透過 CSS 隱藏）。

---

## 格式化

| 選項 | 說明 | 範例 |
|------|------|------|
| `formatOptions` | `Intl.DateTimeFormatOptions` | `{ year: 'numeric', month: 'short', day: 'numeric' }` |
| `locale` | BCP 47 locale | `'zh-TW'`、`'en-US'` |

Display 模式（readonly / disabled / DataTable cell）使用 `Intl.DateTimeFormat` 格式化。Edit 模式顯示原生 date input 的格式（瀏覽器 locale 決定）。

---

## Clearable

`clearable` prop 在有值時顯示 clear 按鈕（endAction）。

- 只在 edit 模式顯示
- 清除後 value 變為 `null`（Display 顯示 —）

---

## 禁止事項

- ❌ 不自建 calendar picker——使用原生 `<input type="date">`
- ❌ 不在 readonly / disabled 模式顯示 clear 按鈕
