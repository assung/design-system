---
name: DS Devmode Addon — Shipped
description: Figma Dev Mode 等級 Storybook inspect addon,2026-04-24 shipped(commits b3acb79/841cf5e)。4 階段全交付,Playwright self-verify 7 張截圖 OK。
type: project
originSessionId: 7fa6c876-f1f7-4537-8cb3-1c97212e5a80
---

# DS Devmode Addon — Shipped(2026-04-24)

**完整規格 + 交付紀錄**:`.claude/planning/ds-devmode.md`(on-disk,git tracked)

## 交付 anchor

- **位置**:`.storybook/addons/ds-devmode/`
- **4 階段全完成**:click-to-pin → computed style + token reverse → redline overlay → padding hatching + List/Code toggle
- **模式**:Off / Live / Pin 三模式;Alt+I toggle;Esc unpin
- **Self-verify**:`node scripts/verify-ds-devmode.mjs`(需 `npm run storybook` 先起)
- **Reusability**:DOM-level 自動適所有元件 + 互動 flow + 每幀可檢閱

## Gotchas(回來改時記得)

- `preset.ts` 必 `createRequire(import.meta.url)`(package.json `type: module` + Storybook CJS loader 混合)
- `main.ts` 註冊路徑必 `./addons/ds-devmode/preset`(加 `/preset`) — 不加會被 auto-discovery 嘗試 `./preview` 無副檔名解不到 `.ts`
- Local addon 必附 `package.json` 含 `exports` map + `type: module`

## 觸發 re-visit

User 要「Figma Dev Mode 體驗 / 驗 CSS / 看 token」→ 啟 Storybook 右側 panel 選「DS Devmode」點元素。
擴充 / 改動 → 先讀 `.storybook/addons/ds-devmode/README.md` 架構。
