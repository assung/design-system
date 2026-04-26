# .claude/hooks/ Charter

## 這裡只收:pre/post tool event 的機械化自動檢查

每個 hook 是一個 shell / python script,在 Claude Code tool event 上自動觸發:
- **PreToolUse**:tool 執行前(可 block 或 inject context)
- **PostToolUse**:tool 執行後(通常 inject 提醒 / warning)
- **Stop**:turn 結束(sanity / harvest / metric capture)
- **SessionStart**:session 開始(governance check)

**核心特徵**:**不依賴 AI 自律**,tool 層強制執行;規則可用 `grep` / 條件判斷自動驗證。

## 當前居民(2026-04-26 重整,以 `settings.json` 註冊為準)

### PreToolUse(Edit / Write / MultiEdit)

| Hook | 做什麼 |
|------|--------|
| `enforce_home_charter.sh` | classification-sensitive dir / 新檔案的 charter gate(Write only) |
| `check_file_size_budget.sh` | CLAUDE.md / spec / SKILL / memory 行數預算警告 |
| `check_story_anatomy.sh` | **BLOCKS** stories 繞 DS canonical hand-craft |
| `check_story_slot_split.sh` | stories slot 拆分 / atom 結構驗證 |
| `check_story_category.sh` | stories 三層 trait-based category 驗證 |
| `check_principles_canonical.sh` | `*.principles.stories.tsx` Polaris-aligned core(WhenToUse / WhenNotToUse / Vs*Rule / ContentGuidelines)≥ 2 攔截 |
| `check_l3_primitive_import.sh` | L3 primitive(L1 token / L2 atom)使用順序驗證 |

### PostToolUse(Edit / Write / MultiEdit)

| Hook | 做什麼 |
|------|--------|
| `block_prototype_imports.py` | 產品 code 禁止 import `explorations/` |
| `check_token_hygiene.sh` | 硬寫 shadow / shadcn compat alias / overflow raw class |
| `check_hardcoded_strings.sh` | 偵測元件 / spec 內疑似硬寫字串(應走 token / 變數) |
| `check_code_quality.sh` | clean-code 量化警告(`any` / dead export / long function / magic number) |
| `check_cva_default_sync.sh` | 動到 cva `defaultVariants` 時三方(code / spec / story)同步警告 |
| `check_story_compile_drift.sh` | 改元件 tsx / spec 自動跑 compile-stories `--check` |
| `log_governance_fires.sh` | 治理檔 fire log 寫入 `.claude/logs/hook-fires.jsonl`(L2 anti-bloat) |

### PostToolUse(Skill)

| Hook | 做什麼 |
|------|--------|
| `log_skill_invokes.sh` | skill invoke log 寫入 `.claude/logs/skill-invokes.jsonl` |

### Stop

| Hook | 做什麼 |
|------|--------|
| `stop_tsc_sanity.sh` | turn 動到 `.ts` / `.tsx` 時跑 `tsc -b` 檢查 |
| `stop_governance_drift_check.sh` | turn 動到 governance 檔(CLAUDE.md / rules / skills / memory)時 drift 檢查 |
| `stop_self_audit.sh` | turn 結束 self-audit(每 turn 跑 score) |
| `stop_meta_self_audit.sh` | M20 meta self-audit;score < 80 / regression ≥ 5 inject MAXIMUM-strength prompt |
| `stop_harvest_corrections.sh` | 掃 session 的 user 糾正信號寫 `.claude/logs/user-corrections.jsonl` |
| `stop_capture_metrics.sh` | session 結束 metric snapshot |

### SessionStart

| Hook | 做什麼 |
|------|--------|
| `session_start_governance_check.sh` | 4 check(行數 / prune / corrections / benchmarks 過期 auto-fetch) |

### Helper(非註冊 hook)

| File | 用途 |
|------|------|
| `_log-fire.sh` | 各 hook source 的 fire-logging helper |

## Anti-bloat 落地

- **L1 Pre-write**:`check_file_size_budget.sh` + `check_l3_primitive_import.sh` + `check_principles_canonical.sh` 等(PreToolUse 阻擋 / 警告)
- **L2 Per-commit**:`log_governance_fires.sh` → `.claude/logs/hook-fires.jsonl`(governance file 編輯軌跡)+ `log_skill_invokes.sh`
- **L3 Periodic**:`/knowledge-prune` skill 季度跑,retire ≥ 5%

## 這裡**不收**(反例)

| 疑似要放這但其實不是 | 實際應去 | 為什麼 |
|-------------------|---------|--------|
| 需要 AI 走流程才能判斷的規則 | `.claude/skills/` | hook 只能機械判斷,複雜 workflow 屬 skill |
| 每 session signal rule | `CLAUDE.md` | hook 是 tool-level,不是 session-level |
| 單一元件的 lint rule | 該元件 spec + code | hook 是跨元件系統級,單元件屬 spec |

## 新 hook 的 criteria(必須全部通過)

1. **規則可機械判斷**(grep / 條件邏輯,不需人類 judgment)
2. **觸發 event 清楚**(PreToolUse / PostToolUse / Stop / SessionStart + matcher)
3. **已有明確 tech debt 或 bug class**(不做預防性空守衛)
4. **失敗模式安全**(hook 掛掉不會 block 合法操作 / 誤殺)

## 接線到 settings.json

新 hook 必須在 `.claude/settings.json` 的 `hooks.PreToolUse` / `hooks.PostToolUse` / `hooks.Stop` / `hooks.SessionStart` 陣列註冊,並用 `$CLAUDE_PROJECT_DIR` 作為路徑前綴。範例:

```json
{
  "type": "command",
  "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/your-hook.sh\""
}
```

## Hook 退出碼約定(Claude Code 協議)

- `exit 0` — 正常,不 inject context
- `exit 2` + stderr — **blocking**,AI 看到 stderr 訊息後必須處理
- `stdout` with `{"hookSpecificOutput":{"hookEventName":"...","additionalContext":"..."}}` — non-blocking context injection

## Retired

`retired/` 目錄存舊 hook(不再註冊),保留 reference 不刪除。當前已 retire 的 hook 不在本 inventory 列出 — 以 `settings.json` 為 SSOT。

## 建立前必 Read

本 README + 最接近的既有 hook 當範本 + CLAUDE.md `# 治理 canonical` 的 Hook 章節。
