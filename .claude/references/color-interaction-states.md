# Color — 互動狀態推導(Hover / Active)完整公式

從 `src/design-system/tokens/color/color.spec.md`(2026-04-24 prune)抽出的互動狀態公式 / derivation / 對照表完整展開。color.spec 主體留 token 定義 + 規則,公式細節 / 反例走本檔。

## 互動狀態推導（Hover / Active）

### 公式

Hover / active **直接引用色盤 step**，不使用獨立公式：

| | Hover（較亮） | Active（較暗） |
|---|---|---|
| Light | step **-5** | step **-7** |
| Dark | step **-7** | step **-5** |

相對色階公式保證 step -5 永遠比 base 亮、step -7 永遠比 base 暗，
所有色相適用同一規則，無例外。

高亮度色相（yellow 等）的 hover gap 較小（ΔL ≈ 0.03），
這是物理事實——亮色的淺色方向空間窄。
cursor 變化 + 細微色移疊加仍提供足夠互動回饋。

```tsx
<button className="bg-primary hover:bg-primary-hover active:bg-primary-active" />
```

### Semantic token 直接指向 primitive

| Token | 指向 primitive |
|-------|----------------|
| --primary / --primary-hover / --primary-active / --primary-subtle | → blue-6 / blue-5 / blue-7 / blue-1 |
| --info / --info-hover / --info-active / --info-subtle / --info-text | → blue-6 / blue-5 / blue-7 / blue-1 / blue-7 |
| --error / --error-hover / --error-active / --error-subtle / --error-text | → deep-orange-6 / deep-orange-5 / deep-orange-7 / deep-orange-1 / deep-orange-7 |
| --success / --success-hover / --success-active / --success-subtle / --success-text | → green-6 / green-5 / green-7 / green-1 / green-7 |
| --warning / --warning-hover / --warning-active / --warning-subtle / --warning-text | → yellow-6 / yellow-5 / yellow-7 / yellow-1 / yellow-7 |

每個色相使用色盤的 4 個 step：-1（subtle）、-5（hover）、-6（base）、-7（active / text）。

Dark mode 覆寫：hover/active 方向反轉（hover → step-7，active → step-5），subtle 使用 alpha 公式。text 不需覆寫——primitives 的相對色階公式已處理 dark mode 方向。

### `--{hue}-hover/active` — 非語意色相的互動 token

除了 semantic 色相（primary、info、error、success、warning）有完整 5 件套（base/hover/active/subtle/text）外，**作為 bg 使用的非語意色相**還有獨立的 hover/active 互動 token：

| Token | 指向 primitive | dark mode swap |
|-------|--------------|--------------|
| `--blue-hover` / `--blue-active` | blue-5 / blue-7 | blue-7 / blue-5 |
| `--red-hover` / `--red-active` | deep-orange-5 / deep-orange-7 | deep-orange-7 / deep-orange-5 |
| `--green-hover` / `--green-active` | green-5 / green-7 | green-7 / green-5 |
| `--yellow-hover` / `--yellow-active` | yellow-5 / yellow-7 | yellow-7 / yellow-5 |
| `--turquoise-hover` / `--turquoise-active` | turquoise-5 / turquoise-7 | turquoise-7 / turquoise-5 |
| `--purple-hover` / `--purple-active` | purple-5 / purple-7 | purple-7 / purple-5 |
| `--magenta-hover` / `--magenta-active` | magenta-5 / magenta-7 | magenta-7 / magenta-5 |
| `--indigo-hover` / `--indigo-active` | indigo-5 / indigo-7 | indigo-7 / indigo-5 |

#### 為什麼存在這組 token

**Tag/Avatar 的 solid 色相 dismiss 互動需要**：
- 跟 Button 同樣的 solid color shade change（hover 較亮、active 較暗）
- 跨 mode 一致的方向（dark mode 必須 swap step 號）
- 但 Tag 的「藍」≠ semantic primary（解耦：改 primary 不應影響 Tag）

直接用 primitive `--color-blue-5/-7` 不行——dark mode 公式互換會方向顛倒。所以擴展 semantic 互動 token 模式到所有 8 個非語意色相。

#### 嚴格限制

**只有 hover/active 兩個 token**——**沒有** `--blue` base、`--blue-subtle`、`--blue-text`：

| 用途 | 該用什麼 |
|------|---------|
| Tag/Avatar 的 base bg（solid） | primitive `--color-blue-6` |
| Tag/Avatar 的 subtle bg | primitive `--color-blue-1` |
| Tag/Avatar 的 text on subtle | primitive `--color-blue-7` |
| Tag/Avatar 的 dismiss hover bg | semantic `--blue-hover` |
| Tag/Avatar 的 dismiss active bg | semantic `--blue-active` |

