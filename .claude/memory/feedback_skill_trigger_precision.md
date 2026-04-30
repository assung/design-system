---
name: skill_trigger_precision
description: Skill invocation triggers must match precise, unique user vocabulary. Loose phrases like「世界級怎麼做」「比幾個版本」are ambient conversation, NOT skill requests — clarify before invoking.
type: feedback
originSessionId: 138f4306-1a67-4fe7-9341-c585d88d643b
---
**Rule**: Every skill's `description` frontmatter must specify **exact vocabulary** the user uses ONLY when they genuinely want the workflow. For loose / high-frequency ambient phrases, require a clarify-first protocol before invoking.

**Why**: 2026-04-19 session — I initially proposed `design-proposal` skill with triggers「給我幾個方案」「比幾個版本」「這個怎麼做世界級」. User corrected twice:
1. 第一次:「"這個怎麼做世界級或是比幾個版本,給我幾個方案"這句話我很常說,但其實不是要你執行這個 skill」
2. 第二次(同 session 後):「"比幾個版本" 可能也太籠統」

User's verbal patterns include these phrases for **thought-partnering / brainstorming / asking for perspective**, not as commitment to a full 6-phase workflow. Auto-invoking on loose phrases results in wrong-scope execution.

**How to apply**:
- When designing a new skill's `description`, ask: does this trigger phrase EXCLUSIVELY mean "run the workflow"? If it has any ambient / casual usage, move to clarify-first.
- When writing skill triggers in frontmatter, include explicit「DO NOT auto-invoke on X / Y / Z」 with specific loose phrases enumerated
- For loose phrases, build a clarify-template in SKILL.md (e.g., "要走正式流程嗎?還是先口頭討論?")
- Current 4 skills all now follow this discipline(design-system-audit / prototype / product-ui-audit / delivery-handoff)— future new skills must inherit

Concrete loose phrases to never auto-invoke on:
- 「世界級怎麼做」/「還能怎麼做」/「怎樣是世界級」
- 「給我幾個方案」/「比幾個版本」/「比一下版本」
- 「有哪些選項」/「哪家做得好」
