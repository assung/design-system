import type { Meta } from '@storybook/react'
import { Alert } from './alert'
import { Button } from '@/design-system/components/Button/button'
import type { NoticeVariant } from '@/design-system/components/Notice/notice'

const meta: Meta = {
  title: 'Design System/Components/Alert/展示',
  parameters: { layout: 'padded' },
}
export default meta

const ALL: NoticeVariant[] = ['neutral', 'info', 'warning', 'error', 'success']
const L: Record<string, string> = { neutral: 'Neutral', info: 'Info', warning: 'Warning', error: 'Error', success: 'Success' }

const actionBtn = <Button variant="tertiary" size="xs">Action</Button>

export const SubtleSingleLine = {
  name: 'Subtle 單行',
  render: () => (
    <div className="flex flex-col gap-3 max-w-lg">
      {ALL.map((v) => <Alert key={v} variant={v} appearance="subtle" title={L[v]} endContent={actionBtn} />)}
    </div>
  ),
}

export const SolidSingleLine = {
  name: 'Solid 單行',
  render: () => (
    <div className="flex flex-col gap-3 max-w-lg">
      {ALL.map((v) => <Alert key={v} variant={v} appearance="solid" title={L[v]} endContent={actionBtn} />)}
    </div>
  ),
}

export const SubtleWithDescription = {
  name: 'Subtle + Description',
  render: () => (
    <div className="flex flex-col gap-3 max-w-lg">
      {ALL.map((v) => <Alert key={v} variant={v} appearance="subtle" title={L[v]} description={L[v]} endContent={actionBtn} />)}
    </div>
  ),
}

export const SolidWithDescription = {
  name: 'Solid + Description',
  render: () => (
    <div className="flex flex-col gap-3 max-w-lg">
      {ALL.map((v) => <Alert key={v} variant={v} appearance="solid" title={L[v]} description={L[v]} endContent={actionBtn} />)}
    </div>
  ),
}

export const Fixed = {
  name: 'Fixed（全域警告）',
  render: () => (
    <div className="flex flex-col gap-6">
      <span className="text-caption text-fg-muted">固定在 header 底下,無圓角,full-width。</span>

      <div className="flex flex-col gap-1">
        <span className="text-caption text-fg-muted font-medium">Subtle Fixed</span>
        <div className="border border-divider rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-surface border-b border-divider">
            <span className="text-body font-medium">專案設定</span>
          </div>
          {ALL.map((v) => <Alert key={v} variant={v} appearance="subtle" placement="fixed" title={`${L[v]} — 全域警告`} />)}
          <div className="p-4 text-fg-muted text-caption">調整此專案的權限與通知偏好。變更會立刻套用到所有成員。</div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-caption text-fg-muted font-medium">Solid Fixed</span>
        <div className="border border-divider rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-surface border-b border-divider">
            <span className="text-body font-medium">專案設定</span>
          </div>
          {ALL.map((v) => <Alert key={v} variant={v} appearance="solid" placement="fixed" title={`${L[v]} — 全域警告`} />)}
          <div className="p-4 text-fg-muted text-caption">調整此專案的權限與通知偏好。變更會立刻套用到所有成員。</div>
        </div>
      </div>
    </div>
  ),
}

