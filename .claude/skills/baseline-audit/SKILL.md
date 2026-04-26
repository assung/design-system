---
name: baseline-audit
description: Build a full cross-component baseline matrix (component x facet) for the design system BEFORE any judgment is applied. Only scans — does not decide canonical, does not propose fixes, does not edit files. Produces a markdown matrix that `/design-system-audit` Phase 1 consumes to find outliers, define canonical, and surface rationale-for-deviation gaps. Invoke via /baseline-audit manually, OR auto-invoked by /design-system-audit Phase 1 as its prerequisite.
---

# Baseline Audit — 全盤 matrix 掃描(scan-only,不判斷)

## 存在意義

CLAUDE.md 根目錄「Consistency Audit 原則」規定:任何跨元件 consistency 主張必須「actual == canonical OR (actual != canonical AND spec.md 有 rationale)」。但 `/design-system-audit` 過去是**零散抽樣**:每輪 audit 抽幾個元件修幾個面向,consistency 類問題因為**沒建立全盤 baseline**,每輪 audit 在重新發現同一類問題。

**本 skill 的單一責任**:在 audit 下判斷之前,先掃完「所有元件 × 關鍵面向」的實際現況,**只記錄現況,不做 canonical 判定、不提 fix、不編輯 code**。

後續的 `/design-system-audit` Phase 1 才基於此 matrix:
1. 看每個面向的分布找 outlier(多數元件用 X、少數用 Y → Y 是可疑 drift)
2. 對每個分布定 canonical(哪個是對的、哪個要靠 rationale 合法)
3. 針對 outlier 檢查其 spec 是否有 documented rationale
4. 列出真正需要修的清單

## Skill 生態位

```
/baseline-audit         只掃不判,建 matrix(本 skill — 先行者)
/design-system-audit    基於 matrix 做 canonical 判定 + 修復(Phase 1 先 invoke 本 skill)
/product-ui-audit       audit consumer UI 對 DS 的消費
```

**關鍵切分**:baseline-audit 絕不寫「VIOLATION」「應改為 X」——只寫「ComponentA: size prop = sm/md/lg 對齊 field-height token;ComponentB: size prop = small/medium/large 未對齊」。分布看完才能判斷誰錯,這是**判斷前置步驟**。

## When to invoke

- **手動**:user 說「跑 baseline」/「建 matrix」/「全盤掃一次」/「/baseline-audit」
- **自動**:`/design-system-audit` Phase 1 起手先 invoke 本 skill,拿 matrix 才進 Phase 2 的 outlier 判斷
- **適用時機**:大批 component 入庫後 / CLAUDE.md 改過跨元件規則後 / user 懷疑「consistency 類問題一直重現」時

## Preconditions

- Working dir = project root(verify `src/design-system/components/` exists)
- Build 可通(若 build 壞,baseline grep 結果仍可信,但 user 應先知道)
- `CLAUDE.md` 讀完(掃描 heuristic 對應的 rule 以最新為準)

---

## 掃描的 14 個面向(matrix 欄位)

每個面向 = matrix 一欄。全部對齊「現況紀錄,不做判定」原則。掃描 heuristic 完整細節見 [references/dimension-heuristics.md](references/dimension-heuristics.md)。

