# Overlay Surface 設計原則

## 定位

Dialog 和 Popover 的**結構化 sub-components 共用 primitive**——提供 Header / Body / Footer 的統一 padding + 分隔線語言。本 pattern 是 **SSOT**,Dialog 與 Popover 不自寫 padding token。

**Layout Family**:非上述 family — structural container primitive(不是 element-level layout,是 surface-level 分區)。

**Consumers**:`Dialog` / `Popover`。未來任何其他「elevation-200 浮層」(如 Drawer / Sheet)的結構化 sub-components 都應消費本 primitive。

---

## 規則

### SurfaceHeader
- `border-b border-divider`(上下分隔）
- `px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]`
- `flex items-center gap-2 shrink-0`(不被 flex-grow 壓縮)

### SurfaceBody
- `px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]`
- **無額外 flex 屬性**——consumer 依浮層類型決定:
  - **Popover**:多數 bare consume,padding 即是總 padding
  - **Dialog / Sheet**:consumer **不直接 wrap SurfaceBody**——走 ScrollArea canonical(下節),padding 搬到 ScrollArea viewport 內層 div

---

## Body overflow canonical(Dialog / Sheet 必用 ScrollArea)

**規則**:Dialog / Sheet 的 body 會 viewport-fill + 長內容需捲動時,**必須用 `<ScrollArea>` wrap**,禁止自寫 `overflow-y-auto` / `overflow-auto`。

**Rationale**:
- Native scrollbar 跨 OS 不一致(macOS overlay / Windows 永遠吃 ~17px 寬度)——Dialog / Sheet 內容會因 OS 不同跑版
- ScrollArea(Radix primitive)用自建 overlay 捲軸 → **跨 OS 一致不吃寬度**,捲動時浮現
- SSOT 見 `components/ScrollArea/scroll-area.spec.md`「何時用」已列明「Sheet / Dialog body 太長」

**實作模板**:
```tsx
// DialogBody / SheetBody 內部:
<ScrollArea className="flex-1 min-h-0">
  <div className="px-[var(--layout-space-loose)] pt-[var(--layout-space-tight)] pb-[var(--layout-space-bottom)]">
    {children}
  </div>
</ScrollArea>
```

- `flex-1 min-h-0` → 撐滿 Content 剩餘高度(min-h-0 防止 flex child 撐破 container)
- Padding 搬進 ScrollArea viewport 內的 inner div(因 ScrollArea Root 自己是 `overflow-hidden`,padding 應在捲動內容上)
- `pb-bottom` 保留 Dialog / Sheet「大容器底部多一拍」的 canonical

**Popover 例外**:Popover 無 viewport-fill、內容預期短,PopoverBody 直接消費 SurfaceBody bare;若未來有長內容 Popover consumer,同樣應 wrap ScrollArea。

**Coachmark 例外**:Coachmark 內容短(media + 2 行 title/description),不設計 body 捲動;不適用本規則。

---

## Body 放 List 時的 padding canonical(2026-04-22 新增)

當 overlay body(Dialog / Sheet / Popover)**只放一個 list**(contact picker / settings menu / command palette 類)時,**上下 padding 必對稱**,list 本身**不加**上下 padding — list 內每個 item 自己的 py 就是節奏來源。

### 世界級對照

| DS | Body pad vs List handling |
|----|-----|
| Material M3 Dialog with List | Body 移除 pt/pb,list 內 item 自己 py-3 |
| Polaris Modal with ResourceList | Body padding 僅 px(水平),list 接頂接底 |
| Atlassian Dialog + OptionList | Body padding 全移除,list 直接貼 Body 邊界 |
| Linear Cmd+K | Body padding 0,list item pad 密集 |
| Notion @mention list | Body padding 極小(`p-1`),item 自己有 py |
| VS Code Quick Pick | Body 零 padding,item padding dense |

**共識**:overlay body 裝 list 時,**body 不再加 vertical padding**,list 自己的 item padding 負責視覺節奏;body 水平 padding 保留(視覺 gutter)或根據 list item 自己有 px。

### Canonical(我們 DS)

**規則 1 — body 放 list 時移除 body 的 pt/pb**:
- 消費者一律用 `<DialogBody variant="list">` / `<SheetBody variant="list">`(2026-04-22 canonical,已 ship)
- Body 保留 `px-loose`(list item 左右對齊 header title 與 footer button),僅移除 `pt` / `pb`
- **禁止 hand-craft `className="!py-0"` override**(違反 mindset #2「不憑直覺發明」——有 prop 不用自刻)

**規則 2 — list 本身不加上下 padding**:
- `<div className="flex flex-col">` wrap list items(不加 `py-*`)
- 第一個 item 的 pt = 其他 items 的 pt(平等);最後一個 item 的 pb = 其他 items 的 pb
- 禁止 list 外再 wrap `py-2` / `py-4` 等(重複 padding 造成上下過鬆)

**規則 3 — list item 本身有 py,由 item 決定節奏**:
- 小 item(icon + label):item `py-1.5`(6px 垂直,符合 MenuItem canonical)
- 中 item(icon + title + description 2 行):item `py-2`(8px 垂直)
- 大 item(avatar + title + description):item `py-3`(12px 垂直,符合 FileItem rich)
- **Item `px=0`**(2026-04-22 v2 revision):item 不加水平 padding,hover bg 寬度 = body padded area,
  flush 到 body padded 邊緣。世界級 overlay list(Material M3 Dialog / Polaris Modal + ResourceList / Linear Cmd+K)
  都採此 pattern:body 有 gutter,item hover bg 貼滿 gutter 內邊(容器內貼邊合理;chrome 外殼仍保留 loose 呼吸)
- Item size 對齊 `patterns/element-anatomy/item-anatomy.spec.md`(Family 1 Menu item / Family 2 List item)

**規則 3.1 — 內容元素與 affordance bg 的 spacing invariant(2026-04-22 v3 校準為真實 invariant)**:

**真實 invariant(CLAUDE.md M11 canonical,Image #25 證實的)**:
**Content 元素(text / icon / avatar / control)不可直接觸到 affordance bg(hover bg / selected bg / row highlight)的邊緣**——**必有 padding 在 bg 內**。content 貼 bg 邊 = 違規(視覺像 content 被擠到 bg 邊,失去 row 的視覺 structure);bg 邊緣則本身有設計自由(flush 容器 / inset 容器皆合法,依 DS 一致性)。

**Layer 區分**(重要心智結構):
| Layer | 元素類型 | Spacing 規則 |
|-------|---------|-------------|
| 1. Chrome 外殼 | dialog / sheet / popover border | 自己 `px-loose` gutter 推開內容 |
| 2. 背景 affordance | hover bg / selected bg / divider | bg 邊位置**有自由**(flush body padded 內邊 / inset 皆合法);**但 bg 寬度必比 content 寬,讓 content 在 bg 內有 breathing** |
| 3. Content 元素 | text / icon / avatar / control | **必有 padding 在 bg 內**(不可觸 bg 邊);content 之間也必 gap |

**世界級 benchmark**(≥5 家一致,content-inside-bg 是 invariant):
- Material M3 List / MenuItem:item 內 horizontal padding = 16,hover bg 寬 = full row,**content 在 bg 內有 16px breathing**
- Polaris ResourceList / OptionList:item padding 12-16,hover bg full row,content inside
- Linear command palette / member list:item padding 8,hover bg full row,content inside
- Slack channel list / DM list:item padding 12,hover bg full row,content inside
- Notion page list:item padding 6-8,hover bg full row,content inside
- GitHub Primer ActionList:item padding 8,hover bg full row,content inside

**共通 pattern**:hover bg 是 affordance layer,content 永遠在 bg 內有 breathing。不同 DS 的 bg 邊位置(flush body / inset body)有選擇空間,但 **content-inside-bg padding 是 invariant**。

**本 DS canonical 實作**(`DialogBody variant="list"` / `SheetBody variant="list"`):
```
chrome ──── [ loose gutter ] ──── body padded 內邊 ──── [ 8px breathing ] ──── content
                                        ↑                          ↑
                                 hover bg 左邊          content(avatar / text)
                                 (flush body padded)
```
- body `px-[calc(loose-8)]`、item `px-2 rounded-md`
- hover bg 邊緣 = body padded 內邊(flush,chrome 有 loose-8 呼吸)
- content 在 hover bg 內有 8px breathing(**不可觸 bg 邊**)
- content left = body (loose-8) + item 8 = **loose** from chrome → 對齊 header title ✓

**M11 state walk hover 檢查**(真正要問的):
1. **Content 內嵌**:text / icon / avatar 距 hover bg 邊 ≥ N(通常 8px)? ← **invariant,最重要**
2. **Hover 區覆蓋整列**:整 row 可 click?
3. **bg 邊位置**:flush body padded 內邊(本 DS canonical)/ inset(選擇 alt)— 兩者皆合法,不是違規判斷點

**Consumer 範例**:

```tsx
// ✅ canonical(2026-04-22 v3):Dialog 放 contact picker
<Dialog>
  <DialogContent>
    <DialogHeader>...</DialogHeader>
    <DialogBody variant="list">  {/* body:px-[calc(loose-8)] + py-2 */}
      <div className="flex flex-col">
        {contacts.map(c => (
          {/* item `px-2 rounded-md` → content 在 hover bg 內有 8px breathing */}
          <button className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-neutral-hover">
            <Avatar size={40} />  {/* Family 2 block mode avatar */}
            <div>
              {c.name}
              {/* title↔desc 2px gap,desc 色 fg-secondary */}
              <p className="mt-0.5 text-caption text-fg-secondary">{c.role}｜{c.empId}</p>
            </div>
          </button>
        ))}
      </div>
    </DialogBody>
  </DialogContent>
</Dialog>
```

**常見違規(M12 FP 記憶)**:
- ❌ 寫 "hover bg 必 flush" / "hover bg 必 inset" = 把 bg 邊位置(variance)誤升級成 strict rule(震盪 anti-pattern)
- ❌ item `px=0` 讓 content 直接觸 hover bg 邊(Image #24 pattern)= 違反 content-inside-bg 真 invariant
- ✅ 真實 invariant = 「content 必在 bg 內有 padding」,bg 邊位置留給 DS 一致性選擇

**規則 4 — 對稱**:
- 對稱 pt=pb(避免「頂貼邊、底留空」非對稱斷裂)
- 例外:scrollable list(>= viewport 80%) 可接受 pb 略大於 pt(breathing tail)— 但需 rationale

### ❌ 禁止

- Body 外層 `py-4` + list 再 `py-2` + items 各 `py-2`(三層堆疊過鬆,Image 3 類 FileItem rich 就會太高)
- Body `py-loose(寬)` + list 沒 flush → 頂底留白大於 item 本身,視覺結構斷裂
- 不對稱 padding(頂 tight / 底 loose)無 rationale

### Consumer 範例

```tsx
// ✅ canonical(2026-04-22 v3):Dialog 放 contact picker
<Dialog>
  <DialogContent>
    <DialogHeader>...</DialogHeader>
    <DialogBody variant="list">  {/* body:px-[calc(loose-8)] + py-2 */}
      <div className="flex flex-col">
        {contacts.map(c => (
          {/* item `px-2 rounded-md` → content 在 hover bg 內有 8px breathing(不可觸 bg 邊) */}
          <button className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-neutral-hover">
            <Avatar size={40} /> {/* Family 2 block mode avatar */}
            <div>
              {c.name}
              {/* title↔desc 2px gap,desc 色 fg-secondary */}
              <p className="mt-0.5 text-caption text-fg-secondary">{c.role}｜{c.empId}</p>
            </div>
          </button>
        ))}
      </div>
    </DialogBody>
  </DialogContent>
</Dialog>
```

### SurfaceFooter
- `border-t border-divider`
- `px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]`
- `flex items-center justify-end gap-2 shrink-0`(右對齊按鈕列,不被壓縮)

---

## Close X canonical(overlay chrome 共用規則)

Overlay chrome header 右上 corner close X **一律** 使用:

```tsx
<Button iconOnly dismiss size="sm" startIcon={X} aria-label="關閉" onClick={onClose} />
```

**Rationale**:Corner close X 屬 **action group region**(跟 footer 的 primary / secondary CTA 同一組 affordance 家族),必用 Button。不用 `ItemInlineActionButton`(那是 row-content 內 inline 動作,語義、視覺尺寸、hover 幾何都不同),不自刻 `<button><X /></button>`(繞 DS token / a11y)。

**套用元件**:
- `Dialog` / `Sheet` → Header 內永遠有 X(modal 必有明確關閉手段)
- `Popover` → `PopoverHeader` 預設有 X,`hideClose` 可關(composition 如 Coachmark 自管 close)
- `Popover` 無 header 版本 → 無 X(click-outside / Esc 即可)
- `Notice` / `Toast` / `Alert` → 透過 Notice primitive 的 `dismissible` prop,同樣消費 `<Button iconOnly dismiss size="sm" />`

**SSOT**:`patterns/element-anatomy/item-anatomy.spec.md`「Dismiss canonical」+ `components/Button/button.spec.md`「Dismiss 視覺類」。

---

## 不屬本 primitive 的職責

- **Close 按鈕渲染**:由 consumer(Dialog / Sheet / Popover)自己包 `<Button iconOnly dismiss>` 在 Header 內,綁各自 Radix Close primitive。SurfaceHeader 本身不渲染 close,避免 pattern 與 consumer 的職責耦合。
- **viewport-fill 高度邏輯**:Dialog 特有(填滿 viewport - inset),由 DialogContent 自行計算 `height: calc(100vh - inset*2)`,與 Body 協作 `flex-1 overflow-y-auto`。
- **radius / border / shadow / bg**:浮層外殼職責,由 Dialog / Popover 的 Content 自己套(都套同一組 token:`bg-surface-raised` / `border-border` / `rounded-lg` / `shadow-[var(--elevation-200)]`——這部分 CLAUDE.md 已經寫明對齊規則,不另外抽 primitive)。

---

## 何時不用

- **Toast / Alert**(Family 2 List item 視覺對齊):那是 row-item layout 不是 surface-section,不要套本 pattern。
- **Tooltip**(純文字短提示):無結構化需求,不包 Header/Body/Footer。
- **HoverCard**(自由組合互動浮層):目前 consumer 自行組合內容,視未來是否引入 Header/Body/Footer 需求再納入 consumer。

---

## 相關

- `../../components/Dialog/dialog.spec.md` — modal 浮層 consumer
- `../../components/Popover/popover.spec.md` — non-modal 浮層 consumer
- `../../tokens/layoutSpace/layoutSpace.spec.md` — padding token 來源(`--layout-space-loose` / `--layout-space-tight` / `--layout-space-bottom`)
