---
name: layoutSpace v6 canonical(region/element + 親疏三級 + flush 已移除)
description: layoutSpace 從 v1(block/inline 機械)演化到 v6(region/element + bounded/unbounded + 親疏三級 + 元件 spec own 分權)+ 2026-05-01 移除 body flush variant 的 rationale
type: feedback
originSessionId: 7fa6c876-f1f7-4537-8cb3-1c97212e5a80
---
# layoutSpace v6 canonical(2026-04-30 演化 → 2026-05-01 flush 移除)

**Why**: v1「block-adjacent 一律 tight」違 Gestalt proximity / 沒考慮親疏 / 沒涵蓋 list-as-region 自帶 py / 沒處理 Dialog-class 元件 spec own override。

**How to apply**:寫 spacing code 前按 v6 三步推。寫 overlay body 前必讀「list-as-region 處理」節(下面)。

## 三步推理

1. **判角色**(scope-relative,每進一層 layout container 重判)
   - **region**:寬高占主要空間 / 視覺畫布 / 該層展示主角
     - **bounded**:有視覺邊界(底色 / 邊框 / 上下分隔線)
     - **unbounded**:無視覺邊界,自帶 py 撐(menu list / nav stack)
   - **element**:局部塊 / 控件感 / 寬高自然

2. **判範疇**(3 級分權)
   - **同範疇 / bundled component family**(spec 寫成 bundle 並定 inter-component spacing,如 FileUpload+FileList、Pagination 內部、Toolbar+ButtonGroup、SurfaceFooter+Button)→ 元件 spec own,**跳過 layout rule**
   - **跨範疇 + 直接 functional 交互 / 依賴**(search→list / heading→content / toolbar→table)→ 規則 3 = **tight**
   - **跨範疇 + parallel / independent**(form fields stack / unrelated sections)→ 規則 3 = **loose**

3. **套規則**
   - 規則 2 Header → first element:bounded → loose / unbounded → 0 / element → tight
   - 規則 3 元素間 gap 只看親疏(role 無關)
   - 規則 4 底部:後接 action button → bottom 48(commitment 留白,概念 A) / 否則看 role 套 spatial 邊界(概念 B)
   - 規則 5 橫排 input gap 固定不隨 density(緊密 8 / 獨立 16)
   - 規則 6 Chrome 水平 padding = loose

## Overlay body list-as-region 處理(2026-05-01 canonical,**取代** flush variant)

**已移除**:`<DialogBody flush>` / `<SheetBody flush>` / `<PopoverBody flush>` variant prop(2026-05-01)。

**Why removed**:
1. flush 只省 1 行 chrome padding override,consumer 仍要自管 list outer `py-2` + item `px-loose rounded-md` — 加 1 row(search / banner)就破功(body 反而沒 chrome padding,更難排版)。Variant 不解決底層脆弱。
2. 世界級主流(Material M3 / Atlassian / Mantine / shadcn)無 universal LayoutBody flush variant;Polaris 有 flush API 但 scope 極窄(只 ResourceList in Modal)。
3. Single API surface 比 dual API 清楚 — body 一律 chrome padded,list-only 場景用 className override 處理。

**Canonical pattern**(consumer 寫 list-only overlay body 必照此):
```tsx
<DialogBody className="!px-0 !pt-0 !pb-0">    {/* body 撤 chrome padding */}
  <div className="py-2">                       {/* list outer wrapper(menu group 8px breathing)*/}
    {items.map(...)} {/* item: px-[var(--layout-space-loose)] rounded-md hover:bg-neutral-hover */}
  </div>
</DialogBody>
```

**3 invariant**(Linear-family canonical;hover bg flush chrome 派):
1. hover bg 貼邊 chrome(item `px-loose` 讓 bg 鋪滿 chrome 內邊)
2. content 對齊 header title(item content 左 = chrome `px-loose` 起點)
3. content 在 hover bg 內有 breathing(item `px-loose rounded-md`)

**SSOT**:`src/design-system/patterns/overlay-surface/overlay-surface.spec.md`「List-as-region in overlay body」+ `src/design-system/components/Dialog/dialog.tsx` DialogBody 註解。