| # | 面向 | 記錄內容(matrix 格子文字) |
|---|------|----------------------------|
| 1 | **Layout Family 宣告** | `Family 1/2/3/4` / `self-contained` / `缺漏`(spec 第一段查找) |
| 2 | **Size prop 對齊** | 有無 size prop?值域(`sm/md/lg` / `small/medium/large` / `xs/sm/md/lg/xl` / `無`);對齊 `--field-height-*` 與否 |
| 3 | **Dismiss pattern** | `無` / `ItemInlineActionButton` / `Tag-style X icon` / `第三方 managed`(Radix 等) / `label Button` / `onDismiss callback` |
| 4 | **Badge overlay 使用** | `無` / `單一 anchor` / `多個 anchor` / `允許子元件 badge prop` |
| 5 | **Padding token 使用** | `--layout-space-*` / `Tailwind p-N` / `任意值 p-[Xpx]` / `混用`;具體最常見的兩個值 |
| 6 | **Gap token 使用** | `gap-1 / 2 / 3 / 4` 的分布;有無 `gap-[Xpx]` 任意值 |
| 7 | **Icon size** | `16 / 20 / 24` 分布;有無自定 icon size(非 `ICON_SIZE` 常數) |
| 8 | **Hover bg 類型** | `neutral-hover` / `primary-subtle` / `自定色相` / `inline rgba` / `無 hover 視覺` |
| 9 | **Typography 對應** | `text-body / caption / h1-6` semantic / `text-xs/sm/base/lg`(Tailwind 預設) / 硬寫 `text-[14px]` |
| 10 | **既有 DS element 消費** | 列出 component 內部消費哪些 DS primitive(`Button / Input / MenuItem / Empty / Separator...`);記「有無 hand-craft raw `<table>/<input>/<hr>` 繞過」 |
| 11 | **Shadow / elevation** | `--elevation-100/200/300` / `shadow-{sm,md,lg,xl,2xl}` / `shadow-none` / `無 shadow` |
| 12 | **Tailwind v4 arbitrary shortcut** | grep `\[--[a-z]` 未包 `var()` 的位置數(技術陷阱);為 0 就寫 `clean` |
| 13 | **Spec 7 維度覆蓋** | 7 個維度(何時用/何時不用/近親分界/常見誤解/相關/空值/驗證時機/Loading+a11y)各自 `有 / 缺`,寫成 `7/7` / `5/7 (缺:空值, 驗證)` 格式 |
| 14 | **視覺對齊(本 skill 不涵蓋)** | 固定寫 `需 /visual-audit`(提醒讀者這面向必須另走 pixel-level audit)|

**禁止新增未列於上的面向**——若 baseline 階段要擴面向,走 CLAUDE.md `# 治理 canonical` flowchart 先確認是否屬 scan-only 性質(能 mechanical grep / 讀 spec 固定段落),若需要「審美判斷」則它屬 `/design-system-audit` Phase 2,不是本 skill。

---

## Workflow

### Phase 0 — Setup

1. `cd` 專案 root,確認 `src/design-system/components/` / `patterns/` / `tokens/` 存在
2. `ls src/design-system/components/` 產生「待掃元件清單」(排除 `README.md`)
3. `ls src/design-system/patterns/` 產生「pattern 清單」(baseline 同樣涵蓋;pattern 也有 spec 可掃)
4. `git status --short` — 記錄目前 branch 狀態(baseline 不改檔,純記)

### Phase 1 — 逐面向掃描

**14 個面向可平行跑**。對每個面向:

1. 開 [references/dimension-heuristics.md](references/dimension-heuristics.md) 查該面向的具體 grep cmd / 讀哪段 spec / 如何記錄
2. 對清單內**每個元件**執行 heuristic,產出該格的紀錄字串
3. 禁止對記錄字串加判斷詞彙(「錯」「應改為」「違規」「VIOLATION」)——只寫**現況值**

**大原則**:
- 若 grep 結果混雜(例:元件同時有 `p-3` 和 `p-[var(--layout-space-tight)]`),記「mixed: p-3 x N, token x M」,不挑「對的」一邊
- 若 spec 完全沒寫某面向(例:沒宣告 Layout Family),記「缺漏」,不寫「應補上」
- 若面向對該元件不適用(例:Separator 不會有 size prop),記「N/A」

### Phase 2 — 輸出 matrix

產出檔案路徑:

```
.claude/skills/baseline-audit/output/{YYYYMMDD}-baseline.md
```

每次 invoke **新增檔案**(以日期命名),不覆寫舊檔——baseline 歷史本身是 DS 演進的診斷資料。若同日多次 invoke,加 `-v2` / `-v3` 後綴。

### Matrix 輸出格式(嚴格)

