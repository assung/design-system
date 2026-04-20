import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './spinner'
import { Button } from '@/design-system/components/Button/button'
import { H3, Desc, Td, Th } from '@/design-system/stories-helpers/anatomy/anatomy-utils'

/**
 * Spinner 是最薄的 animation primitive——單一 SVG + 旋轉動畫。**刻意只有
 * `size` (number) 一個 prop**,沒有 variant、沒有 state、沒有 color(用 currentColor
 * 從父層繼承)。因此本 spec 只有 Overview + 消費場景兩類 story——沒有 StateMatrix
 * (spinner 本身就是單一狀態:旋轉);沒有獨立 ColorMatrix(色彩完全 inherit)。
 * 完整設計規則見 `spinner.spec.md`。
 */

const meta: Meta = {
  title: 'Design System/Components/Spinner/設計規格',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const Overview: Story = {
  name: '元件總覽',
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <H3>Anatomy</H3>
        <Desc>Spinner 是最薄的 primitive——沒有 variant、沒有速度調節、沒有 color prop。單一職責:顯示「東西在轉」。純 CSS 旋轉動畫(SVG stroke)。</Desc>
        <div className="flex items-center gap-6 border border-border rounded-lg p-6">
          <Spinner size={16} />
          <Spinner size={20} />
          <Spinner size={24} />
          <Spinner size={32} />
          <span className="text-caption text-fg-muted font-mono">size 16 / 20 / 24 / 32</span>
        </div>
      </div>

      <div>
        <H3>Props 速查</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Prop</Th><Th>Type</Th><Th>Default</Th><Th>說明</Th></tr></thead>
            <tbody>
              {[
                ['size', 'number', '16', 'px 單位,由 consumer 決定'],
                ['className', 'string', '—', 'Tailwind utilities for color / margin'],
              ].map(([p, t, d, desc]) => (
                <tr key={p}><Td mono>{p}</Td><Td mono>{t}</Td><Td mono>{d}</Td><Td>{desc}</Td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-footnote text-fg-muted mt-3">Spinner 沒有 `color` prop——顏色透過 `currentColor` 從父層繼承。要改色用 `className="text-primary"`。</p>
      </div>
    </div>
  ),
}

export const UsageInButton: Story = {
  name: '在 Button loading 狀態內',
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <H3>Button loading</H3>
        <Desc>Button 的 `loading` prop 內部渲染 Spinner 替代 startIcon——是最常見的 Spinner 消費場景。color 自動從 Button 的 foreground 繼承。</Desc>
        <div className="flex items-center gap-3">
          <Button variant="primary" loading>儲存中</Button>
          <Button variant="secondary" loading>處理中</Button>
          <Button variant="tertiary" loading>載入中</Button>
        </div>
      </div>

      <div>
        <H3>Icon-only loading</H3>
        <div className="flex items-center gap-3">
          <Button variant="tertiary" size="sm" iconOnly loading aria-label="儲存中" />
          <Button variant="tertiary" size="md" iconOnly loading aria-label="處理中" />
          <Button variant="tertiary" size="lg" iconOnly loading aria-label="載入中" />
        </div>
      </div>
    </div>
  ),
}

export const UsageInline: Story = {
  name: 'Inline 使用',
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <H3>Cell / Table row 局部 loading</H3>
        <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2 max-w-xs">
          <Spinner size={16} />
          <span className="text-body text-fg-muted">載入訂單資料...</span>
        </div>
      </div>

      <div>
        <H3>Search pending</H3>
        <div className="relative max-w-sm">
          <input type="text" className="w-full px-3 py-1.5 border border-border rounded-md" placeholder="搜尋..." />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size={16} />
          </div>
        </div>
      </div>
    </div>
  ),
}
