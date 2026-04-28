import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/design-system/components/Button/button'

// ── 消費的 SSOT ───────────────────────────────────────────────────────────────
// - bulk-action-bar.spec.md(本元件 SSOT)
// - DataTable/data-table.spec.md「L2 選取」(整合方式)
// - button.spec.md(action variant 規則:tertiary / tertiary+danger,不用 primary)
// - patterns/action-bar/action-bar.spec.md(批次 action 排序原則)

// ── i18n labels ─────────────────────────────────────────────────────────────

export interface BulkActionBarLabels {
  count: (n: number) => string
  clear: string
  hiddenSuffix: (hidden: number) => string
  hintPageSelected: (page: number) => string
  hintExtendCTA: (total: number) => string
  hintDatasetSelected: (total: number) => string
  hintClearCTA: string
  toolbarAriaLabel: string
}

export const BULK_ACTION_BAR_DEFAULT_LABELS: BulkActionBarLabels = {
  count: (n) => `已選 ${n} 項`,
  clear: '清除選取',
  hiddenSuffix: (hidden) => `· ${hidden} 個被 filter 隱藏`,
  hintPageSelected: (page) => `已選取本頁全部 ${page} 個。`,
  hintExtendCTA: (total) => `點此選取全部 ${total} 個項目`,
  hintDatasetSelected: (total) => `已選取全部 ${total} 個項目。`,
  hintClearCTA: '清除選取項目',
  toolbarAriaLabel: '批次操作',
}

// ── Props ───────────────────────────────────────────────────────────────────

export interface BulkActionBarProps {
  /** 已選 ID,length === 0 時自動隱藏(回傳 null) */
  selection: readonly string[]
  /** Clear 觸發,user 點 X icon 或 Esc(consumer 監聽 page-level Esc 觸發) */
  onClear?: () => void
  /** 批次 actions(Button / DropdownMenu 等;variant=tertiary 或 tertiary+danger,不用 primary) */
  actions?: React.ReactNode
  /** 大 dataset escape hatch */
  dataset?: {
    total: number
    visibleCount: number
    onSelectAll: () => void
    onClearAll: () => void
    isAllSelected: boolean
  }
  /** Filter 模式:hidden 數量,顯示在 count 區 inline」  */
  hiddenByFilter?: number
  /** Placement:影響 hint banner 位置(top → 主 bar 下方;bottom → 主 bar 上方) */
  placement?: 'top' | 'bottom'
  /** i18n labels(Partial,merge with default) */
  labels?: Partial<BulkActionBarLabels>
  className?: string
}

// ── Component ───────────────────────────────────────────────────────────────

const BulkActionBar = React.forwardRef<HTMLDivElement, BulkActionBarProps>(
  function BulkActionBar(
    {
      selection,
      onClear,
      actions,
      dataset,
      hiddenByFilter,
      placement = 'top',
      labels: labelsOverride,
      className,
    },
    ref
  ) {
    const labels: BulkActionBarLabels = React.useMemo(
      () => ({ ...BULK_ACTION_BAR_DEFAULT_LABELS, ...labelsOverride }),
      [labelsOverride]
    )

    // selection.length === 0 自動藏(對齊 spec 禁止事項 #3)
    if (selection.length === 0) return null

    // ── Hint banner 顯示條件(spec「Hint banner 只在 4 個條件全成立才顯示」) ──
    // 1. 提供 dataset prop
    // 2. dataset.total > visibleCount(單頁看不完)
    // 3. 本頁可見已全選 OR dataset 全選
    const showHint =
      !!dataset &&
      dataset.total > dataset.visibleCount &&
      (dataset.isAllSelected || selection.length >= dataset.visibleCount)

    const hintBanner = showHint ? (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 px-3 py-2 text-caption text-fg-secondary"
      >
        <span className="text-fg-muted">ℹ</span>
        {dataset!.isAllSelected ? (
          <>
            <span>{labels.hintDatasetSelected(dataset!.total)}</span>
            <button
              type="button"
              onClick={dataset!.onClearAll}
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {labels.hintClearCTA}
            </button>
          </>
        ) : (
          <>
            <span>{labels.hintPageSelected(selection.length)}</span>
            <button
              type="button"
              onClick={dataset!.onSelectAll}
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {labels.hintExtendCTA(dataset!.total)}
            </button>
          </>
        )}
      </div>
    ) : null

    const mainBar = (
      <div className="flex items-center gap-3 px-3 py-2 min-h-[var(--field-height-md)]">
        {/* Actions region(left) */}
        <div className="flex items-center gap-1 flex-1 min-w-0">{actions}</div>

        {/* Meta region(right):count + filter hidden inline + clear */}
        <div className="flex items-center gap-2 shrink-0 text-caption text-fg-secondary">
          <span className="tabular-nums">
            {labels.count(selection.length)}
            {hiddenByFilter !== undefined && hiddenByFilter > 0 && (
              <span className="text-fg-muted ml-1">
                {labels.hiddenSuffix(hiddenByFilter)}
              </span>
            )}
          </span>
          {onClear && (
            <Button
              variant="text"
              size="xs"
              iconOnly
              startIcon={X}
              aria-label={labels.clear}
              onClick={onClear}
            />
          )}
        </div>
      </div>
    )

    // Footer 模式:hint 在主 bar 上方;Top 模式:hint 在主 bar 下方
    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label={labels.toolbarAriaLabel}
        className={cn(
          'flex flex-col w-full',
          placement === 'bottom' && 'border-t border-divider',
          'motion-reduce:transition-none transition-opacity duration-150',
          className
        )}
      >
        {placement === 'bottom' && hintBanner}
        {mainBar}
        {placement === 'top' && hintBanner}
      </div>
    )
  }
)
BulkActionBar.displayName = 'BulkActionBar'

// Story auto-compile metadata(placement 是 functional 非視覺 variant,不入 variants)
export const bulkActionBarMeta = {
  component: 'BulkActionBar',
  family: null,
  variants: {},
  sizes: {},
  states: ['default'],
  tokens: {
    fg: ['text-fg-secondary', 'text-fg-muted', 'text-primary'],
    border: ['border-divider'],
  },
} as const

export { BulkActionBar }
