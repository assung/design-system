// @story-baseline: none — exploration prototype, not a DS component
// Direction A: Command Nexus — Raycast + Linear DNA
// Positioning: 打開即作戰，鍵盤優先，最快路徑到 agent 委派
import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Bell, Search, Plus, ChevronRight,
  CheckCircle2, Pause,
  Hash, CornerDownLeft, Zap,
  FileText, Mail, CalendarDays, Microscope, Bot,
  X, RefreshCw, MessageSquare, Circle, Loader2,
} from 'lucide-react'
import { Avatar } from '@/design-system/components/Avatar/avatar'
import { Badge } from '@/design-system/components/Badge/badge'
import { Button } from '@/design-system/components/Button/button'
import { ProgressBar } from '@/design-system/components/ProgressBar/progress-bar'
import { cn } from '@/lib/utils'

// ── Data ──────────────────────────────────────────────────────────────────────

type AgentStatus = 'running' | 'waiting' | 'done' | 'error'

type LogState = 'done' | 'active' | 'pending'

interface LogStep {
  label: string
  detail?: string
  time?: string
  state: LogState
}

interface Agent {
  id: string
  name: string
  icon: React.ElementType
  color: string
  iconColor: string
  status: AgentStatus
  currentTask: string
  progress?: number
  lastAction: string
  actionLabel?: string
  objective: string
  log: LogStep[]
}

interface PriorityTask {
  id: string
  title: string
  agent: string
  level: 'critical' | 'high' | 'medium'
}

const AGENTS: Agent[] = [
  {
    id: 'research',
    name: '研究助理',
    icon: Microscope,
    color: 'bg-[var(--color-blue-1)]',
    iconColor: 'text-[var(--color-blue-6)]',
    status: 'running',
    currentTask: '閱讀 Q2 競品分析：Notion AI、Linear、Raycast 功能對比',
    progress: 78,
    lastAction: '剛剛',
    objective: '彙整 Notion AI、Linear、Raycast 三家在 AI 委派與指令面板的功能差異，產出一頁競品對比表給產品團隊。',
    log: [
      { label: '解析任務範圍', detail: '鎖定 3 家競品 × 5 個功能維度', time: '09:12', state: 'done' },
      { label: '擷取 Notion AI 公開文件', detail: '已讀 14 篇 help center 文章', time: '09:18', state: 'done' },
      { label: '擷取 Linear 變更日誌', detail: '已讀 2024 Q1–Q2 release notes', time: '09:31', state: 'done' },
      { label: '彙整 Raycast 擴充生態', detail: '正在比對 command palette 行為', time: '09:44', state: 'active' },
      { label: '產出對比表草稿', state: 'pending' },
    ],
  },
  {
    id: 'drafting',
    name: '起草助理',
    icon: FileText,
    color: 'bg-[var(--color-purple-1)]',
    iconColor: 'text-[var(--color-purple-6)]',
    status: 'waiting',
    currentTask: 'Q2 路線圖草稿已完成，等待您審閱後發送給工程團隊',
    lastAction: '12 分鐘前',
    actionLabel: '審閱草稿',
    objective: '根據上週策略會議記錄，草擬 Q2 工程路線圖並準備發送給工程團隊 review。',
    log: [
      { label: '讀取策略會議記錄', detail: '5/28 product sync 逐字稿', time: '08:40', state: 'done' },
      { label: '對齊既有 roadmap 結構', detail: '沿用 Q1 三欄式分類', time: '08:52', state: 'done' },
      { label: '草擬路線圖內容', detail: '12 個 initiative、3 個里程碑', time: '09:05', state: 'done' },
      { label: '等待您審閱', detail: '審閱後將發送給工程團隊', state: 'active' },
    ],
  },
  {
    id: 'email',
    name: '郵件助理',
    icon: Mail,
    color: 'bg-[var(--color-green-1)]',
    iconColor: 'text-[var(--color-green-6)]',
    status: 'done',
    currentTask: '本週已處理 14 封例行郵件，起草 3 封待發回覆',
    lastAction: '34 分鐘前',
    actionLabel: '查看草稿',
    objective: '分類本週收件匣、自動回覆例行郵件，並為需要您決定的郵件起草回覆。',
    log: [
      { label: '掃描收件匣', detail: '本週 47 封新郵件', time: '昨天 18:00', state: 'done' },
      { label: '分類與優先排序', detail: '14 例行 · 3 需決策 · 30 可忽略', time: '昨天 18:02', state: 'done' },
      { label: '自動回覆例行郵件', detail: '已送出 14 封', time: '昨天 18:05', state: 'done' },
      { label: '起草待決策回覆', detail: '3 封草稿待您審閱', time: '昨天 18:09', state: 'done' },
    ],
  },
  {
    id: 'calendar',
    name: '排程助理',
    icon: CalendarDays,
    color: 'bg-[var(--color-turquoise-1)]',
    iconColor: 'text-[var(--color-turquoise-6)]',
    status: 'running',
    currentTask: '協調週五 sprint retrospective，聯繫 5 位與會者確認時間',
    progress: 40,
    lastAction: '3 分鐘前',
    objective: '找出週五下午 5 位與會者都有空的時段，發送 sprint retrospective 會議邀請。',
    log: [
      { label: '讀取 5 位與會者行事曆', detail: '已取得 free/busy 資料', time: '09:40', state: 'done' },
      { label: '計算共同空檔', detail: '週五 14:00 與 16:00 兩個候選', time: '09:42', state: 'done' },
      { label: '聯繫與會者確認時間', detail: '3/5 已回覆，等待 2 位', time: '09:43', state: 'active' },
      { label: '發送會議邀請', state: 'pending' },
    ],
  },
]

