# TimePicker 設計原則

## 定位

TimePicker 是**單一時間**(時/分/秒)輸入與顯示元件,對齊 Ant Design `<TimePicker>` API 風格,但視覺與互動走本 DS 設計語言。

**Layout Family**:**Family 4(Field control layout)**,視覺對齊 Family 1(Menu item)。見 `patterns/element-anatomy/element-anatomy.spec.md`「Field control layout」段。

**實作基礎**:
- **Trigger**:`<button>` + `fieldWrapperStyles`(視覺 = Input wrapper,但 role 是 button 開 popover)
- **Popup**:`<Popover>`(消費 `patterns/overlay-surface/` 的 surface chrome)
- **Panel 主體**:**自建** 2-3 欄 column picker(時 / 分 / 秒),**不引入第三方 time library**——自建讓 DS own 視覺與交互(對齊 Ant Design 的 Panel 結構 + 本 DS token)
- **世界級對照**:Ant Design TimePicker / Material DateTimePicker / iOS native time picker——共同行為:column scroll selector、minuteStep 支援、Now / OK footer、clearable

---

## 何時用

| 情境 | 範例 |
|------|------|
| 會議排程時間 | Calendar event 的 start / end time(常 minuteStep=15) |
| 航班 / 公車時刻 | 起飛時間、發車時間(HH:mm) |
| 營業時間 / 工作時間 | 店家開放時間、員工排班上下班 |
| 提醒 / 鬧鐘時間 | Reminder time picker(秒無意義,showSeconds=false) |

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| 同時需要日期 + 時間 | **DatePicker with time** 或 `<DatePicker> + <TimePicker>` 並列 | TimePicker 本身不帶日期;需配 DatePicker 組合 |
| 時間範圍(from-to) | **兩個 `<TimePicker>`** 並列 + 之間 `<ArrowRight>` | TimePicker **MVP 不支援 range**,用組合達成(對齊 Ant `TimePicker.RangePicker` 的 composition 思路) |
| 純文字時間輸入(秒有意義的科學測量) | `<Input>` + mask / regex validation | TimePicker 的 column UX 不適合大量精確輸入 |
| 倒數計時 / 相對時間 | 自行渲染 `MM:SS` 倒數 | TimePicker 是 wall-clock time,不是 duration |

---

## API

```tsx
<TimePicker
  value={time}                   // ISO "HH:mm" or "HH:mm:ss" | null
  onChange={setTime}
  size="sm" | "md" | "lg"        // 對齊 field-height family,default md
  mode="edit" | "readonly" | "disabled"
  disabled={boolean}
  error={boolean}
  clearable={boolean}
  placeholder="請選擇時間"
  showSeconds={boolean}          // 預設 false(兩欄:時/分)
  minuteStep={1 | 5 | 10 | 15 | 30}   // 會議常用 15
  secondStep={1 | 5 | 10 | 15 | 30}   // showSeconds=true 時生效
  disabledTime={(parts) => ({    // 動態禁用某些時/分/秒
    disabledHours: [...],
    disabledMinutes: [...],
    disabledSeconds: [...],
  })}
  startIcon={Clock}              // 預設 Clock,傳 null 關閉
  locale="en-US"
  formatOptions={{ hour: '2-digit', minute: '2-digit', hour12: false }}
/>
```

### Value 格式

**Value 是 ISO time string**(`"HH:mm"` 或 `"HH:mm:ss"`),local-time 語義(不帶時區 / 不帶日期)—— 對齊 DatePicker 家族的「value = ISO string」策略,consumer 不需持有 Date object。

### 顯示格式化

**Display 走 `Intl.DateTimeFormat`**(跨 locale 統一、12h/24h 支援)。`formatOptions` 透傳進去。

---

## 尺寸

| size | field-height(md density) | Icon | 字體 |
|------|--------------------------|------|------|
| sm | 28px | 16px | text-body |
| md | **32px**(預設) | 16px | text-body |
| lg | 36px | 20px | text-body-lg |

**field-height family 成員**,default = md(與 Button / Input / DatePicker 共享),見 `tokens/uiSize/uiSize.spec.md`。

---

## Panel 視覺規則

Panel 展開後的 column picker 結構:

```
┌─────────────────────────────────┐
│  時    分    [秒]                │  ← header(有 label 時顯示)
├─────┬─────┬──────────────────┤
│  09 │  00 │                   │
│  10 │  15 │  每欄 scrollable   │  ← body
│▓11▓│▓30▓│  選中項藍底白字     │
│  12 │  45 │                   │
│  13 │     │                   │
├─────┴─────┴──────────────────┤
│            [Now]    [OK]     │  ← footer(選填)
└───────────────────────────────┘
```

### 欄內 item 狀態(對齊 SelectMenu canonical,**非 DatePicker**)

| State | 視覺 | Token |
|-------|------|-------|
| 正常 | 置中文字 | `text-foreground` |
| hover | 灰底 | `hover:bg-neutral-hover` |
| **selected** | **灰底**(非藍底) | `bg-neutral-selected text-foreground rounded-md` |
| disabled(`disabledTime`) | 灰字 | `text-fg-disabled cursor-not-allowed` |

