import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Settings, Bell, User, Home } from 'lucide-react'
import { Avatar } from './avatar'
import { Button } from '@/design-system/components/Button/button'
import { Badge } from '@/design-system/components/Badge/badge'

const meta: Meta = {
  title: 'Design System/Components/Avatar/設計原則',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

const Rule = ({
  title, note, children,
}: {
  title: string; note?: string; children: React.ReactNode
}) => (
  <div className="mb-14">
    <h3 className="text-body font-bold text-foreground mb-1">{title}</h3>
    {note && <p className="text-caption text-fg-muted mb-5 max-w-[720px] leading-relaxed">{note}</p>}
    <div className="flex flex-col gap-3 max-w-md">{children}</div>
  </div>
)

const Label = ({ children, warn }: { children: React.ReactNode; warn?: boolean }) => (
  <p className={`text-footnote leading-normal ${warn ? 'text-error font-medium' : 'text-fg-muted'}`}>{children}</p>
)

export const IdentityVsIconRule: Story = {
  name: 'Avatar 代表身份,Icon 代表概念',
  render: () => (
    <div>
      <Rule
        title="Avatar — 代表實體（人、組織、專案、App）"
        note="留言者頭像、團隊成員、workspace logo、app 身份。視覺上 identity 是唯一的、可被辨識的"
      >
        <div className="flex items-center gap-3">
          <Avatar name="陳麒仁" size={32} />
          <span className="text-body">陳麒仁留言</span>
        </div>
        <div className="flex items-center gap-3">
          <Avatar name="Engineering Team" size={32} color="blue" />
          <span className="text-body">Engineering Team 專案</span>
        </div>
      </Rule>

      <Rule
        title="❌ 代表抽象概念：用 Lucide Icon"
        note="「設定」「通知」「首頁」這類功能 / 動作 / 概念不是「誰」,是「做什麼」。Icon 更適合——Avatar 用在這裡會讓使用者以為是某個人的頭像"
      >
        <div className="flex items-center gap-3">
          <Avatar name="S" icon={Settings} size={32} />
          <span className="text-body">❌ 設定用 Avatar</span>
        </div>
        <Label warn>↑ 「S」+ icon 讓使用者誤以為是某個人(使用者 S?)。功能導覽用 Lucide icon</Label>
        <div className="flex items-center gap-3">
          <Settings size={20} />
          <span className="text-body">✓ 設定用 Icon</span>
        </div>
      </Rule>

      <Rule
        title="判斷法：「這代表『誰』還是『做什麼』？」"
        note="誰 / 什麼實體 → Avatar;做什麼 / 某個概念 → Icon"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Avatar name="陳麒仁" size={24} />
            <span className="text-footnote text-fg-muted">人員</span>
          </div>
          <div className="flex items-center gap-2">
            <Home size={16} />
            <span className="text-footnote text-fg-muted">首頁(概念)</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar name="ABC Corp" size={24} color="purple" />
            <span className="text-footnote text-fg-muted">組織</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell size={16} />
            <span className="text-footnote text-fg-muted">通知(動作)</span>
          </div>
        </div>
      </Rule>
    </div>
  ),
}

export const FallbackRule: Story = {
  name: 'Fallback 順序',
  render: () => (
    <div>
      <Rule
        title="有 src → 顯示圖片；沒有 src / 圖片載入失敗 → 顯示 initials"
        note="Fallback 用 `name` 取首字母(中文取第一字,英文取前兩字首字母大寫)。背景色由 `color` prop 決定"
      >
        <div className="flex items-center gap-3">
          <Avatar name="陳麒仁" size={40} src="https://i.pravatar.cc/80?img=1" />
          <Avatar name="陳麒仁" size={40} />
          <Avatar name="Alice Wang" size={40} />
          <Avatar name="ABC Corp" size={40} color="blue" />
        </div>
        <Label>↑ 依序:有圖 / 中文首字 / 英文前兩字 / 組織首字 + 色彩</Label>
      </Rule>

      <Rule
        title="❌ src 壞掉又沒 name → 空 avatar（不可辨識）"
        note="Avatar 的核心是識別身份,沒 name 又沒 src 等於失去意義。必須至少有 name"
      >
        <Avatar name="" size={40} src="https://invalid-url.example/fail.jpg" />
        <Label warn>↑ 空 avatar → 使用者不知道是誰</Label>
      </Rule>
    </div>
  ),
}

export const WithBadgeOverlayRule: Story = {
  name: 'Avatar + Badge overlay（狀態通知）',
  render: () => (
    <div>
      <Rule
        title="Avatar 右上角疊 Badge dot — 在線狀態指示"
        note="人員 Avatar 疊 dot 表示 online / offline / busy。Avatar 承載身份,Badge 承載狀態"
      >
        <div className="flex items-center gap-4">
          <div className="relative inline-flex">
            <Avatar name="陳麒仁" size={40} />
            <Badge dot variant="high" className="absolute bottom-0 right-0" aria-label="在線" />
          </div>
          <div className="relative inline-flex">
            <Avatar name="Alice" size={40} />
            <Badge dot variant="low" className="absolute bottom-0 right-0" aria-label="離線" />
          </div>
          <div className="relative inline-flex">
            <Avatar name="Bob" size={40} />
            <Badge dot variant="critical" className="absolute bottom-0 right-0" aria-label="忙碌" />
          </div>
        </div>
        <Label>↑ 在線(high)/離線(low)/忙碌(critical)——dot 必有 aria-label</Label>
      </Rule>

      <Rule
        title="Avatar 疊 Badge count — 未讀訊息"
        note="chat / messenger 場景,Avatar 右上角顯示該對話的未讀數"
      >
        <div className="relative inline-flex">
          <Avatar name="陳麒仁" size={40} />
          <Badge count={3} variant="critical" className="absolute -top-1 -right-1" />
        </div>
        <Label>↑ chat list 常見 pattern</Label>
      </Rule>
    </div>
  ),
}

export const HoverCardIntegrationRule: Story = {
  name: 'Avatar + HoverCard 整合',
  render: () => (
    <div>
      <Rule
        title="人員 Avatar 用 hoverCard prop 自動整合 HoverCard"
        note="避免 consumer 手動寫 HoverCardTrigger。hoverCard prop 會自動包裝 Avatar,提供統一的人員 hover 預覽體驗"
      >
        <Avatar
          name="陳麒仁"
          size={40}
          hoverCard={
            <div className="flex flex-col gap-2 w-56">
              <div className="flex items-center gap-3">
                <Avatar name="陳麒仁" size={48} />
                <div>
                  <div className="text-body font-medium">陳麒仁</div>
                  <div className="text-caption text-fg-muted">Design Engineer · 台北</div>
                </div>
              </div>
              <Button variant="tertiary" size="sm">傳訊息</Button>
            </div>
          }
        />
        <Label>↑ hover 我的 avatar 彈出 NameCard(按 Message 按鈕不會消失)</Label>
      </Rule>

      <Rule
        title="❌ 關鍵資訊只靠 HoverCard 顯示（觸控裝置看不到）"
        note="hover 在手機 / 平板無法觸發。關鍵資訊(角色、權限、是否離職)應該在主頁面有其他管道看到,不能只靠 Avatar hover"
      >
        <Label warn>若 Avatar hover 是唯一看到「該成員已離職」的途徑 → 觸控使用者完全錯過</Label>
      </Rule>
    </div>
  ),
}
