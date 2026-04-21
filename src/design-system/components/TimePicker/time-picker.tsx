import * as React from 'react'
import { X, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FieldMode } from '@/design-system/components/Field/field-types'
import {
  fieldWrapperStyles,
  bareInputStyles,
  EMPTY_DISPLAY,
} from '@/design-system/components/Field/field-wrapper'
import { ItemInlineAction } from '@/design-system/patterns/element-anatomy/item-anatomy'
import { Popover, PopoverTrigger, PopoverContent } from '@/design-system/components/Popover/popover'
import { Button } from '@/design-system/components/Button/button'
import { ScrollArea } from '@/design-system/components/ScrollArea/scroll-area'

/**
 * TimePicker — 單一時間(時/分/秒)輸入與顯示元件
 *
 * ── 定位(同 DatePicker 家族)──
 * Value 以 ISO time string 儲存("HH:mm" 或 "HH:mm:ss"),local-time 語義(不帶時區)。
 * Edit 用本 DS 自建 time column panel + Popover 呈現,視覺與 DatePicker 一致。
 * Display 用 Intl.DateTimeFormat 格式化(跨 locale / 12h-24h 統一經過此 API)。
 *
 * ── Layout Family ──
 * CLAUDE.md 4-Family Model Family 4(Field control layout)消費者。結構繼承
 * `fieldWrapperStyles + [startIcon?] [<editable>] [endAction?]`,視覺對齊
 * Family 1(Menu item layout)。
 *
 * ── 實作基礎 ──
 * Trigger:`<button>` + `fieldWrapperStyles`(視覺仍是 Input wrapper,改為可點擊觸發浮層)
 * Popup:`Popover`(消費 overlay-surface pattern)
 * Panel 主體:自建 column picker(三欄 scrollable list),不引入第三方 time library
 *
 * ── 共用規則 ──
 * Mode / size / disabled / error 等詳見 `../Field/field-controls.spec.md`。
 */

// ── Time ISO <-> parts conversion ───────────────────────────────────────────
// Value 用 ISO time string(HH:mm 或 HH:mm:ss),local-time 語義(不帶時區/日期)。
// 跟 DatePicker 的 ISO date string 策略一致。

interface TimeParts {
  h: number
  m: number
  s: number
}

function isoToParts(iso: string | null | undefined): TimeParts | undefined {
  if (!iso) return undefined
  const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(iso)
  if (!match) return undefined
  const h = Number(match[1])
  const m = Number(match[2])
  const s = match[3] !== undefined ? Number(match[3]) : 0
  if (
    Number.isNaN(h) || h < 0 || h > 23 ||
    Number.isNaN(m) || m < 0 || m > 59 ||
    Number.isNaN(s) || s < 0 || s > 59
  ) return undefined
  return { h, m, s }
}

