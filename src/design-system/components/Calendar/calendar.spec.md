# Calendar 設計原則

## 定位

Calendar 是**月曆 primitive**——顯示一個月的日期網格,供使用者點擊選擇單日 / 多日 / 日期範圍。獨立元件,非 DatePicker 內部私有。

**實作基礎**：`react-day-picker@9` 包裝 + 本 DS token 覆寫預設視覺。所有 classNames 透過 `classNames` prop 注入,避免引入原生 `.rdp-*` 樣式漂移。

**Layout Family**：非上述 family — composite / multi-section（月份 caption + 星期標頭 + 日期網格 + nav 按鈕,多區塊組合）。

**世界級對照**:
- shadcn `<Calendar>` — 同樣 react-day-picker 包裝 pattern
- Ant Design `<Calendar>` — inline 行事曆(更複雜含事件)
- Material MUI `<DateCalendar>` — inline 日期 picker
- 本元件取 shadcn 最簡潔的 pattern(inline 月曆),事件行事曆(Ant 風格)非本元件範疇

---

## 何時用

- **Inline 月曆顯示**:dashboard / 行事曆小卡 / 日期 filter bar
- **DatePicker 浮層內嵌**:DatePicker 消費本元件作為選日 popup(見 `../DatePicker/date-picker.spec.md`)
- **範圍選擇**:`mode="range"` 適用「from → to」場景(訂單日期範圍、查詢時段)
- **多日選擇**:`mode="multiple"` 適用「勾選多個不連續日期」(event sign-up)

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 日期輸入欄位 | `DatePicker` | Calendar 是 inline,欄位需要 trigger + popup 結構 |
| 純顯示單日期 | `DatePickerDisplay` / `Intl.DateTimeFormat` | 不需 interactive 月曆 |
| 時間選擇(時分) | ⚠️ 未來 TimePicker | Calendar 只處理日期層級 |
| 事件行事曆(日程本) | 專用行事曆元件 | Calendar 是日期選擇;事件日誌需要 event overlay / drag / week/month view 切換 |

---

## mode(react-day-picker API)

| mode | 選擇行為 | 典型場景 |
|------|---------|---------|
| `single`（預設） | 單日選取,點新日取代舊選 | DatePicker / 生日 / 到期日 |
| `multiple` | 可勾選多個不連續日期 | event 報名多日 |
| `range` | from → to 連續範圍 | 訂單日期範圍 / 查詢時段 |

---

## 視覺 token（本 DS 覆寫 react-day-picker 預設）

| 區塊 | Token |
|------|-------|
| 月份 caption | `text-body font-medium` |
| Nav 按鈕 prev/next | `h-7 w-7 rounded-md text-fg-muted hover:text-foreground hover:bg-neutral-hover` |
| 星期標頭(一/二/三...) | `text-caption text-fg-muted font-normal w-9 h-8` |
| 日格 | `h-9 w-9 rounded-md text-body` |
| Hover | `hover:bg-neutral-hover` |
| Selected | `bg-primary text-white`(hover `bg-primary-hover`) |
| Today(未選) | `ring-1 ring-primary` |
| Outside month(灰色前後月) | `text-fg-disabled` |
| Disabled | `text-fg-disabled opacity-50` |
| Focus-visible | `ring-2 ring-ring outline-none` |

**為什麼固定 h-9 w-9**:月曆格子需要固定尺寸確保對齊,不隨 density 變化(Calendar 是浮層內或 dashboard 卡片,與 field-height family 無關)。

---

## 禁止事項

- ❌ **不改視覺 token 為硬色值**(`bg-primary` 必須來自 semantic,不可 `bg-blue-500`)
- ❌ **不用 `.rdp-*` 原生 class 直接樣式化**(繞過本元件 classNames prop 會跨版本斷掉)
- ❌ **不自包 Popover**(Calendar 是 inline primitive;需要浮層由 consumer 包 Popover,見 DatePicker)
- ❌ **不混用其他 calendar library**(若 DateRange / DateTime 需求出現,擴充本元件 `mode="range"` 或新 prop,不引第二套)

---

## A11y 預設

react-day-picker v9 自動處理:
- **鍵盤**：ArrowLeft/Right 切日,ArrowUp/Down 切週,PageUp/Down 切月,Home/End 切週首尾
- **ARIA**：`role="grid"` + 日格 `role="gridcell" aria-selected`
- **Focus**：`autoFocus` prop 自動 focus 到選中日(或今天)
- **Locale**：`locale` prop 控制週首日、星期標頭語言

Consumer 無需額外處理,保留 react-day-picker API 即可。

---

## 相關

- `../DatePicker/date-picker.spec.md` — **本元件 consumer**:DatePicker 消費 Calendar 作為選日 popup
- `../../tokens/color/color.spec.md` — semantic token 來源（primary / neutral / fg-muted 等）
- react-day-picker 官方文件 — `https://react-day-picker.js.org`
