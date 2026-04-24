# Primitive Exposure Layer — 完整 3 層規格

CLAUDE.md `# Primitive Exposure Layer` 的完整展開。主章留 3 層定義 + 判斷 3 題,本檔放詳細規則 + 世界級對照 + 範例分佈。

## 3 層定義

| Layer | 對象 | 例 | API 形式 |
|-------|------|----|---------|
| **L1 — User-facing primitive** | App code + stories + consumer(所有人)| `Button` / `Input` / `Select` / `MenuItem` / `FileItem` / `DataTable` / `Tag` / `Badge` | 完整 variant / size prop / ReactNode slot |
| **L2 — Host slot API**(config-based)| 消費 L1 host 元件的 app code | `Input.endAction: InlineActionConfig` / `MenuItem.inlineActions: InlineActionConfig[]` / `SidebarMenuButton.inlineActions` | 宣告式 config `{ icon, label, onClick }`,host 內部負責渲染 |
| **L3 — Internal primitive**(不暴露給 app)| 建新 row primitive / host 元件的 DS 作者(非 app code)| `ItemInlineAction` / `ItemInlineActionButton` / `ItemIcon` / `ItemAvatar` / `ItemLabel` / `ItemSuffix` / `RowSizeProvider` | 低階 building block,只 export for composition |

## 判斷新 primitive 放哪層(3 題)

1. **App code 需要直接 import 嗎?**
   - 是 → L1(e.g. `Button`)
   - 否 → 看 Q2
2. **是「host 內部 embedded action」config API 嗎?**
   - 是 → L2(`InlineActionConfig` + host slot prop)
   - 否 → 看 Q3
3. **是「建新 host 時的低階 building block」嗎?**
   - 是 → L3(`ItemInlineActionButton`)
   - 否 → **不該是新 primitive**(可能是舊元件的 feature,走 feature prop)

## 規則

- **L3 primitive stories / docs 必明示**「internal; app 請走 host slot API」
- **L1 不做 L3 該做的事**(Button 不加 `embedded=true` density 維度;embedded 走 L2 host slot)
- **L2 config-based 比 ReactNode slot 更 opinionated**(防 consumer drift),新 host 元件優先 config
- **新 L1 primitive 要經 Checkpoint 3**(classification ambiguity);L2 / L3 可 AUTO

## 世界級對照

本 taxonomy 是 DS 原創,但結構對齊:
- **Radix / Headless UI / Ariakit**:compound component 模式(L1 wrapper + L3 primitives 給 composition)
- **Polaris / Material / Atlassian**:host 元件 slot 吃 ReactNode(相當於 L2 但無 config-based opinionation)
- **我們的 L2 config-based** 比世界級 slot 更 opinionated(防 consumer drift),是 slight deviation 有 rationale

## Icon action primitive 的 3 層分佈(範例)

- **L1**:`<Button iconOnly />` — 獨立 action(toolbar / chrome corner / standalone)
- **L2**:`Input.endAction` / `MenuItem.inlineActions` / 未來 `FileItem.actions / DataTable.rowActions`
- **L3**:`ItemInlineAction`(config wrapper)/ `ItemInlineActionButton`(raw button)

完整 Inline Action vs Button predicate 見 `patterns/element-anatomy/item-anatomy.spec.md`「Predicate」。
