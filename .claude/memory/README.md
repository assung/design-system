# Memory mirror(repo-tracked snapshot)

## 用途

Claude Code auto memory 系統預設將 memory 寫到 user-local path:
`~/.claude/projects/<cwd-hash>/memory/`(harness 自動算路徑)

本資料夾 `.claude/memory/` 是**同份內容的 git-tracked snapshot**,讓 cloud sandbox(claude.ai/code / Codespaces / Cursor cloud)clone repo 後仍能看到既有 memory state。

## 雙向同步(避免 drift)

**從 harness path → repo**(做 commit 前):
```bash
HARNESS=~/.claude/projects/-Users-chenqiren-Library-CloudStorage-GoogleDrive-qijenchen-gmail-com--------my-project/memory
cp $HARNESS/*.md .claude/memory/
```

**從 repo → harness path**(cloud sandbox 第一次啟動;`.devcontainer/devcontainer.json` 的 `postCreateCommand` 已自動處理):
```bash
HARNESS=~/.claude/projects/$(pwd | shasum | cut -c1-40)/memory
mkdir -p $HARNESS && cp -rn .claude/memory/*.md $HARNESS/
```

## 注意

- Memory 內容若含 secrets / 個人敏感資料,**不該** commit 到 repo(尤其 public repo)。本 repo 用此 mirror 是因 user 確認 memory 無秘密
- 若未來新增 memory file 且包含 secret,加 `.gitignore` 排除 + 改用 reference pointer
