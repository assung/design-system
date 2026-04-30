---
name: Story Canonical 三層完整落地(2026-04-26)
description: Storybook 三層(展示 trait v2 + anatomy 5-canonical + principles Polaris-aligned)5-layer M19 pipeline 全落地索引
type: project
originSessionId: 7fa6c876-f1f7-4537-8cb3-1c97212e5a80
---
# Storybook 三層 Canonical — 完整 5-layer 落地

合併原 `project_story_typology_v2_2026_04_26.md` + `project_principles_canonical_2026_04_26.md`。

## 三層定位

| 層 | 檔案 | Canonical | 關鍵 hook | Audit Dim |
|---|------|-----------|-----------|-----------|
| 1 展示 | `*.stories.tsx` | trait-based v2(取代 v1 7-category) | `check_story_category.sh` | Dim 29 |
| 2 設計規格 | `*.anatomy.stories.tsx` | 5-canonical(Overview/Inspector/ColorMatrix/SizeMatrix/StateBehavior) | `check_story_anatomy.sh` + `check_anatomy_section_numbering.sh` | Dim 13 |
| 3 設計原則 | `*.principles.stories.tsx` | Polaris-aligned ≥ 2 of {WhenToUse / WhenNotToUse / Vs*Rule / ContentGuidelines} | `check_principles_canonical.sh` | Dim 30 |

## M8 benchmark(三層共識來源)

- **展示**:Polaris / Material / Carbon / Ant / Storybook 5 家 raw — trait-based 共識
- **anatomy**:Polaris / Material / Atlassian / Carbon / IBM Inspector idiom
- **principles**:Polaris(4 H2)/ Carbon(10 H2)/ Ant(1 H2)— 採 Polaris-aligned 中等

## 5-layer 落地(每層相同模式)

| Layer | 展示 | anatomy | principles |
|-------|------|---------|-----------|
| 1 SSOT | category-templates.md v2 | anatomy-standard.md | category-templates.md「Principles canonical」節 |
| 2 Spec 宣告 | spec.md frontmatter `traits:` | (自動 inferred from cva)| (canonical naming) |
| 3 Hook | check_story_category.sh | check_story_anatomy.sh | check_principles_canonical.sh |
| 4 Audit | Dim 29 | Dim 13 | Dim 30 |
| 5 Scaffold | /new-component Phase 5.0 trait | Phase 5(anatomy 5 stories) | Phase 5(WhenToUse + Vs*Rule) |

## 規則演進(三層共通)

禁止單元件偏離不記 rationale。Typology 演進流程:
1. invoke `/ensure-canonical`(M19)
2. M8 benchmark ≥ 3 家
3. Checkpoint sign-off
4. 5-layer 同步更新

## Migration scripts

- `scripts/migrate-trait-frontmatter.mjs` — 47 元件 spec.md frontmatter 加 traits
- `scripts/migrate-principles-canonical.mjs` — 13 rename + 50 WhenToUse adds(idempotent)

## 47 元件落地狀態(2026-04-26)

- **展示 trait** ✓ 47/47 declared
- **anatomy 5-canonical** ✓ 47/47(已完成 prior session)
- **principles canonical** ✓ 47/47(13 rename + 50 add + 6 internal new files)

## Commits(本 session)

- fdef6ba — feat: trait v2 + hook + Dim 29 + scaffold
- 75d98dd — chore: 47 spec frontmatter trait migration
- 61b3ec7 — fix: trait v2 增刪改
- 741ef62 — feat: principles canonical + hook + Dim 30
- c9ea0f5 — chore: 47 principles batch
- 6a5b4fb — feat: self-improvement infra(stop_self_audit + 6 internal principles + tests)

## Cross-link

- CLAUDE.md `# Story` 三層定位段(上游 anchor)
- 兩個 SSOT files:`category-templates.md` + `anatomy-standard.md`
- 三 hooks 各 sibling test
- 三 audit dims periodic verify
