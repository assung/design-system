import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * 擴充 tailwind-merge,讓它認識設計系統的自訂 typography 與 text-color utilities。
 *
 * 預設 tailwind-merge 看到 `text-{xxx}` 自訂 class 會用 heuristic 猜它是 font-size
 * 還是 color——猜錯就會把不該放在同一組的 class 誤判為衝突,然後 strip 掉其中一個。
 *
 * 實際發生過的 bug:`text-body`(font-size 14px)和 `text-fg-secondary`(color)
 * 被同時放進 font-size group,tailwind-merge 把 `text-body` 吃掉,導致元件
 * inherit 父層 16px,description 永遠跟 label 同字級。
 *
 * 修法:**font-size group 和 text-color group 都明確列舉**,不留猜測空間。
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-h1', 'text-h2', 'text-h3', 'text-h4', 'text-h5', 'text-h6',
        'text-body-lg', 'text-body', 'text-caption', 'text-footnote',
      ],
      // 自訂 text-color utilities(對應 globals.css 的 --color-* @theme bridge)
      // 任何新增的 text-{semantic-name} color utility 都必須在這裡登記,
      // 否則 tailwind-merge 會誤判成 font-size 與 typography classes 衝突
      'text-color': [
        'text-foreground',
        'text-fg-secondary',
        'text-fg-muted',
        'text-fg-disabled',
        'text-inverse-fg',
        'text-inverse-fg-secondary',
        'text-inverse-fg-muted',
        'text-error-text',
        'text-success-text',
        'text-warning-text',
        'text-info-text',
        'text-primary-text',
        'text-popover-foreground',
        'text-muted-foreground',
        'text-accent-foreground',
      ],
    },
  },
})

/**
 * cn() — Tailwind class 合併工具
 *
 * 用法：
 *   cn("px-4 py-2", isActive && "bg-primary", className)
 *
 * 原理：clsx 處理條件式 class，twMerge 解決 Tailwind class 衝突
 * 例如 cn("px-4", "px-2") → "px-2"（後者優先）
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
