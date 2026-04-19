# anatomy Story 標準(`{name}.anatomy.stories.tsx`)

以 `Button/button.anatomy.stories.tsx` 為範本。每個元件的設計規格必須包含以下 5 個 story。

## 1. 元件總覽

- Anatomy 圖——標示所有 slot(標準版面 + iconOnly 等變體版面)
- Variant 一覽——每個 variant 一行:渲染元件 + 一句話角色描述
- Props 速查表——prop / type / default / 說明

## 2. 元件檢閱器(取代 Figma inspect)

- 控制項:variant / danger / state / size / iconOnly(依元件調整)
- 左側:即時預覽 + 尺寸藍圖
- 右側:Inspect 面板,分區顯示 Color / Layout / Typography / Style
- **State 使用開發術語**:default / hover / active / disabled(不用 rest)

## 3. 色彩對照表

- Variant × State 矩陣
- 每格:渲染元件 + bg / text / border token 標註(含即時色塊)
- 標準 variant 與 danger variant 分開

## 4. 尺寸對照表

- Size token 對照表(每個 size 的所有 token 一覽)
- 含 iconOnly 等變體模式的覆寫說明
- 視覺預覽矩陣(Variant × Size,含變體模式)

## 5. 狀態行為

- 每個互動狀態的前後對照(如 loading spinner 替換規則)
- 所有 variant 的 disabled 渲染(含變體模式)
- 元件特有狀態(如 checked toggle)

## 設計規格品質規則

- **Token-first**:所有數值以 token name 為主(如 `h-field-sm`),resolved px 值為輔助灰字。開發者只需確認 token 正確——theme / density 的值解析由系統處理
- **不含 density 雙值**:不顯示 `28px (md) / 32px (lg)`,只顯示 token name + 當前 resolved 值
- **Dev 語言**:使用開發術語(default 不是 rest,用 Tailwind utility name 如 `px-3` `gap-1`)
- **藍圖完整性**:render 函式中**每一層**的 padding / margin / gap 都必須在藍圖中呈現——包括子元素的間距(如 label span 的 `px-1`),不可遺漏
- **範例驗證**:每個範例必須用 spec.md 的所有規則逐條驗證(如 badge 不應出現在 loading / disabled 狀態)
- **色塊即時渲染**:使用 `var()` 內聯樣式,確保切換 dark mode / density 時自動更新
- **資料正確性**:TOKEN_MAP / SIZE_SPECS 等資料必須與元件 `.tsx` 的 `cva()` 定義交叉比對,確認完全一致
- **值溯源完整性**:設計規格中出現的每個行為描述,必須追到 code 中的具體值。不可只描述行為模式而省略數值——包括 Provider 層級設定(如 `delayDuration`)、全域設定檔(`main.tsx`、`preview.tsx`)、CSS 變數定義檔。規則:**如果 code 裡有具體數字,設計規格就必須標出來**

## 連動更新規則

三份文件互為依賴,任一變動必須同步更新其他兩份:

| 異動來源 | 必須連動更新 |
|---------|-------------|
| **`.tsx` 元件程式碼**(variant / size / token / 內部結構) | → 設計規格(TOKEN_MAP、SIZE_SPECS、藍圖、Inspect 面板)<br>→ 展示(如有對應的 story) |
| **`.spec.md` 設計原則**(新增 / 修改 / 刪除規則) | → 設計原則 stories(do/don't 範例必須反映最新 spec)<br>→ 設計規格(範例驗證:確認規格中的範例不違反新規則) |
| **設計規格 story**(結構調整、新增對照維度) | → 展示(確保展示仍是規格的便利瀏覽版,不脫節) |

## 高風險漂移點:`cva()` defaultVariants

**`defaultVariants` 是三方(code / spec / story)最容易漂移的位置,改之前必須意識到四方聯動:**

| 改什麼 | 必須同步 |
|--------|---------|
| `cva()` 裡的 `defaultVariants.size`(或 variant / state) | 1. 元件 `.spec.md` 的 prop 表 / 預設標記<br>2. 元件 `.tsx` 頂端 docblock 的 `★ 預設` 標記<br>3. `{name}.anatomy.stories.tsx` 的 SIZE_SPECS 表 / default marker<br>4. 若屬 field-height family → `tokens/uiSize/uiSize.spec.md` 的 family 清單 |

**曾發生的 bug**:SegmentedControl 的 cva `defaultVariants.size` 是 `md`,spec.md + docblock + anatomy 都寫 `sm ★default`——三方不一致持續存在到 audit 才發現(2026-04-18 修正)。

**預防法**:改 `defaultVariants` 前,grep 該元件所有檔案(`grep "★\|預設\|default" src/design-system/components/{Name}/`),一次改完所有出現位置,不單改 code 就收工。
