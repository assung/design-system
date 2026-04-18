import * as React from 'react'
import { X, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FieldMode } from '@/design-system/components/Field/field-types'
import { fieldWrapperStyles, bareInputStyles, EMPTY_DISPLAY } from '@/design-system/components/Field/field-wrapper'
import { ItemInlineAction } from '@/design-system/patterns/item-layout/item-layout'

// ── Format ──────────────────────────────────────────────────────────────────

export interface DateFormatOptions {
  /** Intl.DateTimeFormat options（預設 { year: 'numeric', month: '2-digit', day: '2-digit' }） */
  formatOptions?: Intl.DateTimeFormatOptions
  /** locale（預設 'en-US'） */
  locale?: string
}

function formatDate(
  value: string | number | Date,
  options: DateFormatOptions = {},
): string {
  const {
    formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' },
    locale = 'en-US',
  } = options
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat(locale, formatOptions).format(date)
}

// ── Display ─────────────────────────────────────────────────────────────────
// Table cell 和 Form readonly 共用。DataTable 透過 column type 查到這個元件。

export interface DatePickerDisplayProps extends DateFormatOptions {
  value?: string | number | Date | null
}

function DatePickerDisplay({ value, ...formatOptions }: DatePickerDisplayProps) {
  if (value == null) return <span className="text-fg-muted">{EMPTY_DISPLAY}</span>
  return <>{formatDate(value, formatOptions)}</>
}
DatePickerDisplay.displayName = 'DatePickerDisplay'

// ── Component ───────────────────────────────────────────────────────────────

export interface DatePickerProps extends DateFormatOptions {
  mode?: FieldMode
  error?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** ISO date string（YYYY-MM-DD） */
  value?: string | null
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  /** 允許清空已選值 */
  clearable?: boolean
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      mode = 'edit',
      error = false,
      size = 'md',
      value,
      onChange,
      placeholder,
      className,
      disabled,
      clearable = false,
      formatOptions,
      locale,
      ...props
    },
    ref
  ) => {
    const resolvedMode = disabled ? 'disabled' : mode
    const isEditable = resolvedMode === 'edit'
    const iconSize = size === 'lg' ? 20 : 16
    const showClear = clearable && value && isEditable
    const inputRef = React.useRef<HTMLInputElement>(null)
    const setRef = React.useCallback((el: HTMLInputElement | null) => {
      inputRef.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
    }, [ref])
    const openPicker = () => { inputRef.current?.showPicker?.(); inputRef.current?.focus() }

    // readonly / disabled
    if (!isEditable) {
      return (
        <div
          className={cn(fieldWrapperStyles({ mode: resolvedMode, size }), className)}
          data-field-mode={resolvedMode}
        >
          <span className={cn('flex-1 min-w-0', resolvedMode === 'disabled' && 'text-fg-disabled')}>
            {value
              ? formatDate(value, { formatOptions, locale })
              : <span className="text-fg-muted">{EMPTY_DISPLAY}</span>
            }
          </span>
        </div>
      )
    }

    // edit
    return (
      <div
        className={cn(
          fieldWrapperStyles({ mode: 'edit', size }),
          error && [
            'border-error hover:border-error-hover',
            'focus-within:border-error focus-within:hover:border-error',
          ],
          className,
        )}
        data-field-mode="edit"
        data-error={error ? '' : undefined}
      >
        <input
          ref={setRef}
          type="date"
          value={value ?? ''}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={cn(
            bareInputStyles,
            'cursor-pointer appearance-none',
            // 隱藏瀏覽器原生日期 icon，用我們自己的 Calendar icon
            '[&::-webkit-calendar-picker-indicator]:hidden',
            !value && 'text-fg-muted',
          )}
          {...props}
        />
        {showClear && (
          <ItemInlineAction
            size={size ?? 'md'}
            action={{ icon: X, label: '清除日期', onClick: () => onChange?.('') }}
          />
        )}
        <Calendar size={iconSize} className="shrink-0 text-fg-muted pointer-events-none" aria-hidden />
      </div>
    )
  }
)
DatePicker.displayName = 'DatePicker'

export { DatePicker, DatePickerDisplay, formatDate }
