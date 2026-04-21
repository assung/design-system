import * as React from 'react'
import { X as XIcon, Info, CircleCheck, TriangleAlert, XCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/design-system/components/Button/button'

/**
 * Notice — Toast / Alert 共用的視覺佈局層
 *
 * ── Typography: md tier ──
 * title: text-body (14px) leading-compact — 有 description 時加 font-medium
 * description: text-body (14px) leading-compact + text-fg-secondary (neutral-8)
 * 14px 配 14px — 視覺層級靠 font-weight + color 區分,不靠 font-size。
 *
 * ── Padding（固定,不隨 density 變） ──
 * px = px-4（16px）
 * py = py-3（12px）
 * gap = gap-2（8px）
 * Toast/Alert 是浮動通知,不是工作區域元件——density 控制表單/選單的緊湊度,
 * 通知的尺寸應該固定,不隨 density 縮放。
 *
 * ── Icon: md tier ──
 * icon size: 16px（ICON_SIZE.md）
 *
 * ── Dismiss X(chrome corner close,Cat 3 Action group region)──
 * 用 Button iconOnly dismiss size="sm" — 非 Inline Action、非自刻 button。
 * Rationale:Alert / Toast 右上 X 屬 action group region(實務上 close 左側可加 refresh / share
 * + Separator),統一 Button iconOnly。`dismiss` prop 自動套 variant="text" + fg-muted override。
 * SSOT:patterns/element-anatomy/item-anatomy.spec.md「Dismiss canonical — X close only」
 *      + components/Alert/alert.spec.md「Chrome corner close X canonical」。
 */

export type NoticeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error'

const VARIANT_ICON: Record<NoticeVariant, LucideIcon | null> = {
  neutral: null,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: XCircle,
}

export const SUBTLE_ICON_COLOR: Record<NoticeVariant, string> = {
  neutral: 'text-fg-muted',
  info: 'text-info-text',
  success: 'text-success-text',
  warning: 'text-warning-text',
  error: 'text-error-text',
}

const NOTICE_LAYOUT = [
  'flex items-start gap-2 w-full',
  'text-body leading-compact',
  'px-4 py-3',
].join(' ')

export interface NoticeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: NoticeVariant
  title: string
  description?: string
  endContent?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  iconClassName?: string
}

const Notice = React.forwardRef<HTMLDivElement, NoticeProps>(
  (
    {
      variant = 'neutral',
      title,
      description,
      endContent,
      dismissible = true,
      onDismiss,
      iconClassName,
      className,
      ...props
    },
    ref,
  ) => {
    const StatusIcon = VARIANT_ICON[variant]

    return (
      <div
        ref={ref}
        role="status"
        className={cn(NOTICE_LAYOUT, className)}
        {...props}
      >
        {StatusIcon && (
          <span className="h-[1lh] shrink-0 flex items-center">
            <StatusIcon size={16} className={cn('shrink-0', iconClassName)} aria-hidden />
          </span>
        )}

        <div className="flex flex-col min-w-0 flex-1">
          <span className={cn('truncate', description && 'font-medium')}>
            {title}
          </span>
          {description && (
            // title → description 的 2px 間距 canonical(對齊 SelectionItem / item-anatomy Family 2)。
            // 先前漏寫 → 標題與描述擠在一起(本次 AR 由 user 主動抓出)。
            <span className="mt-0.5 text-fg-secondary">
              {description}
            </span>
          )}
        </div>

        {(endContent || dismissible) && (
          <div className="flex items-center gap-2 shrink-0 h-[1lh]">
            {endContent}
            {dismissible && (
              <Button
                iconOnly
                dismiss
                size="sm"
                startIcon={XIcon}
                aria-label="關閉通知"
                onClick={onDismiss}
              />
            )}
          </div>
        )}
      </div>
    )
  },
)
Notice.displayName = 'Notice'

export function useInverseTheme(): 'dark' | 'light' {
  const [inverse, setInverse] = React.useState<'dark' | 'light'>('dark')

  React.useEffect(() => {
    const root = document.documentElement
    const update = () => {
      const current = root.getAttribute('data-theme') ?? 'light'
      setInverse(current === 'dark' ? 'light' : 'dark')
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return inverse
}

export { Notice }
