# 展示 Story Trait-Based Typology v2(2026-04-26)

世界級 DS(Polaris / Material / Atlassian / Ant / Carbon / Storybook 官方)的 Storybook story 結構**不是** category-based prescription(「button-likes 必有 5 stories」),是**trait-based**——元件依自身能力宣告 traits,required stories 由 trait 衍生。本 doc 是本 DS canonical typology v2,取代 v1 7-category。

對應 CLAUDE.md `# Story`「拆分原則」+ M8 world-class benchmark。

## 為什麼 v2 trait-based(取代 v1 category-based)

v1 7 categories(A 視覺 variant / B field control / C selection / D structural / E scenario / F media / G internal)在實踐中暴露 4 盲點:
1. **Over-engineered**:A 要求 ≥5 stories 比 Carbon 整 component 還多
2. **Switch 一刀切**:C 要求 group stories,但 Material/Polaris/Carbon 的 Switch 全是 standalone(對齊 single-toggle idiom)
3. **Scope-N/A 沒寫**:Toast 沒 size 軸,A 卻硬要 AllSizes
4. **G 不該定 required stories**:Internal 是 DS visibility governance,不是 story shape

**M8 benchmark 證據**(2026-04-26 raw source 掃 5 系統):
- **Carbon Button**:10 stories,disabled/sizes 走 args(Controls)
- **Polaris Button**:24 stories(variant × tone matrix,但 sizes 散在 per-variant)
- **MUI Button**:18 example files,trait-driven(BasicButtons / OutlinedButtons / IconLabelButtons / LoadingButtons)
- **Ant Button**:22 demos,one demo = one focused trait
- **Storybook 官方**:推薦 Default first + CSF3 args,**不 prescribe count or required set**
- **共識**:`Default` 必有 / `WithIcon` merged grid 不拆 / overlay default-open `useState(true)` / Disabled 多數有但非絕對 / scenarios 多寡看 component 性質

→ trait-based 對齊 5/5 benchmark systems(M8 ≥ 3 ✓ overshot)。

## Trait-based core canonical

### Universal(每元件必有)

- **Default** — 最 minimal 代表性範例(對齊 Storybook 官方 + Carbon idiom)

### Conditional traits → required stories

元件在 **spec.md frontmatter** 的 `traits: [...]` 宣告,`scripts/compile-stories.mjs` + hook 會驗證 required stories 齊全:

| Trait | 何時宣告 | Required stories(traits 觸發後必有) |
|-------|---------|----------------------------------|
| `hasVariants` | ≥ 2 visual variants(primary/secondary/danger 等) | `AllVariants` 對照 grid,**或** ≥ 2 個 per-variant exports |
| `hasSizes` | ≥ 2 sizes(sm/md/lg 等) | `AllSizes` merged grid(❌ 禁止 per-size 拆 `Small`+`Medium`+`Large`) |
| `hasInteractiveStates` | hover / focus / disabled / loading 任一可見 | `Disabled` own story(`Loading` 視 prop / `Error` 視 validation 而定) |
| `isOverlay` | Dialog / Sheet / Popover / Tooltip / Drawer 類 portal-rendered | `OpenSnapshot` story(`defaultOpen` / `useState(true)` 對齊 M15)+ ≥ 3 業務 scenarios |
| `isInputLike` | text / number / search / textarea field | `WithError` + `WithHelpText` + `WithIcon` merged grid |
| `isSelectionMulti` | Checkbox / Radio / 多選 toggle | `States`(checked/unchecked/indeterminate/disabled)+ `VerticalGroup` + `Disabled`(group level) |
| `isSelectionSingle` | Switch / 單一 toggle(無群組概念) | `States` only(對齊 Material/Polaris/Carbon Switch idiom — 無 group story) |
| `isMatrixHeavy` | Avatar / Skeleton / Spinner / Badge / Slider 等 token × size 正交視覺軸 | ≥ 4 matrix stories(`Modes` / `Shapes` / `Colors` / `AllSizes` 任 4) |
| `isStructural` | DataTable / Steps / Tabs / Accordion 結構主導 | 每結構變體 1 story(無固定數,過 earn-existence) |
| `isInternal` | L3 building block(被其他元件消費) | 1 `Default` + ≤ 1 composition scenario(寬鬆,Internal/ 命名空間下) |

