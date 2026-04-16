import type * as React from 'react'
import type { LucideIcon } from 'lucide-react'

// ── Field Mode ───────────────────────────────────────────────────────────────

export type FieldMode = 'edit' | 'readonly' | 'disabled'

// ── Inline Action ────────────────────────────────────────────────────────────
// 宣告式 API：消費者只宣告 intent，host 根據 size tier 自動渲染。
// 見 uiSize.spec.md 的 Inline Action 段落。Canonical 實作:`ItemInlineAction`。

// ── Menu List Min Height ─────────────────────────────────────────────────────
// SelectMenu / Select / Combobox 共用的 CommandList minHeight 計算。
// 確保空狀態有足夠高度讓 Empty 垂直置中(有框容器 → 置中原則)。

const FIELD_HEIGHT_TOKEN: Record<string, string> = {
  sm: 'var(--field-height-sm)',
  md: 'var(--field-height-md)',
  lg: 'var(--field-height-lg)',
}

/** CommandList 最小高度 = field-height × rows + 16px(CommandGroup py-2 上下 padding） */
export function getMenuListMinHeight(size: string, rows: number = 3): string {
  const token = FIELD_HEIGHT_TOKEN[size] ?? FIELD_HEIGHT_TOKEN.md
  return `calc(${token} * ${rows} + 16px)`
}

// ── Inline Action ────────────────────────────────────────────────────────────

export interface InlineActionConfig {
  icon: LucideIcon
  /** aria-label，同時作為 tooltip 來源 */
  label: string
  /**
   * 點擊 handler。可選接收 React 事件物件——有需要時可呼叫 `stopPropagation()` 避免
   * 事件冒泡到父層(例如 Select 清除按鈕在 popover trigger 內,不想觸發 popover open)。
   */
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void
}
