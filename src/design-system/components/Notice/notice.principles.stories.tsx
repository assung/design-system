import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Design System/Internal/Notice/設計原則',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const WhenToUse: Story = {
  name: '何時使用',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>Notice 是 announcement primitive — 給 Alert / Toast 等 announcement 元件作為 row primitive。</p>
      <p>適用情境(對照「展示」頁):</p>
      <ul>
        <li><strong>DeploymentSuccess / BillingFailed</strong> — inline 系統通知</li>
        <li><strong>InlineVariants</strong> — variant 對照</li>
        <li><strong>ToastLikeSolid</strong> — solid 強調 announcement</li>
        <li><strong>NeutralTitleOnly</strong> — 極簡 title-only 模式</li>
      </ul>
      <p className="text-fg-muted">consumer 通常不直接用 Notice,而是用 Alert / Toast(消費 Notice)。</p>
    </div>
  ),
}

export const VsAlertVsToastRule: Story = {
  name: 'Notice vs Alert vs Toast',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>三者關係:Notice 是 primitive,Alert / Toast 是 consumer:</p>
      <ul>
        <li><strong>Notice(本元件)</strong> — internal primitive,提供 announcement row 結構 + variant token</li>
        <li><strong>Alert</strong> — 永久 inline announcement(stays until dismissed)</li>
        <li><strong>Toast</strong> — 短暫 announcement(auto-dismiss)</li>
      </ul>
      <p className="text-fg-muted">建新 announcement 類元件 → 消費 Notice 不要 hand-craft row(對齊 SSOT 消費 canonical)。</p>
    </div>
  ),
}
