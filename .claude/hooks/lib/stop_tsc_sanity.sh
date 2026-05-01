#!/bin/bash
# Stop hook: before Claude ends the turn, if any .ts/.tsx was touched this turn,
# run `tsc -b` and report error count if non-zero.
#
# Prevents today's bug class: accumulating tsc errors (syntax / type drift /
# dead exports) across many commits, undetected because Claude never verified.
# CLAUDE.md L276 rule is "必須跑 storybook 驗證"; this hook enforces the tsc half.
#
# Only fires when the turn touched .ts or .tsx. Silent otherwise.
# Output: single line summary, non-blocking (Claude decides next action).

# Per-hook fire logging(enables /knowledge-prune D2 dead-hook detection)
source "$(dirname "$0")/../_log-fire.sh" 2>/dev/null && log_hook_fire

set -euo pipefail

INPUT=$(cat)

# Extract transcript path to inspect what tools were used this turn.
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')

# If no transcript available, bail (can't tell what was touched).
[ -z "$TRANSCRIPT_PATH" ] && exit 0
[ -f "$TRANSCRIPT_PATH" ] || exit 0

# Walk the transcript for Edit/Write/MultiEdit calls on .ts/.tsx paths since
# last user turn. Quick heuristic: look at the last N lines of transcript for
# `file_path.*\.(ts|tsx)` in tool_input blocks.
TOUCHED_TS=$(tail -200 "$TRANSCRIPT_PATH" 2>/dev/null \
  | jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use") | select(.name=="Edit" or .name=="Write" or .name=="MultiEdit") | .input.file_path // empty' 2>/dev/null \
  | grep -E '\.(ts|tsx)$' \
  | head -1 || echo "")

[ -z "$TOUCHED_TS" ] && exit 0

# Run tsc -b once, cache output, extract count + sample from same run.
cd "$CLAUDE_PROJECT_DIR" || exit 0

TSC_OUTPUT=$(timeout 60 npx tsc -b 2>&1 || true)
ERROR_LINES=$(echo "$TSC_OUTPUT" | grep "error TS" || true)
ERROR_COUNT=$(echo "$ERROR_LINES" | grep -c "error TS" || true)
ERROR_COUNT=${ERROR_COUNT:-0}

if [ "$ERROR_COUNT" -gt 0 ]; then
  # Stop hook JSON schema 不接受 additionalContext → log only
  SAMPLE=$(echo "$ERROR_LINES" | head -3)
  mkdir -p .claude/logs 2>/dev/null
  printf '{"ts":"%s","tsc_errors":%s,"sample":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$ERROR_COUNT" \
    "$(echo "$SAMPLE" | jq -Rs .)" \
    >> .claude/logs/tsc-errors.jsonl 2>/dev/null || true
fi

exit 0
