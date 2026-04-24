# .claude/agents/ Charter

## 這裡只收:**特化 subagent**(scoped tools + isolated context)

每個 agent 一檔 `.md`,格式:
```markdown
---
name: agent-name-kebab-case
description: 何時 invoke(main AI 透過 Task tool `subagent_type: 'agent-name-kebab-case'` 調用)
tools: [Read, Grep, Bash, Glob]  # scoped — 該 agent 需要的最小集
---

System prompt body — agent 收到 prompt + 本檔內容 作為 context。
```

**vs Skill**:skill 是 main AI 跟 user 互動的 workflow(CP / user decision);agent 是 main AI 呼叫的特化 worker(isolated context,返回 summary)。

**vs 一般 general-purpose Agent**:registered agent 有 scoped tools(不能亂改檔)+ 特化 system prompt(專業知識內建)+ 更易 audit。

## 當前居民(3 pilot,2026-04-24)

| Agent | 消費者 | Scoped tools |
|-------|--------|-------------|
| `ds-dim-auditor` | `/design-system-audit` Phase 1(22-dim parallel scan) | Read / Grep / Glob(**禁 Write**)|
| `visual-auditor` | `/visual-audit` / `/component-quality-gate` Phase 4.5 Layer B | Read / Bash / Grep |
| `baseline-matrix-builder` | `/baseline-audit` / `/design-system-audit` P1 prerequisite | Read / Grep / Glob(**禁 Write**)|

## 這裡**不收**(反例)

| 疑似要放這但其實不是 | 正確去處 | 為什麼 |
|---------------------|---------|--------|
| 需要 user CP 多次決策的 workflow | `.claude/skills/` | agent 返回一次 summary,user CP 需在 main AI 端處理 = skill |
| 一次性 script | `.claude/commands/` | agent 是 AI worker,不是 script |
| 每 session signal rule | `CLAUDE.md` | agent 只在 invoke 時載入 |
| 機械 tool-level 檢查 | `.claude/hooks/` | hook 是 pre/post tool event,不是 AI agent |

## 新 agent 的 criteria

1. **Scope isolated**(main AI 不需知道 agent 內部思考,只讀 agent return summary)
2. **Scoped tools** 明確寫在 frontmatter(不是「全權」,是 minimal set)
3. **被 ≥ 1 skill 調用**(orphan agent 不建)
4. **Main AI 可 deterministic 消費 return**(agent 輸出結構清楚)

## Skill vs Agent 選擇指南

```
問題需要 user 多次 CP 決策? 
  → YES: skill(main AI 驅動,phase + CP)
  → NO: 
      問題是 scan / analysis / lookup?
        → YES: agent(scoped tools,isolated,可 parallel / background)
        → NO: 用 skill 或 command
```

## 本 pilot 的 rationale(2026-04-24)

User 提問:`/design-system-audit` 22 dim audit 把 findings 都擠進 main context = pollution。但 audit 又有 user CP(P2 triage)→ 不能全移 agent。
**解法**:skill 保留 CP 流程,但 skill Phase 1 內部 parallel 調 sub-agent 改用 registered `ds-dim-auditor`(scoped tools,更乾淨 return summary),user UX 不變但 backend 升級。
