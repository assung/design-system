// @benchmark-cited: cite Mantine AppShell / Ant Layout / Linear / GitHub real-product 場景。
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { AppShell, AppShellAside } from './app-shell'
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/design-system/components/Sidebar/sidebar'
import { ChromeHeader } from '@/design-system/patterns/header-canonical/chrome-header'
import { Button } from '@/design-system/components/Button/button'
import { Inbox, Calendar, Settings, Users, BarChart3, PanelRightOpen } from 'lucide-react'

const meta: Meta<typeof AppShell> = {
  title: 'Design System/Patterns/AppShell/展示',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta
type Story = StoryObj<typeof AppShell>

// ── Mock data — Linear-style workspace ──
const ISSUES_MOCK = [
  { id: '1', title: 'P0:登入後 redirect 失敗', status: 'In Progress' },
  { id: '2', title: 'Stripe webhook timeout > 10s', status: 'Backlog' },
  { id: '3', title: '新增 PeoplePicker multi-select', status: 'In Review' },
  { id: '4', title: 'DataTable 在 Safari 滾動跳動', status: 'Done' },
]

function LinearSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <span className="text-body font-medium px-2">Acme Inc.</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton><Inbox className="size-4" /> Inbox</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton><Calendar className="size-4" /> My Issues</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton><Users className="size-4" /> Team</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton><BarChart3 className="size-4" /> Insights</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton><Settings className="size-4" /> Settings</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

function IssueList() {
  return (
    <div className="px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]">
      <ul className="divide-y divide-divider">
        {ISSUES_MOCK.map((issue) => (
          <li key={issue.id} className="py-3 flex justify-between items-center">
            <span className="text-body">{issue.title}</span>
            <span className="text-caption text-fg-muted">{issue.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function IssueDetailAside() {
  return (
    <AppShellAside title="P0:登入後 redirect 失敗" width={360}>
      <div className="px-[var(--layout-space-loose)] py-[var(--layout-space-loose)] space-y-3">
        <p className="text-caption text-fg-muted">Issue #1 • In Progress</p>
        <p className="text-body">
          User 登入後本應跳轉到 dashboard,但停在 callback page 看到 404。Stripe SSO 回 token 但 cookie 沒 set。
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="primary">Assign to me</Button>
          <Button size="sm" variant="secondary">Mark resolved</Button>
        </div>
      </div>
    </AppShellAside>
  )
}

/**
 * Linear / Notion / Figma 派 — sidebar 頂天立地,header 在 main 區當當前頁 toolbar。
 * Aside 開時 inline 顯示 issue detail panel,desktop 不蓋 mask 可同時操作 issue list。
 */
export const PrimarySidebar: Story = {
  name: 'primary-sidebar(Linear / Notion 派)',
  render: () => {
    const [asideOpen, setAsideOpen] = React.useState(true)
    return (
      <SidebarProvider>
        <AppShell
          layout="primary-sidebar"
          sidebar={<LinearSidebar />}
          header={
            <ChromeHeader>
              <SidebarTrigger />
              <span className="text-body font-medium flex-1 ml-2">My Issues</span>
              <Button size="sm" variant="text" startIcon={PanelRightOpen} onClick={() => setAsideOpen(!asideOpen)}>
                {asideOpen ? '關閉' : '開啟'}詳情
              </Button>
            </ChromeHeader>
          }
          aside={<IssueDetailAside />}
          asideOpen={asideOpen}
          onAsideOpenChange={setAsideOpen}
        >
          <IssueList />
        </AppShell>
      </SidebarProvider>
    )
  },
}

// GitHubGlobalHeader / RepoSidebar 已 retire(primary-header story pending Sidebar SSOT extension)

/**
 * primary-header mode pending Sidebar SSOT viewport-inset extension(2026-05-19 codex Layer B
 * D1 verdict)。Sidebar 既有 `fixed inset-y-0 h-svh` 會蓋住 global header → broken UI。
 * 待 Sidebar 升級 `viewportInsetTop` 能力後 ship。本 story 暫 removed,避免 broken demo。
 *
 * 對齊 Mantine `layout="default"`(navbar 高度扣 header)— consume Sidebar inset 能力。
 */
// export const PrimaryHeader: Story = { ... }  // future tier, pending Sidebar SSOT

/**
 * Aside modal mode demo — viewport < 768px 時 Aside 自動切 Sheet,從右滑出 + 蓋 mask。
 * 對齊 Material 3 modal drawer canonical。
 * v2(2026-05-19 codex round 2 catch):asideOpen 預設 true 確保 visual probe 看到 modal Sheet 真開啟。
 */
export const AsideModalOnMobile: Story = {
  name: 'Aside modal mode(< 768px Sheet fallback)',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => {
    // 預設 true:probe 直接 screenshot 開啟狀態,不需 click。
    const [asideOpen, setAsideOpen] = React.useState(true)
    return (
      <SidebarProvider>
        <AppShell
          layout="primary-sidebar"
          sidebar={<LinearSidebar />}
          header={
            <ChromeHeader>
              <SidebarTrigger />
              <span className="text-body font-medium flex-1 ml-2">My Issues</span>
              <Button size="sm" variant="text" startIcon={PanelRightOpen} onClick={() => setAsideOpen(true)}>
                詳情
              </Button>
            </ChromeHeader>
          }
          aside={<IssueDetailAside />}
          asideOpen={asideOpen}
          onAsideOpenChange={setAsideOpen}
        >
          <IssueList />
        </AppShell>
      </SidebarProvider>
    )
  },
}