### Optional universal

- 1+ `RealScenario` story(Jira / Stripe / Notion / Figma / Slack / Gmail 真實業務情境),**過 earn-existence 2 test 才開**:
  - Q1:教別 story 沒教的原則?
  - Q2:移除後 spec 理解 degrade?
  - 兩題皆 NO → retire 候選

## Typical story counts(對齊 Carbon / Polaris median)

| 元件類型 | Stories range | 對照 |
|---------|---------------|------|
| L1 minimal(Switch / Skeleton)| 1-3 | Carbon Checkbox 5 |
| L1 standard(Button / Input)| 4-8 | Carbon Button 10 |
| Overlay(Dialog / Sheet)| 6-12 | Polaris Modal 16 / Ant Modal 17 |
| Matrix-heavy(Avatar)| 4-6 | Polaris Avatar 5 |
| Structural(DataTable)| 8-12 | (本 DS 11) |
| Internal primitive | 1-2 | Carbon hidden _PrefixedExport |

## Scope-N/A 例外子句

某 trait 在 spec.md「邊界案例 scope」明示 N/A → 該 trait required stories 跳過,不違反 typology:

- **Toast**:`hasSizes=false`(ephemeral notification 單尺寸)→ AllSizes 跳過
- **Coachmark**:`hasInteractiveStates=false`(無 disabled / loading 概念)→ Disabled 跳過
- **Skeleton**:`hasVariants=false`(只 default skeleton 形狀)→ AllVariants 跳過

**規則**:跳過 trait 時 spec.md 必明文 rationale(例「Toast 是 ephemeral notification,單尺寸對齊 Sonner / Polaris Toast idiom,無 size 軸」)。**禁止**默默 skip。

## How to use(寫 / audit story 時)

1. 該元件宣告哪些 traits?(讀 spec.md frontmatter `traits:` array)
2. 對照本 doc traits → required stories list
3. 缺哪個 → 補(若 spec.md 該 trait 真有效)
4. 多哪個 → 過 earn-existence 2 test;不過 → retire
5. **scope-N/A 例外**:該 trait 在 spec.md 明示 N/A → 跳過 OK,但 spec.md 必有 rationale

## 邊界 case

- **多 trait 元件**(e.g. Button = `hasVariants` + `hasSizes` + `hasInteractiveStates`)→ 各 trait required 都有
- **Family 跨界**(Field control 同時 isInputLike + hasInteractiveStates)→ Union of all traits
- **新 trait 提議**:跑 M8(≥ 3 家 DS benchmark)+ Checkpoint user sign-off,不孤立發明

## Typology 演進規則(對齊 user mandate「除非調整標準」)

本 typology 是 canonical SSOT。**禁止**單元件偏離不記 rationale。Typology 本身可演進,但流程:

1. 提案 invoke `/ensure-canonical` skill(M19 trigger)
2. 跑 M8 benchmark(≥ 3 家 DS)
3. Checkpoint sign-off
4. 落地 5-layer pipeline(typology + hook + audit + scaffold + memory)

## Cross-link

- CLAUDE.md `# Story`「拆分原則」— canonical 上游 one-liner
- `/story-writing` SKILL.md Phase 0 — write-time mapping
- Hook `check_story_category.sh` — pre-write enforcement(攔不符 trait core)
- `/design-system-audit` Dim 29 — periodic verify
- `/new-component` Phase 5 — 新元件 trait-based scaffold
- `scripts/compile-stories.mjs` — runtime trait → required stories check
