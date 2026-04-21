import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SurfaceHeader,
  SurfaceBody,
  SurfaceFooter,
} from "@/design-system/patterns/overlay-surface/overlay-surface"
import { ItemInlineActionButton } from "@/design-system/patterns/element-anatomy/item-anatomy"

/**
 * Sheet — **右側 Dialog primitive**(給消費者的 canonical)。
 *
 * ── 定位(2026-04-21 canonical)──
 * Sheet 給**消費者**用的唯一合法形式 = **右側開啟的 modal**(side="right"),
 * 內部結構跟 `Dialog` 一致:`SheetHeader` / `SheetBody` / `SheetFooter`(各自消費
 * `SurfaceHeader` / `SurfaceBody` / `SurfaceFooter` primitive,padding token SSOT
 * 在 `patterns/overlay-surface/`)。side="right" 是 defaultVariants,消費者不傳 side。
 *
 * ── 其他 side(top / bottom / left)——**非消費者 API**,內部基建用 ──
 * top / bottom / left 變體保留給 DS 內部基建(例:Sidebar 在小尺寸視口時從 left 滑入)。
 * 消費者 code **禁止** 傳 `side="top" | "bottom" | "left"` — 這些用途需 user 授權。
 *
 * ── 跟 Dialog 的差異 ──
 * - Dialog = 中央 modal,用於「明確決策 / 表單 / 確認」
 * - Sheet(side="right")= 側滑 modal,用於「補充資訊 / 多欄位表單 / 編輯 flow」
 * - 兩者 API 結構 1:1 對應,差異只在 side / 動畫 / 初始寬度
 *
 * ── Header / Body / Footer 消費 SurfaceXxx SSOT ──
 * 避免 padding 漂移 — Dialog / Popover / Sheet / Coachmark 共用同一套 overlay-surface
 * padding token(px-loose / py-tight),改 overlay-surface.tsx 四者自動跟進。
 */

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

// ── sheetVariants ─────────────────────────────────────────────────────────
// side="right" 給**消費者**。top/bottom/left 給 **DS 內部基建**用(如 Sidebar 在
// narrow viewport 時切 side="left")。消費者 code 不傳 side,用 default。
const sheetVariants = cva(
  // 核心容器 — 無 padding(由 SheetBody / SheetHeader / SheetFooter 自理 padding,
  // 對齊 overlay-surface pattern + Dialog canonical)
  "fixed z-50 flex flex-col bg-surface-raised shadow-[var(--elevation-200)] transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-divider data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t border-divider data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r border-divider data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-md",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l border-divider data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-md",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

// ── SheetHeader:SurfaceHeader + Close X(對齊 DialogHeader canonical)──────────
const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <SurfaceHeader
    ref={ref}
    className={cn("justify-between", className)}
    {...props}
  >
    <div className="flex-1 min-w-0">{children}</div>
    <SheetPrimitive.Close asChild>
      <ItemInlineActionButton icon={X} aria-label="關閉" size="md" />
    </SheetPrimitive.Close>
  </SurfaceHeader>
))
SheetHeader.displayName = "SheetHeader"

// ── SheetBody:flex-1 + overflow-y-auto(對齊 DialogBody) ─────────────────────
const SheetBody = React.forwardRef<
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
SheetBody.displayName = "SheetBody"

// ── SheetFooter:SurfaceFooter 直接 re-export ─────────────────────────────────
const SheetFooter = SurfaceFooter

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-body-lg font-medium truncate text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-body text-fg-secondary", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetVariants,
}