```markdown
# Baseline Audit — {YYYY-MM-DD}

掃描範圍: src/design-system/components/ (N 個元件) + patterns/ (M 個 pattern)
掃描者: /baseline-audit skill
掃描原則: scan-only,不做 canonical 判定(見 SKILL.md)

## 元件 matrix

| 元件 | 1.Family | 2.Size | 3.Dismiss | 4.Badge | 5.Padding | 6.Gap | 7.Icon | 8.HoverBg | 9.Type | 10.DS消費 | 11.Shadow | 12.TwV4 | 13.Spec7維 | 14.視覺 |
|------|---------|--------|-----------|---------|-----------|-------|--------|-----------|--------|-----------|-----------|---------|------------|---------|
| Button | 3 | sm/md/lg (field-height) | N/A | N/A | token | gap-2 | 16/20 | neutral-hover | text-body | Icon slot | none | clean | 7/7 | 需 /visual-audit |
| Tag | self | xs/sm/md(+non-field) | Tag-style X | N/A | p-2 mixed | gap-1 | 12 | primitive color variant | text-caption | — | none | clean | 6/7 (缺:驗證時機) | 需 /visual-audit |
| ... | | | | | | | | | | | | | | |

## Pattern matrix

| Pattern | 主要 consumers | 面向 1~14(適用者) |
| ... |

## 分布摘要(每面向一節)

### 1. Layout Family 宣告
- Family 1: N 個(清單)
- Family 2: M 個(清單)
- Family 3: K 個(清單)
- Family 4: L 個(清單)
- self-contained: P 個(清單)
- 缺漏: Q 個(清單)← /design-system-audit Phase 2 會 flag

### 2. Size prop 對齊
...

(每個面向都要有分布摘要節——這是 Phase 2 看 outlier 的關鍵輸入)

## Methodology note

本輪 baseline 依 SKILL.md 14 面向 + references/dimension-heuristics.md heuristic 掃。如遇:
- 新元件的某面向 heuristic 無法機械判定 → 標 `?` 並附 reason
- heuristic 本身過時(rule 改了) → 標 `[heuristic-stale]` 並附建議修正
```

### Phase 3 — Checkpoint(必停)

Matrix 寫完後**停下來**,回報 user:

```
Baseline matrix 寫到 .claude/skills/baseline-audit/output/{date}-baseline.md

掃了 N 元件 × 14 面向,分布摘要有幾個看起來像 outlier 的面向:
- 面向 X: 預期集中在 A,但 ComponentY/Z 用了 B → 值得 /design-system-audit Phase 2 判斷 canonical
- ...

下一步選項:
1. 繼續 /design-system-audit(用此 matrix 判斷 canonical + 列 fix)
2. 先人工看 matrix,有疑問再討論
3. 本輪 baseline 就結束

(本 skill 不 auto-proceed;canonical 判定由 /design-system-audit 負責。)
```

---

## Non-goals(關鍵 — 混到這些就是職責混亂)

- **不做 canonical 判定**:不寫「ComponentX 的 size 命名錯了」——只記現況
- **不提 fix**:不列修復建議 / PR 清單 / fix direction
- **不編輯任何 code / spec / story**:純讀純記
- **不決定面向是否重要**:14 面向是 SSOT,不臨時加減
- **不做視覺比對**:面向 14 明示「需 /visual-audit」,本 skill 不涵蓋 pixel-level
- **不替 /design-system-audit 跑 Phase 2**:outlier 判斷是對方的工作

## Common failure modes(watch for these)

- **把 heuristic 結果寫成判決**:記「ComponentX size=small/medium/large」而非「ComponentX size 命名錯」
- **省略 N/A 元件**:對該面向不適用不代表不記錄——記「N/A」才是有掃過
- **只掃 components 不掃 patterns**:patterns/ 也有 spec,也要列入 matrix
- **憑記憶寫面向**:每個面向必走 references/dimension-heuristics.md 的 grep / read-spec heuristic,不憑印象
- **混入 story 檔的內容**:baseline 面向只掃 `.tsx` + `.spec.md`,不掃 `.stories.tsx`(story 層是 `/story-writing` + `/design-system-audit` 的職責)

## References

- [references/dimension-heuristics.md](references/dimension-heuristics.md) — 14 面向各自的 grep cmd / 要讀的 spec 段落 / 如何記錄現況的格式規範
