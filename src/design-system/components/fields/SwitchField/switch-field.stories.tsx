import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SwitchField } from './switch-field'

const meta: Meta<typeof SwitchField> = {
  title: 'Design System/Components/Fields/SwitchField/展示',
  component: SwitchField,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof SwitchField>

/* ── 三種模式 ── */
export const Modes: Story = {
  name: '三種模式',
  render: () => {
    const [value, setValue] = React.useState(true)
    return (
      <div className="flex flex-col gap-6 max-w-xs">
        <div>
          <p className="text-caption text-fg-muted mb-2">edit（true）</p>
          <SwitchField value={value} onChange={setValue} />
        </div>
        <div>
          <p className="text-caption text-fg-muted mb-2">edit（false）</p>
          <SwitchField value={false} onChange={() => {}} />
        </div>
        <div>
          <p className="text-caption text-fg-muted mb-2">readonly</p>
          <div className="flex gap-4">
            <SwitchField mode="readonly" value={true} />
            <SwitchField mode="readonly" value={false} />
          </div>
        </div>
        <div>
          <p className="text-caption text-fg-muted mb-2">disabled</p>
          <div className="flex gap-4">
            <SwitchField disabled value={true} />
            <SwitchField disabled value={false} />
          </div>
        </div>
      </div>
    )
  },
}
