#!/bin/bash
# SessionStart hook: check if governance hygiene actions are overdue; if so,
# inject reminder into session context so Claude proactively addresses them.
#
# Why: M10 — silent tech debt violates. If /knowledge-prune last ran 3+ months
# ago, CLAUDE.md is over 800 lines, or user-corrections.jsonl has pending
# entries not yet codified → user / Claude should know at session start, not
# discover later when things break.
#
# Two-tier thresholds(2026-04-25 G1):
#   • Soft — inject reminder,non-blocking
#   • Hard(2x soft)— inject BLOCKER context requiring Claude's first action
#     to be /knowledge-prune(SessionStart hooks cannot truly block session,
#     but hard-tier context is prefixed with 🚨 BLOCKER / REQUIRED_FIRST_ACTION
#     so Claude reads it as must-address-first instruction)
#
# Checks + thresholds:
#   1. CLAUDE.md line count     — soft 800  / hard 1000
#   2. Days since last prune    — soft 90   / hard 180
#   3. user-corrections pending — soft 20   / hard 40
#   4. Benchmarks freshness     — auto-fetch at 30 days(no hard tier)

# Per-hook fire logging(enables /knowledge-prune D2 dead-hook detection)
source "$(dirname "$0")/_log-fire.sh" 2>/dev/null && log_hook_fire

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

REMINDERS=""
BLOCKERS=""

# Check 1: CLAUDE.md size(soft 800 / hard 1000)
if [ -f CLAUDE.md ]; then
  LINES=$(wc -l < CLAUDE.md | tr -d ' ')
  if [ "$LINES" -gt 1000 ]; then
    BLOCKERS="${BLOCKERS}\n- CLAUDE.md is ${LINES} lines(HARD THRESHOLD 1000 breached). /knowledge-prune REQUIRED FIRST ACTION this session."
  elif [ "$LINES" -gt 800 ]; then
    REMINDERS="${REMINDERS}\n- CLAUDE.md is ${LINES} lines (transition cap 800). Consider /knowledge-prune to consolidate."
  fi
fi

# Check 2: Last /knowledge-prune commit(soft 90d / hard 180d)
LAST_PRUNE=$(git log --format='%ct' --grep='knowledge-prune\|prune:\|governance.*prune' -1 2>/dev/null || echo "")
if [ -n "$LAST_PRUNE" ]; then
  NOW=$(date +%s)
  DAYS=$(( (NOW - LAST_PRUNE) / 86400 ))
  if [ "$DAYS" -gt 180 ]; then
    BLOCKERS="${BLOCKERS}\n- Last /knowledge-prune was ${DAYS} days ago(HARD THRESHOLD 180 breached). /knowledge-prune REQUIRED FIRST ACTION this session."
  elif [ "$DAYS" -gt 90 ]; then
    REMINDERS="${REMINDERS}\n- Last /knowledge-prune commit was ${DAYS} days ago (target: quarterly ≤ 90 days)."
  fi
fi

# Check 3: user-corrections pending(soft 20 / hard 40)
CORRECTIONS_LOG="$PROJECT_DIR/.claude/logs/user-corrections.jsonl"
if [ -f "$CORRECTIONS_LOG" ]; then
  CORRECTION_COUNT=$(wc -l < "$CORRECTIONS_LOG" | tr -d ' ')
  if [ "$CORRECTION_COUNT" -gt 40 ]; then
    BLOCKERS="${BLOCKERS}\n- ${CORRECTION_COUNT} user-corrections pending(HARD THRESHOLD 40 breached). /codify-corrections REQUIRED FIRST ACTION this session."
  elif [ "$CORRECTION_COUNT" -gt 20 ]; then
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

[ -z "$REMINDERS" ] && [ -z "$BLOCKERS" ] && exit 0

if [ -n "$BLOCKERS" ]; then
  # Hard-tier:must-address-first framing,user can override but Claude reads as REQUIRED
  MSG="🚨 BLOCKER — governance hard thresholds breached (SessionStart):${BLOCKERS}\n\n"
  MSG="${MSG}⚠️ REQUIRED_FIRST_ACTION:先 invoke 上述 skill(/knowledge-prune 或 /codify-corrections)"
  MSG="${MSG}把 governance 帶回健康區間,再處理 user 的實際請求。不可 silent defer —— 若 user "
  MSG="${MSG}明示要先做其他任務,你 acknowledge 這些 blocker + 記 tech-debt pointer 再繼續。"
  if [ -n "$REMINDERS" ]; then
    MSG="${MSG}\n\n額外 soft reminder:${REMINDERS}"
  fi
else
  MSG="🧭 Governance hygiene reminders (SessionStart):${REMINDERS}\n\nThese are not blocking — address them inline when timing permits, or defer with explicit reason."
fi
ESCAPED=$(printf '%b' "$MSG" | jq -Rs .)
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' "$ESCAPED"
exit 0
