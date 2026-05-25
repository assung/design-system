#!/bin/bash
# auto_regen_ds_barrel.sh — PostToolUse 自動 regen barrel + per-component index
#
# 2026-05-25 SSOT auto-sync invariant(user 永久 directive 2026-05-23):
# DS infra 增刪改 → package 該同步的都該自動,不需耳提面命。
# 解決 gap:新增 / 刪除 packages/design-system/src/{components,patterns}/<Dir>/ 後
# barrel `src/index.ts` 沒 auto-regen → consumer subpath import 壞 / new component 漏 export。
#
# Fire condition(PostToolUse Write|Edit|MultiEdit):
#   - Write/Edit 創建新 `packages/design-system/src/components/<Dir>/<kebab>.tsx`
#     OR 改動 component primary tsx(可能 export 名 change)
#   - Write/Edit 創建 / 改動 `index.ts` in components/<Dir>/ or patterns/<dir>/
#   - 新增 / 移除 hooks/*.ts or lib/*.ts(barrel 也 include 這些)
#
# Action:silent fire `node scripts/gen-component-indexes.mjs` + `node scripts/gen-design-system-barrel.mjs`
# 不 BLOCKER — auto fix-up,不打斷 workflow。emit message 告訴 AI「已 auto regen barrel」
# 對齊 sync-version-to-all-manifests.mjs pattern(post-action auto fix-up)

source "$(dirname "$0")/_log-fire.sh" 2>/dev/null && log_hook_fire

set -uo pipefail

INPUT=$(cat 2>/dev/null || echo "{}")
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")

if [ -z "$FILE_PATH" ]; then exit 0; fi

# Scope filter:必 packages/design-system/src/{components,patterns,hooks,lib}/**
if ! echo "$FILE_PATH" | grep -qE 'packages/design-system/src/(components|patterns|hooks|lib)/'; then
  exit 0
fi

# Skip stories / spec / test files(not barrel-included)
if echo "$FILE_PATH" | grep -qE '\.(stories|anatomy\.stories|principles\.stories|spec|test|spec\.md)\.(tsx?|md)$'; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" 2>/dev/null || exit 0

# Fire 2 gen scripts silently(stderr captured for diagnostics)
INDEX_OUT=$(node scripts/gen-component-indexes.mjs 2>&1 || true)
BARREL_OUT=$(node scripts/gen-design-system-barrel.mjs 2>&1 || true)

# Only emit additionalContext if barrel content changed(detected by checking if grep finds count delta)
# Simple proxy:grep "generated" in output means script ran successfully
if echo "$BARREL_OUT" | grep -qE 'generated|with [0-9]+ components'; then
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "🔄 auto-regen DS barrel(SSOT auto-sync per 2026-05-23 user directive)— $FILE_PATH 改動觸發 \`gen-component-indexes.mjs\` + \`gen-design-system-barrel.mjs\` re-run。Barrel src/index.ts + per-component index.ts 已對齊。若 commit 此 turn 改動,記得 stage barrel 變化。"
  }
}
EOF
fi

exit 0
