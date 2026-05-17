#!/bin/bash
# check_propose_plain_chinese.sh — Stop hook: scan AI 本 turn reply 含「要 user 決策」pattern 但用 jargon 違 propose-in-plain-chinese canonical。
#
# 對應 SSOT:.claude/memory/feedback_propose_in_plain_chinese.md
#         + CLAUDE.md `# 自主執行 canonical`「SSOT-UI/UX 中文具體人話」明文
#
# User 原話 2026-05-15:「已經跟你說過任何要我決策的東西請講具體人話,為何又跟智障一樣講人聽不懂的話呢?」
#
# Mechanism:
# 1. Tail transcript 取 AI 本 turn 最後 assistant text content
# 2. Detect 決策 prompt pattern(「回 A / B / C」/「→ 選 A」/「等你拍板」/「user 決策」)
# 3. Count jargon density(「M[0-9]+」/「Dim [0-9]+」/「SSOT」/「@watch」/「frontmatter」/「stub」/etc)
# 4. Density > threshold + 含決策 prompt → warn(P1 soft inject)
#
# 不 BLOCK turn,只 inject context warning(避免 false-positive 中斷 work)

source "$(dirname "$0")/_log-fire.sh" 2>/dev/null && log_hook_fire

set -uo pipefail
INPUT=$(cat 2>/dev/null || echo "{}")
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""' 2>/dev/null)

[ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ] && exit 0

# 找最新 user msg line 之後的 assistant text(本 turn AI reply)
LAST_USER_LINE=$(grep -n '"role":"user"' "$TRANSCRIPT_PATH" 2>/dev/null | tail -1 | cut -d: -f1)
[ -z "$LAST_USER_LINE" ] && exit 0

AI_REPLY_TEXT=$(tail -n +$((LAST_USER_LINE+1)) "$TRANSCRIPT_PATH" 2>/dev/null | \
  jq -r 'select(.message.role=="assistant") | .message.content // empty | if type=="string" then . else (.[]? | select(.type=="text") | .text // empty) end' 2>/dev/null)

[ -z "$AI_REPLY_TEXT" ] && exit 0

# Decision prompt pattern(reply 結尾含 ASK)
DECISION_RE='(回 [A-Z]|→ ?選 [A-Z]|等你(拍板|決策|回|看)|user 決策|user 拍板|拍板.{0,5}決|決策.{0,5}選|一字回|回 OK)'
HAS_DECISION=$(echo "$AI_REPLY_TEXT" | grep -cE "$DECISION_RE" 2>/dev/null)
HAS_DECISION=${HAS_DECISION:-0}

[ "$HAS_DECISION" -eq 0 ] && exit 0

# Jargon density(術語 keyword 密度)
JARGON_RE='(M[0-9]+ |Dim [0-9]+|SSOT|@watch|frontmatter|stub|variant.*content|trait-content|backfill|@benchmark|cite battle|Layer [ABCD]|Step [0-9]+\.[0-9]+|OpenSnapshot|render path|truncate chain|min-w-0|inline-flex|hasSizes|hasVariants)'
JARGON_COUNT=$(echo "$AI_REPLY_TEXT" | grep -oE "$JARGON_RE" 2>/dev/null | wc -l | tr -d ' ')
JARGON_COUNT=${JARGON_COUNT:-0}

# Threshold:含決策 prompt + jargon count ≥ 5 → warn
THRESHOLD=5

if [ "$JARGON_COUNT" -ge "$THRESHOLD" ]; then
  echo "🟡 check_propose_plain_chinese WARN:本 turn reply 含 user 決策 prompt + jargon 密度 ${JARGON_COUNT}(threshold ${THRESHOLD})" >&2
  echo "" >&2
  echo "→ 違反 propose-in-plain-chinese canonical(memory/feedback_propose_in_plain_chinese.md SSOT)" >&2
  echo "→ User 原話「請講具體人話,為何又跟智障一樣講人聽不懂的話」" >&2
  echo "→ Rewrite reply:必含 3 段(發生什麼 / 影響什麼 / 各選項 outcome — 全中文具體,禁 jargon)" >&2
  echo "" >&2
  # Soft warn,不 BLOCK turn(exit 0)— 讓 AI 看到 stderr 後 self-correct
fi

exit 0
