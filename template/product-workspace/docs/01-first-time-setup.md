# 01 — First-time setup

Day 0 上工流程(~15 min)。

## Pre-requisite

- macOS / Linux(Windows WSL 也行)
- Node 20+
- npm 7+(workspaces 支援)
- Claude Code CLI(`npm install -g @anthropic-ai/claude-code` or download from claude.ai/code)
- GitHub CLI(`gh`)— optional but recommended

## Steps

### 1. Clone

```bash
git clone github.com/your-org/product-workspace
cd product-workspace
```

### 2. Install(自動拉 DS + Storybook config + Claude plugin)

```bash
npm install
```

預期 output:
- `@your-org/design-system` + `@your-org/storybook-config` from npm
- 35 sub-deps(@radix-ui / @dnd-kit / lucide-react / ... 全 auto)
- `peerDependencies`:react / react-dom / tailwindcss already 在 root

### 3. Claude session 啟動

```bash
claude
```

session-start 自動 detect `.claude/settings.json` 的 `enabledPlugins.design-system@your-org: true`,從 plugin marketplace 拉 27 skills / 37 hooks / 5 rules / CLAUDE.md instructions。

驗證:
```
你:列出可用 skills
Claude:design-system-audit / visual-audit / new-component / ...(全列)
```

### 4. Storybook 確認看得到 DS 元件

```bash
npm run storybook
# http://localhost:6006
```

看到「Design System / Components / Button / 展示」表示 dogfood path 通了。

### 5. Build 確認 toolchain

```bash
npm run audit:all     # tsc + content + code quality
npm run build         # build 全 apps
npm run build-storybook
```

全綠 = ready to ship product。

## Common issue

- **claude detect 不到 plugin**:check `.claude/settings.json` 存在 + `enabledPlugins` 條目正確
- **npm install 拉不到 @your-org/...**:check 你 npm 已 login + `.npmrc` 設 internal registry(若用 GitHub Packages 或 Verdaccio)
- **Storybook 看不到元件**:check `node_modules/@your-org/design-system/dist/` 存在 + `.storybook/main.ts` glob 正確
- **TypeScript path 找不到**:check `tsconfig.json` paths 沒覆寫 npm resolver

→ [05-troubleshooting.md](05-troubleshooting.md) 完整排查
