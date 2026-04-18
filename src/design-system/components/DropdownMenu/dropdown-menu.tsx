import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { ChevronRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AvatarData } from "@/design-system/components/Avatar/avatar"
import { MenuItem } from "@/design-system/components/Menu/menu-item"
import {
  RowSizeProvider,
  useRowSize,
  ICON_SIZE as ROW_ICON_SIZE,
  type RowSize,
} from "@/design-system/patterns/item-layout/item-layout"

/**
 * DropdownMenu — Radix DropdownMenu + MenuItem visual layer
 *
 * 架構分工：
 * - Radix primitives：behavior（keyboard nav, focus management, aria roles）
 * - MenuItem：visual（layout, padding, icon alignment, typography）
 *
 * Radix primitive 是外層容器，控制 focus:bg-neutral-hover。
 * MenuItem 內層只負責佈局，不加互動樣式。
 */

// ── Floating layer 共用樣式 ──
const floatingLayerClass = [
  'z-50 overflow-hidden rounded-lg border border-border bg-surface-raised',
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  'origin-[var(--radix-dropdown-menu-content-transform-origin)]',
].join(' ')

// ── Size:統一用 RowSizeContext(item-layout module),消除本地 SizeContext 漂移 ──
type SizeKey = RowSize
// Re-export for backward compat(內部命名)
const ICON_SIZE = ROW_ICON_SIZE

// ── Shared item classes on Radix primitive ──
const radixItemClass = [
  'relative cursor-pointer select-none outline-none',
  'transition-colors duration-150',
  'focus:bg-neutral-hover',
  'data-[disabled]:pointer-events-none data-[disabled]:text-fg-disabled data-[disabled]:cursor-default',
].join(' ')

// ── Root ──
const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn('outline-none', className)}
    {...props}
  />
))
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName
// DropdownMenuGroup — 對齊 MenuGroup 的 group separation 設計語言
//
// 設計語言(跨 Menu-like 元件統一,SSOT 見 item-layout.spec.md
// 「Group auto-separation」):
//   每個 group 上下各 8px padding,相鄰 group 之間用 border-divider 分隔
//   兩個 group 之間視覺 gap = 8px(上一個 bottom)+ 8px(下一個 top)= 16px + border
//
// MenuGroup(menu-item.tsx)實作:`py-2 [&+&]:border-t [&+&]:border-divider`
//   (在 Command.List 下提供 Content 邊界 8px + group 間 16px gap)
//
// DropdownMenuGroup(本元件)實作:`[&+&]:mt-2 [&+&]:pt-2 [&+&]:border-t
// [&+&]:border-divider`(因為 DropdownMenuContent 已有 py-2 提供 Content 邊界
// 的 8px,只需在第二個起的 group 加 8+8 = 16px gap + border)
//
// **視覺結果等同**:兩種實作的 visual output 一致,只是「padding 住在哪層」
// 不同。不強制統一 CSS 表達式——DropdownMenuContent 的 py-2 是既有 Radix
// 期望的行為,移除會影響 trigger 鍵盤導覽的 focus offset。
const DropdownMenuGroup = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Group>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Group
    ref={ref}
    className={cn('[&+&]:border-t [&+&]:border-divider [&+&]:mt-2 [&+&]:pt-2', className)}
    {...props}
  />
))
DropdownMenuGroup.displayName = 'DropdownMenuGroup'

const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

// ── Content ──
interface DropdownMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
  size?: SizeKey
  /** 最小寬度（px），預設跟隨觸發元件寬度 */
  minWidth?: number
  /** 最大高度（px），超過時捲動 */
  maxHeight?: number
}

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, size = 'md', sideOffset = 8, align = 'start', minWidth, maxHeight, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      onCloseAutoFocus={(e) => e.preventDefault()}
      className={cn(floatingLayerClass, 'py-2', maxHeight && 'overflow-y-auto', className)}
      style={{
        boxShadow: 'var(--elevation-200)',
        minWidth: minWidth ?? 'max(180px, var(--radix-dropdown-menu-trigger-width))',
        maxHeight,
      }}
      {...props}
    >
      <RowSizeProvider value={size}>
        {children}
      </RowSizeProvider>
    </DropdownMenuPrimitive.Content>
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

// ── SubContent ──
const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, children, ...props }, ref) => {
  const size = useRowSize()
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      sideOffset={8}
      className={cn(floatingLayerClass, 'py-2', className)}
      style={{ boxShadow: 'var(--elevation-200)', minWidth: 180 }}
      {...props}
    >
      <RowSizeProvider value={size}>
        {children}
      </RowSizeProvider>
    </DropdownMenuPrimitive.SubContent>
  )
})
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

