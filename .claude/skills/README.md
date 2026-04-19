# .claude/skills/ Charter

## 這裡只收:多步驟 workflow + user 決策點

每個 skill 一個 folder,內含:
- `SKILL.md` — frontmatter(`name` / `description`) + 完整 workflow body
- `references/` — 深度細節檔(AI 在跑 workflow 時按需讀)

**核心特徵**:**只在 user invoke 時載入**(不佔每 session context);流程包含 checkpoint 讓 user 介入決策。

## 當前居民

| Skill | Invoke 時機 | Scope |
|-------|-----------|-------|
| `design-system-audit/` | user 要求 audit DS 本身 | DS 內部 spec/cva/SSOT 18 維度 |
| `product-ui-audit/` | 「audit 這個 UI / 檢查 DS 用對嗎」| consumer UI 6 維檢核 |
| `prototype/` | user 明言「做 prototype / MVP / 原型」| exploration candidates + phase 3.5 gate |
| `delivery-handoff/` | 產品 final 後「要交付 / handoff」| figma-like 交付包 |

## 這裡**不收**(反例 + 正確去處)

| 疑似要放這但其實不是 | 實際應去 | 為什麼 |
|-------------------|---------|--------|
| 單步驟 scaffold / one-shot action | `.claude/commands/` | skill 是多步驟 + checkpoints,命令是單步 |
| 自動機械檢查(pre/post tool) | `.claude/hooks/` | skill 需 AI 走流程,hook 是 tool-level 自動 |
| 每 session 都要的 signal rule | `CLAUDE.md` | skill 只在 invoke 時載入,會 miss signal |
| 隨時間變化的狀態(audit progress) | `memory/` | skill 是不變的 workflow,state 屬 memory |
| 元件 runtime primitive | `src/design-system/patterns/` | skill 是 AI workflow,不是 UI code |

## 新 skill 的 criteria(必須全部通過)

1. **多步驟 workflow**(不只是單一 check,有明確 phase)
2. **有 user 決策 checkpoint**(AI 需要停下問 user)
3. **只在特定 invoke 情境需要**(不是每 session signal)
4. **重複使用 ≥ 3 次**(一次性任務不建 skill)
5. **invoke trigger 明確**(frontmatter description 裡清楚列出 user 說什麼會觸發)

任一不過 → 改建 command / hook / spec / CLAUDE.md rule,不硬塞。

## SKILL.md 必須包含

```markdown
---
name: skill-name-kebab-case
description: 一句話說明 skill 做什麼 + 何時 invoke(user 說哪些話觸發)
---

# Skill Title

## When to run
[明確觸發 trigger]

## Preconditions
[必要條件]

## Workflow
[Phase 1 / 2 / 3 + 每個 phase 的 checkpoint]

## References
[指向 references/*.md 的深度細節]
```

## 建立前必 Read

本 README + CLAUDE.md `# 規則分層` 的 Skill 章節 + 最接近的既有 skill 當範本。