**為什麼 selected 走 neutral 非 primary**(2026-04-21 canonical):TimePicker panel 是「**列表選中**」語意 — user 在時 / 分 / 秒選項間切換,跟 `SelectMenu` / `MenuItem` 同流派(單選 list → `bg-neutral-selected`)。**DatePicker date cell selected 用 `bg-primary`** 是因為那是「**最終選定日期**」的強 affordance(確定性)。兩者不同語意,不互調。

對齊 SelectMenu / MenuItem 的好處:consumer 看 TimePicker 面板知道這是「選一個項目」,跟 Select 下拉選單認知一致(Ant Design TimePicker panel 同樣採 neutral selected)。

### Spacing + 結構(2026-04-21 canonical)

- Panel 內 padding = `--layout-space-tight`(12px @ md density)
- **三欄(時 / 分 / 秒)`flex-1` 均分父層寬度**(Panel `w-56` = 224px,三欄各 ~66px),**不再 w-14 / w-16 固定**。分隔「:」shrink-0 w-3 不吃 slot 空間
- Scrollable list 用 **`<ScrollArea>`**(對齊 DS 跨 OS 一致 overlay 捲軸 canonical);不 raw `overflow-y-auto`
- 每 item **`h-9`(36px)對齊 DatePicker date cell**(跨 picker 視覺一致)
- List 高 `h-[216px]`(容納 6 個 item 置中)

---

## 鍵盤

| 按鍵 | 行為 |
|------|------|
| 點 trigger | 開 Panel |
| Esc | 關 Panel(不確認) |
| Tab | 焦點在 column 間移動 |
| ↑ / ↓ | 欄內上下選 |
| Enter | 確認當前 highlight |
| 直接鍵入數字(optional) | 跳到對應值 |

---

## 狀態行為

### Mode / Error / Disabled / Readonly
詳見 `../Field/field-controls.spec.md`(共用規則)。

### Empty 值
`value={null}` / `value=""` / `value=undefined` 都視為空,trigger 顯示 `placeholder`。Display 模式空值顯示 `—`(對齊 `EMPTY_DISPLAY`)。

### 驗證時機
- Panel 關閉(OK 或 outside click)時 commit value 給 `onChange`
- `disabledTime` 在 Panel 開啟時套用(selected hour 改變會重算 disabledMinutes)
- 若 consumer 需要 form-level 必填驗證 → 外層 `<Field>` + `<FieldError>` 承擔(不是 TimePicker 本體責任)

### Loading
N/A — TimePicker 是純同步輸入,無 async 狀態。

### a11y
- trigger 需 `aria-label`(若沒外部 `<label>`)
- Panel 開啟時 trigger `aria-expanded="true"`
- 每欄 `role="listbox"`,item `role="option" aria-selected`
- Screen reader 讀出「時間選擇器,當前 9 時 30 分」

---

## Dismiss / Clear 規則(對齊 CLAUDE.md canonical)

- **關閉 Panel** → `onOpenChange(false)`(Popover 內建)/ outside click / Esc —— 這是 **overlay close**,不是 `onClear`
- **清空值** → `clearable={true}` 在 trigger 的 endAction slot 顯示 `X` 透過 `ItemInlineActionButton`(canonical),點擊 `onChange("")`
- **禁止**:用帶文字 label 的 Button(「清除」)作 clear

---

## 為何無 Range(MVP)

user 若需「from-to」時間範圍,用**兩個 `<TimePicker>` 並列 + 中間 `<ArrowRight>`**(對齊 Ant `TimePicker.RangePicker` 的 composition 思路)。內建 Range 暫不 MVP 實作,因為:

1. 大部分「時間範圍」情境是**營業時間 / 會議時段**,consumer 端用兩個 TimePicker 組合語意更清晰
2. 未來若出現大量 Range 需求(如 shift 排班表),再抽 `<TimePicker.Range>` sub-composition,對齊 DatePicker.Range 的 API pattern

---

## 禁止事項

- ❌ 不要在 TimePicker 內部直接顯示日期——那是 DatePicker 的語義
- ❌ 不要把 value 改存 Date object——對齊家族 ISO string 策略
- ❌ minuteStep 不要設 7 / 11 / 13 等非整除值——會出現 00 / 07 / 14 / 21 / 28 / 35... 不符時間習慣
- ❌ 不要自刻 `<input type="time">`——瀏覽器原生 UI 跨 OS 不一致,違反 DS「跨 OS 視覺一致」原則
- ❌ Clear button 用帶文字 label 的 Button(違反 dismiss canonical,見 `patterns/element-anatomy/item-anatomy.spec.md`「Dismiss 按鈕 canonical」)

---

## 相關

- `../DatePicker/date-picker.spec.md` — 日期選擇,TimePicker 姊妹元件,API 風格對齊
- `../Input/input.spec.md` — Field control 基礎
- `../Field/field-controls.spec.md` — Mode / size / error 共用規則
- `../Field/form-validation.spec.md` — 驗證時機
- `../../patterns/element-anatomy/item-anatomy.spec.md`「Dismiss 按鈕 canonical」 — clear button 規則
