#!/bin/bash
# Tests for check_l3_primitive_import.sh
#
# 5 scenarios validating L3 import boundary:
#   1. DS component import L3 → pass
#   2. App code import L3 → block
#   3. Exploration import L3 → block
#   4. Allowlist comment bypass → pass
#   5. Non-L3 import from same path prefix → pass (no false positive)

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="$SCRIPT_DIR/../check_l3_primitive_import.sh"

if [ ! -x "$HOOK" ]; then
  echo "FATAL: hook not executable: $HOOK"
  exit 1
fi

PASS=0
FAIL=0
FAILED_TESTS=""

run_hook() {
  local file_path="$1"
  local content="$2"
  local tool="${3:-Write}"
  local payload
  payload=$(jq -n --arg tool "$tool" --arg fp "$file_path" --arg c "$content" \
    '{tool_name: $tool, tool_input: {file_path: $fp, content: $c}}')
  STDOUT=$(mktemp); STDERR=$(mktemp)
  set +e
  printf '%s' "$payload" | bash "$HOOK" >"$STDOUT" 2>"$STDERR"
  EXIT=$?
  set -e
  STDOUT_TEXT=$(cat "$STDOUT"); STDERR_TEXT=$(cat "$STDERR")
  rm -f "$STDOUT" "$STDERR"
}

expect_pass() {
  local name="$1"
  if [ "$EXIT" = "0" ]; then
    echo "  PASS  $name"; PASS=$((PASS+1))
  else
    echo "  FAIL  $name (expected exit 0, got $EXIT)"
    echo "  --- stderr ---"; echo "$STDERR_TEXT" | sed 's/^/    /'; echo "  --- end ---"
    FAIL=$((FAIL+1)); FAILED_TESTS="${FAILED_TESTS}\n  - $name"
  fi
}

expect_block() {
  local name="$1"; local needle="$2"
  if [ "$EXIT" = "2" ] && echo "$STDERR_TEXT" | grep -qF "$needle"; then
    echo "  PASS  $name"; PASS=$((PASS+1))
  else
    echo "  FAIL  $name (expected exit 2 + stderr '$needle', got exit $EXIT)"
    echo "  --- stderr ---"; echo "$STDERR_TEXT" | sed 's/^/    /'; echo "  --- end ---"
    FAIL=$((FAIL+1)); FAILED_TESTS="${FAILED_TESTS}\n  - $name"
  fi
}

# Test 1: DS component import L3 → pass
echo "Test 1: DS component import L3 → pass"
read -r -d '' T1 <<'EOF' || true
import { ItemInlineAction } from '@/design-system/patterns/element-anatomy/item-anatomy'
export function Foo() { return null }
EOF
run_hook "/abs/src/design-system/components/Foo/foo.tsx" "$T1"
expect_pass "Test 1 DS component path allowed"

# Test 2: App code import L3 → block
echo ""
echo "Test 2: App code import L3 → block"
read -r -d '' T2 <<'EOF' || true
import { ItemInlineAction } from '@/design-system/patterns/element-anatomy/item-anatomy'
export default function Page() { return null }
EOF
run_hook "/abs/src/app/pages/my-page.tsx" "$T2"
expect_block "Test 2 app code blocked" "L3 internal primitive"

# Test 3: Exploration import L3 → block
echo ""
echo "Test 3: Exploration import L3 → block"
read -r -d '' T3 <<'EOF' || true
import { ItemContent } from '@/design-system/patterns/element-anatomy/item-anatomy'
EOF
run_hook "/abs/src/explorations/proto/foo.tsx" "$T3"
expect_block "Test 3 exploration blocked" "L3 internal primitive"

# Test 4: allowlist comment → bypass
echo ""
echo "Test 4: allowlist comment bypass"
read -r -d '' T4 <<'EOF' || true
// @l3-import-allow: one-time alignment, documented in foo.spec.md
import { ICON_SIZE } from '@/design-system/patterns/element-anatomy/item-anatomy'
EOF
run_hook "/abs/src/app/MyThing.tsx" "$T4"
expect_pass "Test 4 allowlist comment bypasses block"

# Test 5: import from similar but different path → pass (no FP)
echo ""
echo "Test 5: different pattern path → pass (no false positive)"
read -r -d '' T5 <<'EOF' || true
import { somethingElse } from '@/design-system/patterns/overlay-surface/overlay-surface'
import { utils } from '@/design-system/tokens/uiSize/uiSize'
EOF
run_hook "/abs/src/app/MyPage.tsx" "$T5"
expect_pass "Test 5 non-item-anatomy import passes"

# Summary
echo ""
echo "════════════════════════════════════════"
echo "  Results: $PASS PASS, $FAIL FAIL"
echo "════════════════════════════════════════"
if [ "$FAIL" -gt 0 ]; then
  printf "Failed tests:%b\n" "$FAILED_TESTS"
  exit 1
fi
exit 0
