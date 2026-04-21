import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { X as XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { SurfaceHeader, SurfaceBody, SurfaceFooter } from "@/design-system/patterns/overlay-surface/overlay-surface"
import { Button } from "@/design-system/components/Button/button"

/**
 * Popover — Radix Popover + 設計系統 token
 *
 * ── 視覺 ──
 * 與 Dialog 對齊：bg-surface-raised / rounded-lg / border-border / elevation-200。
 * density 永遠鎖 md（non-modal 輕量浮層不隨頁面 density 放大）。
 *
 * ── 結構 ──
 * PopoverContent：外殼（bg / border / radius / shadow / density），無內距。
 * PopoverHeader / PopoverBody / PopoverFooter：消費 overlay-surface pattern
 * 共用的 SurfaceHeader / SurfaceBody / SurfaceFooter primitives(padding SSOT)。
 *
 * ── Header dismiss X(2026-04-20 決策) ──
 * 所有 PopoverHeader 一律附右上 X 按鈕(對齊 Dialog 的 canonical)。Popover 雖是
 * non-modal + click-outside-to-close,但有 header 的 Popover 通常結構化程度高
 * (title / 多區塊),明確的「關閉」入口讓使用者更易退出。無 header 的簡單 Popover
 * 不加 X(click-outside / Esc 即可)。
 */

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverClose = PopoverPrimitive.Close

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 8, collisionPadding = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      data-density="md"
      className={cn(
        "z-50 w-72 rounded-lg border border-border bg-surface-raised text-foreground shadow-[var(--elevation-200)] outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "origin-[var(--radix-popover-content-transform-origin)]",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

// PopoverHeader: SurfaceHeader + Close X(對齊 Dialog 的 canonical,見 docblock)
// justify-between 讓 children 與 Close 分左右。
interface PopoverHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 隱藏右上 close X(預設 false,顯示)。
   * Coachmark / Tour 類 composition 用 Skip / Done 自管 close,不需 X。
   */
  hideClose?: boolean
}

const PopoverHeader = React.forwardRef<HTMLDivElement, PopoverHeaderProps>(
  ({ className, children, hideClose = false, ...props }, ref) => (
    <SurfaceHeader
      ref={ref}
      className={cn("justify-between", className)}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {!hideClose && (
        <PopoverPrimitive.Close asChild>
          <Button iconOnly dismiss size="sm" startIcon={XIcon} aria-label="關閉" />
        </PopoverPrimitive.Close>
      )}
    </SurfaceHeader>
  ),
)
PopoverHeader.displayName = "PopoverHeader"

const PopoverBody = SurfaceBody
const PopoverFooter = SurfaceFooter

const PopoverTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-body font-medium truncate", className)}
    {...props}
  />
))
PopoverTitle.displayName = "PopoverTitle"

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverTitle,
}
