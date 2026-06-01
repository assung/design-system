// @story-baseline: none — exploration prototype, not a DS component
// Direction B: Ambient Brief — Notion + MS Copilot DNA
// Positioning: 大管家晨報，每天打開都像讀一份為你量身寫的簡報
import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Sparkles, CheckCircle2, Clock, AlertCircle,
  CornerDownLeft, Bookmark, MessageSquare,
  FileText, Mail, CalendarDays, Microscope,
  ChevronRight, Plus, Bot, Cpu,
} from 'lucide-react'
import { Avatar } from '@/design-system/components/Avatar/avatar'
import { Badge } from '@/design-system/components/Badge/badge'
import { Button } from '@/design-system/components/Button/button'
import { ProgressBar } from '@/design-system/components/ProgressBar/progress-bar'
import { Separator } from '@/design-system/components/Separator/separator'
import { cn } from '@/lib/utils'

// ── Data ──────────────────────────────────────────────────────────────────────

type AgentStatus = 'running' | 'waiting' | 'done'

interface Agent {
  id: string
  name: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  status: AgentStatus
  summary: string
  progress?: number
  metric?: string
}

interface QueueItem {
  id: string
  title: string
  description: string
  agent: string
  agentIcon: React.ElementType
  level: 'critical' | 'high' | 'medium'
  actionLabel: string
}

interface MemoryItem {
  id: string
  icon: React.ElementType
  iconColor: string
  title: string
  snippet: string
  meta: string
  category: 'document' | 'preference' | 'decision'
}

const AGENTS: Agent[] = [
  {
    id: 'research',
    name: '研究助理',
    icon: Microscope,
    iconBg: 'bg-[var(--color-blue-1)]',
    iconColor: 'text-[var(--color-blue-6)]',
    status: 'running',
    summary: '正在閱讀 Q2 競品分析報告，已完成 Notion AI 和 Linear 章節',
    progress: 78,
  },
  {
    id: 'drafting',
    name: '起草助理',
    icon: FileText,
    iconBg: 'bg-[var(--color-purple-1)]',
    iconColor: 'text-[var(--color-purple-6)]',
    status: 'waiting',
    summary: 'Q2 路線圖草稿已完成，等待您審閱確認後才發送給工程團隊',
  },
  {
    id: 'email',
    name: '郵件助理',
    icon: Mail,
    iconBg: 'bg-[var(--color-green-1)]',
    iconColor: 'text-[var(--color-green-6)]',
    status: 'done',
    summary: '本週處理了 14 封例行郵件，並起草了 3 封待您發送的回覆',
    metric: '14 封處理完畢',
  },
  {
    id: 'calendar',
    name: '排程助理',
    icon: CalendarDays,
    iconBg: 'bg-[var(--color-turquoise-1)]',
    iconColor: 'text-[var(--color-turquoise-6)]',
    status: 'running',
    summary: '正在協調週五 sprint retrospective，已聯繫 3/5 位與會者',
    progress: 40,
  },
]

const QUEUE: QueueItem[] = [
  {
    id: 'q1',
    title: '確認 Q2 競品分析報告',
    description: '研究助理完成了 Notion AI、Linear、Raycast 的功能對比，需要您確認分析框架後繼續完成報告',
    agent: '研究助理',
    agentIcon: Microscope,
    level: 'high',
    actionLabel: '確認框架',
  },
  {
    id: 'q2',
    title: '審閱並批准 PR #142',
    description: '起草助理已準備好新手引導重新設計的說明文件，等待您批准後工程團隊才能開始實作',
    agent: '起草助理',
    agentIcon: FileText,
    level: 'high',
    actionLabel: '審閱草稿',
  },
  {
    id: 'q3',
    title: '回覆 Clara 的 API 時程問題',
    description: '郵件助理已起草一封回覆，回答 Clara 關於 V2 API 何時能夠整合的問題，請確認後發送',
    agent: '郵件助理',
    agentIcon: Mail,
    level: 'medium',
    actionLabel: '查看草稿',
  },
]

