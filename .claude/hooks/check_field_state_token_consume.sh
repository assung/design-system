#!/bin/bash
set -uo pipefail
# M19 PreToolUse hook(2026-05-05 v9):Field naked variant state ring SSOT enforcement。
#
# Rule(2026-05-05 v9 architectural rewrite):naked variant **完全繼承 Field default state
# machine**(border-based)— 禁止寫平行 outline state ring(`outline-{border|primary}` /
# `box-shadow inset` 等)。對齊 user spec:「原 Field 互動樣式都保留,唯一差別 fill cell + 無圓角」。
#
# 偵測:Edit/Write 動 components/*.tsx,added line 含:
#   match A:`(hover|focus-within|focus-visible|data-\[state=open\]):shadow-\[inset` 舊 box-shadow inset
#   match B:`(hover|focus-within|focus-visible|data-\[state=open\]):outline-(border|primary)` 自寫 outline state ring
#   → BLOCKER(用 Field default state machine 繼承,不寫平行 outline)
#
# 唯一允許:`nakedCellEditableDisplayHover` 是 cell wrapper editable display hover 信號(對齊
# Notion / Airtable),已在 field-wrapper.tsx export — DataTable cell wrapper 直接 import 即可。
#
# Allowlist:行尾 `// @field-state-ring-allow: <reason>`。
# Skip:SSOT host(field-wrapper.tsx / textarea.tsx)+ stories / tests。

source "$(dirname "$0")/_log-fire.sh" 2>/dev/null && log_hook_fire

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

case "$TOOL" in
  Edit|Write|MultiEdit) ;;
  *) exit 0 ;;
esac

case "$FILE_PATH" in
  *components/*.tsx) ;;
  *) exit 0 ;;
esac

# Skip SSOT hosts + non-prod files
case "$FILE_PATH" in
  */field-wrapper.tsx|*/textarea.tsx) exit 0 ;;
  *.stories.tsx|*.test.*|*.spec.tsx) exit 0 ;;
esac

NEW_STRING=$(echo "$INPUT" | jq -r '
  (.tool_input.content // "") + "\n" +
  (.tool_input.new_string // "") + "\n" +
  ([.tool_input.edits[]? | .new_string] | join("\n"))
' 2>/dev/null || echo "")

[ -z "${NEW_STRING//[[:space:]]/}" ] && exit 0

# Allowlist
if echo "$NEW_STRING" | grep -q '@field-state-ring-allow'; then
  exit 0
fi

# Match A: 舊 box-shadow inset 寫法
if echo "$NEW_STRING" | grep -E "(hover|focus-within|data-\[state=open\]):shadow-\[inset" >/dev/null; then
  cat >&2 <<'EOF'

┄┄┄ check_field_state_token_consume — M19 BLOCKER ┄┄┄

[P0] 偵測到 naked variant state ring 用 `box-shadow inset` 寫法。

⚠️  M19 canonical(2026-05-05 v9 architectural rewrite):naked **完全繼承 Field default
    state machine**(border-based)— hover:border-border-hover / focus-within:border-primary
    / data-[state=open]:border-border-hover。**不寫平行 outline / shadow ring**。

修法:讓 Field default state machine 自動繼承(naked compoundVariant 已正確設定);
若是 cell wrapper editable display hover affordance,用 `nakedCellEditableDisplayHover`
const(field-wrapper.tsx export)。

允: 行尾 `// @field-state-ring-allow: <reason>` 豁免。
EOF
  exit 2
fi

# Match B: 自寫 outline state ring(naked context)
if echo "$NEW_STRING" | grep -E "(hover|focus-within|focus-visible|data-\[state=open\]):outline-(border|primary)" >/dev/null; then
  cat >&2 <<'EOF'

┄┄┄ check_field_state_token_consume — M19 BLOCKER ┄┄┄

[P0] 偵測到自寫 outline state ring(`hover:outline-border` / `focus-within:outline-primary` 等)。

⚠️  M19 canonical(2026-05-05 v9):naked variant **不寫 outline state ring**,完全繼承
    Field default state machine(border-based)。前 v4-v8 outline-2 平行系統已 retire。

修法:
  - Field naked variant 內 state(edit/hover/focus/open)→ 走 Field default(border-*)
  - Cell wrapper editable display hover 信號 → import `nakedCellEditableDisplayHover` const

允: 行尾 `// @field-state-ring-allow: <reason>` 豁免。
EOF
  exit 2
fi

exit 0