const PRIORITY_TASKS: PriorityTask[] = [
  { id: 't1', title: '確認 Q2 競品報告', agent: '研究助理', level: 'high' },
  { id: 't2', title: '批准 PR #142 重新設計說明', agent: '起草助理', level: 'high' },
  { id: 't3', title: '回覆 Clara 的 API 時程問題', agent: '郵件助理', level: 'medium' },
]

const MEMORY_TAGS = ['Q2 策略', '設計原則', '不在 10 點前開會', 'Analytics Phase 2']

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusDot = ({ status }: { status: AgentStatus }) => {
  const map: Record<AgentStatus, string> = {
    running: 'bg-[var(--success)]',
    waiting: 'bg-[var(--warning)]',
    done: 'bg-[var(--color-neutral-5)]',
    error: 'bg-[var(--error)]',
  }
  return <span className={cn('inline-block w-2 h-2 rounded-full shrink-0', map[status])} />
}

const StatusLabel = ({ status }: { status: AgentStatus }) => {
  const map: Record<AgentStatus, { text: string; cls: string }> = {
    running: { text: '執行中', cls: 'text-[var(--success-text)]' },
    waiting: { text: '等待確認', cls: 'text-[var(--warning-text)]' },
    done: { text: '完成', cls: 'text-fg-muted' },
    error: { text: '錯誤', cls: 'text-[var(--error-text)]' },
  }
  const { text, cls } = map[status]
  return <span className={cn('text-caption leading-compact', cls)}>{text}</span>
}