const MEMORY: MemoryItem[] = [
  {
    id: 'm1',
    icon: Bookmark,
    iconColor: 'text-[var(--color-blue-6)]',
    title: 'Q2 產品策略',
    snippet: '本季重點：AI 協作功能（P0）、行動端優化（P1）、Analytics 移至 Phase 2',
    meta: '更新於 2 小時前',
    category: 'document',
  },
  {
    id: 'm2',
    icon: Bookmark,
    iconColor: 'text-[var(--color-purple-6)]',
    title: '設計原則 v3',
    snippet: '一致性優先、減少認知負擔、漸進式揭露、錯誤預防勝於修正',
    meta: '上週更新',
    category: 'document',
  },
  {
    id: 'm3',
    icon: MessageSquare,
    iconColor: 'text-[var(--color-green-6)]',
    title: '你的偏好',
    snippet: '「不在早上 10 點前安排會議，我需要 focused work 時間」',
    meta: '你說的，3 天前',
    category: 'preference',
  },
  {
    id: 'm4',
    icon: CheckCircle2,
    iconColor: 'text-[var(--color-turquoise-6)]',
    title: '已決策：Analytics Phase 2',
    snippet: 'Analytics dashboard 延至 Q3 Phase 2，不阻擋 Q2 核心 AI 功能 launch',
    meta: '週三決定',
    category: 'decision',
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────

const AgentRow = ({ agent }: { agent: Agent }) => {
  const Icon = agent.icon
  const statusConfig = {
    running: { dot: 'bg-[var(--success)]', label: '執行中', labelCls: 'text-[var(--success-text)]' },
    waiting: { dot: 'bg-[var(--warning)]', label: '等待確認', labelCls: 'text-[var(--warning-text)]' },
    done: { dot: 'bg-[var(--color-neutral-5)]', label: '完成', labelCls: 'text-fg-muted' },
  }
  const sc = statusConfig[agent.status]

  return (
    <div className="flex flex-col gap-3 py-4 group">
      <div className="flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', agent.iconBg, agent.iconColor)}>
          <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-body font-medium text-foreground leading-compact">{agent.name}</span>
            <span className={cn('text-caption leading-compact', sc.labelCls)}>{sc.label}</span>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', sc.dot)} />
          </div>
          <p className="text-caption text-fg-secondary leading-[1.45] mt-0.5 line-clamp-2">{agent.summary}</p>
        </div>
      </div>
      {agent.status === 'running' && agent.progress !== undefined && (
        <ProgressBar value={agent.progress} status="inProgress" />
      )}
      {agent.metric && (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success-text)]" />
          <span className="text-caption text-[var(--success-text)] font-medium">{agent.metric}</span>
        </div>
      )}
      {agent.status === 'waiting' && (
        <Button size="sm" variant="secondary" className="self-start">
          審閱草稿
        </Button>
      )}
    </div>
  )
}

const QueueCard = ({ item, index }: { item: QueueItem; index: number }) => {
  const AgentIcon = item.agentIcon
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-surface hover:border-[var(--border-hover)] transition-colors cursor-default">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[var(--color-neutral-2-opaque)] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-caption font-semibold text-fg-secondary">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-body font-medium text-foreground leading-compact">{item.title}</p>
            <Badge variant={item.level} dot className="mt-1 shrink-0" />
          </div>
          <p className="text-caption text-fg-secondary leading-[1.45] mt-1.5">{item.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5 text-caption text-fg-muted">
          <AgentIcon className="w-3.5 h-3.5" />
          {item.agent}
        </div>
        <Button size="sm" variant="secondary">{item.actionLabel}</Button>
      </div>
    </div>
  )
}

const MemoryCard = ({ item }: { item: MemoryItem }) => {
  const Icon = item.icon
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-surface hover:border-[var(--border-hover)] transition-colors cursor-default group">
      <div className="flex items-start gap-2">
        <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', item.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-foreground leading-compact">{item.title}</p>
          <p className="text-caption text-fg-muted mt-0.5">{item.meta}</p>
        </div>
      </div>
      <p className="text-caption text-fg-secondary leading-[1.45] line-clamp-3">{item.snippet}</p>
    </div>
  )
}

// ── Main Layout ───────────────────────────────────────────────────────────────

