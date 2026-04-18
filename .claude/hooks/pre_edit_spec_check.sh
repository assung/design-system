#!/bin/bash
# PreToolUse hook: before editing a design-system component .tsx,
# remind AI to read the spec first.
FILE_PATH=$(jq -r '.tool_input.file_path // empty')

# Only trigger for design-system component .tsx files (not stories, not specs)
if echo "$FILE_PATH" | grep -q 'src/design-system/components/.*\.tsx$' && \
   ! echo "$FILE_PATH" | grep -q '\.stories\.tsx$'; then

  # Extract component directory name
  COMP_DIR=$(echo "$FILE_PATH" | sed -n 's|.*src/design-system/components/\([^/]*\)/.*|\1|p')

  if [ -n "$COMP_DIR" ]; then
    cat <<EOJSON
{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"DESIGN SYSTEM GUARD: You are editing ${COMP_DIR}. Before proceeding, confirm you have read: (1) the component's spec.md, (2) all pattern specs referenced in the spec (item-layout, action-bar, etc.), (3) color.spec.md if touching colors, (4) uiSize.spec.md if touching sizes. If you haven't read them in this conversation, read them NOW before making this edit."}}
EOJSON
  fi
fi
