import * as React from 'react'
import { User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/design-system/components/HoverCard/hover-card'
import { Badge } from '@/design-system/components/Badge/badge'

/**
 * Avatar — 頭像元件
 *
 * 三種內容模式（按優先順序）：
 *   1. src → 圖片
 *   2. icon → icon 在底色圓/方形內
 *   3. alt → 取首字作文字 fallback
 *   4. 都沒有 → 預設 User icon
 *
 * ── 尺寸 ──
 *   size 接受任意 px 值，icon 自動 = round_even(size × 0.6)
 *   文字 fallback 字體 = size × 0.5
 *
 * ── 形狀 ──
 *   circle（預設）→ rounded-full，用於人物
 *   square → rounded-md (4px)，用於實體（專案、組織、App）
 */

// ── 色彩 ──
// 直接引用 primitive（bg=step-1, text=step-7），不經過語義層
// solid：step-6 全色底 + 白色前景（yellow 例外用 --warning-foreground）
// neutral solid：neutral-9 + --inverse-fg（自動反轉）
type ColorKey = 'neutral' | 'blue' | 'red' | 'green' | 'yellow' | 'turquoise' | 'purple' | 'magenta' | 'indigo'
type VariantKey = 'subtle' | 'solid'

const COLOR_MAP: Record<VariantKey, Record<ColorKey, { bg: string; text: string }>> = {
  subtle: {
    neutral:   { bg: 'var(--muted)',                text: 'var(--foreground)' },
    blue:      { bg: 'var(--color-blue-1)',         text: 'var(--color-blue-7)' },
    red:       { bg: 'var(--color-deep-orange-1)',  text: 'var(--color-deep-orange-7)' },
    green:     { bg: 'var(--color-green-1)',        text: 'var(--color-green-7)' },
    yellow:    { bg: 'var(--color-yellow-1)',       text: 'var(--color-yellow-7)' },
    turquoise: { bg: 'var(--color-turquoise-1)',    text: 'var(--color-turquoise-7)' },
    purple:    { bg: 'var(--color-purple-1)',       text: 'var(--color-purple-7)' },
    magenta:   { bg: 'var(--color-magenta-1)',      text: 'var(--color-magenta-7)' },
    indigo:    { bg: 'var(--color-indigo-1)',       text: 'var(--color-indigo-7)' },
  },
  solid: {
    neutral:   { bg: 'var(--color-neutral-9)',      text: 'var(--inverse-fg)' },
    blue:      { bg: 'var(--color-blue-6)',         text: 'var(--on-emphasis)' },
    red:       { bg: 'var(--color-deep-orange-6)',  text: 'var(--on-emphasis)' },
    green:     { bg: 'var(--color-green-6)',        text: 'var(--on-emphasis)' },
    yellow:    { bg: 'var(--color-yellow-6)',       text: 'var(--warning-foreground)' },
    turquoise: { bg: 'var(--color-turquoise-6)',    text: 'var(--on-emphasis)' },
    purple:    { bg: 'var(--color-purple-6)',       text: 'var(--on-emphasis)' },
    magenta:   { bg: 'var(--color-magenta-6)',      text: 'var(--on-emphasis)' },
    indigo:    { bg: 'var(--color-indigo-6)',       text: 'var(--on-emphasis)' },
  },
}

// ── Icon size: round to nearest even, ≈ 60% ──
function getIconSize(avatarSize: number): number {
  return Math.round((avatarSize * 0.6) / 2) * 2
}

// ── Text fallback: first character ──
function getInitial(text: string): string {
  return text.trim().charAt(0).toUpperCase()
}

// ── Component ──

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 尺寸：number (px) 或 'fill'（填滿父容器，由父層決定大小）。預設 32 */
  size?: number | 'fill'
  /** 形狀：circle（人物）或 square（實體），預設 circle */
  shape?: 'circle' | 'square'
  /** 圖片 URL */
  src?: string
  /** 替代文字（圖片失敗時取首字作 fallback） */
  alt?: string
  /** Icon 模式（LucideIcon） */
  icon?: LucideIcon
  /** Icon / text fallback 的背景色，預設 neutral */
  color?: ColorKey
  /** 深底白字模式（step-6 背景 + 白色前景，warning 例外），預設 false */
  solid?: boolean
  /**
   * 在線狀態指示器(presence),顯示在 avatar **右下角**。
   * 世界級對照:Slack / Teams / Discord — `online` 是最廣泛被理解的術語。
   * 位置語義:右下 = "此人的 presence"(使用者聚焦於「這個人是誰 + 現在 在不在」)。
   */
  status?: 'online' | 'away' | 'busy' | 'offline'
  /**
   * 未讀 / 通知計數 badge,顯示在 avatar **右上角**。
   * 世界級對照:chat app(iMessage / Slack thread / LINE / WhatsApp)一律右上角。
   * 位置語義:右上 = "關於此對話的新事件數量"(使用者聚焦於「有多少未處理」);
   * 與右下的 presence 共存不衝突(不同角、不同語義)。
   * `> 99` 自動顯示 "99+"(交給內部 Badge 的 `max` 行為)。
   */
  badgeCount?: number
  /**
   * 傳入 HoverCard 內容（如 NameCard），hover avatar 時自動顯示。
   * 只有人員 avatar 需要傳；實體 avatar（專案、組織）不傳。
   */
  hoverCard?: React.ReactNode
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 32, shape = 'circle', src, alt, icon: Icon, color = 'neutral', solid = false, status, badgeCount, hoverCard, className, style, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false)
    const isFill = size === 'fill'
    // Fill 模式下 icon 用 60% 寬高、text 用 50cqi（container query inline-size）；
    // 數字模式下用既有 px 計算
    const numSize = isFill ? 32 : (size as number)
    const iconPx = getIconSize(numSize)
    const fontSizePx = Math.round(numSize * 0.5)
    const variantKey: VariantKey = solid ? 'solid' : 'subtle'
    const colors = COLOR_MAP[variantKey]?.[color] ?? COLOR_MAP.subtle.neutral
    const radius = shape === 'circle' ? '9999px' : '4px'

    // 決定內容
    const showImage = src && !imgError
    const showIcon = !showImage && (Icon || (!alt))
    const showText = !showImage && !showIcon && alt

    const FallbackIcon = Icon ?? User

    // Status dot 尺寸:avatar 的 28%(Slack / Teams / Discord 世界級平均),
    // clamp [8, 16] — floor 8 保小 avatar 仍可辨識但不喧賓奪主(10 floor 會讓 24px
    // avatar 的 dot 占 42% 太大);ceiling 16 防大 avatar dot 過度放大
    const dotSize = isFill ? 10 : Math.max(8, Math.min(16, Math.round(numSize * 0.28)))
    // Border ring 在 surface 上分離 dot 與 avatar,dotSize ≥ 12 時升階到 3px 保持視覺比例
    const dotBorder = dotSize >= 12 ? 3 : 2

    // Semantic presence tokens — 見 color/semantic.css
    const STATUS_DOT_COLOR: Record<string, string> = {
      online: 'var(--status-online)',
      away: 'var(--status-away)',
      busy: 'var(--status-busy)',
      offline: 'var(--status-offline)',
    }

    const avatarEl = (
      <div
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden select-none',
          isFill && 'w-full h-full',
        )}
        style={{
          ...(isFill
            ? { containerType: 'inline-size' as React.CSSProperties['containerType'] }
            : { width: numSize, height: numSize }),
          borderRadius: radius,
          backgroundColor: showImage ? undefined : colors.bg,
          color: showImage ? undefined : colors.text,
        }}
        data-avatar-size={isFill ? 'fill' : numSize}
      >
        {showImage && (
          <img
            src={src}
            alt={alt ?? ''}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
        {showIcon && (
          isFill
            ? <FallbackIcon className="w-[60%] h-[60%]" aria-hidden />
            : <FallbackIcon size={iconPx} aria-hidden />
        )}
        {showText && (
          <span
            className="font-medium leading-none"
            style={{ fontSize: isFill ? '50cqi' : fontSizePx }}
            aria-hidden
          >
            {getInitial(alt!)}
          </span>
        )}
      </div>
    )

    const hasOverlay = status || typeof badgeCount === 'number'
    const baseEl = !hasOverlay
      ? <div ref={ref} className={cn('inline-flex shrink-0', className)} style={style} {...props}>{avatarEl}</div>
      : (
        <div ref={ref} className={cn('relative inline-flex shrink-0', className)} style={style} {...props}>
          {avatarEl}
          {/* Status dot:bottom-right(presence — 世界級對照 Slack / Teams / Discord),
              落在 circle avatar 圓周 45° 位置 / square avatar 右下直角;
              border ring 用 surface 色讓 dot 從 avatar 邊界視覺分離 */}
          {status && (
            <span
              className="absolute block rounded-full"
              style={{
                width: dotSize,
                height: dotSize,
                bottom: 0,
                right: 0,
                backgroundColor: STATUS_DOT_COLOR[status],
                boxShadow: `0 0 0 ${dotBorder}px var(--surface-raised, var(--canvas))`,
              }}
              role="status"
              aria-label={`presence: ${status}`}
            />
          )}
          {/* Count badge:top-right(chat 未讀 / 通知計數 — 世界級對照 iMessage /
              Slack thread / LINE / WhatsApp)。消費 DS Badge(critical variant),
              再加 ring 與 avatar 分離 */}
          {typeof badgeCount === 'number' && badgeCount > 0 && (
            <Badge
              variant="critical"
              count={badgeCount}
              max={99}
              className="absolute -top-1 -right-1"
              style={{
                boxShadow: `0 0 0 2px var(--surface-raised, var(--canvas))`,
              }}
              aria-label={`${badgeCount} unread`}
            />
          )}
        </div>
      )

    if (!hoverCard) return baseEl

    return (
      <HoverCard openDelay={300} closeDelay={200}>
        <HoverCardTrigger asChild>
          {baseEl}
        </HoverCardTrigger>
        <HoverCardContent className="bg-surface-raised rounded-lg border border-border" style={{ boxShadow: 'var(--elevation-200)' }}>
          {hoverCard}
        </HoverCardContent>
      </HoverCard>
    )
  }
)
Avatar.displayName = 'Avatar'

// ── AvatarData ─────────────────────────────────────────────────────────────
// 資料型別，讓 consumer 傳資料而非 ReactNode。
// 接收端內部用 Avatar 元件渲染，統一控制尺寸與 fallback。

export interface AvatarData {
  /** 圖片 URL */
  src?: string
  /** 替代文字（圖片失敗時取首字作 fallback） */
  alt: string
  /** Icon / text fallback 的背景色，預設 neutral */
  color?: ColorKey
  /**
   * Person avatar hover NameCard(DS-wide canonical,person avatar 預設必有,見 avatar.spec.md)。
   * Entity avatar(專案 / 組織 logo)不帶 → consumer 不傳 hoverCard 即豁免。
   * 所有消費 AvatarData 的 primitive(MenuItem / DropdownMenu / SelectMenu / SelectionItem / NameCard)
   * 需 forward 此 prop 到內部 <Avatar hoverCard={avatar.hoverCard} />。
   */
  hoverCard?: React.ReactNode
}

export { Avatar }
