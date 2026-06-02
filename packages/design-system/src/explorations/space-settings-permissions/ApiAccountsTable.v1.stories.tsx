// @story-baseline: none — exploration prototype, not a DS component
// Space settings ▸ Permissions ▸ API accounts table
//
// Context: 公司內部知識庫平台(Notion-like)。Space 設定有 4 個分頁
// General / Permissions / Approval / Advanced。Permissions 既有「空間成員」表格,
// 此 exploration 在同頁新增第二個 section「API accounts」管理各 API 的授權狀況。
//
// 設計決策(user 拍板 2026-06-02):
//   1. Role 與 API privilege 為「獨立兩軸」— Role = 帳號在空間的治理身分
//      (沿用成員 Owner/Editor/Commenter/Reader 語彙);API privilege = 技術 API
//      scope(per-resource None/Read/Write),兩者不互相 derive。
//   2. 以 Storybook exploration 交付。
//   3. 納入建議的 Status / Last used / Expiry 欄(治理 + stale-credential 衛生)。
//
// 世界級對照(benchmark,詳 notes.md):
//   - Stripe Restricted API Keys:per-resource None/Read/Write,Write 含 Read,least-privilege
//   - GitHub fine-grained PAT:50+ granular permission(no access/read/read+write)+ 強制 expiry
//   - Google Cloud IAM service account:email-like machine identity + role 列表 + 用量
//   - Notion Connections:workspace 設定內人/機分區管理 + disconnect
import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  KeyRound, Bot, Cloud, Slack, Database, Zap, FileText,
  Search, Filter, Plus, MoreVertical, Pencil, RotateCcw, PauseCircle,
  PlayCircle, ScrollText, ShieldX, ShieldAlert, ExternalLink,
} from 'lucide-react'
import { DataTable } from '@/design-system/components/DataTable/data-table'
import '@/design-system/components/DataTable/column-types' // ColumnMeta declaration merging
import type { PersonData } from '@/design-system/components/PeoplePicker/person-display'
import { Tag } from '@/design-system/components/Tag/tag'
import { Avatar } from '@/design-system/components/Avatar/avatar'
import { Button } from '@/design-system/components/Button/button'
import { Input } from '@/design-system/components/Input/input'
import { Textarea } from '@/design-system/components/Textarea/textarea'
import { Select } from '@/design-system/components/Select/select'
import { SegmentedControl, SegmentedControlItem } from '@/design-system/components/SegmentedControl/segmented-control'
import { Field, FieldLabel, FieldDescription } from '@/design-system/components/Field/field'
import { Empty } from '@/design-system/components/Empty/empty'
import { Separator } from '@/design-system/components/Separator/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/design-system/components/Tabs/tabs'
import {
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverTitle,
} from '@/design-system/components/Popover/popover'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/design-system/components/DropdownMenu/dropdown-menu'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogBody, DialogFooter, DialogClose,
} from '@/design-system/components/Dialog/dialog'

// ── Domain model ────────────────────────────────────────────────────────────

type Role = 'owner' | 'editor' | 'commenter' | 'reader'
type Status = 'active' | 'pending' | 'revoked' | 'expired'
type Level = 'none' | 'read' | 'write'

// API privilege = 技術 scope(獨立於 Role 治理身分)。固定的 resource 清單,
// 每個 resource 一個 level。Write 含 Read(Stripe canonical)。
const RESOURCES = ['Pages', 'Comments', 'Attachments', 'Members', 'Settings', 'Webhooks'] as const
type Resource = (typeof RESOURCES)[number]

interface ApiAccount {
  id: string
  /** IAM account — email-like machine identity(Google IAM idiom) */
  iam: string
  /** 友善代號,顯示在 identifier 上方 */
  handle: string
  app: { name: string; icon: React.ElementType; color: React.ComponentProps<typeof Avatar>['color'] }
  purpose: string
  role: Role
  privileges: Record<Resource, Level>
  status: Status
  lastUsed: string
  /** ISO date 或 null = 無到期(治理風險,標 warning) */
  expiry: string | null
}

const priv = (over: Partial<Record<Resource, Level>>): Record<Resource, Level> => ({
  Pages: 'none', Comments: 'none', Attachments: 'none', Members: 'none', Settings: 'none', Webhooks: 'none', ...over,
})

