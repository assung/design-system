import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Overlay Surface primitives — Dialog / Popover 共用結構化 sub-components。
 *
 * 抽象這層避免 Dialog 與 Popover 各自硬寫 padding / border 導致漂移。
 * 兩邊都消費這些 primitive,有特殊行為（Dialog Close 按鈕 / viewport-fill 高度）
 * 由 Dialog 額外包裝,不污染 primitive。
 *
 * ── Token 規則 ──
 * padding: px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]
 * 分隔線: border-{b|t} border-divider
 * Header / Footer 為 shrink-0 維持高度固定,中間 Body 負責 flex-grow（consumer 決定）
 */

export const SurfaceHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-2 shrink-0 border-b border-divider',
      'px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]',
      className,
    )}
    {...props}
  />
))
SurfaceHeader.displayName = 'SurfaceHeader'

export const SurfaceBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]',
      className,
    )}
    {...props}
  />
))
SurfaceBody.displayName = 'SurfaceBody'

export const SurfaceFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end gap-2 shrink-0 border-t border-divider',
      'px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]',
      className,
    )}
    {...props}
  />
))
SurfaceFooter.displayName = 'SurfaceFooter'
