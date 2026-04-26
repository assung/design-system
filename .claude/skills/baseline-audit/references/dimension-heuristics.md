# Baseline Audit — 14 面向掃描 heuristic

每個面向的執行方法:**grep cmd / 讀哪段 spec / 如何記錄**。全部對齊 SKILL.md「scan-only 不判定」原則——heuristic 只規定「找什麼」「寫成什麼格式」,不規定「誰對誰錯」。

**通用記錄規則**:
- 每格內容 ≤ 15 字(matrix 可讀性)。過長時在分布摘要節展開。
- 混合狀況用 `mixed: A x N, B x M` 格式
- 不適用用 `N/A`(配備此欄位但本元件不需要,e.g. Separator 無 size)
- 缺漏用 `缺漏`(此欄位應有但未找到,e.g. Family 未宣告)
- 無法 mechanical 判定用 `?` + reason 附註

---

## 1. Layout Family 宣告

**Canonical source**: CLAUDE.md `# 4-Family Layout Model` + 各元件 `spec.md` 第一段

**Heuristic**:

```bash
# 對每個元件讀 spec.md 前 40 行
head -40 src/design-system/components/{Name}/{name}.spec.md
```

找以下任一:
- 明文「Layout Family: 1」「Family 2」「Family 3」「Family 4」
- 明文「非 Family / self-contained / composite / 無 Layout Family」
- 以上皆無 → 記「缺漏」

**記錄格式**:`1` / `2` / `3` / `4` / `self` / `composite` / `缺漏`

**注意**:不要推斷(看 JSX 結構猜 Family)——只記 spec 是否明文宣告。未宣告 = 缺漏,這是 `/design-system-audit` dim 16 的職責。

---

## 2. Size prop 對齊

**Canonical source**: `.claude/rules/ui-development.md`「建立 UI 前必讀」 → `uiSize.spec.md` + `field-controls.spec.md`;field-height family 用 `sm / md / lg`

**Heuristic**:

```bash
# 1. 看 tsx 的 cva variants
grep -nE 'size:\s*\{' src/design-system/components/{Name}/{name}.tsx
# 2. 讀 cva 該 block 列出 size keys
# 3. 看有無 h-field-* 或 var(--field-height-*)
grep -nE 'h-field-|field-height' src/design-system/components/{Name}/{name}.tsx
```

**記錄格式**:
- `sm/md/lg (field-height)` — 三標準值 + 對齊 token
- `sm/md/lg (自訂高度)` — 三標準值但用非 field-height token(註:此欄只記現況,為何不用 field-height 看 spec rationale 是 Phase 2 工作)
- `xs/sm/md/lg/xl (field-height)` — 五標準值
- `small/medium/large` — 命名偏離(原始字串)
- `N/A` — 無 size prop

---

## 3. Dismiss pattern

**Canonical source**: 尚未有單一 canonical(這就是為什麼要建 baseline)——先掃分布

**Heuristic**:

```bash
# grep 元件有無 dismiss / close / remove 關鍵字
grep -nE 'onDismiss|onClose|onRemove|onDelete|dismissable|closable' src/design-system/components/{Name}/{name}.tsx
# 看實作(若有 dismiss)用什麼 UI
grep -nE 'ItemInlineActionButton|X\s+icon|X as XIcon|X,\s*$' src/design-system/components/{Name}/{name}.tsx
```

**記錄格式**:
- `無` — 元件無 dismiss 行為
- `ItemInlineActionButton` — 用 item-anatomy primitive
- `Tag-style X icon` — 自刻 X icon 在 right slot
- `第三方 managed` — Radix/cmdk 等內建 dismiss
- `label Button` — 用完整 Button(非 inline action)
- `onDismiss callback only` — 僅暴露 callback 不提供 UI
- 混合:`mixed: ItemInlineAction(Tag) + onDismiss callback`

---

## 4. Badge overlay 使用

**Canonical source**: 尚未有單一 canonical;Badge 元件自身 spec.md + 使用 Badge 的元件

**Heuristic**:

```bash
# 元件是否 render <Badge> overlay(anchor 在 right-top 類)
grep -nE '<Badge|import.*Badge' src/design-system/components/{Name}/{name}.tsx
# 元件是否暴露 badge prop 給 consumer
grep -nE '^\s*badge\??:|badge\s*=' src/design-system/components/{Name}/{name}.tsx
```

**記錄格式**:
- `N/A` — 元件不涉及 badge(多數)
- `單一 anchor` — 暴露 badge prop 接 1 個 Badge
- `多個 anchor` — 支援多個 badge 位置(top-left / top-right / bottom)
- `子元件 badge` — 內部 sub-element 有 badge(如 NameCard avatar)
- `Badge 本體` — 本元件就是 Badge

