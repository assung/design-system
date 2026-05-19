// @anatomy-exempt: pattern-level demo,展示 SSOT 契約而非業務情境表格。
import type { Meta, StoryObj } from '@storybook/react'

import { ChromeHeader } from './chrome-header'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/components/Dialog/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/design-system/components/Sheet/sheet'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/design-system/components/Tabs/tabs'
import { Button } from '@/design-system/components/Button/button'

const meta: Meta = {
  title: 'Design System/Patterns/Header Canonical',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

/**
 * 範例補完(2026-05-18 audit gap):header-canonical pattern 訂 6 consumer + W1-W6
 * 契約但無 stories 視覺化,人類打開 Storybook 看不到實際示範。本檔補 4 demo
 * 對應 spec.md「withTabs 連動」核心契約 + 雙線禁止 anchor。
 */

// ──────────────────────────────────────────────────────────────────────────────
// Demo 1: Dialog header(withTabs=false)— header 自畫 border-b
// ──────────────────────────────────────────────────────────────────────────────

export const DialogHeaderDefault: Story = {
  name: 'Dialog 標頭（單線,header 自畫）',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">打開單純 Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>專案設定</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-body">內容區。Header 跟 Body 之間有一條 `border-b border-divider`,由 DialogHeader 自畫。</p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  ),
}

// ──────────────────────────────────────────────────────────────────────────────
// Demo 2: Dialog header + Tabs(withTabs=true 接管 border paint)
// ──────────────────────────────────────────────────────────────────────────────

export const DialogHeaderWithTabs: Story = {
  name: 'Dialog 標頭內含 Tabs（border 交由 Tabs 接管,避免雙線）',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">打開含分頁的 Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader withTabs>
          <DialogTitle>專案設定</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">一般</TabsTrigger>
            <TabsTrigger value="members">成員</TabsTrigger>
            <TabsTrigger value="integrations">整合</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="p-loose">
            一般設定內容。
          </TabsContent>
          <TabsContent value="members" className="p-loose">
            成員管理內容。
          </TabsContent>
          <TabsContent value="integrations" className="p-loose">
            第三方整合內容。
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  ),
}

// ──────────────────────────────────────────────────────────────────────────────
// Demo 3: Sheet header + Tabs
// ──────────────────────────────────────────────────────────────────────────────

export const SheetHeaderWithTabs: Story = {
  name: 'Sheet 標頭內含 Tabs（同 Dialog 契約）',
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">打開側邊抽屜</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader withTabs>
          <SheetTitle>使用者資料</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">個人資料</TabsTrigger>
            <TabsTrigger value="activity">活動記錄</TabsTrigger>
            <TabsTrigger value="permissions">權限</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="p-loose">基本資料</TabsContent>
          <TabsContent value="activity" className="p-loose">登入歷史 / 操作記錄</TabsContent>
          <TabsContent value="permissions" className="p-loose">可存取的專案 / 資料夾</TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  ),
}

// ──────────────────────────────────────────────────────────────────────────────
// Demo 4: ChromeHeader primitive 直接用(Page top bar / Drawer 等場景)
// ──────────────────────────────────────────────────────────────────────────────

export const ChromeHeaderWithTabs: Story = {
  name: 'ChromeHeader 主檔 primitive（無 Dialog 包裝）',
  render: () => (
    <div className="border border-divider rounded-md w-[640px] bg-surface">
      <ChromeHeader withTabs>
        <span className="text-body font-medium">分析儀表板</span>
      </ChromeHeader>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">概覽</TabsTrigger>
          <TabsTrigger value="traffic">流量</TabsTrigger>
          <TabsTrigger value="conversions">轉換率</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="p-loose">每日 active user / 留存 / NPS</TabsContent>
        <TabsContent value="traffic" className="p-loose">流量來源 / referrer / search</TabsContent>
        <TabsContent value="conversions" className="p-loose">funnel / 轉換漏斗</TabsContent>
      </Tabs>
    </div>
  ),
}

// ──────────────────────────────────────────────────────────────────────────────
// Demo 5: ChromeHeader 不含 Tabs(對照組 — 看 border 仍由 header 自畫)
// ──────────────────────────────────────────────────────────────────────────────

export const ChromeHeaderDefault: Story = {
  name: 'ChromeHeader 主檔 primitive（無分頁,header 自畫 border）',
  render: () => (
    <div className="border border-divider rounded-md w-[640px] bg-surface">
      <ChromeHeader>
        <span className="text-body font-medium">分析儀表板</span>
        <div className="flex-1" />
        <Button variant="text" size="sm">設定</Button>
      </ChromeHeader>
      <div className="p-loose text-body">
        Body 內容。Header 跟 body 中間有 `border-b border-divider`。
      </div>
    </div>
  ),
}
