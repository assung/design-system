# components/ Charter

## 這裡只收:單一元件的 folder

每個元件一個 PascalCase folder,內含:
- `{name}.tsx` — 元件本體
- `{name}.spec.md` — 設計原則
- `{name}.stories.tsx` — 展示
- `{name}.anatomy.stories.tsx` — 設計規格
- `{name}.principles.stories.tsx` — 設計原則 stories
- 子檔案視元件需要(`{name}-context.ts` / `{name}-types.ts` 等)

**folder 名**: PascalCase(`Button/` / `DatePicker/`)
**file 名**: kebab-case(`button.tsx` / `date-picker.tsx`)

## 這裡**不收**(反例)

| 疑似要放這但其實不是 | 實際應去 | 為什麼 |
|-------------------|---------|--------|
| 平坦 `.md` 檔(`components/foo.md`) | Skill / CLAUDE.md / spec | 本 dir 慣例是 PascalCase folder,平坦 md 破壞結構 |
| 跨元件共用的 checklist | `.claude/skills/component-quality-gate/` | 是 invoke-time workflow |
| 跨元件 runtime primitive | `../patterns/` | 本 dir 是單元件,跨元件去 patterns |
| 命名規則 / Props 命名慣例 | `CLAUDE.md` | 每 session signal |

## 新元件進來的條件

進 `components/` 前:
1. 走 `.claude/skills/component-quality-gate/`(完整 checklist)
2. 聲明 Layout Family(第一段 spec 必含,見 `patterns/element-anatomy/item-anatomy.spec.md`「4-Family Model Taxonomy」)
3. 對標至少 2 個世界級 DS 的相似元件
4. spec 第一段寫明實作基礎(Radix X / cmdk / native / 自建+理由)

## Internal primitive vs Public 元件

兩類都住同一個 folder,差別在:
- **Public**(Components/):有預設視覺,consumer 直接 `<X>` 就能用 — Storybook title `Design System/Components/{Name}`
- **Internal primitive**(Internal/):無預設視覺,必被 wrapper 元件包 — Storybook title `Design System/Internal/{Name}`

判斷 test 見 CLAUDE.md `# Story` → 「Internal vs Components 判斷 test」。

## 建立前必 Read

本 README + 該元件所在 pattern spec(若屬 Family) + CLAUDE.md `# 元件 Props 命名原則` + `.claude/skills/component-quality-gate/`。
