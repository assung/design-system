#!/bin/bash
# Pre-write hook: verify展示 stories file conforms to component's declared traits
# (per `.claude/skills/story-writing/references/category-templates.md` v2 trait-based typology).
#
# Reads:
#   • spec.md frontmatter `traits: [...]` array
#   • new file content (incoming write/edit)
#
# Block conditions(P0):
#   • hasSizes trait declared but no AllSizes story present(or per-size split detected)
#   • isOverlay trait declared but no OpenSnapshot / defaultOpen scenario
#   • isInputLike trait declared but missing WithError
#   • isSelectionMulti declared but missing VerticalGroup
#
# Warn conditions(P1, non-block):
#   • Universal Default story missing
#   • Suspicious story name not earning existence(only counts as warn,not block)
#
# Allowlist:`// @story-trait-rationale: <reason>` 段內的 trait 違反不擋。
#
# Why proactive:user mandate「ensure storybook 永遠都是 v2 trait-based 沒例外,除非調整標準」
# (M19 trigger,2026-04-26)。Pre-write 是 mechanical 防線,Audit Dim 29 是 periodic 補位。

# Per-hook fire logging
source "$(dirname "$0")/../_log-fire.sh" 2>/dev/null && log_hook_fire

set -u

# Read tool-use payload
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""' 2>/dev/null)
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // {}' 2>/dev/null)

# Only handle stories.tsx writes/edits
FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.file_path // ""' 2>/dev/null)
[[ "$FILE_PATH" =~ \.stories\.tsx$ ]] || exit 0
# Skip anatomy / principles stories(not subject to trait typology — those have their own canonical)
[[ "$FILE_PATH" =~ \.(anatomy|principles)\.stories\.tsx$ ]] && exit 0

# Get incoming content(Write: content, Edit/MultiEdit: new_string)
NEW_CONTENT=""
case "$TOOL_NAME" in
  Write)
    NEW_CONTENT=$(echo "$TOOL_INPUT" | jq -r '.content // ""' 2>/dev/null)
    ;;
  Edit)
    NEW_CONTENT=$(echo "$TOOL_INPUT" | jq -r '.new_string // ""' 2>/dev/null)
    ;;
  MultiEdit)
    NEW_CONTENT=$(echo "$TOOL_INPUT" | jq -r '[.edits[]?.new_string] | join("\n")' 2>/dev/null)
    ;;
  *) exit 0 ;;
esac

[ -z "$NEW_CONTENT" ] && exit 0

# Allowlist escape
if echo "$NEW_CONTENT" | grep -q "@story-trait-rationale:"; then
  exit 0
fi