// ── Helper: build endContent from badge + endIcon + shortcut ──
function buildEndContent(
  size: SizeKey,
  badge?: React.ReactNode,
  endIcon?: LucideIcon,
  shortcut?: string,
): React.ReactNode | undefined {
  const EndIcon = endIcon
  if (!badge && !EndIcon && !shortcut) return undefined
  const iconPx = ICON_SIZE[size]
  return (
    <>
      {badge}
      {EndIcon && <EndIcon size={iconPx} className="text-fg-muted" aria-hidden />}
      {shortcut && <span className="text-caption text-fg-muted">{shortcut}</span>}
    </>
  )
}

// ── Item ──
interface DropdownMenuItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>, 'children'> {
  children: React.ReactNode
  /** 左側 icon */
  startIcon?: LucideIcon
  /** 左側頭像資料（AvatarData），與 startIcon 互斥 */
  avatar?: AvatarData
  /** 次要說明文字 */
  description?: React.ReactNode
  /** 後綴 Tag（ReactNode） */
  tag?: React.ReactNode
  /** 後綴 Badge（ReactNode） */
  badge?: React.ReactNode
  /** 後綴指示型 icon（LucideIcon），fg-muted */
  endIcon?: LucideIcon
  /** 鍵盤快捷鍵 */
  shortcut?: string
  /** 單選選中（bg-neutral-selected，持續選中狀態）*/
  selected?: boolean
}

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, children, startIcon, avatar, description, tag, badge, endIcon, shortcut, selected, disabled, ...props }, ref) => {
  const size = useRowSize()
  const endContent = buildEndContent(size, badge, endIcon, shortcut)

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      disabled={disabled}
      className={cn(
        radixItemClass,
        selected && 'bg-neutral-selected',
        className,
      )}
      {...props}
    >
      <MenuItem
        size={size}
        startIcon={startIcon}
        avatar={avatar}
        description={description}
        tag={tag}
        endContent={endContent}
        disabled={disabled}
        // Pure visual — Radix parent handles role/aria/interaction
        role="presentation"
        className="!bg-transparent hover:!bg-transparent pointer-events-none"
      >
        {children}
      </MenuItem>
    </DropdownMenuPrimitive.Item>
  )
})
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

// ── SubTrigger（子選單觸發器，自動附加 ChevronRight）──
interface DropdownMenuSubTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>, 'children'> {
  children: React.ReactNode
  /** 左側 icon */
  startIcon?: LucideIcon
  /** 子選單目前狀態值文字（如 "深色"） */
  value?: string
  /** 子選單狀態 badge */
  badge?: React.ReactNode
}

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(({ className, children, startIcon, value, badge, ...props }, ref) => {
  const size = useRowSize()
  const iconPx = ICON_SIZE[size]

  // SubTrigger suffix: [value?] [badge?] [ChevronRight] with gap-1
  const endContent = (
    <div className="flex items-center gap-1">
      {value && <span className="text-fg-muted">{value}</span>}
      {badge}
      <ChevronRight size={iconPx} className="text-fg-muted" />
    </div>
  )

  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        radixItemClass,
        'data-[state=open]:bg-neutral-hover',
        className,
      )}
      {...props}
    >
      <MenuItem
        size={size}
        startIcon={startIcon}
        endContent={endContent}
        role="presentation"
        className="!bg-transparent hover:!bg-transparent pointer-events-none"
      >
        {children}
      </MenuItem>
    </DropdownMenuPrimitive.SubTrigger>
  )
})
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

// ── CheckboxItem ──
interface DropdownMenuCheckboxItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>, 'children'> {
  children: React.ReactNode
  /** 左側 icon */
  startIcon?: LucideIcon
  /** 次要說明文字 */
  description?: React.ReactNode
}

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, children, startIcon, description, checked, disabled, ...props }, ref) => {
  const size = useRowSize()

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      checked={checked}
      disabled={disabled}
      onSelect={(e) => e.preventDefault()}
      className={cn(radixItemClass, className)}
      {...props}
    >
      <MenuItem
        size={size}
        checkbox
        checked={!!checked}
        startIcon={startIcon}
        description={description}
        disabled={disabled}
        role="presentation"
        className="!bg-transparent hover:!bg-transparent pointer-events-none"
      >
        {children}
      </MenuItem>
    </DropdownMenuPrimitive.CheckboxItem>
  )
})
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

// ── Label（群組標題）──
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, children, ...props }, ref) => {
  const size = useRowSize()
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn('outline-none', className)}
      {...props}
    >
      <MenuItem
        size={size}
        header
        role="presentation"
        className="pointer-events-none"
      >
        {children}
      </MenuItem>
    </DropdownMenuPrimitive.Label>
  )
})
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

// ── Separator ──
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("my-2 h-px bg-divider", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  floatingLayerClass,
}
export type { SizeKey, DropdownMenuItemProps }
