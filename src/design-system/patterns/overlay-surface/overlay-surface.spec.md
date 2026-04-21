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
  - **Dialog**:consumer 外層疊 `flex-1 overflow-y-auto pb-[var(--layout-space-bottom)]`(viewport-fill 專用)

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
