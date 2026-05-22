---
name: team_distribution_phase1_4_landed
description: Team distribution roadmap Phase 1-4 complete 2026-05-22 / 23(npm workspace + storybook-config + Claude plugin manifest + release pipeline + Phase 5+6 templates in repo)。Pickup contract:user 完成 GitHub repo create + NPM token + plugin host pick 後,session 直接接 Phase 5 真實 setup。
type: project
---

# Team Distribution Phase 1-4 Landed(2026-05-22 / 23)

## Status snapshot

| Phase | Status | Output |
|---|---|---|
| 1 | ✅ DONE | `packages/design-system/`(name `@your-org/design-system`)+ vite-lib + d.ts + barrel(`scripts/gen-design-system-barrel.mjs`)+ lib/utils internalized + 504-file npm pack 1.3MB / mock install verified PASS(296 exports)|
| 2 | ✅ DONE | `packages/storybook-config/`(addons preset + preview + dogfood)|
| 3 | ✅ DONE(scaffold) | `.claude-plugin/marketplace.json` plugin manifest |
| 4 | ✅ DONE(scaffold) | `.github/workflows/release.yml` + `.changeset/{config.json,README.md,initial-release.md}` + `CONTRIBUTING.md` |
| 5 | ✅ TEMPLATE in repo | `template/product-workspace/`(boilerplate ready,user `cp -r ../template/product-workspace .` 即用)|
| 6 | ✅ DOCS in repo | `template/product-workspace/docs/{01..05}.md`(5 onboarding docs + auto-update propagation explainer)|

## User-blocked(out of Claude session)

1. **Create GitHub repo** `your-org/product-workspace`(empty)
2. **Copy template**:`cp -r design-system/template/product-workspace/. product-workspace/`
3. **Register npm org** `@your-org`(npmjs.com / GitHub Packages)
4. **Set NPM_TOKEN secret** in DS repo + product-workspace repo
5. **Pick plugin host**:Anthropic marketplace / GitHub direct / internal NPM(open question in `.claude-plugin/marketplace.json`)
6. **Install Renovate app** to `your-org` GitHub org(per template `renovate.json`)
7. **First release**:DS owner 跑 `npx changeset version && git tag v0.1.0 && git push` → CI auto-publish

## Auto-update propagation(answered user 2026-05-23)

- **npm semver caret**(`^0.1.0` in product-workspace package.json)→ `npm install` 自動拉 minor/patch
- **Renovate**(per template `renovate.json`)— 每週一 6am 開 PR for `@your-org/*` bumps
- **Pre-release dist-tag**(`@beta` / `@next`)— release.yml auto-detect from tag suffix
- **Codemod**(per template `codemods/` + DS repo `codemods/` future)— jscodeshift for major bumps
- **CI audit gates**(per template `.github/workflows/audit.yml`)blocks bad Renovate PRs

## Pickup contract(下次 session)

User 講「Phase 5 開做」/「team distribution 繼續」/「product-workspace 開做」→ Claude:
1. Read 本檔 + `team-distribution-roadmap.md`
2. Confirm user 已完成 user-blocked 1-7(grep `your-org` 的 repo 存在 / npm package published / etc.)
3. 若有缺 → 提示 user 補
4. 若全備 → 走 actual setup(write `tsconfig.json` / `vite.config.ts` 等 template TODOs in new repo + 跑 first deploy verify)

## Mock install verification(2026-05-22)

```bash
cd packages/design-system && npm pack
# your-org-design-system-0.0.0.tgz

mkdir /tmp/ds-consumer-test && cd /tmp/ds-consumer-test
npm init -y
npm install /path/your-org-design-system-0.0.0.tgz react react-dom tailwindcss
# 10 packages, 0 vulnerabilities ✓

node -e "import('@your-org/design-system').then(DS => console.log(Object.keys(DS).length))"
# 296 ✓
```

確認 package distributable + 35 dependencies(@radix-ui×19 / @dnd-kit×3 / @tanstack×2 / lucide-react / class-variance-authority / clsx / cmdk / date-fns / embla-carousel-react / react-day-picker / react-zoom-pan-pinch / recharts / sonner / tailwind-merge)auto-install 正確 + 3 peerDeps(react / react-dom / tailwindcss)consumer 自管。

## Commits this session

- `fd119a82` knowledge-prune deep(M33/M34/M35 fold + SSOT 對齊 + 行數 cap 升)
- `b7b34721` Phase 1 npm workspace 結構
- `f5e47f54` Phase 2-4 storybook-config + Claude plugin manifest + release pipeline scaffolds
- `dc8c7f52` Phase 1 lib build complete(vite-lib + d.ts + barrel + lib/utils 內化)
- `6aa8718d` deps fix(npm install verify-driven — 35 missing deps 補)
- `de8cea72` infra path migration(105 .claude/ files)
- Pending commit:Phase 5+6 templates + changeset + CLAUDE.md path refresh + metric snapshot + 本 memory entry
