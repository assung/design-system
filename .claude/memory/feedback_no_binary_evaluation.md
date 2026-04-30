---
name: Don't binary-evaluate user proposals — generate 3rd alternative
description: When user proposes a solution (A or F), I must not execute binarily. Generate at least one 3rd alternative via world-class DS benchmark and compare all three before executing. User proposals are prompts not demands.
type: feedback
originSessionId: 05d48110-60e2-415a-8f5c-193bb9f0bd29
---
When user asks「走 A 還是 B?」or proposes「併回 X」or「做 Y」, **do not treat it as execute-or-reject binary**. The user is PROMPTING thought, not DEMANDING execution.

**Why**: 2026-04-20 session iterated through item-layout / element-anatomy / layout-families / nested / flat multiple times because I kept executing user's stated option without generating a 3rd world-class alternative. Each iteration user correctly pushed back:
- Round 1: I proposed Option F (top-level LAYOUT-FAMILIES.md), user said「我選 A」, I executed mechanically. User then flagged「item-layout 在 element-anatomy 之下很奇怪」— I had put concept-narrower file in concept-broader folder.
- Round 2: User said「重構也可以,要世界級」, I proposed Option F again (split top-level). User asked「為什麼不合成一份放 patterns」—— valid 3rd option I hadn't evaluated.
- Round 3: I did nested element-anatomy/item-anatomy/. User asked「為什麼 element anatomy 不能包含 item anatomy(integration)」, I should have evaluated flat/merged/nested 3-way but didn't until pushed.

**How to apply**:
1. When user proposes X, ALWAYS generate ≥ 1 third alternative Y/Z via「世界級 DS 怎麼做」benchmark(Material / Polaris / Atlassian / Carbon / Radix — check actual structure, not rationalize from memory)
2. Compare ALL candidates on: consistency with existing project conventions / semantic accuracy / navigation ergonomics / future-proofing
3. Present the comparison and the BEST recommendation — not just「Y vs X,你選」but「A vs B vs C,我推薦 C 因為...」
4. User's「不管工程大小要最好」is a clear signal: don't optimize for least change, optimize for correctness. Big refactor is fine when it buys clarity.

**Counter-pattern to avoid**: "User said A → I execute A → user pushes back → I try B → user pushes back → I try C → user pushes back → ..." This exhausts the user and signals I'm not thinking, just reacting.

**Related failures from this session**:
- Putting `story-writing` in `patterns/` without checking patterns/ charter
- Keeping `item-layout.tsx` in `element-anatomy/` to avoid rename
- Claiming `ItemLayout` is Material idiom when Material actually uses `<ListItem>` (should have actually checked, not rationalized)
- Three successive folder-structure flip-flops before landing on flat topical Z structure

**Structural prevention**: The `enforce_home_charter.sh` hook catches placement errors at Write time. But thinking-level errors(「沒想到 3rd option」)need behavioral rule. This memory entry IS that rule.
