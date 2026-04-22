import type { Meta, StoryObj } from '@storybook/react'
import { ExternalLink, Github, Calendar, MapPin } from 'lucide-react'
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card'
import { Avatar } from '@/design-system/components/Avatar/avatar'
import { Button } from '@/design-system/components/Button/button'
import { NameCard } from '@/design-system/components/NameCard/name-card'

const meta: Meta = {
  title: 'Design System/Internal/HoverCard/展示',
  tags: ['!dev'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'HoverCard 是 hover 觸發的可互動浮層 primitive(基於 Radix HoverCard)。與 Tooltip 的差異:內容可互動(按鈕、連結、hover 子元素)。HoverCard 本身**不含視覺樣式**——bg / border / shadow / padding 由 consumer 決定。以下情境展示最常見的兩種 consumer pattern(亮色 NameCard / 深色 tooltip)以及自訂情境。',
      },
    },
  },
}
export default meta
type Story = StoryObj

/* ═══════════════════════════════════════════════════════════════════════════
   Story 1:人員頭像 + NameCard(亮色樣式,最常見)
   ═══════════════════════════════════════════════════════════════════════════ */

export const PersonNameCard: Story = {
  name: '人員頭像 NameCard',
  render: () => (
    <div className="flex flex-col gap-3 max-w-xl">
      <p className="text-caption text-fg-muted">
        GitHub PR reviewer hover 看人員卡 — 可點「傳訊息」或「查看個人頁」。
      </p>
      <div className="flex items-center gap-3">
        <span className="text-caption text-fg-muted">Reviewer:</span>
        <HoverCard>
          <HoverCardTrigger asChild>
            <button type="button" aria-label="Ada Chen 個人資訊" className="cursor-pointer rounded-full">
              <Avatar alt="Ada Chen" color="indigo" size={28} />
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            className="bg-surface-raised border border-border rounded-lg p-0"
            style={{ boxShadow: 'var(--elevation-200)', width: 280 }}
          >
            <NameCard
              name="Ada Chen"
              avatar={{ alt: 'Ada Chen', color: 'indigo' }}
              subtitle="Design Engineer · Frontend"
              status="online"
              statusMessage="正在處理 login 頁重構"
              fields={[
                { label: 'Timezone', value: 'UTC+8 台北' },
                { label: 'Employee #', value: 'E-4821' },
              ]}
              onViewMore={() => {}}
            />
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  ),
}

/* ═══════════════════════════════════════════════════════════════════════════
   Story 2:連結預覽(亮色樣式 + 自訂內容)
   ═══════════════════════════════════════════════════════════════════════════ */

export const LinkPreview: Story = {
  name: '連結預覽卡',
  render: () => (
    <div className="flex flex-col gap-3 max-w-xl">
      <p className="text-caption text-fg-muted">
        Notion / Linear 風格的連結預覽 — hover 看目標頁面標題、摘要、元資料,不 hover 不干擾閱讀。
      </p>
      <p className="text-body leading-relaxed">
        本次 sprint 的重點是
        <HoverCard>
          <HoverCardTrigger asChild>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-primary underline underline-offset-2 mx-1 cursor-pointer"
            >
              Q2 OKR roadmap
            </a>
          </HoverCardTrigger>
          <HoverCardContent
            className="bg-surface-raised border border-border rounded-lg p-4"
            style={{ boxShadow: 'var(--elevation-200)', width: 320 }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-footnote text-fg-muted">
                <ExternalLink size={12} />
                <span>notion.so / platform-team</span>
              </div>
              <div className="text-body font-medium text-foreground">Q2 OKR roadmap</div>
              <p className="text-caption text-fg-secondary leading-relaxed">
                本季三個 objective:多工作區、SSO、audit log。每項由各 squad 認領,預計 6 月底前完成。
              </p>
              <div className="flex items-center gap-3 text-footnote text-fg-muted">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} /> 更新於 2 天前
                </span>
                <span>· 5 min read</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        ,負責人是 Platform team。
      </p>
    </div>
  ),
}

/* ═══════════════════════════════════════════════════════════════════════════
   Story 3:溢出清單(深色 tooltip 樣式)
   ═══════════════════════════════════════════════════════════════════════════ */