function partsToIso(parts: TimeParts, showSeconds: boolean): string {
  const hh = String(parts.h).padStart(2, '0')
  const mm = String(parts.m).padStart(2, '0')
  if (!showSeconds) return `${hh}:${mm}`
  const ss = String(parts.s).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

// ── Display formatting ──────────────────────────────────────────────────────

export interface TimeFormatOptions {
  /** Intl.DateTimeFormat options(預設 { hour: '2-digit', minute: '2-digit', hour12: false }) */
  formatOptions?: Intl.DateTimeFormatOptions
  /** locale(預設 'en-US') */
  locale?: string
}

function formatTime(
  iso: string,
  options: TimeFormatOptions = {},
): string {
  const parts = isoToParts(iso)
  if (!parts) return iso
  const {
    formatOptions = { hour: '2-digit', minute: '2-digit', hour12: false },
    locale = 'en-US',
  } = options
  // 借用 Date 讓 Intl.DateTimeFormat 處理 locale / 12h-24h
  const d = new Date()
  d.setHours(parts.h, parts.m, parts.s, 0)
  return new Intl.DateTimeFormat(locale, formatOptions).format(d)
}

// ── Display sub-component(DataTable cell 用)────────────────────────────────

export interface TimePickerDisplayProps extends TimeFormatOptions {
  value?: string | null
}

function TimePickerDisplay({ value, ...formatOptions }: TimePickerDisplayProps) {
  if (value == null || value === '')
    return <span className="text-fg-muted">{EMPTY_DISPLAY}</span>
  return <>{formatTime(value, formatOptions)}</>
}
TimePickerDisplay.displayName = 'TimePickerDisplay'

// ── Column list helpers ─────────────────────────────────────────────────────

type Step = 1 | 5 | 10 | 15 | 30

function buildRange(max: number, step: number): number[] {
  const arr: number[] = []
  for (let v = 0; v < max; v += step) arr.push(v)
  return arr
}

// ── Time column(scrollable list of 2-digit values)──────────────────────────

interface TimeColumnProps {
  values: number[]
  selected: number
  /** 由 disabledTime 回傳的 disabled 值集 */
  disabledSet?: Set<number>
  label: string
  onSelect: (value: number) => void
}

function TimeColumn({ values, selected, disabledSet, label, onSelect }: TimeColumnProps) {
  const listRef = React.useRef<HTMLUListElement>(null)

  // 打開時滾到 selected 位置(在 ScrollArea viewport 中置中)
  React.useEffect(() => {
    const list = listRef.current
    if (!list) return
    const viewport = list.parentElement
    if (!viewport) return
    const idx = values.indexOf(selected)
    if (idx < 0) return
    const item = list.children[idx] as HTMLElement | undefined
    if (!item) return
    viewport.scrollTop = item.offsetTop - viewport.clientHeight / 2 + item.clientHeight / 2
  }, [values, selected])

  return (
    // flex-1 讓三欄均分父層寬度(不再 w-14 固定);ScrollArea 跨 OS 一致 overlay 捲軸
    <ScrollArea className="flex-1 h-[216px]">
      <ul
        ref={listRef}
        role="listbox"
        aria-label={label}
        className="flex flex-col px-1"
      >
        {values.map((v) => {
          const isSelected = v === selected
          const isDisabled = disabledSet?.has(v) ?? false
          return (
            <li key={v} role="option" aria-selected={isSelected}>
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => onSelect(v)}
                className={cn(
                  // h-9 對齊 DatePicker date cell(36px),跨 picker 視覺一致
                  'w-full h-9 text-body tabular-nums',
                  'flex items-center justify-center',
                  'rounded-md cursor-pointer transition-colors',
                  'hover:bg-neutral-hover',
                  // selected 走 bg-neutral-selected 對齊 SelectMenu canonical
                  // (TimePicker 選項是「列表選中」語意 — 跟 SelectMenu / MenuItem 一致;
                  // DatePicker 的 selected 是「最終選定日期」,語意不同故仍 bg-primary)
                  isSelected && 'bg-neutral-selected text-foreground hover:bg-neutral-selected',
                  isDisabled && 'text-fg-disabled cursor-not-allowed hover:bg-transparent',
                )}
              >
                {String(v).padStart(2, '0')}
              </button>
            </li>
          )
        })}
      </ul>
    </ScrollArea>
  )
}

// ── Disabled time callback ──────────────────────────────────────────────────

export interface DisabledTimeResult {
  disabledHours?: number[]
  disabledMinutes?: number[]
  disabledSeconds?: number[]
}

// ── Component props ─────────────────────────────────────────────────────────

export interface TimePickerProps extends TimeFormatOptions {
  mode?: FieldMode
  error?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** ISO time string("HH:mm" 或 "HH:mm:ss") */
  value?: string | null
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  /** 允許清空已選值 */
  clearable?: boolean
  /**
   * 是否顯示秒欄(三欄 picker)。預設 false(兩欄:時/分)。
   * format 自動對應:false → "HH:mm",true → "HH:mm:ss"。
   */
  showSeconds?: boolean
  /** 分鐘步進(會議常用 15)。預設 1 */
  minuteStep?: Step
  /** 秒步進。預設 1。僅 showSeconds=true 有效 */
  secondStep?: Step
  /** 動態 disabled 某些時/分/秒(基於已選其他欄位)。 */
  disabledTime?: (parts: Partial<TimeParts>) => DisabledTimeResult
  /** 左側 startIcon,預設 Clock。傳 null 可關閉 */
  startIcon?: LucideIcon | null
}

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
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
      showSeconds = false,
      minuteStep = 1,
      secondStep = 1,
      disabledTime,
      startIcon,
      formatOptions,
      locale,
    },
    ref,
  ) => {
    const resolvedMode = disabled ? 'disabled' : mode
    const isEditable = resolvedMode === 'edit'
    const iconSize = size === 'lg' ? 20 : 16
    const StartIconCmp: LucideIcon | null =
      startIcon === null ? null : (startIcon ?? Clock)
    const defaultPlaceholder = showSeconds ? 'HH:MM:SS' : 'HH:MM'
    const resolvedPlaceholder = placeholder ?? defaultPlaceholder
    const showClear = clearable && !!value && isEditable
    const [open, setOpen] = React.useState(false)

    const currentParts = React.useMemo(() => isoToParts(value), [value])
    // draft 僅在 panel 開啟時用來處理 commit(OK button)的暫存
    const [draft, setDraft] = React.useState<TimeParts>(() => currentParts ?? { h: 0, m: 0, s: 0 })

    // 每次 popover 開啟時以當前 value 初始化 draft
    React.useEffect(() => {
      if (open) {
        setDraft(currentParts ?? { h: 0, m: 0, s: 0 })
      }
    }, [open, currentParts])

    const hourValues = React.useMemo(() => buildRange(24, 1), [])
    const minuteValues = React.useMemo(() => buildRange(60, minuteStep), [minuteStep])
    const secondValues = React.useMemo(() => buildRange(60, secondStep), [secondStep])

    const disabledSets = React.useMemo(() => {
      const res = disabledTime?.({ h: draft.h, m: draft.m, s: draft.s }) ?? {}
      return {
        hours: res.disabledHours ? new Set(res.disabledHours) : undefined,
        minutes: res.disabledMinutes ? new Set(res.disabledMinutes) : undefined,
        seconds: res.disabledSeconds ? new Set(res.disabledSeconds) : undefined,
      }
    }, [disabledTime, draft.h, draft.m, draft.s])

    const commitDraft = (next: TimeParts) => {
      setDraft(next)
      onChange?.(partsToIso(next, showSeconds))
    }

    const handleNow = () => {
      const now = new Date()
      // 按照 minuteStep / secondStep 對齊
      const m = Math.round(now.getMinutes() / minuteStep) * minuteStep
      const s = showSeconds
        ? Math.round(now.getSeconds() / secondStep) * secondStep
        : 0
      const next: TimeParts = {
        h: now.getHours(),
        m: Math.min(m, 59),
        s: Math.min(s, 59),
      }
      commitDraft(next)
      setOpen(false)
    }

    // readonly / disabled
    if (!isEditable) {
      return (
        <div
          className={cn(fieldWrapperStyles({ mode: resolvedMode, size }), className)}
          data-field-mode={resolvedMode}
        >
          {StartIconCmp && (
            <StartIconCmp
              size={iconSize}
              className={cn(
                'shrink-0 pointer-events-none',
                resolvedMode === 'disabled' ? 'text-fg-disabled' : 'text-fg-muted',
              )}
              aria-hidden
            />
          )}
          <span
            className={cn(
              'flex-1 min-w-0',
              resolvedMode === 'disabled' && 'text-fg-disabled',
            )}
          >
            {value
              ? formatTime(value, { formatOptions, locale })
              : <span className="text-fg-muted">{EMPTY_DISPLAY}</span>
            }
          </span>
        </div>
      )
    }

    const displayText = value
      ? formatTime(value, { formatOptions, locale })
      : <span className="text-fg-muted">{resolvedPlaceholder}</span>

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            aria-invalid={error || undefined}
            aria-haspopup="dialog"
            aria-expanded={open}
            data-field-mode="edit"
            data-error={error ? '' : undefined}
            className={cn(
              fieldWrapperStyles({ mode: 'edit', size }),
              'text-left cursor-pointer',
              'focus-visible:outline-none',
              error && [
                'border-error hover:border-error-hover',
                'focus-within:border-error focus-within:hover:border-error',
              ],
              className,
            )}
          >
            {StartIconCmp && (
              <StartIconCmp
                size={iconSize}
                className="shrink-0 text-fg-muted pointer-events-none"
                aria-hidden
              />
            )}
            <span className={cn(bareInputStyles, 'truncate', !value && 'text-fg-muted')}>
              {displayText}
            </span>
            {showClear && (
              <ItemInlineAction
                size={size ?? 'md'}
                action={{
                  icon: X,
                  label: '清除時間',
                  onClick: (e) => {
                    e?.stopPropagation()
                    onChange?.('')
                  },
                }}
              />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col w-56">
            {/* Column picker:三欄 flex-1 均分父層寬度,: 分隔固定寬度不吃 slot */}
            <div className="flex items-stretch px-[var(--layout-space-tight)] pt-[var(--layout-space-tight)]">
              <TimeColumn
                label="hours"
                values={hourValues}
                selected={draft.h}
                disabledSet={disabledSets.hours}
                onSelect={(h) => commitDraft({ ...draft, h })}
              />
              <span className="shrink-0 w-3 flex items-start justify-center pt-1 text-fg-muted text-body">:</span>
              <TimeColumn
                label="minutes"
                values={minuteValues}
                selected={draft.m}
                disabledSet={disabledSets.minutes}
                onSelect={(m) => commitDraft({ ...draft, m })}
              />
              {showSeconds && (
                <>
                  <span className="shrink-0 w-3 flex items-start justify-center pt-1 text-fg-muted text-body">:</span>
                  <TimeColumn
                    label="seconds"
                    values={secondValues}
                    selected={draft.s}
                    disabledSet={disabledSets.seconds}
                    onSelect={(s) => commitDraft({ ...draft, s })}
                  />
                </>
              )}
            </div>
            {/* Footer:Now + OK */}
            <div
              className={cn(
                'flex items-center justify-between gap-2',
                'border-t border-divider',
                'px-[var(--layout-space-tight)] py-[var(--layout-space-tight)]',
              )}
            >
              <Button variant="text" size="sm" onClick={handleNow}>
                此刻
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setOpen(false)}
              >
                確定
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  },
)
TimePicker.displayName = 'TimePicker'

export { TimePicker, TimePickerDisplay, formatTime }
