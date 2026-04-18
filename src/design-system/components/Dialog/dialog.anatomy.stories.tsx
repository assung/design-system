import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from './dialog'
import { Button } from '@/design-system/components/Button/button'
import { Input } from '@/design-system/components/Input/input'
import { Field, FieldLabel, FieldGroup } from '@/design-system/components/Field/field'

const meta: Meta = {
  title: 'Design System/Components/Dialog/設計規格',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-body font-bold text-foreground mb-2">{children}</h3>
)
const Desc = ({ children }: { children: React.ReactNode }) => (
  <p className="text-caption text-fg-muted mb-4 max-w-[720px] leading-relaxed">{children}</p>
)
const Td = ({ children, mono }: { children: React.ReactNode; mono?: boolean }) => (
  <td className={`border border-border px-3 py-1.5 text-caption ${mono ? 'font-mono' : ''}`}>{children}</td>
)
const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="border border-border px-3 py-1.5 text-caption text-fg-secondary bg-muted text-left">{children}</th>
)

export const Overview: Story = {
  name: '元件總覽',
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <H3>Anatomy</H3>
        <Desc>Dialog 由 Overlay + Content 組成。Content 分三個區塊:Header(邊框底)+ Body(可捲動 flex-1)+ Footer(邊框頂)。基於 Radix Dialog(shadcn 包裝),橋接 DS token。</Desc>
        <div className="border border-border rounded-lg p-4 max-w-md">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="primary">開啟 Dialog 範例</Button>
            </DialogTrigger>
            <DialogContent autoHeight maxWidth={480}>
              <DialogHeader>
                <DialogTitle>建立新專案</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <FieldGroup>
                  <Field required>
                    <FieldLabel>專案名稱</FieldLabel>
                    <Input placeholder="例:Q1 行銷活動" />
                  </Field>
                  <Field>
                    <FieldLabel>描述</FieldLabel>
                    <Input placeholder="簡短描述..." />
                  </Field>
                </FieldGroup>
              </DialogBody>
              <DialogFooter>
                <Button variant="tertiary">取消</Button>
                <Button variant="primary">建立</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        <H3>結構說明</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>區塊</Th><Th>CSS</Th><Th>用途</Th></tr></thead>
            <tbody>
              <tr><Td mono>DialogHeader</Td><Td mono>border-b, px-loose py-tight</Td><Td>Title + Close button(fixed top-right)</Td></tr>
              <tr><Td mono>DialogBody</Td><Td mono>flex-1, overflow-y-auto, px-loose pt-tight pb-bottom</Td><Td>主要內容(可捲動,底部留較大空間)</Td></tr>
              <tr><Td mono>DialogFooter</Td><Td mono>border-t, px-loose py-tight</Td><Td>Action buttons(justify-end, gap-2)</Td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <H3>Props 速查</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Prop</Th><Th>Type</Th><Th>Default</Th><Th>說明</Th></tr></thead>
            <tbody>
              {[
                ['autoHeight', 'boolean', 'false', 'true=隨內容 / false=填滿 viewport(body 捲動)'],
                ['maxWidth', 'number', '512', 'Content 最大寬度(px),受 viewport inset 限制'],
              ].map(([p, t, d, desc]) => (
                <tr key={p}><Td mono>{p}</Td><Td mono>{t}</Td><Td mono>{d}</Td><Td>{desc}</Td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}

export const HeightBehavior: Story = {
  name: '高度行為(預設填滿 vs autoHeight)',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <H3>預設(填滿 viewport)</H3>
        <Desc>`height = 100vh - inset*2`,Body 捲動。防止動態內容(載入資料、展開 section)造成 dialog 跳動。適合內容量不確定的場景。</Desc>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="tertiary">填滿 viewport(20 個欄位)</Button>
          </DialogTrigger>
          <DialogContent maxWidth={560}>
            <DialogHeader>
              <DialogTitle>系統設定</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <FieldGroup>
                {Array.from({ length: 20 }).map((_, i) => (
                  <Field key={i}>
                    <FieldLabel>設定項目 {i + 1}</FieldLabel>
                    <Input placeholder={`設定值 ${i + 1}`} />
                  </Field>
                ))}
              </FieldGroup>
            </DialogBody>
            <DialogFooter>
              <Button variant="tertiary">取消</Button>
              <Button variant="primary">儲存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <H3>autoHeight</H3>
        <Desc>高度隨內容,超過 viewport 時套 max-height 安全帽。適合內容量已知且穩定的場景(確認框、短表單)。</Desc>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="tertiary">autoHeight(短確認)</Button>
          </DialogTrigger>
          <DialogContent autoHeight maxWidth={440}>
            <DialogHeader>
              <DialogTitle>確認儲存?</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p className="text-body">變更將儲存到雲端,其他協作者將看到更新。</p>
            </DialogBody>
            <DialogFooter>
              <Button variant="tertiary">取消</Button>
              <Button variant="primary">儲存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  ),
}

export const DestructiveMatrix: Story = {
  name: '破壞性動作 Dialog',
  render: () => (
    <div className="flex flex-col gap-8 max-w-md">
      <div>
        <H3>破壞性動作的 footer 配對</H3>
        <Desc>破壞性動作用 primary + danger(立即不可逆)。必須搭配 Cancel button 讓使用者反悔。Title 用問句讓使用者意識到「這是個決策」。</Desc>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="tertiary" startIcon={Trash2}>刪除專案(含確認)</Button>
          </DialogTrigger>
          <DialogContent autoHeight maxWidth={440}>
            <DialogHeader>
              <DialogTitle>確定要永久刪除此專案?</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p className="text-body">此動作無法復原,所有相關資料將一併刪除。</p>
            </DialogBody>
            <DialogFooter>
              <Button variant="tertiary">取消</Button>
              <Button variant="primary" danger startIcon={Trash2}>永久刪除</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  ),
}

export const TokenMatrix: Story = {
  name: 'Token 對照',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <H3>Density</H3>
        <Desc>`DialogContent` 強制 `data-density="lg"`——dialog 內所有子元件 token 解析為 lg 模式。Dialog 是獨立上下文,不繼承頁面 density。</Desc>
      </div>

      <div>
        <H3>Layout token</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Area</Th><Th>Token</Th><Th>數值</Th></tr></thead>
            <tbody>
              <tr><Td>水平 padding(Header / Body / Footer 統一)</Td><Td mono>--layout-space-loose</Td><Td>24/32 px</Td></tr>
              <tr><Td>Header / Footer 垂直 padding</Td><Td mono>--layout-space-tight</Td><Td>12/16 px</Td></tr>
              <tr><Td>Body 垂直 padding(top)</Td><Td mono>--layout-space-tight</Td><Td>12/16 px</Td></tr>
              <tr><Td>Body 垂直 padding(bottom)</Td><Td mono>--layout-space-bottom</Td><Td>48 px(固定)</Td></tr>
              <tr><Td>Viewport inset(四邊)</Td><Td mono>--layout-space-bottom</Td><Td>48 px(四邊統一)</Td></tr>
              <tr><Td>Footer 按鈕間距</Td><Td mono>gap-2</Td><Td>8 px</Td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <H3>視覺 token</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>屬性</Th><Th>Token</Th></tr></thead>
            <tbody>
              <tr><Td>Overlay</Td><Td mono>bg-overlay</Td></tr>
              <tr><Td>Shadow</Td><Td mono>--elevation-200(浮層級)</Td></tr>
              <tr><Td>圓角</Td><Td mono>rounded-lg(8px)</Td></tr>
              <tr><Td>背景</Td><Td mono>bg-surface-raised</Td></tr>
              <tr><Td>外邊框</Td><Td mono>border-border</Td></tr>
              <tr><Td>Header/Footer 分隔線</Td><Td mono>border-divider</Td></tr>
              <tr><Td>Title</Td><Td mono>text-body-lg font-medium truncate</Td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <H3>動畫</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>階段</Th><Th>動畫</Th></tr></thead>
            <tbody>
              <tr><Td>進場</Td><Td mono>fade-in + zoom-in-95 + slide-in-from-center</Td></tr>
              <tr><Td>離場</Td><Td mono>fade-out + zoom-out-95 + slide-out-to-center</Td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}
