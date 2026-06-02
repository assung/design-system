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
  PlayCircle, ScrollText, ShieldX, ShieldAlert, ExternalLink, Eye,
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
import {
  Sheet, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetClose,
} from '@/design-system/components/Sheet/sheet'
import { DescriptionList, DescriptionItem } from '@/design-system/components/DescriptionList/description-list'

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

// 詳情抽屜用的延伸 metadata(建立者 / 建立於 / 金鑰 ID)— 與表格欄分離,避免主表臃腫
const ACCOUNT_META: Record<string, { owner: string; created: string; keyId: string; activity: string[] }> = {
  a1: { owner: 'Aaron Sung', created: '2025-11-03', keyId: 'key_live_…a91f', activity: ['8 分鐘前 — 寫入 12 個頁面', '今天 02:00 — 排程同步成功', '昨天 — 輪替金鑰'] },
  a2: { owner: 'Mei Lin', created: '2025-09-21', keyId: 'key_live_…3c7d', activity: ['2 分鐘前 — 索引 340 個頁面', '1 小時前 — 索引 12 個附件', '今天 06:00 — 全量重建'] },
  a3: { owner: 'David Wu', created: '2026-01-14', keyId: 'key_live_…f205', activity: ['1 小時前 — 推送 3 則通知', '今天 — 訂閱 page.published', '3 天前 — 更新 webhook URL'] },
  a4: { owner: 'Aaron Sung', created: '2025-06-30', keyId: 'key_live_…8b1e', activity: ['3 天前 — 匯出 1.2 GB', '上週 — 匯出成功', '2025-12 — 建立'] },
  a5: { owner: 'Mei Lin', created: '2026-05-28', keyId: '(尚未產生)', activity: ['等待管理員審批中'] },
  a6: { owner: 'David Wu', created: '2024-08-02', keyId: '(已撤銷)', activity: ['41 天前 — 最後一次讀取', '2024-09 — 遷移完成', '2024-08 — 建立'] },
}

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

