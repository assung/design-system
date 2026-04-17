import * as React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, type AvatarData } from '@/design-system/components/Avatar/avatar'
import { Button } from '@/design-system/components/Button/button'

/**
 * NameCard — 人員 HoverCard 的內容元件
 *
 * 放在 HoverCardContent 內使用，不包含 HoverCard wrapper。
 * Consumer 自行用 HoverCard + HoverCardTrigger 包 avatar/name。
 *
 * ── 結構 ──
 * 1. Profile header：avatar 64px + name + subtitle
 * 2. Action buttons（可選）：consumer 提供，通常是 tertiary buttons
 * 3. Status（可選）：在線狀態 + 狀態訊息
 * 4. Info fields（可選）：key-value 欄位（ID、Employee number）
 * 5. Footer（可選）：View more 連結
 *
 * 寬度由 HoverCardContent 控制（建議 320px）。
 * 各 section 用 border-divider 分隔。
 * px = 16px (px-4), section py = 12px (py-3)。
 */

const AVATAR_SIZE = 64

type StatusType = 'available' | 'away' | 'busy' | 'offline'

const STATUS_COLOR: Record<StatusType, string> = {
  available: 'bg-success',
  away: 'bg-warning',
  busy: 'bg-error',
  offline: 'bg-fg-muted',
}

const STATUS_LABEL: Record<StatusType, string> = {
  available: 'Available',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
}

function StatusDot({ status, className }: { status: StatusType; className?: string }) {
  return <span className={cn('inline-block w-2 h-2 rounded-full shrink-0', STATUS_COLOR[status], className)} />
}

export interface NameCardField {
  label: string
  value: string
}

export interface NameCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 姓名（必填） */
  name: string
  /** Avatar data */
  avatar?: AvatarData
  /** 副標（組織、ID、員工編號等） */
  subtitle?: string
  /** 在線狀態 */
  status?: StatusType
  /** 狀態訊息 */
  statusMessage?: React.ReactNode
  /** Action buttons（Chat、Audio call 等），consumer 自行組合 */
  actions?: React.ReactNode
  /** Key-value 欄位（ID、Employee number） */
  fields?: NameCardField[]
  /** View more 連結 */
  onViewMore?: () => void
  /** View more 文字，預設「View more」 */
  viewMoreLabel?: string
}

const NameCard = React.forwardRef<HTMLDivElement, NameCardProps>(
  (
    {
      name,
      avatar,
      subtitle,
      status,
      statusMessage,
      actions,
      fields,
      onViewMore,
      viewMoreLabel = 'View more',
      className,
      ...props
    },
    ref,
  ) => {
    const hasStatus = !!status
    const hasFields = fields && fields.length > 0

    return (
      <div ref={ref} className={cn('w-[320px]', className)} {...props}>
        {/* ── Profile header ── */}
        <div className="flex items-start gap-3 px-4 py-3">
          <Avatar
            src={avatar?.src}
            alt={avatar?.alt ?? name}
            color={avatar?.color}
            size={AVATAR_SIZE}
            className="shrink-0"
          />
          <div className="flex flex-col min-w-0 flex-1 pt-0.5">
            <span className="text-body-lg font-medium text-foreground">{name}</span>
            {subtitle && (
              <span className="flex items-center gap-1 text-caption text-fg-secondary mt-0.5">
                {status && <StatusDot status={status} />}
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* ── Action buttons ── */}
        {actions && (
          <div className="flex items-center gap-2 px-4 pb-3">
            {actions}
          </div>
        )}

        {/* ── Status + message ── */}
        {hasStatus && (
          <div className="border-t border-divider px-4 py-3">
            <div className="flex items-center gap-1.5 text-body">
              <StatusDot status={status!} />
              <span>{STATUS_LABEL[status!]}</span>
            </div>
            {statusMessage && (
              <div className="mt-2">
                <span className="text-caption text-fg-muted">Status message</span>
                <p className="text-body mt-0.5">{statusMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Info fields ── */}
        {hasFields && (
          <div className="border-t border-divider px-4 py-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {fields!.map((f) => (
                <div key={f.label} className="flex flex-col">
                  <span className="text-caption text-fg-muted">{f.label}</span>
                  <span className="text-body">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── View more ── */}
        {onViewMore && (
          <div className="border-t border-divider px-4 py-3">
            <Button variant="link" size="sm" onClick={onViewMore}>{viewMoreLabel}</Button>
          </div>
        )}
      </div>
    )
  },
)
NameCard.displayName = 'NameCard'

export { NameCard, StatusDot }