# Find component spec.md to read traits
# Path shape: src/design-system/components/{Name}/{name}.stories.tsx
COMPONENT_DIR=$(dirname "$FILE_PATH")
SPEC_FILE=""
for candidate in "$COMPONENT_DIR"/*.spec.md; do
  [ -f "$candidate" ] && SPEC_FILE="$candidate" && break
done

# No spec.md → can't verify traits, exit silent(not all components have spec yet)
[ -z "$SPEC_FILE" ] && exit 0

# Extract traits array from frontmatter — only `  - traitName` lines after `traits:`
TRAITS=""
if head -30 "$SPEC_FILE" | grep -q "^traits:"; then
  TRAITS=$(awk '
    /^traits:/ { in_traits = 1; next }
    in_traits && /^  - / { sub(/^  - /, ""); print; next }
    in_traits && !/^  / { in_traits = 0 }
  ' "$SPEC_FILE" | tr '\n' ' ')
fi

# No traits declared → can't verify(may be pre-migration), exit silent
[ -z "$TRAITS" ] && exit 0

# Combine on-disk + new content for full picture(if file already exists)
EXISTING_CONTENT=""
[ -f "$FILE_PATH" ] && EXISTING_CONTENT=$(cat "$FILE_PATH" 2>/dev/null || echo "")
FULL_CONTENT="${EXISTING_CONTENT}
${NEW_CONTENT}"

# Extract export const story names from full content
STORY_EXPORTS=$(echo "$FULL_CONTENT" | grep -oE "^export const [A-Z][a-zA-Z]+" | awk '{print $3}' | sort -u)

# ── Trait compliance checks ─────────────────────────────────────────────────
VIOLATIONS=""

check_present() {
  local pattern="$1"
  echo "$STORY_EXPORTS" | grep -qE "^${pattern}$"
}

# Fuzzy: any story name containing the pattern(BorderStates / AllStates → States)
check_contains() {
  local pattern="$1"
  echo "$STORY_EXPORTS" | grep -qE "${pattern}"
}

# Universal: Default story
if ! check_present "Default" && ! check_present "AllVariants"; then
  VIOLATIONS="${VIOLATIONS}\n  • [P1 warn] Missing universal 'Default' or 'AllVariants' story"
fi

# Per-trait checks
for trait in $TRAITS; do
  case "$trait" in
    hasSizes)
      if ! check_present "AllSizes"; then
        # Detect per-size split anti-pattern
        if echo "$STORY_EXPORTS" | grep -qE "^(Small|Medium|Large|SizeSm|SizeMd|SizeLg)$"; then
          VIOLATIONS="${VIOLATIONS}\n  • [P0] hasSizes trait → per-size split detected(Small/Medium/Large),merge into AllSizes grid"
        else
          VIOLATIONS="${VIOLATIONS}\n  • [P0] hasSizes trait → missing AllSizes story"
        fi
      fi
      ;;
    hasInteractiveStates)
      # Accept exact Disabled / States / Modes OR fuzzy *States / *Modes
      if ! check_contains "(Disabled|States|Modes)"; then
        VIOLATIONS="${VIOLATIONS}\n  • [P0] hasInteractiveStates trait → missing Disabled / States / Modes story"
      fi
      ;;
    isOverlay)
      if ! check_present "OpenSnapshot" && ! echo "$FULL_CONTENT" | grep -qE "(defaultOpen|useState\(true\))"; then
        VIOLATIONS="${VIOLATIONS}\n  • [P0] isOverlay trait → missing OpenSnapshot or defaultOpen=true scenario(M15 stakeholder visual)"
      fi
      ;;
    isInputLike)
      if ! check_present "WithError" && ! check_present "ErrorState"; then
        VIOLATIONS="${VIOLATIONS}\n  • [P0] isInputLike trait → missing WithError / ErrorState story"
      fi
      ;;
    isSelectionMulti)
      if ! check_present "VerticalGroup" && ! check_present "Group"; then
        VIOLATIONS="${VIOLATIONS}\n  • [P0] isSelectionMulti trait → missing VerticalGroup / Group story"
      fi
      ;;
  esac
done

# No violations → silent pass
[ -z "$VIOLATIONS" ] && exit 0

# Has violations → block(P0)or warn(P1 only)
if echo -e "$VIOLATIONS" | grep -q "\[P0\]"; then
  cat >&2 <<EOF
❌ Story trait compliance violation(check_story_category.sh):

  Component: $(basename "$COMPONENT_DIR")
  Spec traits: $TRAITS
  File: $FILE_PATH

Violations:$(echo -e "$VIOLATIONS")

Per .claude/skills/story-writing/references/category-templates.md v2:
  ‣ 修補缺失的 required stories,或
  ‣ 在 spec.md 邊界案例 scope 明示該 trait N/A + rationale,或
  ‣ 在 stories.tsx 加 \`// @story-trait-rationale: <reason>\` 段(escape)

This is part of M19 ensure-canonical pipeline(2026-04-26)— typology v2 enforcement
not optional unless typology itself is changed via /ensure-canonical.
EOF
  exit 2
fi

# P1 warn only → non-blocking
echo "⚠️  Story trait warning(check_story_category.sh):$(echo -e "$VIOLATIONS")" >&2
exit 0
