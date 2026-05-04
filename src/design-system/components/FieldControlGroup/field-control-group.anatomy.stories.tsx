import type { Meta, StoryObj } from '@storybook/react'
import { FieldControlGroup } from './field-control-group'
import { Select } from '@/design-system/components/Select/select'
import { Input } from '@/design-system/components/Input/input'

const meta: Meta<typeof FieldControlGroup> = {
  title: 'Design System/Components/FieldControlGroup/設計規格',
  component: FieldControlGroup,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof FieldControlGroup>

const FIELDS = [
  { value: 'sku', label: 'SKU' },
  { value: 'name', label: '名稱' },
]
const OPS = [
  { value: 'is', label: '等於' },
  { value: 'contains', label: '包含' },
]

/* Overview */
export const Overview: Story = {
  name: 'Overview',
  render: () => (
    <div className="flex flex-col gap-6 w-[520px]">
      <section>
        <h3 className="text-body font-bold mb-2">機制(派 B,2026-05-04 — Material OutlinedInput inspired)</h3>
        <ul className="text-body text-fg-secondary list-disc pl-5 space-y-1">
          <li>FCG outer 自帶 frame:<code>border + rounded-md + overflow-hidden + bg-surface</code></li>
          <li>子 cells 內部 flat:<code>!border-0 !rounded-none</code>(保留 own bg)</li>
          <li>內部 divider:<code>::before</code> pseudo absolute 1px line(均勻無壓深)</li>
          <li>State signal:hover / focus-within 套 outer border-hover + ring(group-level)</li>
          <li>Cell error:<code>shadow-[inset_0_0_0_1px_var(--error)]</code>(cell-level 精確標示)</li>
        </ul>
      </section>
      <section>
        <h3 className="text-body font-bold mb-2">範例</h3>
        <FieldControlGroup block>
          <Select className="w-[120px]" options={FIELDS} value="name" onChange={() => {}} />
          <Select className="w-[100px]" options={OPS} value="contains" onChange={() => {}} />
          <Input className="flex-1" defaultValue="phone" />
        </FieldControlGroup>
      </section>
    </div>
  ),
}

/* SizeMatrix */
export const SizeMatrix: Story = {
  name: 'SizeMatrix',
  render: () => (
    <div className="flex flex-col gap-6 w-[420px]">
      {(['sm', 'md', 'lg'] as const).map(size => (
        <div key={size}>
          <p className="text-caption text-fg-muted mb-2">size="{size}"</p>
          <FieldControlGroup block>
            <Select size={size} className="w-[120px]" options={FIELDS} value="name" onChange={() => {}} />
            <Input size={size} className="flex-1" defaultValue="value" />
          </FieldControlGroup>
        </div>
      ))}
    </div>
  ),
}

/* StateBehavior */
export const StateBehavior: Story = {
  name: 'StateBehavior',
  render: () => (
    <div className="flex flex-col gap-6 w-[420px]">
      <div>
        <p className="text-caption text-fg-muted mb-2">default</p>
        <FieldControlGroup block>
          <Select className="w-[120px]" options={FIELDS} value="name" onChange={() => {}} />
          <Input className="flex-1" defaultValue="abc" />
        </FieldControlGroup>
      </div>
      <div>
        <p className="text-caption text-fg-muted mb-2">disabled(整 group children 各自 disabled)</p>
        <FieldControlGroup block>
          <Select className="w-[120px]" options={FIELDS} value="name" onChange={() => {}} disabled />
          <Input className="flex-1" defaultValue="abc" disabled />
        </FieldControlGroup>
      </div>
      <div>
        <p className="text-caption text-fg-muted mb-2">cell error(其中一 child invalid → border-error + z-3)</p>
        <FieldControlGroup block>
          <Select className="w-[120px]" options={FIELDS} value="name" onChange={() => {}} />
          <Input className="flex-1" defaultValue="abc" error />
        </FieldControlGroup>
      </div>
    </div>
  ),
}

/* Accessibility */
export const Accessibility: Story = {
  name: 'Accessibility',
  render: () => (
    <div className="flex flex-col gap-3 w-[420px]">
      <p className="text-body">
        Container 不加 ARIA role(透明 wrapper);children 各自 aria-label。Tab 鍵在 children 之間正常移動,no focus trap。
      </p>
      <FieldControlGroup block>
        <Select className="w-[120px]" options={FIELDS} value="name" onChange={() => {}} aria-label="篩選欄位" />
        <Select className="w-[100px]" options={OPS} value="contains" onChange={() => {}} aria-label="篩選運算子" />
        <Input className="flex-1" defaultValue="phone" aria-label="篩選值" />
      </FieldControlGroup>
    </div>
  ),
}