---

## 5. Padding token 使用

**Canonical source**: `.claude/rules/ui-development.md`「Token 命名 4 條硬規則」 + `layoutSpace.spec.md` + `uiSize.spec.md`;elements 用 Tailwind spacing scale,layout 用 `--layout-space-*`

**Heuristic**:

```bash
grep -nE 'p-[0-9]|px-[0-9]|py-[0-9]|p-\[|layout-space' src/design-system/components/{Name}/{name}.tsx
```

**記錄格式**:統計該元件 padding 來源分布,最常見前 2 個寫出:
- `p-3 / px-2` — Tailwind spacing
- `p-[var(--layout-space-loose)]` — layout token
- `px-[Xpx]` — 硬寫任意值(技術問題)
- `mixed: Tailwind x N, token x M`

---

## 6. Gap token 使用

**Canonical source**: `.claude/rules/ui-development.md` → 新增數值前查既有 pattern;常見 `gap-2`(item-anatomy inline action)/ `gap-1`(tight) / `gap-3`(loose)

**Heuristic**:

```bash
grep -nE 'gap-[0-9]|gap-\[' src/design-system/components/{Name}/{name}.tsx | sort | uniq -c
```

**記錄格式**:最常見前 2 個 + 有無任意值
- `gap-2 (x5), gap-1 (x2)` — 明列
- `gap-2 only` — 單一值
- `mixed + gap-[Xpx]` — 含任意值(技術問題)

---

## 7. Icon size

**Canonical source**: `.claude/rules/ui-development.md` → `ICON_SIZE` 常數(sm/md=16, lg=20);`patterns/element-anatomy/item-anatomy.spec.md` Inline Action 規格

**Heuristic**:

```bash
# 1. 看有無 import ICON_SIZE 常數
grep -nE 'ICON_SIZE|iconSize' src/design-system/components/{Name}/{name}.tsx
# 2. grep size= 或 className w-4 h-4 / w-5 h-5
grep -nE '<[A-Z][a-zA-Z]+\s+size=|className=.*w-[4-6]\s+h-[4-6]' src/design-system/components/{Name}/{name}.tsx
```

**記錄格式**:
- `16/20 via ICON_SIZE` — 走 constant
- `16 fixed` — 只有一種 size
- `16/20 inline` — 硬寫 size prop 但值對
- `14/18/24 custom` — 用非 canonical 值
- `N/A` — 元件無 icon

---

## 8. Hover bg 類型

**Canonical source**: `tokens/color/color.spec.md`(neutral-hover)+ state token 家族

**Heuristic**:

```bash
grep -nE 'hover:bg-|data-\[hover|:hover.*background' src/design-system/components/{Name}/{name}.tsx
```

**記錄格式**:
- `neutral-hover` — 用 `hover:bg-neutral-hover` 標準 state token
- `primary-subtle` — 選中態 hover 用 primary family
- `error-subtle` / `success-subtle` — 色相 family
- `自刻色相` — 硬寫 rgba / hex(技術問題)
- `無 hover 視覺` — 不涉及 hover
- 混合:`neutral-hover + primary-subtle(selected 態)`

---

## 9. Typography 對應

**Canonical source**: `tokens/typography/typography.spec.md` + `.claude/rules/ui-development.md`「Tailwind 5 條核心」 禁止清單(Tailwind 預設 `text-xs/sm/base/lg` 禁用)

**Heuristic**:

```bash
grep -nE 'text-(caption|body|h[1-6])|text-(xs|sm|base|lg|xl)|text-\[' src/design-system/components/{Name}/{name}.tsx
```

**記錄格式**:
- `text-body / text-caption` — 純 semantic token
- `text-body-lg + text-caption` — 多種 semantic
- `text-sm`(Tailwind 預設) — 技術陷阱(CLAUDE.md 禁用清單)
- `text-[14px]` — 硬寫任意值
- 混合:`mixed: semantic x N + Tailwind x M`
- `N/A` — 元件不含文字(e.g. Separator)

---

## 10. 既有 DS element 消費

**Canonical source**: `.claude/rules/ui-development.md`「建立 UI 前必讀」「既有 DS 元件 / primitive 優先消費」表 + `# 失敗記憶索引`「hand-craft 繞 DS canonical」

**Heuristic**:

```bash
# 列出元件 import 的 DS element
grep -nE '^import.*@/design-system/(components|patterns)' src/design-system/components/{Name}/{name}.tsx
# 檢測 hand-craft 可疑 signal
grep -nE '<table|<input|<hr|<button(?!\s+type)' src/design-system/components/{Name}/{name}.tsx
```

