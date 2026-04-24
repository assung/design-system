#!/bin/bash
# PreToolUse Write: before creating a NEW governance file, check if existing
# homes already cover the topic. Prevents CLAUDE.md / Meta-Pattern / spec drift
# from append-only accumulation.
#
# Scope: only fires on Write (new file), not Edit. Checks:
#   - new memory_*.md      → grep MEMORY.md for similar topic
#   - new hook             → grep existing hooks for similar pattern
#   - new skill            → grep .claude/skills/ for similar purpose
#   - new spec.md          → grep existing specs for same component name
#
# Output: additionalContext warning with top-3 potential duplicates. Non-blocking —
# Claude decides whether to merge / point / continue with new file.

# Per-hook fire logging(enables /knowledge-prune D2 dead-hook detection)
source "$(dirname "$0")/_log-fire.sh" 2>/dev/null && log_hook_fire

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[ -z "$FILE_PATH" ] && exit 0
# Only fire for NEW files (Write creates; Edit modifies existing)
[ -f "$FILE_PATH" ] && exit 0

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

BASENAME=$(basename "$FILE_PATH" .md)
BASENAME=${BASENAME%.sh}
BASENAME=${BASENAME%.py}

MATCHES=""

case "$FILE_PATH" in
  */memory/*.md)
    # Extract keywords from filename (e.g. feedback_xxx_yyy → xxx yyy)
    KEYWORDS=$(echo "$BASENAME" | tr '_' ' ' | awk '{for(i=2;i<=NF;i++) printf "%s ",$i}')
    MEMORY_DIR=$(dirname "$FILE_PATH")
    [ -d "$MEMORY_DIR" ] && MATCHES=$(ls "$MEMORY_DIR" 2>/dev/null | grep -iE "$(echo "$KEYWORDS" | tr ' ' '|')" | head -3 || true)
    HOME_LABEL="memory"
    ;;
  */.claude/hooks/*)
    # New hook — check for similar name
    KEYWORDS=$(echo "$BASENAME" | tr '_' ' ' | awk '{for(i=2;i<=NF;i++) printf "%s ",$i}')
    [ -z "$KEYWORDS" ] && KEYWORDS="$BASENAME"
    MATCHES=$(ls .claude/hooks/ 2>/dev/null | grep -iE "$(echo "$KEYWORDS" | tr ' ' '|')" | head -3 || true)
    HOME_LABEL="hook"
    ;;
  */.claude/skills/*/SKILL.md)
    # New skill — grep existing skill names
    MATCHES=$(ls .claude/skills/ 2>/dev/null | grep -iE "$BASENAME" | head -3 || true)
    HOME_LABEL="skill"
    ;;
  *.spec.md)
    # New spec — grep existing specs for same component
    MATCHES=$(find src/design-system -name "${BASENAME}*" 2>/dev/null | head -3 || true)
    HOME_LABEL="spec"
    ;;
  *) exit 0 ;;
esac

[ -z "$MATCHES" ] && exit 0

MSG="📋 Creating new ${HOME_LABEL} file: ${FILE_PATH}\nPossibly-related existing files:\n$(echo "$MATCHES" | sed 's/^/  /')\nBefore writing, verify: (a) is this a duplicate? (b) can we extend an existing file instead? (c) CLAUDE.md Rule-of-3 SSOT — if concept exists in 3+ places, pick one owner, others point."

ESCAPED=$(printf '%s' "$MSG" | jq -Rs .)
printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":%s}}\n' "$ESCAPED"
exit 0
