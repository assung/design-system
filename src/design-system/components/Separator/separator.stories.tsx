import type { Meta, StoryObj } from '@storybook/react'
import { MoreVertical, Pencil, Copy, Trash2, User, Bell, Shield } from 'lucide-react'
import { Separator } from './separator'
import { DescriptionList, DescriptionItem } from '@/design-system/components/DescriptionList/description-list'
import { Button } from '@/design-system/components/Button/button'
import { MenuItem } from '@/design-system/components/Menu/menu-item'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/design-system/components/DropdownMenu/dropdown-menu'

const meta: Meta<typeof Separator> = {
  title: 'Design System/Components/Separator/展示',
  component: Separator,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '語意分隔元件（Radix Separator passthrough）——只用於 consumer 手動放置的分隔線。色彩固定為 `--divider` token，無 size / variant。',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Separator>

/* ── Horizontal(預設)──────────────────────────────────────────────── */
// Settings page / overview panel 的分段 rows。**每個 row 消費 MenuItem**(Family 1 item-anatomy
// 正式消費者),有 icon prefix + label + description;Separator 切出 row group 之間的視覺分段。
// 對應 iOS Settings / Notion Workspace settings / Linear user settings canonical。
export const Horizontal: Story = {
  name: 'Horizontal',
  render: () => (
    <div role="listbox" aria-label="settings sections demo" className="border border-border rounded-lg max-w-md overflow-hidden">
      <MenuItem
        startIcon={User}
        description="Email、時區、顯示語言"
      >
        帳號設定
      </MenuItem>
      <Separator />
      <MenuItem
        startIcon={Bell}
        description="Email / 推播通知規則"
      >
        通知
      </MenuItem>
      <Separator />
      <MenuItem
        startIcon={Shield}
        description="資料分享範圍、權限層級"
      >
        隱私
      </MenuItem>
    </div>
  ),
}

/* ── Vertical（垂直分隔，toolbar 間隔）──────────────────────────────────── */
export const Vertical: Story = {
  name: 'Vertical',
  render: () => (
    <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 w-fit">
      <Button variant="text" size="sm">編輯</Button>
      <Button variant="text" size="sm">複製</Button>
      <Separator orientation="vertical" className="h-5" />
      <Button variant="text" size="sm">分享</Button>
      <Button variant="text" size="sm">下載</Button>
      <Separator orientation="vertical" className="h-5" />
      <Button variant="text" size="sm" danger>刪除</Button>
    </div>
  ),
}

/* ── 在 DropdownMenu 內 ─────────────────────────────────────────────── */
export const InDropdownMenu: Story = {
  name: '在 DropdownMenu 內',
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="tertiary" size="sm" startIcon={MoreVertical}>
          更多操作
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem startIcon={Pencil}>重新命名</DropdownMenuItem>
        <DropdownMenuItem startIcon={Copy}>複製連結</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem startIcon={Trash2}>刪除</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/* ── 在 DescriptionList 之間 ────────────────────────────────────────── */
export const BetweenSections: Story = {
  name: '在 DescriptionList 區塊之間',
  render: () => (
    <div className="border border-border rounded-lg p-4 max-w-md flex flex-col gap-4">
      {/*
       * heading → first-item gap 對齊 item → item gap(都是 layout-space-tight):
       * Gestalt proximity canonical —— 相同距離代表 heading 擁有下方 items;
       * 若拉大 gap 反而讓 heading 看似「分離」,與 items 的歸屬關係變弱。世界級 idiom:
       * iOS Settings / Notion properties / Ant Descriptions 皆採相等 gap。
       */}
      <div>
        <div className="text-body font-medium mb-[var(--layout-space-tight)]">基本資料</div>
        <DescriptionList cols={1}>
          <DescriptionItem label="姓名">Ada Chen</DescriptionItem>
          <DescriptionItem label="Email">ada.chen@example.com</DescriptionItem>
        </DescriptionList>
      </div>
      <Separator />
      <div>
        <div className="text-body font-medium mb-[var(--layout-space-tight)]">團隊資訊</div>
        <DescriptionList cols={1}>
          <DescriptionItem label="團隊">Design Systems</DescriptionItem>
          <DescriptionItem label="職稱">Design Engineer</DescriptionItem>
        </DescriptionList>
      </div>
    </div>
  ),
}
