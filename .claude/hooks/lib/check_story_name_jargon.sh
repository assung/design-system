#!/bin/bash
# PostToolUse hook: catch designer-unfriendly jargon in Storybook story names.
#
# Per .claude/rules/story-rules.md:
# - 子頁中文,人話,禁止 spec 內部代號 / 抽象代號 / 技術術語
# - 違規 examples: "L2 Selection", "L3 Cell Rendering", "canonical mode", "spec section X"
#
# Detects in `name: '...'` lines:
# 1. L<digit> Layer codes (L1-L7 from data-table.spec.md internal layers)
# 2. "canonical" / "Canonical" — spec-internal terminology
# 3. "(spec...)" / "(canonical)" trailing tags

source "$(dirname "$0")/../_log-fire.sh" 2>/dev/null && log_hook_fire

FILE_PATH=$(jq -r '.tool_input.file_path // empty')

if ! echo "$FILE_PATH" | grep -qE '\.stories\.tsx$'; then
  exit 0
fi
if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

VIOLATIONS=""

# ── Catch L<n> layer codes in story name ──
LAYER_HITS=$(grep -nE "name:\s*['\"][^'\"]*\bL[0-9]\b" "$FILE_PATH" 2>/dev/null | head -5)
if [ -n "$LAYER_HITS" ]; then
  VIOLATIONS="${VIOLATIONS}\n⚠️ story name 含 layer 代號(L1/L2/L3 等是 spec 內部分層,設計師不懂):\n${LAYER_HITS}\n  → 改成人話描述,如 'L2 Selection — Shift-click' → '區間選取與鍵盤操作'"
fi

# ── Catch "canonical" / "(canonical)" ──
CANON_HITS=$(grep -nE "name:\s*['\"][^'\"]*\bcanonical\b" "$FILE_PATH" 2>/dev/null | head -5)
if [ -n "$CANON_HITS" ]; then
  VIOLATIONS="${VIOLATIONS}\n⚠️ story name 含 'canonical'(spec 內部術語):\n${CANON_HITS}\n  → 移除 (canonical) 後綴,留人話描述"
fi

# ── Catch "(spec X)" / "(per spec)" 等 spec 內部 reference ──
SPEC_HITS=$(grep -nE "name:\s*['\"][^'\"]*\(spec\b" "$FILE_PATH" 2>/dev/null | head -3)
if [ -n "$SPEC_HITS" ]; then
  VIOLATIONS="${VIOLATIONS}\n⚠️ story name 引用 spec(設計師不需知道):\n${SPEC_HITS}"
fi

if [ -n "$VIOLATIONS" ]; then
  ADDITIONAL_CONTEXT=$(printf 'Story name 違規(.claude/rules/story-rules.md「人話描述,禁止 spec 內部代號」):%b' "$VIOLATIONS")
  jq -n --arg ctx "$ADDITIONAL_CONTEXT" '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: $ctx
    }
  }'
fi

exit 0
