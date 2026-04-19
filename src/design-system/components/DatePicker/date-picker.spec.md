# DatePicker 設計原則

## 定位

DatePicker 是**單一日期**的輸入與顯示元件。Edit 用**本 DS 自建 Calendar**（基於 `react-day-picker` + 本 DS token）+ Popover 呈現；Display 用 `Intl.DateTimeFormat`。

共用規則見 `../Field/field-controls.spec.md`。本文件只記錄 DatePicker 特有的原則。

**Layout Family**：CLAUDE.md 4-Family Model **Family 4（Field control layout）** 消費者。結構繼承 `components/Field/field-controls.spec.md` 的 `fieldWrapperStyles + [startIcon?] [<editable>] [endAction?]` 規格,視覺對齊 Family 1（Menu item）讓 SelectMenu trigger + options 連續一致。

**實作基礎**：
- Trigger：`<button>` 包 `fieldWrapperStyles`(視覺仍是 Input wrapper,只是改為可點擊觸發浮層)
- Popup：`Popover`(消費 overlay-surface pattern 外殼)
- Calendar 主體：消費獨立的 `Calendar` 元件（見 `../Calendar/calendar.spec.md`;react-day-picker 包裝成本 DS token)

---

## 何時用

- **單一日期選擇**：出生日、到期日、提醒日、發佈日
- **需要 locale-aware 顯示**（`Intl.DateTimeFormat` 自動處理年月日順序、月份語言）
- **需要視覺上與 Dialog / Popover / SelectMenu 一致的浮層體驗**（所有浮層都用我們的 token）
- **DataTable 的日期欄位**（自動整合，meta.type='date'）

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 日期範圍（from → to） | ⚠️ 尚未提供（未來 Date Range Picker） | 目前暫用兩個獨立 DatePicker + 自己組範圍邏輯 |
| 日期 + 時間（含時分） | ⚠️ 尚未提供（未來 DateTime Picker） | 目前暫用 DatePicker + 另一個 Input for time，不理想 |
| 相對時間（「3 天前」「昨天」）| 自訂 Display 元件 | DatePicker 的 Display 是絕對日期；相對時間需要計算 + locale 格式化 |
| 純文字 YYYY-MM-DD（不需要 picker）| `Input` | 如 API debug 介面、不需互動的純記錄 |
| 生日等「只有月日、不需要年」的欄位 | 目前用 DatePicker 忍受年份 | 多數情境可接受；要極致可自訂 MonthDayPicker |

---

## Calendar popup（本 DS 自建）

DatePicker 使用**本 DS 自建 Calendar** + Popover 而非瀏覽器原生 `<input type="date">`。歷史變更（2026-04-19）：原本遵守「不自建 calendar」禁令以保留 mobile 原生 wheel UX,但 CLAUDE.md Mindset #1 擴充後明確要求「視覺上也必須跟世界級一樣整齊」——原生 picker 視覺不受控、跨瀏覽器不一致,無法達成與 Dialog / SelectMenu / Combobox 等浮層的視覺連續性。遂改為自建 Calendar。

### 架構

```
<button fieldWrapperStyles>        ← 視覺仍是 Input wrapper(不變)
  <span>格式化的日期文字</span>
  <ItemInlineAction X />            ← 選用,clearable=true 時顯示
  <CalendarIcon />                   ← 右側固定
</button>
       │ 點擊開啟
       ▼
<Popover>
  <Calendar />                      ← react-day-picker + 本 DS token
</Popover>
```

### 視覺 token（Calendar 內部）

| 區塊 | Token |
|------|-------|
| 月份 caption | `text-body font-medium` |
| Nav 按鈕(prev/next) | `h-7 w-7 rounded-md text-fg-muted hover:bg-neutral-hover` |
| 星期標頭 | `text-caption text-fg-muted` |
| 日格 | `h-9 w-9 rounded-md text-body` |
| Hover | `hover:bg-neutral-hover` |
| Selected | `bg-primary text-white` |
| Today（未選） | `ring-1 ring-primary` |
| Outside month | `text-fg-disabled` |
| Disabled | `text-fg-disabled opacity-50` |

### Calendar icon

右側固定顯示 Calendar icon（視覺指示這是日期輸入）。Trigger 本身是 `<button>`,點擊開啟 Popover。

---

## 格式化

| 選項 | 說明 | 範例 |
|------|------|------|
| `formatOptions` | `Intl.DateTimeFormatOptions` | `{ year: 'numeric', month: 'short', day: 'numeric' }` |
| `locale` | BCP 47 locale | `'zh-TW'`、`'en-US'` |

Display 模式（readonly / disabled / DataTable cell）使用 `Intl.DateTimeFormat` 格式化。Edit 模式 trigger 顯示文字也透過 `Intl.DateTimeFormat` 格式化（與 Display 一致，`formatOptions` / `locale` prop 對兩者皆生效）。

---

## Clearable

`clearable` prop 在有值時顯示 clear 按鈕（endAction）。

- 只在 edit 模式顯示
- 清除後 value 變為 `null`（Display 顯示 —）

---

## 禁止事項

- ❌ 不在 readonly / disabled 模式顯示 clear 按鈕
- ❌ 不改 Calendar 視覺 token 為本 DS 以外的顏色(`bg-primary` / `ring-primary` 等必須來自 semantic token,不可硬寫)
- ❌ 不用其他 calendar library 平行實作（若有 DateRange / DateTime 未來需求,擴充本 Calendar 而非引入第二個 library）

---

## 相關

- `../Input/input.spec.md` — 純文字 YYYY-MM-DD（不需 picker 互動的場景）
- `../NumberInput/number-input.spec.md` — 年齡、天數等數值
- `../Field/field-controls.spec.md` — Field Control 共用規則（mode / size / endAction / error）
