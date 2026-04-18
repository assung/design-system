# Dialog 設計原則

Modal 對話框，基於 Radix Dialog。用於需要使用者注意力的操作流程（建立、編輯、確認），阻斷背景互動。

## 結構

```
DialogContent (fixed, centered)
├── DialogHeader (border-b)
│   ├── DialogTitle
│   └── Close button (ItemInlineActionButton)
├── DialogBody (flex-1, overflow-y-auto)
└── DialogFooter (border-t)
    └── Action buttons
```

## Density

`DialogContent` 強制 `data-density="lg"`——dialog 內所有子元件的 token 解析為 lg 模式。Dialog 是獨立上下文，不繼承頁面密度。

## Layout

- **水平 padding**：`px-[var(--layout-space-loose)]`（header / body / footer 統一）
- **Header / Footer 垂直 padding**：`py-[var(--layout-space-tight)]`
- **Body 垂直 padding**：`pt-[var(--layout-space-tight)]` + `pb-[var(--layout-space-bottom)]`——底部留較大空間，視覺上不壓迫

## Viewport Inset

Modal 與 viewport 四邊保持 `--layout-space-bottom`（48px）最小間距。maxWidth 也受此限制：`min(maxWidth, 100vw - inset*2)`。

## 高度行為

| 模式 | 條件 | 行為 |
|---|---|---|
| **預設（填滿）** | 不傳 `autoHeight` | `height = 100vh - inset*2`，body 捲動。防止動態內容（載入資料、展開 section）造成 dialog 跳動 |
| **autoHeight** | `autoHeight={true}` | 高度隨內容，超過 viewport 時 `max-height` 安全帽。適合內容量已知且穩定的 dialog（確認框、短表單） |

## maxWidth

預設 512px，consumer 可透過 `maxWidth` prop 調整。

## 關閉按鈕

永遠存在於 DialogHeader 右側。使用 `ItemInlineActionButton`（Inline Action pattern），icon 為 `X`，size `md`。不可移除——使用者永遠需要明確的關閉手段。

## Title

`text-body-lg font-medium truncate`——單行截斷，不換行。

## Footer 按鈕

預設 size `md`，與 Field 系統表單元件尺寸一致。按鈕靠右對齊（`justify-end`），間距 `gap-2`。

## 視覺

- **Overlay**：`bg-overlay`
- **Shadow**：`elevation-200`（浮層級）
- **圓角**：`rounded-lg`
- **背景**：`bg-surface-raised`
- **邊框**：`border-border`
- **分隔線**（header / footer）：`border-divider`

## 動畫

- 進場：fade-in + zoom-in-95 + slide-in-from-center
- 離場：fade-out + zoom-out-95 + slide-out-to-center
