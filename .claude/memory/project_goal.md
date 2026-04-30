---
name: project_goal
description: The ultimate goal of this repo — a world-class design system where CLAUDE.md + specs ensure AI can faithfully execute design principles every time
type: project
---

This repo's purpose is to build a world-class design system where:

1. **spec.md** defines human/AI decision-making design principles
2. **tsx** codifies programmatic design rules
3. **storybook** auto-generates three layers: design principles (do/don't), design specs (anatomy/tokens surpassing Figma), and variant showcase
4. **CLAUDE.md** ensures AI executes all principles faithfully every time — no drift, no shortcuts

**Why:** The user wants Claude Code to produce pixel-perfect, principle-adherent UI without human supervision. Every component must reuse existing primitives, follow centralized specs, and maintain consistent design language.

**How to apply:** Every change must be audited against all relevant specs. No new components without verifying reuse. All design decisions must trace back to documented principles. CLAUDE.md is the enforcement layer — it must be comprehensive enough that AI never deviates.