// 真實業務情境:知識庫平台「Engineering」space 的 API 授權清單
const ACCOUNTS: ApiAccount[] = [
  {
    id: 'a1', iam: 'svc-confluence-sync@acme.iam', handle: 'Wiki Mirror',
    app: { name: 'Confluence Cloud', icon: Cloud, color: 'blue' },
    purpose: '每晚把工程 runbook 同步進知識庫對應頁面',
    role: 'editor', privileges: priv({ Pages: 'write', Comments: 'write', Members: 'read' }),
    status: 'active', lastUsed: '8 分鐘前', expiry: '2026-12-01',
  },
  {
    id: 'a2', iam: 'svc-search-indexer@acme.iam', handle: 'Enterprise Search',
    app: { name: 'Glean', icon: Search, color: 'turquoise' },
    purpose: '索引全空間內容供企業搜尋',
    role: 'reader', privileges: priv({ Pages: 'read', Comments: 'read', Attachments: 'read' }),
    status: 'active', lastUsed: '2 分鐘前', expiry: null,
  },
  {
    id: 'a3', iam: 'svc-slack-notify@acme.iam', handle: 'Doc Notifier',
    app: { name: 'Slack', icon: Slack, color: 'purple' },
    purpose: '頁面發佈事件推送到 #eng-docs',
    role: 'commenter', privileges: priv({ Pages: 'read', Comments: 'write', Webhooks: 'write' }),
    status: 'active', lastUsed: '1 小時前', expiry: '2026-09-15',
  },
  {
    id: 'a4', iam: 'svc-backup-export@acme.iam', handle: 'Cold Storage Backup',
    app: { name: 'Internal Backup', icon: Database, color: 'indigo' },
    purpose: '每週完整匯出到冷儲存',
    role: 'owner', privileges: priv({ Pages: 'read', Members: 'read', Attachments: 'read', Settings: 'read' }),
    status: 'active', lastUsed: '3 天前', expiry: '2027-01-01',
  },
  {
    id: 'a5', iam: 'svc-zapier-hook@acme.iam', handle: 'Form Intake',
    app: { name: 'Zapier', icon: Zap, color: 'yellow' },
    purpose: '把表單提交建立成新頁面',
    role: 'editor', privileges: priv({ Pages: 'write' }),
    status: 'pending', lastUsed: '尚未使用', expiry: '2026-08-01',
  },
  {
    id: 'a6', iam: 'svc-legacy-importer@acme.iam', handle: 'Notion Importer',
    app: { name: 'Notion Importer', icon: FileText, color: 'neutral' },
    purpose: '一次性從 Notion 遷移(已完成)',
    role: 'reader', privileges: priv({ Pages: 'read' }),
    status: 'revoked', lastUsed: '41 天前', expiry: '已過期',
  },
]

// ── Visual mappings(集中,避免 magic value 散落)──────────────────────────

const ROLE_META: Record<Role, { label: string; color: React.ComponentProps<typeof Tag>['color'] }> = {
  owner:     { label: 'Owner',     color: 'purple' },
  editor:    { label: 'Editor',    color: 'blue' },
  commenter: { label: 'Commenter', color: 'turquoise' },
  reader:    { label: 'Reader',    color: 'neutral' },
}

const STATUS_META: Record<Status, { label: string; color: React.ComponentProps<typeof Tag>['color'] }> = {
  active:  { label: 'Active',           color: 'green' },
  pending: { label: 'Pending approval', color: 'yellow' },
  revoked: { label: 'Revoked',          color: 'red' },
  expired: { label: 'Expired',          color: 'neutral' },
}

const levelAbbr = (l: Level) => (l === 'write' ? 'R/W' : l === 'read' ? 'R' : '')

// ── Cell renderers ────────────────────────────────────────────────────────

function IamCell({ account }: { account: ApiAccount }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar size={28} shape="square" icon={KeyRound} color="neutral" aria-hidden />
      <div className="min-w-0">
        <div className="text-body text-foreground truncate">{account.handle}</div>
        <div className="text-caption text-fg-muted font-mono truncate">{account.iam}</div>
      </div>
    </div>
  )
}

function AppCell({ app }: { app: ApiAccount['app'] }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar size={20} shape="square" icon={app.icon} color={app.color} aria-hidden />
      <span className="text-body text-foreground truncate">{app.name}</span>
    </div>
  )
}

