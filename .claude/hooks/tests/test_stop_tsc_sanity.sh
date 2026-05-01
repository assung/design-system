#!/bin/bash
# Smoke test for stop_tsc_sanity.sh
set -u
HOOK="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../lib/stop_tsc_sanity.sh"
[ -x "$HOOK" ] || { echo "FATAL"; exit 1; }
echo "Test 1: minimal payload → no crash"
STDOUT=$(echo '{}' | bash "$HOOK" 2>&1); EXIT=$?
[ "$EXIT" -le 2 ] && echo "  PASS exit=$EXIT" || { echo "  FAIL exit=$EXIT out=${STDOUT:0:100}"; exit 1; }
echo "Results: 1 PASS, 0 FAIL"
