// @story-baseline: none — primitive 用 minimal scenario showcase visual + cursor + a11y
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { ResizeHandle } from './resize-handle'

const meta: Meta<typeof ResizeHandle> = {
  title: 'Design System/Patterns/ResizeHandle',
  component: ResizeHandle,
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj<typeof ResizeHandle>

// Demo column with resize handle on right edge
const ColumnDemo: React.FC<{ isResizing?: boolean; disabled?: boolean }> = ({ isResizing, disabled }) => (
  <div className="relative inline-block bg-surface border border-divider px-loose py-2 w-[200px]">
    <span className="text-body">Column header</span>
    <ResizeHandle
      direction="horizontal"
      position="end"
      isResizing={isResizing}
      disabled={disabled}
      aria-label="拖曳調整欄寬"
    />
  </div>
)

export const Default: Story = {
  name: '預設',
  render: () => (
    <div className="flex flex-col gap-4">
      <ColumnDemo />
      <p className="text-caption text-fg-muted">滑鼠移到右邊緣 → cursor 變 col-resize + line 變色</p>
    </div>
  ),
}

export const Dragging: Story = {
  name: '拖拉中',
  render: () => (
    <div className="flex flex-col gap-4">
      <ColumnDemo isResizing />
      <p className="text-caption text-fg-muted">isResizing=true → line bg primary blue,consumer 自管 drag state</p>
    </div>
  ),
}

export const Disabled: Story = {
  name: '禁用',
  render: () => (
    <div className="flex flex-col gap-4">
      <ColumnDemo disabled />
      <p className="text-caption text-fg-muted">disabled=true → 無 cursor, 無 role=separator(a11y tree 不入),line bg-divider 維持</p>
    </div>
  ),
}

export const Vertical: Story = {
  name: '垂直方向',
  render: () => (
    <div className="relative bg-surface border border-divider px-loose py-2 w-[300px] h-[120px]">
      <span className="text-body">Panel body</span>
      <ResizeHandle
        direction="vertical"
        position="end"
        aria-label="拖曳調整面板高度"
      />
    </div>
  ),
}
