#!/bin/bash
# Stop hook: scan session transcript for user correction signals; append to
# .claude/logs/user-corrections.jsonl for future /knowledge-prune Phase 0.5.
#
# Purpose: M14 AUTO integrate — every user correction should land somewhere.
# Without harvest, corrections die in transcripts. Log them for post-hoc
# codification (memory / CLAUDE.md / skill reference).
#
# Signals detected in user turns:
#   「不是」「不對」「錯了」「應該」「為什麼」「糾正」「先不管」「之後再」
#
# Non-blocking; silent on success. Self-rotates at 1 MB.

# Per-hook fire logging(enables /knowledge-prune D2 dead-hook detection)
source "$(dirname "$0")/../_log-fire.sh" 2>/dev/null && log_hook_fire

set -euo pipefail

INPUT=$(cat)
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')
[ -z "$TRANSCRIPT_PATH" ] && exit 0
[ -f "$TRANSCRIPT_PATH" ] || exit 0

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOG_DIR="$PROJECT_DIR/.claude/logs"
LOG_FILE="$LOG_DIR/user-corrections.jsonl"
mkdir -p "$LOG_DIR"

# Rotate if > 1 MB
if [ -f "$LOG_FILE" ]; then
  SIZE=$(wc -c < "$LOG_FILE" | tr -d ' ')
  if [ "$SIZE" -gt 1048576 ]; then
    mv "$LOG_FILE" "${LOG_FILE}.$(date +%Y%m)"
  fi
fi

# Extract user turns from last 500 lines of transcript, grep for correction signals
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')

# jq walks transcript, gets user message text, greps for correction keywords
CORRECTIONS=$(tail -500 "$TRANSCRIPT_PATH" 2>/dev/null \
  | jq -r 'select(.type=="user") | .message.content? // empty | if type=="string" then . else (.[]? | select(.type=="text") | .text) end' 2>/dev/null \
  | grep -E '不是|不對|錯了|應該|糾正|為什麼沒|先不管|之後再|別再|不要' \
  | head -5 || true)

[ -z "$CORRECTIONS" ] && exit 0

# Dedup by session:only log latest per session(avoid re-harvest same session 爆炸 log)
# 2026-04-24 bug fix v2:原 `grep && mv` 若全 line 都 match(grep 返回 1)→ && short-circuit
# 不跑 mv → log 繼續 grow。改用獨立 grep + 無條件 mv,確保替換一定執行。
if [ -f "$LOG_FILE" ]; then
  grep -v "\"session\":\"$SESSION_ID\"" "$LOG_FILE" > "$LOG_FILE.tmp" 2>/dev/null || true
  # grep -v 可能 exit 1(無 non-match 時),但 tmp 檔一定存在(空或含內容);無條件 mv
  [ -f "$LOG_FILE.tmp" ] && mv -f "$LOG_FILE.tmp" "$LOG_FILE"
fi

# Append summary line(latest per session)
COUNT=$(echo "$CORRECTIONS" | wc -l | tr -d ' ')
ESCAPED_SAMPLE=$(echo "$CORRECTIONS" | head -2 | jq -Rs .)
printf '{"ts":"%s","session":"%s","count":%s,"sample":%s}\n' \
  "$TIMESTAMP" "$SESSION_ID" "$COUNT" "$ESCAPED_SAMPLE" >> "$LOG_FILE"

# Stop hook JSON schema 不接受 additionalContext。Silent log only — corrections
# already saved to user-corrections.jsonl line 62. /codify-corrections skill 會在
# threshold 時 SessionStart hook 提醒。
exit 0
