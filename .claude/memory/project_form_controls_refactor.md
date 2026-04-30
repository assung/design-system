---
name: project_form_controls_refactor
description: Rejected — 3-layer form-controls refactor evaluated and declined on 2026-04-18 as over-abstraction
type: project
originSessionId: 138f4306-1a67-4fe7-9341-c585d88d643b
---
## Decision (2026-04-18): DO NOT refactor

Evaluated the planned 3-layer split (Primitive + Field + form-controls) and rejected it.

### Why rejected

**Industry alignment**: World-class DS (Chakra, Ant Design, shadcn, Material) all keep `readOnly` / `disabled` as props on the primitive — no separate form-controls layer. The proposed 3-layer architecture only makes sense in schema-driven contexts (Salesforce Lightning, Fluent UI where permissions determine readonly). This project is manual UI composition, not schema-driven.

**Cost vs benefit**:
- Cost: 6+ new components, 14+ story rewrites, DataTable/Dialog/Field stories migration, invalidates just-committed `field-controls.spec.md`
- Benefit: `<Input mode="readonly">` becomes `<TextControl mode="readonly">` — same usage, one more layer of indirection
- Tree-shaking makes "DataTable imports Input to get InputDisplay" a non-issue for bundle size

**Current architecture is already world-class**: Matches Chakra / Ant / shadcn conventions exactly.

### Implications

- `field-controls.spec.md` stays accurate — describes the canonical architecture
- BooleanDisplay (`Checkbox/boolean-display.tsx`) remains a valid one-off extraction (different visual: text vs checkbox UI) — not a template for a wider pattern
- Queue reordered: skip form-controls refactor, prioritize 43-component quality audit per Button benchmark
