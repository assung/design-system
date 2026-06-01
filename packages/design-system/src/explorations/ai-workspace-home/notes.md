# AI Workspace Home — Exploration Notes

**Brief**: 企業內部個人 AI 工作台首頁。每天打開的 job-to-be-done: 今日情境快速上手 + agent 狀態監控 + 快速委派指令 + 知識/記憶回顧。

## Benchmark (Phase 1)

| Reference | Approach | Key insight |
|---|---|---|
| Linear Inbox | Daily triage inbox, keyboard-first | j/k nav, priority dot, cycle awareness |
| Raycast | Command launcher, everything from one bar | Speed-first, ⌘Space entry, no chrome |
| Notion Home | Widget dashboard, personalized | Customizable, ambient, editorial |
| GitHub Copilot Workspace | Task → plan → code pipeline | NL to action steps, agent ownership |
| MS 365 Copilot | Enterprise morning brief | Catch-up narrative, email/meeting digest |
| Apple Intelligence | Ambient personal context | Time-aware, notification-summarize |

## Phase 2 Evaluation

| Axis | A: Command Nexus | B: Ambient Brief |
|---|---|---|
| DS 一致性 | ★★★★★ 全用既有元件 | ★★★★★ 全用既有元件 |
| 業務 fit | ★★★★☆ keyboard power user 最快 | ★★★★★ 所有角色都易懂 |
| 複雜度 | ★★★★☆ 低 | ★★★★☆ 低 |
| 主要差異 | Agent-centric, dense, 速度 | Task-centric, narrative, 溫度 |

## Phase 3.0 Object Map (ORCA — 兩 candidate 共享)

**Objects**: Agent · Brief · Task · Memory · Command

**Relationships**:
- Brief → references → Task[] (1:many)
- Agent → executes → Task (1:1 active)
- Task → produces → Memory (optional)
- Command → creates → Task (1:1)

**CTAs per role (User)**:
- Agent: View Detail / Pause / Redirect / Ask
- Task: Approve / Edit / Defer / Delegate
- Memory: Edit / Delete / Promote to doc
- Command: Type → Send

## Candidates

| | A: Command Nexus | B: Ambient Brief |
|---|---|---|
| DNA | Raycast + Linear | Notion + MS Copilot |
| Positioning | 打開即作戰，最快路徑到 agent 委派 | 大管家晨報，每天讀一份為你量身寫的簡報 |
| Primary object | Agent | Brief + Task |
| UX style | 鍵盤優先，dense，monochrome accent | 視覺敘事，寬鬆，warm greeting |

## New components needed

- 兩個 candidate 均不需新增 DS 元件，消費既有 Avatar/Badge/Button/ProgressBar/Tag/Chip
- 若採用任一，需補 AgentCard pattern spec（M17 SSOT 要求）