const AmbientBriefPage: React.FC = () => {
  const [commandValue, setCommandValue] = React.useState('')

  return (
    <div className="flex flex-col min-h-screen bg-canvas">

      {/* Nav bar */}
      <header className="flex h-12 items-center shrink-0 px-6 gap-4 border-b border-divider bg-surface">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-body font-semibold text-foreground leading-compact">Nexus</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <span className="text-caption text-fg-muted">Mon, Jun 2</span>
          <Separator orientation="vertical" className="h-4" />
          <Avatar size={28} shape="circle" color="blue" solid alt="Aaron Sung" />
        </div>
      </header>

      {/* Hero: Greeting + Brief */}
      <section className="px-8 pt-8 pb-6 border-b border-divider bg-surface">
        <div className="max-w-4xl">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-h3 font-semibold text-foreground leading-tight mb-2">
                早安，Aaron。
              </h1>
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--color-blue-1)] border border-[var(--color-blue-2)]">
                <Sparkles className="w-4 h-4 text-[var(--color-blue-6)] shrink-0 mt-0.5" />
                <p className="text-body text-[var(--color-blue-8)] leading-relaxed">
                  你的 4 個 agents 昨晚完成了 12 件任務。研究助理正在進行 Q2 競品分析（78%），
                  起草助理已完成 Q2 路線圖草稿等待您確認，郵件助理準備好了 Clara 的回覆草稿。
                  <strong> 今天有 3 件事需要你決定。</strong>
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-3 shrink-0">
              {[
                { label: '今日完成', value: '12', sub: '昨晚完成' },
                { label: '待你決定', value: '3', sub: '需要輸入' },
                { label: '記憶片段', value: '28', sub: '知識庫' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-canvas">
                  <span className="text-h4 font-bold text-foreground leading-none">{stat.value}</span>
                  <div>
                    <p className="text-caption font-medium text-foreground leading-compact">{stat.label}</p>
                    <p className="text-caption text-fg-muted leading-compact">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main 3-column grid */}
      <div className="flex-1 grid grid-cols-3 gap-0 divide-x divide-border pb-20">

        {/* Col 1: Agents */}
        <section className="flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-h6 font-semibold text-foreground leading-compact">Agents</h2>
              <p className="text-caption text-fg-muted">4 個助理，2 件待確認</p>
            </div>
            <Button size="sm" variant="text" className="text-fg-muted gap-1">
              <Plus className="w-3.5 h-3.5" />
              新增
            </Button>
          </div>

          <div className="flex flex-col divide-y divide-divider">
            {AGENTS.map((agent) => (
              <AgentRow key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        {/* Col 2: Priority Queue */}
        <section className="flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-h6 font-semibold text-foreground leading-compact">待決策</h2>
              <p className="text-caption text-fg-muted">需要你拍板的 3 件事</p>
            </div>
            <Badge variant="high" count={3} />
          </div>

          <div className="flex flex-col gap-3">
            {QUEUE.map((item, index) => (
              <QueueCard key={item.id} item={item} index={index} />
            ))}
          </div>

          {/* All done state hint */}
          <div className="mt-4 flex items-center gap-2 text-caption text-fg-muted">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>處理完畢後 agents 會自動繼續執行</span>
          </div>
        </section>

        {/* Col 3: Memory */}
        <section className="flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-h6 font-semibold text-foreground leading-compact">記憶庫</h2>
              <p className="text-caption text-fg-muted">AI 記得的重要知識</p>
            </div>
            <Button size="sm" variant="text" className="text-fg-muted gap-1">
              <ChevronRight className="w-3.5 h-3.5" />
              全部
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {MEMORY.map((item) => (
              <MemoryCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Command Strip */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-divider bg-surface/95 backdrop-blur-sm px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3 h-10 px-4 rounded-xl border border-border bg-canvas shadow-[var(--elevation-100)] focus-within:border-[var(--primary)] focus-within:shadow-[0_0_0_3px_var(--color-blue-2)] transition-all">
          <Bot className="w-4 h-4 text-fg-muted shrink-0" />
          <input
            value={commandValue}
            onChange={(e) => setCommandValue(e.target.value)}
            placeholder="輸入任務或問題，委派給 AI 助理…"
            className="flex-1 bg-transparent text-body text-foreground placeholder:text-fg-disabled outline-none leading-compact"
          />
          {commandValue ? (
            <button className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-[var(--primary)] text-white text-caption font-medium shrink-0">
              <CornerDownLeft className="w-3.5 h-3.5" />
              送出
            </button>
          ) : (
            <kbd className="inline-flex items-center gap-0.5 px-1.5 rounded border border-border font-mono text-[10px] text-fg-disabled shrink-0">⌘↵</kbd>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Story ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Explorations/AI Workspace Home/B — Ambient Brief',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**Direction B: Ambient Brief** — Notion + MS Copilot DNA

定位：大管家晨報。每天打開就像讀一份為你量身寫的 briefing，task-centric，有溫度。

強項：AI 敘事感強、所有角色都懂、待決策流程最清楚。
弱項：資訊密度比 A 低、三欄式需要較寬螢幕。
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj

export const Overview: Story = {
  name: '情境晨報',
  render: () => <AmbientBriefPage />,
}
