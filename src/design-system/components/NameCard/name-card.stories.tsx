import type { Meta } from '@storybook/react'
import { MessageCircle, Phone, ChevronDown } from 'lucide-react'
import { NameCard } from './name-card'
import { Button } from '@/design-system/components/Button/button'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/design-system/components/HoverCard/hover-card'
import { Avatar } from '@/design-system/components/Avatar/avatar'

const meta: Meta = {
  title: 'Design System/Components/NameCard/展示',
  parameters: { layout: 'padded' },
}
export default meta

const noop = () => {}

export const Full = {
  name: '完整',
  render: () => (
    <div className="p-8">
      <NameCard
        name="Hanamizuki Yukinome 花水木雪乃芽"
        avatar={{ src: 'https://i.pravatar.cc/128?u=hana', alt: 'Hanamizuki' }}
        subtitle="{Org} | {ID} | {Employee number}"
        status="available"
        statusMessage="Out of Office: Back on Monday! For urgent matters please contact @Wei-Lun Cheng in the meantime."
        actions={<>
          <Button variant="tertiary" size="sm" startIcon={MessageCircle} className="flex-1">Chat</Button>
          <Button variant="tertiary" size="sm" startIcon={Phone} endIcon={ChevronDown} className="flex-1">Audio call</Button>
        </>}
        fields={[
          { label: 'ID', value: 'YHANAX' },
          { label: 'Employee number', value: '1234567' },
        ]}
        onViewMore={noop}
      />
    </div>
  ),
}

export const Minimal = {
  name: '精簡',
  render: () => (
    <div className="p-8">
      <NameCard
        name="Alice Chen"
        avatar={{ src: 'https://i.pravatar.cc/128?u=alice', alt: 'Alice' }}
        subtitle="Design｜D-0042｜EMP-1001"
        status="available"
      />
    </div>
  ),
}

export const WithHoverCard = {
  name: 'HoverCard 觸發',
  render: () => (
    <div className="p-16 flex items-center gap-4">
      <HoverCard openDelay={300} closeDelay={200}>
        <HoverCardTrigger asChild>
          <button type="button" className="cursor-pointer">
            <Avatar src="https://i.pravatar.cc/128?u=hana" alt="Hanamizuki" size={40} />
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="bg-surface-raised rounded-lg border border-border" style={{ boxShadow: 'var(--elevation-200)' }}>
          <NameCard
            name="Hanamizuki Yukinome 花水木雪乃芽"
            avatar={{ src: 'https://i.pravatar.cc/128?u=hana', alt: 'Hanamizuki' }}
            subtitle="{Org} | {ID} | {Employee number}"
            status="available"
            statusMessage="Out of Office: Back on Monday!"
            actions={<>
              <Button variant="tertiary" size="sm" startIcon={MessageCircle} className="flex-1">Chat</Button>
              <Button variant="tertiary" size="sm" startIcon={Phone} endIcon={ChevronDown} className="flex-1">Audio call</Button>
            </>}
            fields={[
              { label: 'ID', value: 'YHANAX' },
              { label: 'Employee number', value: '1234567' },
            ]}
            onViewMore={noop}
          />
        </HoverCardContent>
      </HoverCard>
      <span className="text-body text-fg-secondary">← hover 頭像</span>
    </div>
  ),
}
