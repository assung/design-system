---
name: ship-then-revert-anti-pattern
description: 禁 ship-then-revert workflow。SSOT-UI/UX edit 必先 propose verbatim approval,違 = mechanical BLOCKER
type: feedback
originSessionId: a689a78e-f264-4c1f-b881-0859a7a12135
---
# Ship-then-revert anti-pattern

## Rule

**SSOT-affecting UI/UX edit(src/design-system production code substantive)前必引 user verbatim approval。**

Approval signals(任一可):
- 「同意」/「採用」/「拍板」/「OK」/「好」/「push」/「ship」/「修」/「改」/「做」
- Numbered directive(`#1 A` / `#2 B` / `1. A` 等)
- 「照你建議」/「照 codex 共識」+ 具體議題反 reference

**No signal → ASK propose**(中文具體人話 列選項 + tradeoff,等回覆才動)。

## User 原話 SSOT(2026-05-15)

> 「我之前不是也要你增刪改 infra 避免你他媽做事之前都不全盤考慮,等做完了之後發現不對才來 revert,**到底是要多沒效率**？之前已經叫你避免了,**又再犯**？」
>
> 「**上述的問題請你務必確實確保永遠他媽不要再給我犯了**」

## Anti-pattern 錨例

**2026-05-15 commit `9e89d4d` H1 ship**:`field-wrapper.tsx:25` 加 `min-w-0`(Field family SSOT change)。User 只 echo 我的 hypothesis 問 M10,**不是 verbatim approval**。Stop hook CODEX-DESIGN-NO-APPROVAL BLOCKER fires → commit `e6eafcd` revert。

Cycle waste:edit → ship → BLOCKER → revert → re-propose。每多一次 = 浪費 user 時間 / 動 attention budget。

## Mechanical strength

- Hook `check_substantive_edit_approval_preflight.sh` 目前 P1 soft warn → 升 P0 BLOCKER(exit 2)在 src/design-system production substantive + no approval keyword 場景
- Hook 同時必 grep 近 5 條 user message approval keyword,**not just paraphrase echo**(M4「user echo hypothesis ≠ approval」sub-check)

## How to apply

- 動 `src/design-system/**/*.tsx` substantive 前先檢查近 5 條 user msg
- 找不到 verbatim → 不動,改 propose
- Propose 必含:concrete option + tradeoff + 「等你回 A/B」結尾
- 若 user 已給 numbered directive `#N A/B`,引 verbatim quote 才動

## Related

- CLAUDE.md `# 自主執行 canonical` SSOT-UI/UX → ASK
- CLAUDE.md `# 稽核 canonical` Audit-vs-execute 分權
- M33(下個 session defer 反 pattern)
- M19(trigger phrase auto-pipeline,只在 ensure / always 等 keyword 起)
