#!/bin/bash
# PostToolUse hook for Edit/Write on component .tsx:
# When a change touches cva() defaultVariants, grep for 3-way consistency across
# spec.md + docblock + anatomy.stories.tsx and warn if any disagree on the default.
#
# Prevents the SegmentedControl bug class: cva says 'md', spec/docblock/anatomy say
# 'sm ★default' — silently drifts until audit catches it.
#
# Exit: 0 + stdout JSON additionalContext (non-blocking warning)

set -euo pipefail

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

case "$TOOL" in
  Edit|Write|MultiEdit) ;;
  *) exit 0 ;;
esac

# Only target component .tsx files (not stories, not specs)
if ! echo "$FILE_PATH" | grep -qE 'src/design-system/components/[^/]+/[^/]+\.tsx$'; then
  exit 0
fi
echo "$FILE_PATH" | grep -qE '\.stories\.tsx$' && exit 0

# Only fire if the file actually contains defaultVariants (post-edit state)
[ -f "$FILE_PATH" ] || exit 0
grep -q "defaultVariants" "$FILE_PATH" || exit 0

COMP_DIR=$(dirname "$FILE_PATH")
COMP_NAME=$(basename "$COMP_DIR")
SPEC_FILE="$COMP_DIR/$(basename "$FILE_PATH" .tsx).spec.md"
ANATOMY_FILE="$COMP_DIR/$(basename "$FILE_PATH" .tsx).anatomy.stories.tsx"

# Extract default values from each source (best-effort grep; signal not proof)
CVA_DEFAULTS=$(grep -A5 "defaultVariants" "$FILE_PATH" 2>/dev/null | grep -E "(size|variant|state):" | head -3 | tr -d ' "' | sed 's/,$//' || echo "")
SPEC_DEFAULTS=""
[ -f "$SPEC_FILE" ] && SPEC_DEFAULTS=$(grep -E "★|預設|default" "$SPEC_FILE" 2>/dev/null | head -5 || echo "")
ANATOMY_DEFAULTS=""
[ -f "$ANATOMY_FILE" ] && ANATOMY_DEFAULTS=$(grep -E "★|default|defaultVariants" "$ANATOMY_FILE" 2>/dev/null | head -5 || echo "")

WARNING=$(cat <<MSG
⚠️ cva defaultVariants edited in $COMP_NAME — verify 3-way sync across:

  1. $FILE_PATH (cva)
  2. $(basename "$SPEC_FILE") (prop table / default markers)
  3. $(basename "$ANATOMY_FILE") (SIZE_SPECS / default marker)
  + tokens/uiSize/uiSize.spec.md (if field-height family)

Current signals (NOT authoritative, just hints):
- cva:     $(echo "$CVA_DEFAULTS" | tr '\n' ' ')
- spec:    $(echo "$SPEC_DEFAULTS" | head -1 | cut -c1-100)
- anatomy: $(echo "$ANATOMY_DEFAULTS" | head -1 | cut -c1-100)

Historical bug: SegmentedControl cva='md' while spec/docblock/anatomy='sm ★default' — silent drift for weeks.

Action: grep "★|預設|default" $COMP_DIR/ and confirm all agree before this commit ships.
MSG
)

# Escape for JSON via jq
ESCAPED=$(printf '%s' "$WARNING" | jq -Rs .)

cat <<EOJSON
{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":$ESCAPED}}
EOJSON

exit 0
