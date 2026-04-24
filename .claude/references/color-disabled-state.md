# Color — Disabled 狀態完整規則

從 `src/design-system/tokens/color/color.spec.md`(2026-04-24 prune)抽出的 Disabled 狀態 token 使用規則 / 合法例外 / code review 檢查點完整展開。

## Disabled 狀態

disabled 元件內的所有子元素必須呈現 disabled 狀態：

| 元素類型 | Disabled 處理 |
|---|---|
| 文字 | `text-fg-disabled` |
| Icon（stroke） | `text-fg-disabled` |
| 圖片 / Avatar | `opacity-disabled`——圖片無法套用語義色，用透明度弱化 |
| Checkbox / Radio | 元件自身的 disabled 樣式 |
| 背景色 | `bg-disabled`（如適用） |

**判斷標準：disabled 元件內不應有任何元素呈現可互動 affordance。**

### 兩種 disabled 策略:何時用哪個

系統有**兩種** disabled 視覺處理方式,判準是「**顏色是否是 semantic state 的唯一視覺載體**」:

| 策略 | 何時用 | 消費者 | 做法 |
|---|---|---|---|
| **灰階 token swap** | State 由形狀 / 位置 / icon / 文字 等**非顏色載體**承載,顏色只是美學 | Button、Checkbox、Input、Slider、Tag | 每個元素換到 disabled 對應的灰階 token(`bg-disabled` / `text-fg-disabled` / `border-fg-disabled` 等) |
| **`opacity-disabled`** | State **完全只靠顏色區分**(形狀在 on/off 之間沒有差異),灰階化會丟失 state 辨識 | **Switch** | Root 層套 `opacity-disabled`,保留原有顏色身分,透過透明度均勻降級 |

**具體判準(寫新元件時問自己)**:
1. 在 disabled 狀態下,使用者需要辨識的 state 資訊是什麼?
2. 這些資訊**沒有顏色**仍然能看出來嗎?
3. 能 → 灰階 swap;不能 → opacity

**範例**:
- Checkbox 的 checked:checkmark **形狀**是 state 載體 → 灰階 swap OK
- Slider 的 value:thumb **位置** + range **長度**是 state 載體 → 灰階 swap OK
- Radio 的 selected:內圓點 **形狀**是 state 載體 → 灰階 swap OK
- Switch 的 on/off:track 在 on/off 之間**形狀相同**,只有**顏色**差別 → 必須 opacity

### Disabled 視覺階層公式(多元素元件參考)

多元素互動元件(Slider、Progress、複合 Input 等)在 disabled 狀態常需要 3–4 階灰階深度來分層:

```
底層背景 (n-2)  <  中層填充 (n-5)  <  輪廓邊框 (n-6)  <  文字 (n-7+)
bg-muted          bg-border         border-fg-disabled     text-fg-disabled
```

每階至少差 1 個 primitive step,使用者掃視時才能分清四個層。Slider 的 disabled 就是這個公式:track(底)< range(填充)< thumb border(輪廓)< label(文字)。

### ⚠️ fg token 不可當 bg 用(跨 family 借用是 smell)

Semantic token 按**載體類型**分成四個 family,**family 之間的 token 不能互借**:

| Family | 前綴 | 語意 | 範例 |
|---|---|---|---|
| **Foreground**(前景) | `--fg-*` / `--foreground` | 文字 / icon stroke 的前景色 | `--foreground`, `--fg-secondary`, `--fg-muted`, `--fg-disabled` |
| **Background**(背景) | `--bg-*` / `--surface` / `--muted` / 色相 subtle | 填充色 | `--surface`, `--muted`, `--bg-disabled`, `--primary-subtle` |
| **Border**(邊框 / 分隔)| `--border`, `--border-hover`, `--divider` | 視覺分隔線、容器邊框 | `--border`, `--border-hover` |
| **Ring**(聚焦環)| `--ring` | `focus-visible` 的聚焦環 | `--ring` |

**跨 family 借用是 smell**,即使「剛好是我想要的顏色」。曾經踩過的例子:

> **Case**:Slider disabled 的 Range(填充段)一開始寫成 `bg-fg-disabled`。理由:`--fg-disabled`(neutral-6)剛好是我想要的「比 track 深但比文字淺」的灰度。但 `--fg-disabled` 語意是「**disabled 文字的前景色**」,拿來當 bg 等於借 fg token 當 bg 用。
>
> **問題**:
> 1. **語意矛盾**:consumer 讀 code 時 `bg-fg-disabled` 會困惑「這到底是 bg 還是 fg」
> 2. **耦合未來變動**:未來若微調 `--fg-disabled`(例如從 n-6 改成 n-7 讓 disabled 文字更可讀),Slider range 會被迫一起變,但它不是文字、不需要文字可讀性的約束
> 3. **缺乏單一來源的 bg token**:應該存在一個「disabled 狀態的中層填充色」的 bg token(如果沒有,要新增一個 semantic alias,而不是借 fg)
>
> **修正**:改用 `bg-border`(neutral-5)。`--border` 屬於 Border family,語意是「視覺分隔線 / 容器邊框 / 階層分隔的視覺元件」——跟 range 的「填充視覺指示器」角色接近,且 family 對得上(非文字的視覺填充類)。

**規則**:

1. **新元件寫新樣式前,先確認 class 的 family 語意跟實際用途對齊**——`bg-*` 一律從 bg/surface family 選,`text-*` 一律從 fg family 選,`border-*` 一律從 border family 選
2. **沒有合適 token 時,新增 semantic alias,不要借** family——例如若 bg family 沒有「中層填充」token,在 semantic.css 開 `--fill-muted` 或類似名稱,不要借 `--fg-disabled`
3. **Code review 檢查**:看到 `bg-fg-*` / `bg-foreground` / `text-surface` / `border-fg-*` 這類命名組合,立刻質疑是否 family 借用

**唯一合法例外**:`--foreground` 偶爾用在 `bg-foreground`(暗色填充)表達「inverse surface」(例如 Tooltip 深底)——但這是 inverse namespace 的設計意圖,有專門的 `--inverse-*` token family 處理,不是隨便借。一般元件不該 `bg-foreground`。


## Icon 色彩原則