const AgentCard = ({ agent, onOpen }: { agent: Agent; onOpen: () => void }) => {
  const Icon = agent.icon
  return (
    <div
      onClick={onOpen}
      className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3 hover:border-[var(--border-hover)] hover:shadow-[var(--elevation-100)] transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', agent.color, agent.iconColor)}>
          <Icon className="w-4 h-4" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-foreground leading-compact">{agent.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusDot status={agent.status} />
            <StatusLabel status={agent.status} />
            <span className="text-caption text-fg-disabled">· {agent.lastAction}</span>
          </div>
        </div>
      </div>

      <p className="text-caption text-fg-secondary leading-[1.4] line-clamp-2">{agent.currentTask}</p>

      {agent.status === 'running' && agent.progress !== undefined && (
        <ProgressBar value={agent.progress} status="inProgress" />
      )}

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {agent.actionLabel ? (
          <Button size="sm" variant="secondary" onClick={onOpen}>{agent.actionLabel}</Button>
        ) : (
          <Button size="sm" variant="text" className="text-fg-muted hover:text-foreground" onClick={onOpen}>查看詳情</Button>
        )}
        {agent.status === 'running' && (
          <Button size="sm" variant="text" className="text-fg-muted px-2">
            <Pause className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

const LogStepRow = ({ step, isLast }: { step: LogStep; isLast: boolean }) => {
  const node = {
    done: <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />,
    active: <Loader2 className="w-4 h-4 text-[var(--color-blue-6)] animate-spin" />,
    pending: <Circle className="w-4 h-4 text-fg-disabled" />,
  }[step.state]
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <span className="shrink-0">{node}</span>
        {!isLast && <span className="w-px flex-1 bg-divider my-1" />}
      </div>
      <div className={cn('flex-1 min-w-0', isLast ? 'pb-0' : 'pb-4')}>
        <div className="flex items-baseline gap-2">
          <p className={cn(
            'text-caption font-medium leading-compact',
            step.state === 'pending' ? 'text-fg-disabled' : 'text-foreground',
          )}>{step.label}</p>
          {step.time && <span className="text-caption text-fg-disabled font-mono ml-auto shrink-0">{step.time}</span>}
        </div>
        {step.detail && <p className="text-caption text-fg-muted leading-[1.4] mt-0.5">{step.detail}</p>}
      </div>
    </li>
  )
}

const AgentDetailPanel = ({ agent, onClose }: { agent: Agent; onClose: () => void }) => {
  const Icon = agent.icon
  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[var(--color-neutral-12)]/20 z-10 animate-in fade-in duration-150"
      />
      {/* Panel */}
      <aside className="absolute top-0 right-0 bottom-0 w-[420px] z-20 flex flex-col bg-surface border-l border-divider shadow-[var(--elevation-200)] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <header className="flex items-start gap-3 px-5 py-4 border-b border-divider shrink-0">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', agent.color, agent.iconColor)}>
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-body font-semibold text-foreground leading-compact">{agent.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusDot status={agent.status} />
              <StatusLabel status={agent.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-fg-muted hover:bg-[var(--color-neutral-1-opaque)] hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Objective */}
          <div className="mb-5">
            <p className="text-caption font-medium text-fg-muted uppercase tracking-wider mb-2">任務目標</p>
            <p className="text-caption text-fg-secondary leading-[1.5]">{agent.objective}</p>
          </div>

          {/* Progress */}
          {agent.status === 'running' && agent.progress !== undefined && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-caption font-medium text-fg-muted uppercase tracking-wider">進度</span>
                <span className="text-caption font-mono text-fg-secondary">{agent.progress}%</span>
              </div>
              <ProgressBar value={agent.progress} status="inProgress" />
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-caption font-medium text-fg-muted uppercase tracking-wider mb-3">執行紀錄</p>
            <ul className="flex flex-col">
              {agent.log.map((step, i) => (
                <LogStepRow key={step.label} step={step} isLast={i === agent.log.length - 1} />
              ))}
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <footer className="shrink-0 border-t border-divider px-5 py-3 flex items-center gap-2">
          {agent.status === 'waiting' ? (
            <>
              <Button size="sm" variant="primary" className="flex-1">批准並發送</Button>
              <Button size="sm" variant="secondary">編輯</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="secondary" className="gap-1.5 flex-1">
                <MessageSquare className="w-3.5 h-3.5" />
                追問 agent
              </Button>
              {agent.status === 'running' ? (
                <Button size="sm" variant="secondary" className="gap-1.5">
                  <Pause className="w-3.5 h-3.5" />
                  暫停
                </Button>
              ) : (
                <Button size="sm" variant="secondary" className="gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  重新指派
                </Button>
              )}
            </>
          )}
        </footer>
      </aside>
    </>
  )
}

// ── Main Layout ───────────────────────────────────────────────────────────────

const CommandNexusPage: React.FC<{ initialOpenAgentId?: string | null }> = ({ initialOpenAgentId = null }) => {
  const [commandValue, setCommandValue] = React.useState('')
  const [openAgentId, setOpenAgentId] = React.useState<string | null>(initialOpenAgentId)
  const openAgent = AGENTS.find((a) => a.id === openAgentId) ?? null

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenAgentId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative flex h-screen flex-col bg-canvas overflow-hidden">

      {/* Global Header */}
      <header className="flex h-12 items-center shrink-0 px-4 gap-3 border-b border-divider bg-surface">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--primary)] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-body font-semibold text-foreground leading-compact">Nexus</span>
        </div>

        <button className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-canvas text-caption text-fg-muted hover:border-[var(--border-hover)] hover:text-fg-secondary transition-colors ml-1">
          <Search className="w-3.5 h-3.5" />
          <span>快速指令</span>
          <kbd className="ml-1 inline-flex items-center px-1 rounded border border-border font-mono text-[10px] text-fg-disabled">⌘K</kbd>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-neutral-1-opaque)] transition-colors">
            <Bell className="w-4 h-4 text-fg-secondary" />
            <span className="absolute top-1 right-1.5">
              <Badge variant="critical" count={3} />
            </span>
          </button>
          <Avatar size={28} shape="circle" color="blue" solid alt="Aaron Sung" />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Panel */}
        <aside className="w-[260px] shrink-0 flex flex-col border-r border-divider bg-[var(--color-neutral-1-opaque)] overflow-y-auto">
          <div className="px-4 pt-5 pb-3">
            <p className="text-caption text-fg-disabled uppercase tracking-widest font-medium">Mon Jun 2, 2026</p>
          </div>

          {/* AI Brief */}
          <div className="mx-3 mb-4">
            <div className="rounded-lg border border-[var(--color-blue-2)] bg-[var(--color-blue-1)] px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3 h-3 text-[var(--color-blue-6)]" />
                <span className="text-caption font-medium text-[var(--color-blue-7)]">今日 AI 簡報</span>
              </div>
              <p className="text-caption text-[var(--color-blue-7)] leading-[1.5]">
                4 個 agents 昨晚執行了 12 件任務。有 <strong>3 件需要您決定</strong>——Q2 報告、PR #142 和 Clara 的問題優先度最高。
              </p>
            </div>
          </div>

          {/* Priority Queue */}
          <div className="px-4 mb-1">
            <p className="text-caption font-medium text-fg-muted uppercase tracking-wider mb-2">待決策</p>
          </div>
          <ul className="px-2 flex flex-col gap-0.5 mb-5">
            {PRIORITY_TASKS.map((task) => (
              <li key={task.id}>
                <button className="w-full flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--color-neutral-2-opaque)] text-left transition-colors group">
                  <Badge variant={task.level} dot className="mt-[3px] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-medium text-foreground leading-compact">{task.title}</p>
                    <p className="text-caption text-fg-muted leading-compact">{task.agent}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-fg-disabled opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                </button>
              </li>
            ))}
          </ul>

          {/* Memory */}
          <div className="px-4 mb-2">
            <p className="text-caption font-medium text-fg-muted uppercase tracking-wider mb-2">記憶庫</p>
          </div>
          <div className="px-3 flex flex-wrap gap-1.5 pb-6">
            {MEMORY_TAGS.map((tag) => (
              <button key={tag} className="flex items-center gap-1 h-6 px-2 rounded-md bg-surface border border-border text-caption text-fg-secondary hover:border-[var(--border-hover)] hover:text-foreground transition-colors">
                <Hash className="w-2.5 h-2.5 text-fg-disabled" />
                {tag}
              </button>
            ))}
          </div>
        </aside>

        {/* Main: Agent Grid */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-h5 font-semibold text-foreground leading-compact">Active Agents</h2>
                <p className="text-caption text-fg-muted mt-0.5">4 個助理執行中 · 2 件需要您的輸入</p>
              </div>
              <Button size="sm" variant="secondary" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                新委派
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {AGENTS.map((agent) => (
                <AgentCard key={agent.id} agent={agent} onOpen={() => setOpenAgentId(agent.id)} />
              ))}
            </div>

            {/* Recent completions */}
            <div className="mt-8">
              <p className="text-caption font-medium text-fg-muted uppercase tracking-wider mb-3">昨日完成</p>
              <div className="flex flex-col gap-0.5">
                {[
                  { label: '市場調研摘要報告 v2', time: '昨天 22:14', agent: '研究助理' },
                  { label: '工程師週會議程草稿', time: '昨天 20:31', agent: '起草助理' },
                  { label: '客戶詢問自動回覆 × 8', time: '昨天 18:05', agent: '郵件助理' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-neutral-1-opaque)] transition-colors cursor-default">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-neutral-5)] shrink-0" />
                    <span className="text-caption text-fg-secondary flex-1 leading-compact">{item.label}</span>
                    <span className="text-caption text-fg-disabled">{item.agent}</span>
                    <span className="text-caption text-fg-disabled font-mono">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Command Bar */}
      <div className="shrink-0 border-t border-divider bg-surface px-4 py-2.5 flex items-center gap-3">
        <Bot className="w-4 h-4 text-fg-muted shrink-0" />
        <input
          value={commandValue}
          onChange={(e) => setCommandValue(e.target.value)}
          placeholder="委派任務、詢問 agents 或搜尋記憶庫..."
          className="flex-1 bg-transparent text-body text-foreground placeholder:text-fg-disabled outline-none leading-compact"
        />
        {commandValue && (
          <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-[var(--primary)] text-white text-caption font-medium">
            <CornerDownLeft className="w-3 h-3" />
            送出
          </button>
        )}
        <div className="flex items-center gap-1 text-caption text-fg-disabled">
          <kbd className="inline-flex items-center px-1 rounded border border-border font-mono text-[10px]">⌘</kbd>
          <kbd className="inline-flex items-center px-1 rounded border border-border font-mono text-[10px]">↵</kbd>
        </div>
      </div>

      {/* Agent Detail Panel */}
      {openAgent && (
        <AgentDetailPanel agent={openAgent} onClose={() => setOpenAgentId(null)} />
      )}
    </div>
  )
}

// ── Story ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Explorations/AI Workspace Home/A — Command Nexus',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**Direction A: Command Nexus** — Raycast + Linear DNA

定位：打開即作戰。keyboard-first，agent-centric，最小 chrome。

強項：資訊密度高、鍵盤全操作、agent 狀態一眼看清。
弱項：新用戶學習曲線、視覺較冷、「大管家溫度」不足。
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj

export const Overview: Story = {
  name: '命令中樞',
  render: () => <CommandNexusPage />,
}

export const AgentDetailOpen: Story = {
  name: 'Agent 詳情展開',
  render: () => <CommandNexusPage initialOpenAgentId="research" />,
}
