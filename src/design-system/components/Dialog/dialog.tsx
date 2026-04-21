import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X as XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/design-system/components/Button/button"
import { SurfaceHeader, SurfaceBody, SurfaceFooter } from "@/design-system/patterns/overlay-surface/overlay-surface"

/**
 * Dialog (Modal) — Radix Dialog + 設計系統 token
 *
 * ── Layout ──
 * px = layout-space-loose, header/footer py = layout-space-tight。
 * Body pt = layout-space-tight, pb = layout-space-bottom。
 * data-density="lg" 讓所有 token 解析為 lg。
 *
 * ── Viewport Inset ──
 * Modal 與 viewport 四邊保持 layout-space-bottom (48px) 最小間距。
 *
 * ── 高度行為 ──
 * 預設：height 填滿 viewport（扣除 inset），body 捲動。防止動態內容跳動。
 * height="auto"：高度隨內容，超過 viewport 時 max-height 安全帽。
 */

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// Modal 與 viewport 四邊的最小間距 = layout-space-bottom (48px)
const DIALOG_INSET_VAR = 'var(--layout-space-bottom)'

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-overlay",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** 最大寬度。預設 512px。傳 number 視為 px。 */
  maxWidth?: string | number
  /**
   * 高度模式。
   * - 不傳（預設）：填滿 viewport（height = 100vh - inset*2），body 捲動。防止內容跳動。
   * - true：高度隨內容，超過 viewport 時捲動（max-height 安全帽）。
   */
  autoHeight?: boolean
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, maxWidth = '512px', autoHeight, children, style, ...props }, ref) => {
  const insetCalc = `${DIALOG_INSET_VAR} * 2`
  const viewportH = `calc(100vh - ${insetCalc})`
  const maxWidthCss = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth

  const heightStyle: React.CSSProperties = autoHeight
    ? { maxHeight: viewportH }
    : { height: viewportH }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-density="lg"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
          "flex flex-col bg-surface-raised rounded-lg border border-border",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className,
        )}
        style={{
          boxShadow: 'var(--elevation-200)',
          maxWidth: `min(${maxWidthCss}, calc(100vw - ${insetCalc}))`,
          ...heightStyle,
          ...style,
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

// DialogHeader: SurfaceHeader + Close 按鈕(Dialog 特有)
// justify-between 讓 children 與 Close 分左右;Close 用 Radix DialogPrimitive.Close 包裝。
const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <SurfaceHeader
    ref={ref}
    className={cn("justify-between", className)}
    {...props}
  >
    <div className="flex-1 min-w-0">{children}</div>
    <DialogPrimitive.Close asChild>
      <Button iconOnly dismiss size="sm" startIcon={XIcon} aria-label="關閉" />
    </DialogPrimitive.Close>
  </SurfaceHeader>
))
DialogHeader.displayName = "DialogHeader"

// DialogBody: SurfaceBody + viewport-fill 行為(Dialog 特有)
// flex-1 + overflow-y-auto 撐滿 viewport 高度;pb-bottom 覆寫 SurfaceBody 預設對稱 padding,
// 讓 Dialog body 底部多一拍呼吸(符合 Dialog 「大容器」語感)。
const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SurfaceBody
    ref={ref}
    className={cn(
      "flex-1 overflow-y-auto pb-[var(--layout-space-bottom)]",
      className,
    )}
    {...props}
  />
))
DialogBody.displayName = "DialogBody"

// DialogFooter: SurfaceFooter 直接 re-export alias(無 Dialog 特有行為)
const DialogFooter = SurfaceFooter

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-body-lg font-medium truncate", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    // title → description 的 2px 間距 canonical(item-anatomy Family 2)
    className={cn("mt-0.5 text-body text-fg-secondary", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
