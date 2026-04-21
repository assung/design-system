import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TimePicker } from './time-picker'

/**
 * TimePicker 設計規格 — 完整技術規格。anatomy 5-story 最小版本。
 * 深度規格見 `time-picker.spec.md`。
 */

const meta: Meta<typeof TimePicker> = {
  title: 'Design System/Components/TimePicker/設計規格',
  component: TimePicker,
  parameters: { layout: 'centered' },
}
export default meta

type Story = StoryObj<typeof TimePicker>

export const Overview: Story = {
  name: '1. 元件總覽',
  render: () => <TimePicker value="09:00" onChange={() => {}} />,
}

/** 尺寸矩陣 sm / md(預設) / lg */
export const SizeMatrix: Story = {
  name: '4. 尺寸對照表',
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="w-12 text-caption text-fg-muted">sm</span>
        <TimePicker size="sm" value="09:00" onChange={() => {}} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-12 text-caption text-fg-muted">md ★default</span>
        <TimePicker size="md" value="09:00" onChange={() => {}} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-12 text-caption text-fg-muted">lg</span>
        <TimePicker size="lg" value="09:00" onChange={() => {}} />
      </div>
    </div>
  ),
}

/** Mode / error 狀態 matrix */
export const ModeMatrix: Story = {
  name: '6. 模式對照',
  render: () => (
    <div className="flex flex-col gap-3 w-60">
      <TimePicker value="09:00" onChange={() => {}} placeholder="edit(預設)" />
      <TimePicker value="09:00" onChange={() => {}} mode="readonly" />
      <TimePicker value="09:00" onChange={() => {}} disabled />
      <TimePicker value="" onChange={() => {}} placeholder="空值 → placeholder" />
      <TimePicker value="09:00" onChange={() => {}} error />
      <TimePicker value="09:00" onChange={() => {}} clearable />
    </div>
  ),
}

/** Panel 精度:showSeconds 三欄 vs 兩欄 / minuteStep 粒度 */
export const PrecisionMatrix: Story = {
  name: '7. 精度對照',
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <div>
        <div className="text-caption text-fg-muted mb-1">兩欄(showSeconds=false,預設)</div>
        <TimePicker value="09:00" onChange={() => {}} />
      </div>
      <div>
        <div className="text-caption text-fg-muted mb-1">三欄(showSeconds=true)</div>
        <TimePicker value="09:00:00" onChange={() => {}} showSeconds />
      </div>
      <div>
        <div className="text-caption text-fg-muted mb-1">minuteStep=15(會議常用)</div>
        <TimePicker value="09:00" onChange={() => {}} minuteStep={15} />
      </div>
      <div>
        <div className="text-caption text-fg-muted mb-1">disabledTime:0-5 點不可選</div>
        <TimePicker
          value="09:00"
          onChange={() => {}}
          disabledTime={() => ({ disabledHours: [0, 1, 2, 3, 4, 5] })}
        />
      </div>
    </div>
  ),
}

/** Inspector — live props 調整驗規格 */
export const Inspector: Story = {
  name: '2. 元件檢閱器',
  args: {
    value: '09:00',
    size: 'md',
    clearable: false,
    showSeconds: false,
    minuteStep: 1,
    disabled: false,
    error: false,
    placeholder: '請選擇時間',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    minuteStep: { control: 'inline-radio', options: [1, 5, 10, 15, 30] },
  },
  render: (args) => {
    const [v, setV] = React.useState(args.value ?? '')
    return <TimePicker {...args} value={v} onChange={setV} />
  },
}
