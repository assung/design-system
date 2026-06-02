# Space Settings ▸ Permissions ▸ API accounts — exploration notes

知識庫平台(Notion-like,公司內部)Space 設定的 Permissions 分頁,在既有「空間成員」
表格之外,新增第二個 section 管理 **API accounts**(服務帳號 / 整合的授權狀況)。

## 設計決策(2026-06-02,user 拍板)

| 決策 | 選擇 | 理由 |
|------|------|------|
| Role vs API privilege | **獨立兩軸** | Role = 帳號在空間的治理身分(沿用成員 Owner/Editor/Commenter/Reader 語彙);API privilege = 技術 API scope(per-resource None/Read/Write)。兩者不互相 derive。 |
| 交付形式 | Storybook exploration | `*.v1.stories.tsx`,隔離於 production DS。 |
| 額外欄位 | 納入 Status / Last used / Expiry | 治理 + stale-credential 衛生;Status「Pending approval」串接 Approval 分頁。 |

## 欄位(5 requested + 3 recommended)

1. **IAM account** — square `Avatar`(機器身分,有別於成員 circle)+ 友善代號 + monospace identifier(`svc-*@acme.iam`)。pinned-left 候選。
2. **APP name** — app icon(square Avatar)+ 名稱。
3. **Purpose** — 單行截斷 + 溢位 tooltip(`meta.type='string'`)。
4. **Role** — `Tag`(owner=purple / editor=blue / commenter=turquoise / reader=neutral)。
5. **API privilege** — 2 個 scope Tag + 「+N」溢位,點擊開 `Popover` 顯示完整 resource × None/Read/Write 矩陣。Write 含 Read。
6. **Status** — `Tag`(active=green / pending=yellow / revoked=red / expired=neutral)。
7. **Last used** — 相對時間 / 「尚未使用」(揪出 dead credential)。
8. **Expiry** — 日期;`null`(無到期)標 warning icon(GitHub 強制 expiry 對照)。
9. **Row `⋮`** — 編輯權限 / 輪替金鑰 / 稽核紀錄 / 暫停(或重新啟用)/ 撤銷(danger)。

## 世界級對照(M26 WebFetch ≥ 3,2026-06-02)

- **Stripe Restricted API Keys** — per-resource None/Read/Write;**Write 含 Read**;least-privilege。 https://docs.stripe.com/keys/restricted-api-keys
- **GitHub fine-grained PAT** — 50+ granular permission(no access / read / read+write)+ 強制 expiry + scoped to repos。 https://github.blog/security/application-security/introducing-fine-grained-personal-access-tokens-for-github/
- **Google Cloud IAM service account** — email-like machine identity + principal/role 列表 + 用量。 https://docs.cloud.google.com/iam/docs/service-account-overview
- **Notion Connections** — workspace 設定內人/機分區管理 + view who uses + disconnect。 https://www.notion.com/help/add-and-manage-connections-with-the-api

人/機分兩個 section(非合併單表):對齊 GitHub「People vs Installed GitHub Apps」+ Notion「Members vs Connections」。

## Stories

| Story | 內容 |
|-------|------|
| `完整 Permissions 頁` | 4 設定分頁脈絡 + 成員 section + API accounts section(hero)|
| `授權 API account(Dialog)` | 新增流程 — 身分/app/purpose/role/privilege 矩陣/expiry(`defaultOpen`)|
| `API privilege Popover(展開)` | Stripe-style scope 矩陣 |
| `列操作選單(展開)` | row `⋮` 動作(檢視詳情 / 編輯 / 輪替 / 稽核 / 暫停 / 撤銷)|
| `帳號詳情抽屜(展開)` | 右側 Sheet — 身分 / Overview / Role / 可編輯權限矩陣 / 金鑰(reveal-once)/ 近期活動 / 生命週期 footer |
| `空狀態` | `Empty` + CTA |

## 消費的 SSOT

DataTable / Tag / Avatar(square)/ Popover / DropdownMenu / Dialog / Sheet / DescriptionList /
Field / Input / Textarea / Select / SegmentedControl / Empty / Separator / Tabs。色彩走
status/semantic token + primitive(`--color-*`)。

## 下一輪候選(未做,待 user 反饋)

- **金鑰 reveal-once** 真實流程(授權後僅顯示一次的可複製金鑰)。
- 搜尋 / 篩選真實 wiring(目前 toolbar 為視覺占位)。
- IAM account hoverCard NameCard(created-by / created-on / key id)。
- Approval 分頁 ↔ Status「Pending approval」雙向連結。
- 欄位 pinned-left(IAM account)+ 水平捲動驗證(8 欄較寬)。