// API privilege cell:前 2 個有授權的 scope 以 Tag 概覽 + 「+N」溢位,
// 點擊開 Popover 顯示完整矩陣(Stripe-style resource × level)。
function PrivilegeCell({ account, defaultOpen }: { account: ApiAccount; defaultOpen?: boolean }) {
  const granted = RESOURCES.filter((r) => account.privileges[r] !== 'none')
  if (granted.length === 0) {
    return <span className="text-body text-fg-muted">No access</span>
  }
  const head = granted.slice(0, 2)
  const overflow = granted.length - head.length

  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 min-w-0 rounded-md -mx-1 px-1 py-0.5 hover:bg-neutral-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`檢視 ${account.handle} 的 API 權限`}
        >
          {head.map((r) => (
            <Tag key={r} color="neutral" size="sm">{`${r} · ${levelAbbr(account.privileges[r])}`}</Tag>
          ))}
          {overflow > 0 && <Tag color="neutral" size="sm">{`+${overflow}`}</Tag>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <PopoverHeader>
          <PopoverTitle>API privilege</PopoverTitle>
        </PopoverHeader>
        <PopoverBody>
          <ul className="flex flex-col gap-1.5">
            {RESOURCES.map((r) => {
              const lvl = account.privileges[r]
              return (
                <li key={r} className="flex items-center justify-between gap-3">
                  <span className="text-body text-foreground">{r}</span>
                  {lvl === 'write' ? (
                    <Tag color="blue" size="sm" solid>Write</Tag>
                  ) : lvl === 'read' ? (
                    <Tag color="neutral" size="sm">Read</Tag>
                  ) : (
                    <span className="text-caption text-fg-muted">No access</span>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="text-caption text-fg-muted mt-3 pt-3 border-t border-divider">
            Write 權限含 Read。授予每個整合最小必要權限。
          </p>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

function RowActions({ account, defaultOpen }: { account: ApiAccount; defaultOpen?: boolean }) {
  const isRevoked = account.status === 'revoked'
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="text" size="xs" iconOnly startIcon={MoreVertical} aria-label={`${account.handle} 操作`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem startIcon={Pencil}>編輯權限</DropdownMenuItem>
        <DropdownMenuItem startIcon={RotateCcw}>輪替金鑰</DropdownMenuItem>
        <DropdownMenuItem startIcon={ScrollText}>檢視稽核紀錄</DropdownMenuItem>
        <DropdownMenuSeparator />
        {isRevoked ? (
          <DropdownMenuItem startIcon={PlayCircle}>重新啟用</DropdownMenuItem>
        ) : (
          <DropdownMenuItem startIcon={PauseCircle}>暫停</DropdownMenuItem>
        )}
        <DropdownMenuItem startIcon={ShieldX} className="text-error">撤銷授權</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Column definitions ──────────────────────────────────────────────────────

const col = createColumnHelper<ApiAccount>()

const apiColumns: ColumnDef<ApiAccount, any>[] = [
  col.accessor('iam', {
    header: 'IAM account', meta: { width: 240 },
    cell: (info) => <IamCell account={info.row.original} />,
  }),
  col.accessor((r) => r.app.name, {
    id: 'app', header: 'APP name', meta: { width: 160 },
    cell: (info) => <AppCell app={info.row.original.app} />,
  }),
  col.accessor('purpose', { header: 'Purpose', meta: { type: 'string', width: 220 } }),
  col.accessor('role', {
    header: 'Role', meta: { width: 120 },
    cell: (info) => {
      const m = ROLE_META[info.getValue() as Role]
      return <Tag color={m.color} size="sm">{m.label}</Tag>
    },
  }),
  col.accessor((r) => r.privileges, {
    id: 'privilege', header: 'API privilege', meta: { width: 230 },
    cell: (info) => <PrivilegeCell account={info.row.original} />,
  }),
  col.accessor('status', {
    header: 'Status', meta: { width: 150 },
    cell: (info) => {
      const m = STATUS_META[info.getValue() as Status]
      return <Tag color={m.color} size="sm">{m.label}</Tag>
    },
  }),
  col.accessor('lastUsed', {
    header: 'Last used', meta: { width: 120 },
    cell: (info) => <span className="text-body text-fg-secondary">{info.getValue() as string}</span>,
  }),
  col.accessor('expiry', {
    header: 'Expiry', meta: { width: 140 },
    cell: (info) => {
      const v = info.getValue() as string | null
      if (v === null) {
        return (
          <span className="inline-flex items-center gap-1 text-body text-[var(--color-yellow-7)]">
            <ShieldAlert size={14} aria-hidden /> 無到期
          </span>
        )
      }
      return <span className="text-body text-fg-secondary">{v}</span>
    },
  }),
]

// ── Section scaffold(章節標題 + 工具列)───────────────────────────────────

function SectionHeader({
  title, count, description, action,
}: { title: string; count: number; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-body-lg font-medium text-foreground">{title}</h3>
          <Tag color="neutral" size="sm">{String(count)}</Tag>
        </div>
        <p className="text-body text-fg-secondary mt-0.5">{description}</p>
      </div>
      {action}
    </div>
  )
}

function ApiAccountsToolbar() {
  return (
    <div className="flex items-center gap-2 mt-4 mb-3">
      <Input startIcon={Search} placeholder="搜尋 IAM account 或 APP" className="w-72" aria-label="搜尋 API accounts" />
      <Button variant="secondary" size="md" startIcon={Filter}>篩選</Button>
    </div>
  )
}

// ── Authorize flow(Dialog)───────────────────────────────────────────────

const ROLE_OPTIONS = (Object.keys(ROLE_META) as Role[]).map((r) => ({ value: r, label: ROLE_META[r].label }))

function PrivilegeMatrixRow({ resource }: { resource: Resource }) {
  const [level, setLevel] = React.useState<Level>('none')
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-body text-foreground">{resource}</span>
      <SegmentedControl size="sm" value={level} onValueChange={(v) => setLevel(v as Level)}>
        <SegmentedControlItem value="none">None</SegmentedControlItem>
        <SegmentedControlItem value="read">Read</SegmentedControlItem>
        <SegmentedControlItem value="write">Write</SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
}

function AuthorizeDialog({ trigger, defaultOpen }: { trigger: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>授權 API account</DialogTitle>
          <DialogDescription>
            授予整合存取此空間的權限。Role 決定治理身分,API privilege 決定可呼叫的 API scope。
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Field>
            <FieldLabel>IAM account</FieldLabel>
            <Input placeholder="svc-name@acme.iam" />
            <FieldDescription>機器身分,需已在組織 IAM 建立。</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>APP name</FieldLabel>
            <Input placeholder="例:Confluence Cloud" />
          </Field>
          <Field>
            <FieldLabel>Purpose</FieldLabel>
            <Textarea placeholder="這個整合為什麼需要存取此空間?" rows={2} />
          </Field>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <Select options={ROLE_OPTIONS} defaultValue="reader" placeholder="選擇治理身分" />
          </Field>
          <div>
            <div className="text-body font-medium text-foreground mb-1">API privilege</div>
            <p className="text-caption text-fg-muted mb-3">逐 resource 設定 None / Read / Write。Write 含 Read。</p>
            <div className="flex flex-col gap-2.5">
              {RESOURCES.map((r) => <PrivilegeMatrixRow key={r} resource={r} />)}
            </div>
          </div>
          <Field>
            <FieldLabel>Expiry</FieldLabel>
            <Select
              options={[
                { value: '90', label: '90 天' },
                { value: '180', label: '180 天' },
                { value: '365', label: '1 年' },
                { value: 'none', label: '無到期(不建議)' },
              ]}
              defaultValue="90"
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary">取消</Button></DialogClose>
          <DialogClose asChild><Button variant="primary">授權並產生金鑰</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const authorizeButton = <Button variant="primary" size="md" startIcon={Plus}>授權 API account</Button>

// ── Members section(既有表格,提供同頁脈絡)────────────────────────────

const MEMBERS: PersonData[] = [
  { name: 'Aaron Sung', avatarUrl: 'https://i.pravatar.cc/128?u=aaron', description: 'Platform｜Taipei', status: 'online', fields: [{ label: '部門', value: 'Platform' }] },
  { name: 'Mei Lin', avatarUrl: 'https://i.pravatar.cc/128?u=mei', description: 'Docs｜Taipei', status: 'busy', fields: [{ label: '部門', value: 'Docs' }] },
  { name: 'David Wu', avatarUrl: 'https://i.pravatar.cc/128?u=david', description: 'Eng｜Hong Kong', status: 'offline', fields: [{ label: '部門', value: 'Engineering' }] },
]

interface Member { id: string; person: PersonData; role: Role; access: string }
const MEMBER_ROWS: Member[] = [
  { id: 'm1', person: MEMBERS[0], role: 'owner', access: '完整存取' },
  { id: 'm2', person: MEMBERS[1], role: 'editor', access: '可編輯' },
  { id: 'm3', person: MEMBERS[2], role: 'reader', access: '唯讀' },
]
const memberCol = createColumnHelper<Member>()
const memberColumns: ColumnDef<Member, any>[] = [
  memberCol.accessor('person', { header: '成員', meta: { type: 'person', width: 240 } }),
  memberCol.accessor('role', {
    header: 'Role', meta: { width: 120 },
    cell: (info) => { const m = ROLE_META[info.getValue() as Role]; return <Tag color={m.color} size="sm">{m.label}</Tag> },
  }),
  memberCol.accessor('access', { header: '存取範圍', meta: { type: 'string', width: 160 } }),
]

// ── Stories ───────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Explorations/Space Settings/Permissions ▸ API accounts',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

/** 完整 Permissions 頁:既有「空間成員」section + 新增「API accounts」section,放在 4 個設定分頁脈絡中。 */
export const PermissionsPage: Story = {
  name: '完整 Permissions 頁',
  render: () => (
    <div className="min-h-screen bg-surface p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-heading font-semibold text-foreground mb-1">Engineering · 空間設定</h1>
        <p className="text-body text-fg-secondary mb-6">管理此空間的成員、API 授權與工作流程。</p>

        <Tabs defaultValue="permissions">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="approval">Approval</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="pt-6">
            {/* Section 1 — 既有成員表格 */}
            <SectionHeader
              title="Space members"
              count={MEMBER_ROWS.length}
              description="可存取此空間的人員與其治理身分。"
              action={<Button variant="secondary" size="md" startIcon={Plus}>邀請成員</Button>}
            />
            <div className="mt-3">
              <DataTable columns={memberColumns} data={MEMBER_ROWS} height="auto" />
            </div>

            <Separator className="my-8" />

            {/* Section 2 — 新增 API accounts 表格 */}
            <SectionHeader
              title="API accounts"
              count={ACCOUNTS.length}
              description="透過 API 存取此空間的服務帳號與整合。授予每個整合最小必要權限。"
              action={<AuthorizeDialog trigger={authorizeButton} />}
            />
            <ApiAccountsToolbar />
            <DataTable
              columns={apiColumns}
              data={ACCOUNTS}
              height="auto"
              rowActions={(row) => <RowActions account={row} />}
            />
          </TabsContent>

          <TabsContent value="general" className="pt-6">
            <p className="text-body text-fg-muted">General 設定(略)</p>
          </TabsContent>
          <TabsContent value="approval" className="pt-6">
            <p className="text-body text-fg-muted">Approval 工作流程(略)— Status「Pending approval」的 API account 會在此審批。</p>
          </TabsContent>
          <TabsContent value="advanced" className="pt-6">
            <p className="text-body text-fg-muted">Advanced 設定(略)— 金鑰輪替政策、最大權限上限。</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
}

/** 授權流程 Dialog 單獨展示(預設展開,visual snapshot 可見)。 */
export const AuthorizeApiAccount: Story = {
  name: '授權 API account(Dialog)',
  render: () => (
    <div className="min-h-screen bg-surface grid place-content-center">
      <AuthorizeDialog trigger={authorizeButton} defaultOpen />
    </div>
  ),
}

/** API privilege Popover 展開:Stripe-style per-resource None/Read/Write 矩陣。 */
export const PrivilegeMatrixOpen: Story = {
  name: 'API privilege Popover(展開)',
  render: () => (
    <div className="min-h-screen bg-surface grid place-content-center">
      <PrivilegeCell account={ACCOUNTS[0]} defaultOpen />
    </div>
  ),
}

/** 列操作選單展開:編輯 / 輪替 / 稽核 / 暫停 / 撤銷(danger)。 */
export const RowActionsOpen: Story = {
  name: '列操作選單(展開)',
  render: () => (
    <div className="min-h-screen bg-surface grid place-content-center">
      <RowActions account={ACCOUNTS[0]} defaultOpen />
    </div>
  ),
}

/** 空狀態:尚無任何 API account 被授權。 */
export const EmptyState: Story = {
  name: '空狀態',
  render: () => (
    <div className="min-h-screen bg-surface p-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          title="API accounts"
          count={0}
          description="透過 API 存取此空間的服務帳號與整合。"
          action={<AuthorizeDialog trigger={authorizeButton} />}
        />
        <ApiAccountsToolbar />
        <div className="rounded-lg border border-divider py-16">
          <Empty
            icon={Bot}
            title="尚未授權任何 API account"
            description="當你授權整合存取此空間時,它們會列在這裡。授予每個整合最小必要權限。"
            action={<AuthorizeDialog trigger={<Button variant="primary" startIcon={Plus}>授權 API account</Button>} />}
          />
        </div>
      </div>
    </div>
  ),
}
