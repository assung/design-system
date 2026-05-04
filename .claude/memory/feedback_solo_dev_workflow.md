# Solo dev workflow — push direct to main,no branch,no PR

**Codified 2026-05-04** — 本 session 早期我違反此 workflow,user 多次糾正後 codify。

## User 的 workflow 真實狀況

- **Solo dev**(整個 design system 只有 user 一人開發)
- **單一 chat 連續處理**(不分 session,「下個 session」概念不存在)
- **Netlify 自動 preview = review 介面**(每次 push 觸發 deploy,user 在 preview URL 看結果)

## 我該做什麼

```
edit code → git push origin main → Netlify auto-deploy → user check preview → done
```

**不要做**:
- ❌ 開 `claude/<task>` branch(除非 harness session-start 強制指定)
- ❌ 建 PR(branch → PR → merge → close 4 步多餘)
- ❌ split 1 PR 成多 PR(2-way / 5-way 都不適用 solo dev)
- ❌ 提 fix-forward PR(直接 push main 即可)
- ❌ 開 hotfix branch(同上)
- ❌ 任何「等 next session 處理」的 deferred 措辭(user 視 chat 為連續)

**該做**:
- ✓ Edit + commit + push origin main 一氣呵成
- ✓ Netlify deploy 自動觸發,user 看 preview URL
- ✓ user 說「OK」/「done」/「沒問題」= 完成
- ✓ user 說「改 X」= 繼續 edit + push
- ✓ 有設計衝突真需 user 拍板才停下

## 例外:harness 強制指定 branch

session 開始時 harness 可能 inject「DEVELOP on branch `claude/<task>-XXX`」directive。此情況:
- 該 branch 視為「working area」,在它上 push
- 完成後直接 push main(若 user 同意)OR 走最 minimal merge(squash 1 commit,close branch)
- **不主動拆多 branch**

## 反 pattern(本 session 的錯)

2026-05-02→04 session 我做了:
1. 把 1 個原始 PR 拆成 2 PR(product + governance)
2. 開 fix-forward PR(post-merge review 找到 bug)
3. 開 hotfix PR(我引入的 set -uo pipefail bug)
4. 留 6 個 stale branch(harness 不允許我 delete remote)

→ 結果:**6 個 stale branch user 要手動清** + 5 次 PR 來回 + user 多次說「我就是會在這個聊天不斷處理所有任務」。

## 對齊既有 governance

- Mindset #1「對標世界級」≠ 對標「multi-reviewer team workflow」。Polaris / Atlassian 內部也有 solo experiments 走 main 直推。
- M21「Premature abstraction」延伸:**Premature workflow ceremony 也算 abstraction**(branch + PR 是 multi-dev 的 ceremony,solo 不需)
- M14 AUTO integrate:同 chat 連續處理 = 把 5-layer pipeline 做完才 stop,不 deferred

## Trigger phrase memory

User 說以下任一 = 直接 push main 完成,不開 branch:
- 「直接 push」
- 「不要 branch / 不要 PR」
- 「都這條 chat 處理」
- 「不分 session」
- 「馬不停蹄」(隱含 don't pause for ceremony)