function RowActions({ account, defaultOpen, onViewDetails }: { account: ApiAccount; defaultOpen?: boolean; onViewDetails?: () => void }) {
  const isRevoked = account.status === 'revoked'
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="text" size="xs" iconOnly startIcon={MoreVertical} aria-label={`${account.handle} 操作`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem startIcon={Eye} onSelect={() => onViewDetails?.()}>檢視詳情</DropdownMenuItem>
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

function PrivilegeMatrixRow({ resource, defaultLevel = 'none' }: { resource: Resource; defaultLevel?: Level }) {
  const [level, setLevel] = React.useState<Level>(defaultLevel)
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

// ── Row-detail drawer(Sheet)─────────────────────────────────────────────

function DrawerSection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-body font-medium text-foreground">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  )
}

/** 點 row「檢視詳情」開啟的右側抽屜:身分 / Role / 可編輯權限矩陣 / 金鑰 / 用量 / 生命週期。 */
function AccountDetailSheet({
  account, open, onOpenChange,
}: { account: ApiAccount | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!account) return null
  const meta = ACCOUNT_META[account.id]
  const status = STATUS_META[account.status]
  const role = ROLE_META[account.role]
  const isRevoked = account.status === 'revoked'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3 min-w-0">
            <Avatar size={36} shape="square" icon={KeyRound} color="neutral" aria-hidden />
            <div className="min-w-0">
              <SheetTitle className="truncate">{account.handle}</SheetTitle>
              <p className="text-caption text-fg-muted font-mono truncate">{account.iam}</p>
            </div>
          </div>
        </SheetHeader>

        <SheetBody className="flex flex-col gap-[var(--layout-space-loose)]">
          {/* Overview */}
          <DrawerSection title="總覽" action={<Tag color={status.color} size="sm">{status.label}</Tag>}>
            <DescriptionList direction="horizontal">
              <DescriptionItem label="APP name">
                <span className="inline-flex items-center gap-1.5">
                  <Avatar size={16} shape="square" icon={account.app.icon} color={account.app.color} aria-hidden />
                  {account.app.name}
                </span>
              </DescriptionItem>
              <DescriptionItem label="Purpose">{account.purpose}</DescriptionItem>
              <DescriptionItem label="建立者">{meta.owner}</DescriptionItem>
              <DescriptionItem label="建立於">{meta.created}</DescriptionItem>
              <DescriptionItem label="Last used">{account.lastUsed}</DescriptionItem>
              <DescriptionItem label="Expiry">
                {account.expiry === null
                  ? <span className="inline-flex items-center gap-1 text-[var(--color-yellow-7)]"><ShieldAlert size={14} aria-hidden /> 無到期</span>
                  : account.expiry}
              </DescriptionItem>
            </DescriptionList>
          </DrawerSection>

          {/* Role(治理身分,獨立軸)*/}
          <DrawerSection title="Role">
            <p className="text-caption text-fg-muted mb-2">帳號在此空間的治理身分(沿用成員語彙),獨立於 API scope。</p>
            <Select options={ROLE_OPTIONS} defaultValue={account.role} />
          </DrawerSection>

          {/* API privilege(技術 scope,可編輯矩陣)*/}
          <DrawerSection title="API privilege">
            <p className="text-caption text-fg-muted mb-3">逐 resource 設定 None / Read / Write。Write 含 Read。</p>
            <div className="flex flex-col gap-2.5">
              {RESOURCES.map((r) => <PrivilegeMatrixRow key={r} resource={r} defaultLevel={account.privileges[r]} />)}
            </div>
          </DrawerSection>

          {/* Key management */}
          <DrawerSection title="金鑰" action={<Button variant="secondary" size="sm" startIcon={RotateCcw}>輪替金鑰</Button>}>
            <DescriptionList direction="horizontal">
              <DescriptionItem label="金鑰 ID"><span className="font-mono">{meta.keyId}</span></DescriptionItem>
            </DescriptionList>
            <p className="text-caption text-fg-muted mt-2">完整金鑰僅在產生時顯示一次,無法再次檢視。輪替會立即失效舊金鑰。</p>
          </DrawerSection>

          {/* Recent activity */}
          <DrawerSection title="近期活動" action={<Button variant="text" size="sm" endIcon={ExternalLink}>完整稽核紀錄</Button>}>
            <ul className="flex flex-col gap-1.5">
              {meta.activity.map((line, i) => (
                <li key={i} className="text-caption text-fg-secondary">{line}</li>
              ))}
            </ul>
          </DrawerSection>
        </SheetBody>

        <SheetFooter>
          <div className="flex items-center justify-between w-full gap-2">
            {isRevoked
              ? <Button variant="secondary" startIcon={PlayCircle}>重新啟用</Button>
              : <Button variant="secondary" startIcon={PauseCircle}>暫停</Button>}
            <div className="flex items-center gap-2">
              <SheetClose asChild><Button variant="secondary">關閉</Button></SheetClose>
              <Button variant="secondary" danger startIcon={ShieldX}>撤銷授權</Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/** API accounts section — 章節標題 + 工具列 + 表格 + 受控詳情抽屜(row「檢視詳情」開啟)。 */
function ApiAccountsSection() {
  const [detail, setDetail] = React.useState<ApiAccount | null>(null)
  return (
    <>
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
        rowActions={(row) => <RowActions account={row} onViewDetails={() => setDetail(row)} />}
      />
      <AccountDetailSheet account={detail} open={detail !== null} onOpenChange={(o) => !o && setDetail(null)} />
    </>
  )
}

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

            {/* Section 2 — 新增 API accounts 表格 + 詳情抽屜 */}
            <ApiAccountsSection />
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

/** Row 詳情抽屜展開:身分 / Role / 可編輯權限矩陣 / 金鑰 / 用量 / 生命週期。 */
export const AccountDetailDrawer: Story = {
  name: '帳號詳情抽屜(展開)',
  render: () => {
    const [open, setOpen] = React.useState(true)
    return (
      <div className="min-h-screen bg-surface p-8">
        <Button variant="secondary" onClick={() => setOpen(true)}>開啟詳情抽屜</Button>
        <AccountDetailSheet account={ACCOUNTS[0]} open={open} onOpenChange={setOpen} />
      </div>
    )
  },
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
