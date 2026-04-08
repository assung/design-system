import * as React from 'react'
import { User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

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

// ── 語義色對應 ──
// 色彩對齊 Tag 元件：neutral 用 foreground，有色用 step-7（非 step-6）優先辨識度
const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  neutral:   { bg: 'var(--muted)',              text: 'var(--foreground)' },
  blue:      { bg: 'var(--info-subtle)',        text: 'var(--color-blue-7)' },
  red:       { bg: 'var(--error-subtle)',       text: 'var(--color-deep-orange-7)' },
  green:     { bg: 'var(--success-subtle)',     text: 'var(--color-green-7)' },
  yellow:    { bg: 'var(--warning-subtle)',     text: 'var(--color-yellow-7)' },
  turquoise: { bg: 'var(--turquoise-subtle)',   text: 'var(--color-turquoise-7)' },
  purple:    { bg: 'var(--purple-subtle)',      text: 'var(--color-purple-7)' },
  magenta:   { bg: 'var(--magenta-subtle)',     text: 'var(--color-magenta-7)' },
  indigo:    { bg: 'var(--indigo-subtle)',      text: 'var(--color-indigo-7)' },
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
  /** 尺寸（px），預設 32 */
  size?: number
  /** 形狀：circle（人物）或 square（實體），預設 circle */
  shape?: 'circle' | 'square'
  /** 圖片 URL */
  src?: string
  /** 替代文字（圖片失敗時取首字作 fallback） */
  alt?: string
  /** Icon 模式（LucideIcon） */
  icon?: LucideIcon
  /** Icon / text fallback 的背景色，預設 neutral */
  color?: keyof typeof COLOR_MAP
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 32, shape = 'circle', src, alt, icon: Icon, color = 'neutral', className, style, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false)
    const iconPx = getIconSize(size)
    const fontSize = Math.round(size * 0.5)
    const colors = COLOR_MAP[color] ?? COLOR_MAP.neutral
    const radius = shape === 'circle' ? '9999px' : '4px'

    // 決定內容
    const showImage = src && !imgError
    const showIcon = !showImage && (Icon || (!alt))
    const showText = !showImage && !showIcon && alt

    const FallbackIcon = Icon ?? User

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center justify-center shrink-0 overflow-hidden select-none', className)}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: showImage ? undefined : colors.bg,
          color: showImage ? undefined : colors.text,
          ...style,
        }}
        data-avatar-size={size}
        {...props}
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
          <FallbackIcon size={iconPx} aria-hidden />
        )}
        {showText && (
          <span
            className="font-medium leading-none"
            style={{ fontSize }}
            aria-hidden
          >
            {getInitial(alt!)}
          </span>
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar }
