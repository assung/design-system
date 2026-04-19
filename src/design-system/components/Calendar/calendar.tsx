import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-day-picker/style.css'

import { cn } from '@/lib/utils'

/**
 * Calendar — DayPicker 包裝,用本 DS token 覆寫預設視覺。
 *
 * 視覺語言:
 * - 月份 caption:text-body font-medium
 * - 星期標頭:text-caption text-fg-muted
 * - 日格:36x36 圓形,hover/selected/today 三態清晰
 * - 選中:bg-primary text-white(實心)
 * - 今天:ring-1 ring-primary(framing,非選中時)
 * - 前後月日期:text-fg-disabled(淡化)
 * - nav 按鈕:Tertiary-style icon button,rounded-md
 *
 * 覆寫 react-day-picker v9 class names 為本 DS utility class,避免引入原生 .rdp-* 樣式漂移。
 */

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'flex flex-col gap-3',
        month_caption: 'flex items-center justify-center h-9 relative',
        caption_label: 'text-body font-medium',
        nav: 'flex items-center gap-1 absolute inset-x-0 justify-between pointer-events-none',
        button_previous: cn(
          'pointer-events-auto inline-flex items-center justify-center h-7 w-7 rounded-md',
          'text-fg-muted hover:text-foreground hover:bg-neutral-hover',
          'disabled:opacity-50 disabled:pointer-events-none',
          'transition-colors',
        ),
        button_next: cn(
          'pointer-events-auto inline-flex items-center justify-center h-7 w-7 rounded-md',
          'text-fg-muted hover:text-foreground hover:bg-neutral-hover',
          'disabled:opacity-50 disabled:pointer-events-none',
          'transition-colors',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-fg-muted text-caption font-normal w-9 h-8 flex items-center justify-center',
        week: 'flex w-full mt-1',
        day: 'h-9 w-9 p-0 text-center relative [&:has([aria-selected])]:bg-transparent',
        day_button: cn(
          'h-9 w-9 p-0 font-normal text-body rounded-md',
          'hover:bg-neutral-hover',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'transition-colors',
          'aria-selected:bg-primary aria-selected:text-white aria-selected:hover:bg-primary-hover',
        ),
        today: 'ring-1 ring-primary rounded-md',
        outside: 'text-fg-disabled aria-selected:text-white',
        disabled: 'text-fg-disabled opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
          return <Icon size={16} />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'
