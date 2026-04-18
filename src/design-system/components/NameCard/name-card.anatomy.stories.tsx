import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NameCard } from './name-card'
import { Avatar } from '@/design-system/components/Avatar/avatar'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/design-system/components/HoverCard/hover-card'

const meta: Meta = {
  title: 'Design System/Components/NameCard/設計規格',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-body font-bold text-foreground mb-2">{children}</h3>
)
const Desc = ({ children }: { children: React.ReactNode }) => (
  <p className="text-caption text-fg-muted mb-4 max-w-[720px] leading-relaxed">{children}</p>
)
const Td = ({ children, mono }: { children: React.ReactNode; mono?: boolean }) => (
  <td className={`border border-border px-3 py-1.5 text-caption ${mono ? 'font-mono' : ''}`}>{children}</td>
)
const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="border border-border px-3 py-1.5 text-caption text-fg-secondary bg-muted text-left">{children}</th>
)

export const Overview: Story = {
  name: '元件總覽',
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <H3>Anatomy</H3>
        <Desc>NameCard 是人員 HoverCard 的**內容元件**——提供統一的人員資訊展示格式。本身不含觸發或定位邏輯(那是 HoverCard 的職責),只是 HoverCard content 的標準人員模板。固定寬度 320px。</Desc>
        <div className="border border-border rounded-lg p-4">
          <HoverCard defaultOpen>
            <HoverCardTrigger asChild>
              <Avatar name="陳麒仁" size={40} />
            </HoverCardTrigger>
            <HoverCardContent align="start" className="p-0" sideOffset={8}>
              <NameCard
                name="陳麒仁"
                subtitle="Design Engineer"
                avatar={<Avatar name="陳麒仁" size={56} />}
                status="在線"
                infoFields={[
                  { label: 'Email', value: 'user@example.com' },
                  { label: '團隊', value: 'Engineering' },
                  { label: '時區', value: 'UTC+8(台北)' },
                ]}
                onViewMore={() => {}}
              />
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>

      <div>
        <H3>結構</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Section</Th><Th>內容</Th><Th>可選</Th></tr></thead>
            <tbody>
              <tr><Td>Profile Header</Td><Td>Avatar 56px + Name + Subtitle</Td><Td>必有</Td></tr>
              <tr><Td>Action Buttons</Td><Td>CTA(Message / Follow / Invite)</Td><Td>選填</Td></tr>
              <tr><Td>Status 區</Td><Td>在線狀態 / 忙碌時間等</Td><Td>選填</Td></tr>
              <tr><Td>Info Fields</Td><Td>DescriptionList(Email / Team / 時區等)</Td><Td>選填</Td></tr>
              <tr><Td>View More</Td><Td>「查看完整 profile」按鈕</Td><Td>選填(有 onViewMore 時顯示)</Td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-footnote text-fg-muted mt-3">Section 之間用 `border-t border-divider` 分隔——清晰的資訊分區,每個 section 獨立存在或不存在</p>
      </div>

      <div>
        <H3>Props 速查</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Prop</Th><Th>Type</Th><Th>Default</Th><Th>說明</Th></tr></thead>
            <tbody>
              {[
                ['name', 'string', '必填', '姓名'],
                ['subtitle', 'string', '—', '職稱 / 位置 / 描述'],
                ['avatar', 'ReactNode', '—', 'Profile header 的 Avatar(通常 56px)'],
                ['actions', 'ReactNode', '—', 'CTA buttons(Message / Follow)'],
                ['status', 'string', '—', '在線狀態文字'],
                ['infoFields', 'Array<{ label; value }>', '[]', '資訊欄位(走 DescriptionList)'],
                ['onViewMore', '() => void', '—', '查看完整 profile callback'],
              ].map(([p, t, d, desc]) => (
                <tr key={p}><Td mono>{p}</Td><Td mono>{t}</Td><Td mono>{d}</Td><Td>{desc}</Td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}

export const DesignDecisions: Story = {
  name: '設計決策',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <H3>固定寬度 320px,不 min/max</H3>
        <Desc>HoverCard 內容量可預期(人員資訊結構固定),固定寬度避免不同人員 card 寬度跳動。使用者每次 hover 看到的 card 尺寸一致。</Desc>
      </div>

      <div>
        <H3>Section 用 border-t 分隔,不用 Separator</H3>
        <Desc>NameCard 的 section 邊界屬於**元件固定結構**(見 separator.spec.md 的「CSS border 情境」),consumer 不決定是否分隔。用 `border-t border-divider` 直接寫,不套 `&lt;Separator /&gt;` 元件。</Desc>
      </div>

      <div>
        <H3>Status badge 用 muted 而非 interactive 色</H3>
        <Desc>狀態是**展示資訊**,不可點擊。用 muted 色避免暗示互動性(「在線」不該長得像按鈕)。</Desc>
      </div>
    </div>
  ),
}