export const OverflowList: Story = {
  name: '溢出清單(深色樣式)',
  render: () => {
    const hidden = [
      { name: '黃怡君', color: 'turquoise' as const },
      { name: '王文彬', color: 'purple' as const },
      { name: '李思妤', color: 'yellow' as const },
    ]
    return (
      <div className="flex flex-col gap-3 max-w-md">
        <p className="text-caption text-fg-muted">
          此樣式由 OverflowIndicator 使用(深色 tooltip-style)—— +N hover 看完整清單。
        </p>
        <div className="flex items-center gap-1">
          <Avatar alt="Ada Chen" color="indigo" size={24} />
          <Avatar alt="張美真" color="magenta" size={24} />
          <Avatar alt="林伯彥" color="green" size={24} />
          <HoverCard openDelay={200} closeDelay={300}>
            <HoverCardTrigger asChild>
              <button
                type="button"
                className="ml-1 h-6 min-w-6 rounded-full inline-grid place-content-center bg-muted text-foreground text-caption font-medium cursor-default"
              >
                +{hidden.length}
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              className="bg-tooltip rounded-lg p-2"
              data-theme="dark"
            >
              <div className="flex flex-col gap-1 min-w-[160px]">
                {hidden.map((p) => (
                  <div key={p.name} className="flex items-center gap-2 text-caption">
                    <Avatar alt={p.name} color={p.color} size={20} />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    )
  },
}

/* ═══════════════════════════════════════════════════════════════════════════
   Story 4:倉庫卡(亮色 + 多 action)
   ═══════════════════════════════════════════════════════════════════════════ */

export const RepoCard: Story = {
  name: 'Repository 資訊卡',
  render: () => (
    <div className="flex flex-col gap-3 max-w-xl">
      <p className="text-caption text-fg-muted">
        GitHub-like repo hover card — hover 倉庫連結看 star 數、分支資訊、快速動作。
      </p>
      <p className="text-body leading-relaxed">
        CI 剛剛在
        <HoverCard>
          <HoverCardTrigger asChild>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-primary underline underline-offset-2 mx-1 font-mono cursor-pointer"
            >
              platform/monitoring
            </a>
          </HoverCardTrigger>
          <HoverCardContent
            className="bg-surface-raised border border-border rounded-lg p-4"
            style={{ boxShadow: 'var(--elevation-200)', width: 320 }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-primary-subtle grid place-content-center text-primary">
                  <Github size={18} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="text-body font-medium text-foreground truncate">platform/monitoring</div>
                  <div className="text-caption text-fg-muted truncate">觀測指標、alert、SLO dashboard</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-footnote text-fg-muted">
                <span>TypeScript</span>
                <span>· 42 stars</span>
                <span>· 8 contributors</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="tertiary" size="xs">
                  Clone
                </Button>
                <Button variant="tertiary" size="xs">
                  Open in IDE
                </Button>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        上成功部署。
      </p>
    </div>
  ),
}

/* ═══════════════════════════════════════════════════════════════════════════
   Story 5:多 trigger 展示 + delay 對照
   ═══════════════════════════════════════════════════════════════════════════ */

export const TriggerShowcase: Story = {
  name: 'Trigger 類型與 delay',
  render: () => (
    <div className="flex flex-col gap-6 max-w-xl">
      <p className="text-caption text-fg-muted">
        HoverCard 接受任何 trigger(透過 asChild)——Avatar / Button / text link / icon 皆可。openDelay /
        closeDelay 控制 hover 節奏。
      </p>

      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex flex-col gap-2">
          <span className="text-footnote text-fg-muted font-mono">trigger: Avatar</span>
          <HoverCard openDelay={200} closeDelay={300}>
            <HoverCardTrigger asChild>
              <button type="button" aria-label="Ada Chen 個人資訊" className="cursor-pointer rounded-full">
                <Avatar alt="Ada Chen" color="indigo" size={32} />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="bg-surface-raised border border-border rounded-lg p-3">
              <div className="text-caption">Ada Chen · Design Engineer</div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-footnote text-fg-muted font-mono">trigger: Button</span>
          <HoverCard openDelay={200} closeDelay={300}>
            <HoverCardTrigger asChild>
              <Button variant="tertiary" size="sm">
                查看位置
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="bg-surface-raised border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 text-caption">
                <MapPin size={14} className="text-fg-muted" />
                <span>台北市信義區松仁路 100 號</span>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-footnote text-fg-muted font-mono">trigger: text link</span>
          <HoverCard openDelay={200} closeDelay={300}>
            <HoverCardTrigger asChild>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-primary underline underline-offset-2 cursor-pointer text-caption"
              >
                PR #1,234
              </a>
            </HoverCardTrigger>
            <HoverCardContent className="bg-surface-raised border border-border rounded-lg p-3">
              <div className="text-caption">feat: 支援多工作區切換</div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>

      <div className="text-footnote text-fg-muted">
        建議 delay:<code className="font-mono mx-1">openDelay=200ms / closeDelay=300ms</code>——跟 Tooltip
        (delay 0)拉開節奏,避免 hover 過路誤觸。
      </div>
    </div>
  ),
}
