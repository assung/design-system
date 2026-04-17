import * as React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, type AvatarData } from '@/design-system/components/Avatar/avatar'
import { Button } from '@/design-system/components/Button/button'
import { Alert } from '@/design-system/components/Alert/alert'
import { DescriptionList, DescriptionItem } from '@/design-system/components/DescriptionList/description-list'

/**
 * NameCard — 人員 HoverCard 的內容元件
 *
 * ── Padding ──
 * px-4 (16px) py-2 (8px) 固定——compact hover card 不需要大 padding。
 *
 * ── Avatar 對齊 ──
 * 跟 FileItem detail 統一：右側 text column 用 justify-center + minHeight=avatar。
 * 短文字置中於 avatar，長文字（多行名字）自然撐高。
 *
 * ── View more ──
 * Button link w-full——card footer 的 action 填滿容器。
 *
 * ── DataField ──
 * Status message、ID、Employee number 都用 DataField（label + value 統一規格）。
 */

const AVATAR_SIZE = 64

type StatusType = 'available' | 'away' | 'busy' | 'offline'

const STATUS_LABEL: Record<StatusType, string> = {
  available: 'Available',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
}

export interface NameCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  avatar?: AvatarData
  subtitle?: string
  status?: StatusType
  statusMessage?: React.ReactNode
  actions?: React.ReactNode
  fields?: { label: string; value: string }[]
  onViewMore?: () => void
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
        {/* ── Profile header: avatar + name ── */}
        <div className="flex items-start gap-3 px-4 py-3">
          <Avatar
            src={avatar?.src}
            alt={avatar?.alt ?? name}
            color={avatar?.color}
            size={AVATAR_SIZE}
            status={status}
            className="shrink-0"
          />
          <div
            className="flex flex-col justify-center min-w-0 flex-1"
            style={{ minHeight: AVATAR_SIZE }}
          >
            <span className="text-body-lg font-medium text-foreground">{name}</span>
            {subtitle && (
              <span className="text-body text-fg-secondary mt-0.5">{subtitle}</span>
            )}
          </div>
        </div>

        {/* ── Action buttons ── */}
        {actions && (
          <div className="flex items-center gap-2 px-4 pb-3">
            {actions}
          </div>
        )}

        {/* ── Status: neutral Alert (無 dismiss) ── */}
        {hasStatus && (
          <div className="border-t border-divider px-4 py-3">
            <Alert
              variant="neutral"
              appearance="subtle"
              dismissible={false}
              title={STATUS_LABEL[status!]}
              description={statusMessage ? String(statusMessage) : undefined}
            />
          </div>
        )}

        {/* ── Info fields ── */}
        {hasFields && (
          <div className="border-t border-divider px-4 py-3">
            <DescriptionList cols={2}>
              {fields!.map((f) => (
                <DescriptionItem key={f.label} label={f.label}>{f.value}</DescriptionItem>
              ))}
            </DescriptionList>
          </div>
        )}

        {/* ── View more ── */}
        {onViewMore && (
          <div className="border-t border-divider px-4 py-2">
            <Button variant="link" size="sm" onClick={onViewMore} className="w-full">{viewMoreLabel}</Button>
          </div>
        )}
      </div>
    )
  },
)
NameCard.displayName = 'NameCard'

export { NameCard }
