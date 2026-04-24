import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useFieldContext } from "@/design-system/components/Field/field-context"
import { SelectionItem } from "@/design-system/components/SelectionControl/selection-item"

// ── RadioGroup ──────────────────────────────────────────────────────────────

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn("grid", className)}
    {...props}
    ref={ref}
  />
))
RadioGroup.displayName = 'RadioGroup'
// Field layout 宣告：RadioGroup 是 block primitive（多項堆疊），
// 進入 <Field> 時 control area 自動切 items-start + padding-top 公式對齊。
// Convention 詳見 components/Field/field.spec.md「Control area:Inline vs Block」段落。
;(RadioGroup as unknown as { fieldLayout: 'block' }).fieldLayout = 'block'

// ── RadioGroupItem Variants ─────────────────────────────────────────────────
// 與 Checkbox 完全對齊：sm/md=16px, lg=20px。差異只有形狀（rounded-full）和指示器（filled dot）。

const radioItemVariants = cva(
  [
    'grid place-content-center shrink-0 rounded-full',
    'border border-border bg-surface',
    'transition-colors duration-150',
    'hover:border-border-hover',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
    'data-[state=checked]:border-primary data-[state=checked]:text-primary',
    'data-[state=checked]:hover:border-primary-hover data-[state=checked]:hover:text-primary-hover',
    'disabled:cursor-not-allowed disabled:bg-disabled disabled:border-transparent disabled:hover:border-transparent',
    'disabled:data-[state=checked]:bg-disabled disabled:data-[state=checked]:border-transparent disabled:data-[state=checked]:text-fg-disabled',
    // readOnly：鎖定互動但維持 checked/unchecked 視覺
    'data-[readonly=true]:pointer-events-none data-[readonly=true]:cursor-default',
    'data-[readonly=true]:hover:border-border',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// ── Dot Size ────────────────────────────────────────────────────────────────
const dotSize: Record<string, number> = { sm: 8, md: 8, lg: 10 }

// ── Types ───────────────────────────────────────────────────────────────────

type RadioItemPrimitiveProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>

export interface RadioGroupItemProps
  extends RadioItemPrimitiveProps,
    VariantProps<typeof radioItemVariants> {
  /**
   * Inline label。提供時 RadioGroupItem 自動透過 SelectionItem 包裝，
   * 套用 codified 樣式（text-body / text-foreground / disabled 色）。
   * 在 <Field> context 內時此 prop 仍然生效（Radio 的 label 是每個 item
   * 各自的，不是整組 Field 的；FieldLabel 是 RadioGroup 整體的 label）。
   */
  label?: React.ReactNode
  /**
   * Inline description（secondary 文字）。須與 label 搭配使用。
   * 套用 text-body / text-fg-secondary 樣式。
   */
  description?: React.ReactNode
  /**
   * readonly 模式：鎖定互動但維持 checked/unchecked 視覺正確。
   * 通常整個 RadioGroup 一起設 readonly（由 parent RadioGroup 的 disabled
   * 或 readonly 行為決定），個別 item 也可設。
   */
  readOnly?: boolean
}

// ── RadioGroupItem ──────────────────────────────────────────────────────────

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(
  (
    {
      className,
      size,
      label,
      description,
      readOnly = false,
      disabled,
      id: idProp,
      ...props
    },
    ref
  ) => {
    const sizeKey = size ?? 'md'
    const dotPx = dotSize[sizeKey]

    // 注意：Radio 的 label 語意與 Checkbox/Switch 不同——
    // Checkbox/Switch 的 label 就是該 control 的唯一 label（被 Field context 接管），
    // RadioGroupItem 的 label 是「該選項」的 label（每 item 各自擁有），
    // FieldLabel 則是整個 RadioGroup 的 label。
    // 因此 RadioGroupItem 的 label 不因 Field context 被忽略。
    const fieldCtx = useFieldContext()

    const generatedId = React.useId()
    const inputId = idProp ?? generatedId

    const rootEl = (
      <RadioGroupPrimitive.Item
        id={inputId}
        ref={ref}
        disabled={disabled}
        aria-readonly={readOnly || undefined}
        data-readonly={readOnly || undefined}
        tabIndex={readOnly ? -1 : undefined}
        className={cn(radioItemVariants({ size }), className)}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="grid place-content-center">
          <Circle
            style={{ width: dotPx, height: dotPx }}
            className="fill-current text-current"
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    )

    // 無 label → 只渲染 radio 本體
    if (label == null) return rootEl

    // 有 label → 透過 SelectionItem 包裝，與 Checkbox 一致
    // 同時繼承 Field context 的 disabled（若 RadioGroup 在 Field disabled 內）
    const resolvedDisabled = disabled ?? fieldCtx?.disabled ?? false

    return (
      <SelectionItem
        control={rootEl}
        label={label}
        description={description}
        htmlFor={inputId}
        disabled={resolvedDisabled}
        size={sizeKey}
      />
    )
  }
)
RadioGroupItem.displayName = 'RadioGroupItem'

// Story auto-compile metadata — Phase 1 mechanical migration(2026-04-24)
// Phase 2 fill needed: purpose descriptions + when rationale + world-class refs
export const radioGroupMeta = {
  component: 'RadioGroup',
  family: null, // TODO: Phase 2 — declare Layout Family(1/2/3/4 或 non-family)
  variants: {

  },
  sizes: {
    sm: { fieldHeight: 28, iconSize: 16, typography: 'body' },
    md: { fieldHeight: 32, iconSize: 16, typography: 'body' },
    lg: { fieldHeight: 40, iconSize: 20, typography: 'body' },
  },
  states: ['default', 'hover', 'active', 'focus-visible', 'disabled'],
  tokens: {
    bg: [], // TODO: grep tsx for bg-* tokens
    fg: [],
    ring: [],
  },
  defaultSize: 'md',
} as const

export { RadioGroup, RadioGroupItem, radioItemVariants }