## 我自己跌過的 anti-patterns(下次禁止重蹈)

- ✗ 把「同種類 component instance 多個」當「同範疇」(form fields stack 不是 bundled)
- ✗ Cite v1 詞彙(block/inline)沒換 v6 — 已被 user 抓過 2 次
- ✗ 把 Tooltip / Toast 的 `px-3 py-2` 跟 layout-space token 混為一談(是寫死值,不是 token)
- ✗ 規則 3 只用 role 不看親疏
- ✗ 把 InfoPanel / Popover 當「Dialog-class」(沒自帶 pb-bottom 的不算)
- ✗ **加 `flush` variant 解 list-only body**(2026-05-01 撤回):應該讓 consumer 用 className override + 自管 list outer。新增 prop 必先過 4-Q gate(Q1 M8 ≥ 3 家 / Q2 M17 SSOT 必要性 / Q3 Rule-of-3 / Q4 M10 下游),flush 在 Q1+Q4 失敗
- ✗ **混淆 body py-2 屬於哪一層**:body py-2 概念上屬 list outer wrapper(consumer 自管),不該寫到 body variant 裡
- ✗ **「list 在 body 變成單一 region」當特殊 case**:其實是 unbounded list-as-region 通則(無 chrome padding + list 自帶 py + item 自帶 px),不該額外造 prop

## 客觀判斷依據(避免 case-by-case 主觀)

- 「Dialog-class」= 該元件 spec 有沒有自帶 `pb-*` canonical(eg `dialog.spec.md`)
- 「Bundled family」= spec 文件有沒有把 components 寫成 bundle 並定 spacing
- 「Functional 交互」= 操作後在畫面上有交互 / labeling / context dependency
- 「list-as-region in overlay body」= consumer 用 className override(`!px-0 !pt-0 !pb-0`)+ 自管 list outer wrapper,**不**期望 DS 提供 prop

## v1 → v6 → 2026-05-01 變動表

| 維度 | v1 | v6(2026-04-30)| 2026-05-01 微調 |
|------|----|----|----|
| 命名 | block / inline | region / element(避 CSS display 撞名)| 不變 |
| region 子分類 | 無 | bounded / unbounded | 不變 |
| 規則 3 邏輯 | block-adjacent 一律 tight | 親疏三級 | 不變 |
| 範疇分權 | 無 | bundled family → 元件 spec own | 不變 |
| 規則 4 大容器 | 無 | 拆兩概念(commitment vs spatial)| 不變 |
| 規則 1 padding 寫哪 | 一律父層 | 3 patterns(元件自帶 / 父層管 / item 自帶)| 不變 |
| Body list-only 處理 | (未討論)| `flush` variant prop | **移除 flush**,consumer className override + list outer wrapper |

## SSOT 在哪

- `src/design-system/tokens/layoutSpace/layoutSpace.spec.md`(v6 framework + Notes flush 移除說明)
- `src/design-system/patterns/overlay-surface/overlay-surface.spec.md`「List-as-region in overlay body」(rationale + canonical pattern + 3 invariant + 世界級對照)
- `src/design-system/components/Dialog/dialog.tsx` DialogBody JSDoc(consumer-facing canonical example)

## 命名 / API 決策 future-proof rule

未來再遇「要不要加 body variant 解 list-only / banner-on-top / search-on-top 場景」時:

1. **先問 4-Q gate**(M18):Q1 ≥ 3 家世界級對照 / Q2 是否真 SSOT(token / primitive / utility class 三擇一)/ Q3 Rule-of-3 / Q4 下游吸收
2. **想 multi-row 場景能不能 hold**(加 1 個 search row / banner row 就破功的 prop 不該存在)
3. **想 consumer 寫 className override 是不是 5 字以內**(`!px-0 !pt-0 !pb-0` = 16 字,不夠少 → 才考慮 prop;低於則 consumer 自管)
4. **問 Material/Atlassian/Mantine 怎做**(他們不做的我們也不做,除非有 strong rationale)

對照 historical:flush variant 失敗在 Q1(只 Polaris 有,1 家不過 3)+ Q4(下游沒被吸收,新增 prop 沒簡化 consumer)+ multi-row 破功 + override 字數其實夠少。
