---
name: Proactive 5-layer pipeline(M14 + M19 自動執行)
description: 對話得到設計結論後立刻自動 5-layer 落地(spec / hook / consumer / 同類 grep),不等 user 提醒
type: feedback
originSessionId: 7fa6c876-f1f7-4537-8cb3-1c97212e5a80
---
每次對話得到一條 design 結論 / canonical 決定 / 命名共識,**立刻**走 M14 5-layer pipeline ≥ 3 層,不等 user 催:

1. SSOT spec.md 寫入(canonical home)
2. 同類 consumer grep + 批次更新
3. Hook 寫攔(防未來再犯)
4. 失敗記憶 / Meta-Pattern 索引(若是 generalizable bug class)
5. 驗證(tsc / 截圖 / compile-stories)

**Why**:2026-04-28 user 在多輪對話後直接質問「你說你會自我改善,今天改善了什麼?」— 點出我整輪 reactive 模式,等 user 罵才修。我認知層 missing:
- BulkActionBar 加 border-t → 沒同步寫進 spec
- Cell 整格點擊改 code → 沒寫 spec.md「Selection cell 點擊範圍 canonical」
- NameCard 6 處違規 → 修了 data 但沒加 hook
- Button `+` 字面 → 改了 1 處沒 grep 同類
- Story 名「L2 Selection」內部代號 → 整輪不查直到 user 點

**How to apply**:
- 對話結論句出現「我們應該 X」/「canonical 是 Y」/「以後都要 Z」→ 立刻 M14 五層下手,不問 user 確認(M19)
- 修完一處 bug → 同 turn 內 grep DS-wide 同 pattern,批量修(M10 proactive exhaustive scan)
- 命名 / 規則 / canonical 的決定 → 同 turn 內回填 spec + 加 hook(若可機械化)
- User 第 2 次問同主題 → 必截圖 / 必 grep,不是補解釋(M13)
- 寫 final summary 時:列「自動改善的部分」一節,空白也寫「無新 pattern」(強制反思)

**加 hook 前必過 CLAUDE.md「3 題」**(2026-04-28 補,因為違反過):
1. 既有 Meta-Pattern / spec / canonical 已覆蓋?有 → append pointer 不新寫
2. **Rule-of-3**:DS-wide 同 pattern ≥ 3 處?**< 3 處不加 hook**(避免為 1 次失誤建專用攔截)
3. 7 天後還會 fire 嗎?不確定 → 不寫
歷史錯案:`check_button_icon_literal.sh`(2026-04-28 retired)— DS-wide 0 hits 卻為自己 1 次失誤建 hook,違反 Rule-of-3。Hook 不是失誤紀念碑,是高頻違規防線。

**寫 UI 範例 / 動視覺 code 前必過 5-step pre-check**(2026-04-28 補,user 反覆問才寫死):
1. Read CLAUDE.md「SSOT 消費 canonical」清單章節
2. `ls src/design-system/{components,patterns}/` 看既有
3. Read 主要消費的元件 spec.md(eg DataTable / Alert / BulkActionBar)
4. grep 同類 pattern(eg "BulkActionBar" / "selection mode" / "footer band")
5. tsx 開頭寫「── 消費的 SSOT ──」段
跳任一步 = 違反 M1 + M2 + M5;inject_pending_self_audit 會在下 turn 把證據送進來。

**Inject hook DIRECTIVE 觸發時的對應 action**(2026-04-28 hook 升級為 directive):
- M19 trigger-phrase 警告 → 立刻 invoke `/ensure-canonical` skill,不只口頭答
- M10 topic-repeated 警告 → grep DS-wide 同 pattern,批量修(不只 user 點的個案)
- Claim-verify gap → 立刻跑 `tsc -b` / hook test / score script,或撤回 claim