**為什麼故意不加 base/subtle/text？** 那些不需要 mode 翻轉知識（primitives 已處理），加 semantic alias 只會污染命名空間、讓 semantic 層重新引入色相維度(backslide 到廢除的 categorical token layer)。只有 hover/active 真的需要 semantic 層處理 mode swap。

#### 新增非語意色相 hue 互動 token 的步驟

當需要在 Tag/Avatar 加入新色相 variant（例：lime）：

1. **確認 primitive 已存在**：`--color-lime-6` 等（primitives.css 應該已定義）
2. **在 semantic.css 加 hover/active**（light + dark）：
   ```css
   /* :root, [data-theme] */
   --lime-hover:  var(--color-lime-5);
   --lime-active: var(--color-lime-7);

   /* [data-theme="dark"] */
   --lime-hover:  var(--color-lime-7);
   --lime-active: var(--color-lime-5);
   ```
3. **更新 Tag/Avatar 元件**：variant cva 加 lime 條目，SOLID_DISMISS_HOVER 加 lime hover/active
4. **不要加** `--lime`、`--lime-subtle`、`--lime-text`（這些用 primitive 直接消費）

### 新增語意色相的標準流程

每次新增 semantic 色相（例：新增 `--accent` 指向 turquoise）必須**完整執行**這 4 步，不可省略——確保所有 semantic 色相結構一致。

#### Step 1: Primitive（如該色相不存在）

在 `primitives.css` 定義 base-6 值（只需指定 L、C、H），相對公式自動推導 1-10 階。如已存在則跳過。

```css
--color-turquoise-6: oklch(0.57 0.10 225);
/* 1-5 / 7-10 自動由公式推導 */
```

#### Step 2: Semantic 五件套（必填）

在 `semantic.css` 的 `:root, [data-theme]` 區塊新增 5 個 token，**不可缺任何一個**：

```css
--accent:        var(--color-turquoise-6);   /* base */
--accent-hover:  var(--color-turquoise-5);   /* hover */
--accent-active: var(--color-turquoise-7);   /* active */
--accent-subtle: var(--color-turquoise-1);   /* subtle bg */
--accent-text:   var(--color-turquoise-7);   /* text on subtle bg */
```

**對應規則**（不可亂改）：
| Semantic role | Primitive step | 為什麼 |
|---|---|---|
| base | -6 | 主色 |
| hover | -5 | 輕微變亮 |
| active | -7 | 輕微變暗（pressed feel） |
| subtle | -1 | 弱化背景（dark mode 自動 alpha） |
| text | -7 | 高對比文字（dark mode 自動反轉方向） |

#### Step 3: Dark mode 反轉（必填）

在 `[data-theme="dark"]` 區塊新增 hover/active 方向反轉：

```css
[data-theme="dark"] {
  --accent-hover:  var(--color-turquoise-7);   /* dark: 仍是較亮 */
  --accent-active: var(--color-turquoise-5);   /* dark: 仍是較暗 */
  /* subtle、text 不需覆寫 — primitives 已處理 */
}
```

**為什麼只反轉 hover/active？** Primitives 在 dark mode 已經：
- 把 step-1 改為 alpha 公式（subtle 自動正確）
- 把 step-5/-7 公式互換（step-7 在 dark mode 仍是高對比方向，所以 text 自動正確）

但 semantic token 直接 reference step number，所以 hover→step-5 在 dark mode 會變成 darker（錯方向）。必須在 semantic 層手動 swap。

#### Step 4: Tailwind Bridge（必填）

在 `semantic.css` 的 `@theme inline` 區塊加入：

```css
--color-accent:        var(--accent);
--color-accent-hover:  var(--accent-hover);
--color-accent-active: var(--accent-active);
--color-accent-subtle: var(--accent-subtle);
--color-accent-text:   var(--accent-text);
```

讓 `bg-accent`、`text-accent-text`、`hover:bg-accent-hover` 等 Tailwind utility 可用。

---

### 檢查清單

新增完一個語意色相，逐項對照：

- [ ] Primitive base-6 已定義（或已存在）
- [ ] Semantic 五件套全部寫齊（base / hover / active / subtle / text）
- [ ] Dark mode `hover` / `active` 方向反轉已加
- [ ] Dark mode `subtle` / `text` 沒亂加（primitives 已處理）
- [ ] Tailwind bridge 五件套全部加齊
- [ ] 命名遵循 `--{name}` / `--{name}-{role}` 模式（不混色相名）
- [ ] 用 `npx tsc --noEmit` 檢查零錯誤


