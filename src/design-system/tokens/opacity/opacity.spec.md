# Opacity Token Spec

Opacity 定義元件停用狀態的透明度，確保全系統 disabled 視覺一致。

## Token

| Token | 值 | Tailwind utility | 用途 |
|-------|-----|-----------------|------|
| `--opacity-disabled` | 0.45 | `opacity-disabled` | 所有元件的 disabled 狀態 |

## 使用規則

### 何時用 opacity vs token swap

停用狀態有兩種視覺策略（詳見 `color.spec.md`「Disabled 策略」節）：

- **Token swap**（預設）：disabled 時換成專用 token（`fg-disabled`、`bg-disabled`），精確控制每個層的顏色。適用於多層結構的元件（Button、Input）。
- **Opacity blanket**：對整個元件套 `opacity-disabled`，一次處理所有子元素。適用於結構簡單、子元素多的元件（Avatar、Switch thumb、Slider）。

不可混用——同一元件要嘛用 token swap，要嘛用 opacity，不兩者同時。

## 為什麼 0.45

0.45 在 light mode 和 dark mode 都能產生足夠的「褪色感」，同時保持文字可讀（WCAG 不要求 disabled 元素的對比度，但仍需辨識）。

## 消費者

Avatar、Sidebar、MenuItem、Slider、Switch、Steps、Chip。

## 反向引用

- Disabled 策略選擇框架：`tokens/color/color.spec.md`
