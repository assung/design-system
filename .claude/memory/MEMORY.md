# Memory Index

## User context
- [user_role.md](user_role.md) — Design-oriented frontend engineer with high standards for design correctness
- [project_goal.md](project_goal.md) — World-class DS where CLAUDE.md + specs ensure AI faithfully executes design principles

## Feedback (workflow / collaboration discipline)
- [feedback_codex_dual_track_synthesizer.md](feedback_codex_dual_track_synthesizer.md) — Codex collab 永遠 dual-track:Claude own + codex own + 比稿 synthesize
- [feedback_codex_collab_2026_05_23_directives.md](feedback_codex_collab_2026_05_23_directives.md) — Codex brief 三 invariant + 「trust 自己」真意=dual-track NOT skip + ASK gate 嚴格 + triple-verify(2026-05-23 永久,合 3 file)
- [feedback_audit_discipline_full_sweep_deterministic_preflight.md](feedback_audit_discipline_full_sweep_deterministic_preflight.md) — 稽核三 invariant:NO-SAMPLE 全盤 / 必 chain deterministic script / Preflight scan(合 3 file)
- [feedback_solo_dev_workflow.md](feedback_solo_dev_workflow.md) — 1 chat = 1 working branch;Netlify preview = user gate;user 拍板才 push main(M28)
- [feedback_ship_then_revert_anti_pattern.md](feedback_ship_then_revert_anti_pattern.md) — SSOT-UI/UX edit 必先 propose verbatim approval,違 = hook BLOCKER(2026-05-15)
- [feedback_propose_in_plain_chinese.md](feedback_propose_in_plain_chinese.md) — 要 user 決策必用中文人話(發生什麼/影響/選項 outcome),禁 jargon,hook 機械強制(2026-05-15)
- [feedback_codex_local_transport_node_modules.md](feedback_codex_local_transport_node_modules.md) — 地端 codex 走 `node_modules/.bin/codex`(npm dep),3-test discovery 順序固定(2026-05-17)
- [feedback_push_always_call.md](feedback_push_always_call.md) — 每 substantive turn 結尾必 call PushNotification,不自我 suppress(2026-05-17)
- [feedback_codex_visual_audit_dangerously_bypass.md](feedback_codex_visual_audit_dangerously_bypass.md) — Codex exec MCP visual audit 唯一可行 path = `--dangerously-bypass-approvals-and-sandbox`(2026-05-27)
- [feedback_propose_without_cite_fabrication_2026_05_27.md](feedback_propose_without_cite_fabrication_2026_05_27.md) — 對話 propose 含「規定 / 必配 / canonical 寫」必附 file:line cite,沒 cite = 瞎掰自動撤回(2026-05-27,hook `check_propose_cite_required.sh`)
- [feedback_ds_css_aggregator_full_sweep_2026_05_27.md](feedback_ds_css_aggregator_full_sweep_2026_05_27.md) — DS src/**/*.css 必在 tokens.css aggregator 或被 tsx import — 否則 consumer 拿不到(2026-05-27,hook `check_orphan_ds_css.sh`)
- [feedback_ssot_mechanical_p0_not_p1_warn_2026_05_27.md](feedback_ssot_mechanical_p0_not_p1_warn_2026_05_27.md) — SSOT canonical = 必 P0 BLOCKER 機械強制 with per-line escape comment;禁 P1 WARN soft signal(2026-05-27)
- [feedback_composition_fidelity_pixel_vs_structural_2026_05_27.md](feedback_composition_fidelity_pixel_vs_structural_2026_05_27.md) — Pixel diff 對 template-vs-canonical 是錯工具;render fidelity 由架構(workspace link + portal + anti-pattern hooks)保;pixel diff 僅同內容 story 適用(2026-05-27)
- [feedback_ai_self_audit_unreliable_mechanical_primary_2026_05_27.md](feedback_ai_self_audit_unreliable_mechanical_primary_2026_05_27.md) — AI self-audit unreliable;mechanical ground-truth = primary defense / AI judgement = supplementary only / new audit layer ALWAYS expand never replace(2026-05-27 user verbatim「你他媽常常無法發現自己錯」+ session 5+ anchor)

## Feedback (DS canonical / 視覺判斷)
- [feedback_story_baseline_reference.md](feedback_story_baseline_reference.md) — 寫 stories wrap primitive 必 reference 既有完整佈局 baseline(2026-05-20 AppShell-vs-Sidebar drift anchor)
- [feedback_nearest_same_purpose_canonical.md](feedback_nearest_same_purpose_canonical.md) — M35 nearest same-purpose canonical wins(folded into M23(d);registry-driven + hook R8 + SKILL Phase 0.0)

## Reference
- [reference_deploy_targets.md](reference_deploy_targets.md) — Storybook GitHub Pages + Netlify per-branch preview + main = production

---
**Prune history**:
- **2026-05-15 D3 retire 4 entries**(已被上游吸收):`spec_impl_sort_parallel_fix` → M10/M12/M23/M29 / `datatable_f3_row_drag` → data-table.spec.md / `overlay_primitive_consumption` → overlay-surface.spec.md / `overlay_chrome_token_semantic` → semantic.css
- **2026-05-27 D1+D2 prune 8 entries**(Rule-of-3 absorb + stale,archive `retired/2026-05-27-prune/`):
  - Merge cluster A — audit discipline:`audit_full_sweep_not_sample` + `audit_deterministic_script_not_subagent` + `audit_preflight_全盤查` → 合 `feedback_audit_discipline_full_sweep_deterministic_preflight.md`
  - Merge cluster B — codex 2026-05-23 directives:`autonomous_default_triple_verify_2026_05_23` + `codex_collab_real_intent` + `codex_brief_invariants_2026_05_23` → 合 `feedback_codex_collab_2026_05_23_directives.md`
  - Stale retire:`project_hover_overlay_decisions_2026_05_09`(Q1/Q2/Q4/Q5/Q7 已 codified data-table.spec.md;Q3 NOT NOW defer post-v1)+ `codex_collab_backfill_2026-05-19`(CLOSED 2026-05-26 per content)
  - Net delta:22 → 17 entries(-5,軟 cap 18 達標)