**記錄格式**:前半列 imports,後半記可疑 signal(若有)
- `Button, Input, MenuItem` — 純消費既有 DS
- `Button; raw <input>` — 有 hand-craft signal(可疑)
- `無 import` — 不消費其他 DS element(最底層 primitive)

---

## 11. Shadow / elevation

**Canonical source**: `tokens/elevation/elevation.spec.md` + `.claude/rules/ui-development.md` → shadow 一律用 `--elevation-*`;禁 `shadow-{sm,md,lg,xl,2xl}`

**Heuristic**:

```bash
grep -nE 'shadow-|elevation-' src/design-system/components/{Name}/{name}.tsx
```

**記錄格式**:
- `--elevation-200` — 單一 token
- `--elevation-100/200/300` — 多個 elevation level
- `shadow-md`(Tailwind) — 技術問題(禁用清單)
- `shadow-none` — 明確無 shadow(合法)
- `無 shadow` — 元件不涉及 shadow

---

## 12. Tailwind v4 arbitrary shortcut

**Canonical source**: `.claude/rules/ui-development.md`「Tailwind 5 條核心」 → `[--foo]` shorthand 在 v4 失效,必用 `var(--foo)`

**Heuristic**:

```bash
# 技術陷阱 grep(必須扣除 [&[data-...]] / [&:hover] 這類 arbitrary variants)
grep -nE 'className=.*\[--[a-z]' src/design-system/components/{Name}/{name}.tsx | grep -vE '\[&'
```

**記錄格式**:
- `clean` — 0 個違規 shorthand
- `dirty: N 處` — 有 N 個未包 `var()` 的 shorthand(具體 line 在分布摘要節展開)

---

## 13. Spec 7 維度覆蓋

**Canonical source**: `.claude/rules/spec-rules.md` → 7 世界級 DS 判斷維度

**Heuristic**:對 `{name}.spec.md` 搜以下 heading keywords(繁中或英文都算):

| 維度 | Heading keyword |
|------|----------------|
| 何時用 | 「何時用」「When to use」 |
| 何時不用 | 「何時不用」「不適用」 |
| 近親元件分界 | 「與 X 的分界」「分界」「vs」 |
| 常見誤解 | 「常見誤解」「禁止事項」「Don'ts」 |
| 相關 links | 「相關」「See also」「連動」 |
| 空值呈現 | 「空值」「empty」「Empty state」 |
| 驗證時機 | 「驗證」「validation」「Form validation」 |
| Loading / a11y | 「Loading」「a11y」「無障礙」 |

**Heuristic script 示意**:

```bash
for kw in 何時用 何時不用 分界 誤解 相關 空值 驗證 無障礙 Loading; do
  grep -c "$kw" src/design-system/components/{Name}/{name}.spec.md
done
```

**記錄格式**:
- `7/7` — 全覆蓋(最多)
- `5/7 (缺: 空值, 驗證)` — 缺漏明列
- `N/A - scope 繼承 field-controls` — 按 `.claude/rules/spec-rules.md` 的 scope 預設,可 pointer 繼承 family 時記 N/A

**Scope 預設**(不算缺漏):
- Field family 元件的 mode / disabled / readonly → 可 pointer `field-controls.spec.md`
- 純 wrapper 元件(Separator / Skeleton / CircularProgress / ProgressBar)無互動狀態 → 一行帶過不算缺

---

## 14. 視覺對齊面向

**Canonical source**: 無——這個欄位明示本 skill 不涵蓋

**Heuristic**:固定寫 `需 /visual-audit`

**為什麼列入**:matrix 要讓讀者看到「這個面向是存在的,但本 skill 不負責」——避免誤以為 baseline = 全面完整。視覺 regression(API 用對但視覺跑掉)的 audit 基建見 memory `project_pending_tasks` tech debt #6。

---

## 面向新增 / 修改的 governance

若要新增第 15 個面向:
1. 必須能 mechanical grep / read-spec 判定(不可「審美判斷」)
2. 必須在 CLAUDE.md 或某 spec 有 canonical 可對照(否則 baseline 記什麼都是 noise)
3. 必須同步更新 SKILL.md 的 14 面向表 + 本檔的 heuristic

若刪除某面向:必須在 SKILL.md 記錄刪除 rationale + 搬去哪(是歸併到 `/design-system-audit`?還是移到其他 skill?)。**不可沉默刪除**——matrix 輸出會突然缺欄,下游 audit 會以為沒掃。
