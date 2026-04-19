import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Spinner — 載入中視覺 primitive
 *
 * 整個設計系統唯一的 loading 旋轉圖示。任何要表達「進行中」的元件都從這裡消費,
 * 不要 inline copy `<Loader2 className="animate-spin" />`。詳見 `spinner.spec.md`。
 *
 * ── 設計決策 ──
 * - 尺寸:自由 `size: number`(跟 Avatar / Lucide icon 同策略,不用 sm/md/lg enum)
 * - 顏色:`currentColor`(繼承父層 text color,消費者自己控制)
 * - A11y:不傳 `aria-label` 預設 `aria-hidden`(父層用 `aria-busy` 管理);
 *         傳 `aria-label` 自動變 `role="status"`(獨立 loading 區塊模式)
 */

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 尺寸(px)。預設 24。 */
  size?: number
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = 24, className, 'aria-label': ariaLabel, ...props }, ref) => {
    const hasLabel = typeof ariaLabel === 'string' && ariaLabel.length > 0
    return (
      <span
        ref={ref}
        // A11y:有 label → 自報 status;沒 label → 完全隱藏讓父層 aria-busy 負責
        role={hasLabel ? 'status' : undefined}
        aria-label={hasLabel ? ariaLabel : undefined}
        aria-hidden={hasLabel ? undefined : true}
        className={cn('inline-flex shrink-0', className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <Loader2
          className="animate-spin"
          // 直接傳 size 到 Lucide — 在某些 wrapper 內 CSS selector 會失效,
          // 顯式傳 prop 才可靠(對齊 item-anatomy.spec.md 的 ICON_SIZE 規則)
          size={size}
          aria-hidden
        />
      </span>
    )
  },
)
Spinner.displayName = 'Spinner'

export { Spinner }
