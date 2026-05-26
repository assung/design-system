#!/bin/bash
# inject_deploy_url_after_push.sh — UserPromptSubmit + PostToolUse: 偵測 git push 後自動 inject deploy URL
#
# Per user verbatim 2026-05-26:「完成部署之後都應該自動回吐部署的連結,每次必定自動回,不論是現在這個 session 還是其他的」
#
# Mechanism:
#   PostToolUse Bash:tool_input.command 含 `git push origin <branch>` → 偵測 → 嘗試 npm run deploy-url
#   若 script 存在 → output URL inject into AI context(下個 reply 必看到)
#   若 script 不存在(non-fork-aware repo)→ silent skip
#
# 為何走 Hook(per CLAUDE.md governance 8-home L7 Hook 自動化):
#   - 不靠 AI 記得「每次推完都要 echo URL」(會忘記)
#   - 不靠 user 每次問「部署到哪?」(無聊重複)
#   - Hook 機械保證每 push 必觸發,跨 session / 跨 fork user 自動受惠
#
# Scope:任何 repo cwd 含 .netlify/state.json + scripts/deploy-url.mjs(product-workspace + fork)。
# DS repo 本身無此 script → silent skip(預設 OK)。
#
# 對齊:.claude/skills/codex-collab/SKILL.md PostToolUse pattern + check_fork_user_plugin_install.sh detection pattern

source "$(dirname "$0")/_log-fire.sh" 2>/dev/null && log_hook_fire

set -uo pipefail
INPUT=$(cat 2>/dev/null || echo "{}")
EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // ""' 2>/dev/null)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""' 2>/dev/null)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null)

# Scope:PostToolUse Bash 且 cmd 含 git push to remote(main / branch)
[ "$EVENT" != "PostToolUse" ] && exit 0
[ "$TOOL" != "Bash" ] && exit 0

# Heuristic:detect `git push origin <branch>` patterns
if ! echo "$CMD" | grep -qE '\bgit\s+push\s+(-u\s+)?origin\b'; then
  exit 0
fi

# Skip if push --delete (branch cleanup, not deploy)
if echo "$CMD" | grep -qE 'push\s+origin\s+--delete'; then
  exit 0
fi

# Only fire if scripts/deploy-url.mjs exists in cwd(product-workspace + fork)
CWD=$(pwd)
DEPLOY_SCRIPT="$CWD/scripts/deploy-url.mjs"
[ ! -f "$DEPLOY_SCRIPT" ] && exit 0
[ ! -f "$CWD/.netlify/state.json" ] && exit 0

# Run deploy-url script → capture JSON output
URL_INFO=$(node "$DEPLOY_SCRIPT" --json 2>/dev/null)
[ -z "$URL_INFO" ] && exit 0

URL=$(echo "$URL_INFO" | jq -r '.url // ""' 2>/dev/null)
IS_PROD=$(echo "$URL_INFO" | jq -r '.isProd // false' 2>/dev/null)
BRANCH=$(echo "$URL_INFO" | jq -r '.branch // ""' 2>/dev/null)

[ -z "$URL" ] && exit 0

# Inject into AI context(stdout per Anthropic hook spec PostToolUse additionalContext)
if [ "$IS_PROD" = "true" ]; then
  cat <<EOF
🚀 Netlify PRODUCTION deploy triggered(branch: $BRANCH)
   URL: $URL
   Build 2-3 min。verify Netlify Dashboard \`Deploys\` tab 變綠勾。
EOF
else
  cat <<EOF
🔍 Netlify PREVIEW deploy triggered(branch: $BRANCH)
   Preview URL: $URL
   Build 2-3 min。等 deploy 完 share preview URL 給 user verify,user 拍板才 squash-merge main 進 production。
EOF
fi

exit 0
