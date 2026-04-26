# tokens/ Charter

## 這裡只收:design token 定義 + spec + stories

每個 token 類別一個 folder:
- `{name}.css` — CSS custom properties 定義
- `{name}.spec.md` — 命名原則 / 用法規則 / 家族結構
- `{name}.stories.tsx` — token 展示(色票 / 字級 / 尺寸對照)
- primitives vs semantic 分檔(如 `color/primitives.css` + `color/semantic.css`)

**folder 名規則**:
- 單字 → lowercase(`color/` / `radius/` / `typography/`)
- 多字 → camelCase 反映 CSS `--uiSize` 命名風格(`uiSize/` / `layoutSpace/`)

## 當前居民

`color/` / `typography/` / `uiSize/` / `layoutSpace/` / `density/` / `elevation/` / `radius/` / `opacity/`

## 這裡**不收**(反例)

| 疑似要放這但其實不是 | 實際應去 | 為什麼 |
|-------------------|---------|--------|
| 元件消費 token 的 code | `../components/{Name}/` | token 被 consume,不在 token home 寫 consumer |
| cross-cutting design rule(如「何時用 semantic token vs primitive」)| `.claude/rules/ui-development.md`「Token 命名 4 條硬規則」 | 系統級 rule,不只關某個 token |
| shadcn compat alias 遷移規則 | `.claude/rules/ui-development.md`「Tailwind 5 條核心」 | 技術陷阱屬 UI 開發 |

## 新增 token 的 criteria

1. 找不到現有 family 可鏡射 → **先質疑是否真需要**(見 CLAUDE.md 「對齊既有 family」)
2. 命名過三重 test(既有語言 / 世界級 idiom / 跨元件不衝突)
3. Primitive / semantic 分層清楚
4. 若是語意色相 → 走 `color/color.spec.md`「新增語意色相的標準流程」4 步

## 建立前必 Read

CLAUDE.md `# Token 命名原則` + 對應 family 的 spec(如 `color/color.spec.md`)。
