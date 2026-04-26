import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Design System/Internal/OverflowIndicator/設計原則',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const WhenToUse: Story = {
  name: '何時使用',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>OverflowIndicator 是 collapse-overflow 的 visual primitive — 顯示「+N」表示有未顯示的 overflow items。</p>
      <p>適用情境(對照「展示」頁):</p>
      <ul>
        <li><strong>ComboboxTagOverflow</strong> — Combobox 多選 tag 太多時 collapse</li>
        <li><strong>AvatarStackOverflow</strong> — Avatar stack 「+5」表 5 個未顯示</li>
        <li><strong>BreadcrumbCollapse</strong> — Breadcrumb 中段 collapse</li>
        <li><strong>TableRowAssignees</strong> — 表格 row 多 assignee 收合</li>
      </ul>
      <p className="text-fg-muted">非 OverflowIndicator 適用:單純截斷文字 → CSS truncate;不知道總數的展開 → ScrollArea。</p>
    </div>
  ),
}

export const VsScrollAreaRule: Story = {
  name: 'OverflowIndicator vs ScrollArea',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>處理超出空間的 2 種策略:</p>
      <ul>
        <li><strong>OverflowIndicator(本元件)</strong>—展示已知數量的 collapse;「我有 N 個 item,看不下去」+1 visual,點開展開或 expand</li>
        <li><strong>ScrollArea</strong>—未知數量或極多 item 時 scroll;讓使用者捲動瀏覽全部</li>
      </ul>
      <p className="text-fg-muted">判斷:item 數可數且少(≤ 100)→ OverflowIndicator;太多或不知數 → ScrollArea。</p>
    </div>
  ),
}
