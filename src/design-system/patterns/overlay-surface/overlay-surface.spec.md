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

## 不屬本 primitive 的職責

- **Close 按鈕**:Dialog modal 特有(一定要 X 關閉),Popover 預設無(click-outside 關閉)。Dialog 自己包 `ItemInlineActionButton` 在 Header 內,不污染 SurfaceHeader。
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
