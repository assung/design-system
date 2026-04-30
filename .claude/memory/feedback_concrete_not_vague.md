---
name: 提 P2 / finding 必具體不浪費 user 時間
description: When listing audit findings or P2 items needing user decision, always include file:line + concrete example + specific question;never list topics generically ("Rule A 9 處 prose 保留還是改寫" without showing which prose)
type: feedback
---

User 糾正:「第六題你講不清楚我哪知道要怎麼回答？你以後可以講具體明確一點不要浪費我時間嗎？」

**Why**:User 要 sign-off P2 類 design decision 時需要**具體 context** — which file, which line, actual prose snippet, what's the ambiguity. 沒 context 的 topic-level 描述("9 處 spec Rule A prose")不能決策。

**How to apply**:
- 回報 audit finding → **每條**含:`file:line` + actual 片段(200 字內)+ 具體問題
- 提 P2 討論:「這句『X』是否算 Y?」具體句,不是 topic
- 一次掃完再提,不要丟多輪反覆
- **禁止**籠統描述("這類找到 N 處"而不給 sample)
