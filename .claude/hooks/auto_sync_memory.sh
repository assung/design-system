#!/bin/bash
# auto_sync_memory.sh — SessionStart 自動跑 sync-memory(harness ↔ repo)
#
# 2026-05-25 SSOT auto-sync gap fix(2026-05-23 user 永久 directive):
# Memory canonical = `~/.claude/projects/<project-hash>/memory/`(harness SSOT)
# Repo mirror = `.claude/memory/`(讓 cloud sandbox / git history 看得到)
#
# Pre-fix:`npm run sync-memory` 純手動,user 改 memory 後忘跑 → repo mirror 落後 / cloud sandbox 看不到 latest entries
# Fix:每 session start 自動 fire `node scripts/sync-memory.mjs`(non-blocking,exit 0 永遠不擋 session start)
#
# 對齊 sync-version-to-all-manifests.mjs / auto_regen_ds_barrel.sh post-action SSOT auto-sync pattern。

source "$(dirname "$0")/_log-fire.sh" 2>/dev/null && log_hook_fire

set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" 2>/dev/null || exit 0

# Skip if script doesn't exist(defensive — repo could be partial clone)
[ -f scripts/sync-memory.mjs ] || exit 0

# Run sync-memory silently. Capture output but only surface if files actually copied.
SYNC_OUT=$(node scripts/sync-memory.mjs 2>&1 || true)

# Parse "copied: N" — only inject context if N > 0(reduce noise)
COPIED=$(echo "$SYNC_OUT" | grep -oE 'copied: [0-9]+' | grep -oE '[0-9]+' | head -1)
if [ -n "$COPIED" ] && [ "$COPIED" -gt 0 ]; then
  MSG="🔄 auto sync-memory(SessionStart)— harness → repo mirrored ${COPIED} memory file(s)。Latest entries 已對齊 .claude/memory/"
  ESCAPED=$(printf '%s' "$MSG" | jq -Rs .)
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' "$ESCAPED"
fi

exit 0
