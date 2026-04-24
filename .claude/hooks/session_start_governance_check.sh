#!/bin/bash
# SessionStart hook: check if governance hygiene actions are overdue; if so,
# inject reminder into session context so Claude proactively addresses them.
#
# Why: M10 — silent tech debt violates. If /knowledge-prune last ran 3+ months
# ago, CLAUDE.md is over 800 lines, or user-corrections.jsonl has pending
# entries not yet codified → user / Claude should know at session start, not
# discover later when things break.
#
# Checks:
#   1. CLAUDE.md line count vs transition cap (800)
#   2. Days since last /knowledge-prune commit(based on git log)
#   3. user-corrections.jsonl pending count (last harvested)
#   4. benchmarks/ freshness(> 30 days = stale)
#
# Non-blocking; injects context only when thresholds breached.

# Per-hook fire logging(enables /knowledge-prune D2 dead-hook detection)
source "$(dirname "$0")/_log-fire.sh" 2>/dev/null && log_hook_fire

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

REMINDERS=""

# Check 1: CLAUDE.md size
if [ -f CLAUDE.md ]; then
  LINES=$(wc -l < CLAUDE.md | tr -d ' ')
  if [ "$LINES" -gt 800 ]; then
    REMINDERS="${REMINDERS}\n- CLAUDE.md is ${LINES} lines (transition cap 800). Consider /knowledge-prune to consolidate."
  fi
fi

# Check 2: Last /knowledge-prune commit
LAST_PRUNE=$(git log --format='%ct' --grep='knowledge-prune\|prune:\|governance.*prune' -1 2>/dev/null || echo "")
if [ -n "$LAST_PRUNE" ]; then
  NOW=$(date +%s)
  DAYS=$(( (NOW - LAST_PRUNE) / 86400 ))
  if [ "$DAYS" -gt 90 ]; then
    REMINDERS="${REMINDERS}\n- Last /knowledge-prune commit was ${DAYS} days ago (target: quarterly ≤ 90 days)."
  fi
fi

# Check 3: user-corrections pending
CORRECTIONS_LOG="$PROJECT_DIR/.claude/logs/user-corrections.jsonl"
if [ -f "$CORRECTIONS_LOG" ]; then
  CORRECTION_COUNT=$(wc -l < "$CORRECTIONS_LOG" | tr -d ' ')
  if [ "$CORRECTION_COUNT" -gt 20 ]; then
    REMINDERS="${REMINDERS}\n- ${CORRECTION_COUNT} user-correction signals pending codification (.claude/logs/user-corrections.jsonl). Review + codify pending ones."
  fi
fi

# Check 4: benchmarks freshness — AUTO-RUN fetcher if > 30 days or never fetched
# (對齊 M14 AUTO integrate pipeline — external signal refresh 不等 user 提醒)
BENCH_DIR="$PROJECT_DIR/.claude/benchmarks"
if [ -d "$BENCH_DIR" ]; then
  LAST_FETCH_FILE="$BENCH_DIR/last-fetch.txt"
  SHOULD_AUTO_FETCH=0

  if [ ! -f "$LAST_FETCH_FILE" ]; then
    SHOULD_AUTO_FETCH=1
    FETCH_REASON="never fetched"
  else
    LAST_TS=$(stat -f '%m' "$LAST_FETCH_FILE" 2>/dev/null || echo "0")
    NOW=$(date +%s)
    DAYS=$(( (NOW - LAST_TS) / 86400 ))
    if [ "$DAYS" -gt 30 ]; then
      SHOULD_AUTO_FETCH=1
      FETCH_REASON="${DAYS} days stale"
    fi
  fi

  # Background fetch(不 block session 起動,寫結果供下次 session 用)
  # 只有 fetcher 存在才跑,容忍網路錯誤(fetch.sh 內建 fail-silent)
  if [ "$SHOULD_AUTO_FETCH" = "1" ] && [ -x "$BENCH_DIR/fetch.sh" ]; then
    (bash "$BENCH_DIR/fetch.sh" > "$BENCH_DIR/.last-auto-fetch.log" 2>&1 &) 2>/dev/null
    REMINDERS="${REMINDERS}\n- Benchmarks ${FETCH_REASON} → auto-fetching in background(結果寫 .last-auto-fetch.log,下次 session 生效)"
  elif [ "$SHOULD_AUTO_FETCH" = "1" ]; then
    REMINDERS="${REMINDERS}\n- Benchmarks ${FETCH_REASON} → manually run \`bash .claude/benchmarks/fetch.sh\`"
  fi
fi

[ -z "$REMINDERS" ] && exit 0

MSG="🧭 Governance hygiene reminders (SessionStart):${REMINDERS}\n\nThese are not blocking — address them inline when timing permits, or defer with explicit reason."
ESCAPED=$(printf '%b' "$MSG" | jq -Rs .)
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' "$ESCAPED"
exit 0
