import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { X, Download, RotateCw } from 'lucide-react'
import { FileItem } from './file-item'
import { Button } from '@/design-system/components/Button/button'

const meta: Meta = {
  title: 'Design System/Components/FileItem/設計規格',
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
        <Desc>FileItem 是組合元件——Prefix(Avatar 或 Paperclip)+ Content(name + description + 可選 progress bar)+ 可選 Actions suffix。基於 item-layout pattern。</Desc>
        <div className="flex flex-col gap-2 max-w-lg">
          <FileItem
            name="Q1-report.pdf"
            description="2.4 MB · 上傳中 75%"
            status="uploading"
            progress={75}
            mode="detail"
          />
          <FileItem
            name="beach-photo.jpg"
            description="4.8 MB"
            mode="detail"
            thumbnailSrc="https://i.pravatar.cc/112?img=3"
          />
        </div>
      </div>

      <div>
        <H3>Props 速查</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Prop</Th><Th>Type</Th><Th>Default</Th><Th>說明</Th></tr></thead>
            <tbody>
              {[
                ['name', 'string', '必填', '檔名'],
                ['mode', "'detail' | 'compact'", "'detail'", 'detail=Avatar 56px 縮圖 / compact=Paperclip 16px icon'],
                ['status', "'uploading' | 'completed' | 'error'", '—', '上傳狀態(不傳=已上傳靜態)'],
                ['progress', 'number', '—', '上傳進度 0-100(uploading 時顯示 bar)'],
                ['description', 'string', '—', 'detail 任意場景 / compact 只有 error 才顯示'],
                ['thumbnailSrc', 'string', '—', 'detail mode 的縮圖 URL(圖片類檔案)'],
                ['actions', 'ReactNode', '—', 'suffix actions(cancel / retry / download)'],
                ['onClick', '() => void', '—', '傳入後整個 item 變可點擊(hover bg + cursor-pointer)'],
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

export const ModeMatrix: Story = {
  name: 'Mode 對照(detail vs compact)',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <H3>detail — Avatar 56px square 在左</H3>
        <Desc>閱讀模式(text-body 14px 1.5 line-height),資訊容量較高。適合圖片 / 文件 / 需要縮圖的場景。</Desc>
        <div className="flex flex-col gap-2 max-w-lg">
          <FileItem name="Q1-report.pdf" description="2.4 MB · 已上傳" mode="detail" />
          <FileItem name="photo.jpg" description="4.8 MB" mode="detail" thumbnailSrc="https://i.pravatar.cc/112?img=3" />
          <FileItem name="contract.pdf" description="1.2 MB · 上傳中 45%" status="uploading" progress={45} mode="detail" />
        </div>
      </div>

      <div>
        <H3>compact — Paperclip 16px icon 在左</H3>
        <Desc>掃描模式(text-caption),資訊密度高。適合批次上傳的 logs / CSV / JSON。Description 只在 error 才顯示。</Desc>
        <div className="flex flex-col gap-1 max-w-lg">
          <FileItem name="users.csv" mode="compact" status="completed" progress={100} />
          <FileItem name="orders.json" mode="compact" status="uploading" progress={42} />
          <FileItem name="products.xlsx" mode="compact" status="error" description="檔案格式不支援" />
          <FileItem name="logs.txt" mode="compact" status="completed" progress={100} />
        </div>
      </div>

      <div>
        <H3>Mode 對照</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Mode</Th><Th>Prefix</Th><Th>Typography</Th><Th>Description</Th><Th>使用場景</Th></tr></thead>
            <tbody>
              <tr><Td mono>detail</Td><Td>Avatar 48px square</Td><Td>閱讀模式(text-body)</Td><Td>任何場景</Td><Td>圖片、文件、需要預覽</Td></tr>
              <tr><Td mono>compact</Td><Td>Paperclip 16px</Td><Td>掃描模式(text-caption)</Td><Td>只有 error 才顯示</Td><Td>批次上傳、一般檔案</Td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}

export const StatusMatrix: Story = {
  name: '狀態(uploading / completed / error / 靜態)',
  render: () => (
    <div className="flex flex-col gap-4 max-w-lg">
      <div>
        <H3>所有狀態對照</H3>
        <div className="flex flex-col gap-2">
          <FileItem name="uploading.pdf" description="2.4 MB · 上傳中 60%" status="uploading" progress={60} mode="detail" actions={<Button variant="tertiary" size="sm" iconOnly startIcon={X} aria-label="取消" />} />
          <FileItem name="completed.pdf" description="2.4 MB · 已上傳" status="completed" mode="detail" actions={<Button variant="tertiary" size="sm" iconOnly startIcon={Download} aria-label="下載" />} />
          <FileItem name="error.pdf" description="網路中斷,請重試" status="error" mode="detail" actions={<div className="flex gap-1"><Button variant="tertiary" size="sm" iconOnly startIcon={RotateCw} aria-label="重試" /><Button variant="tertiary" size="sm" iconOnly startIcon={X} aria-label="移除" /></div>} />
          <FileItem name="static.pdf" description="已儲存 · 1.2 MB" mode="detail" onClick={() => {}} actions={<Button variant="tertiary" size="sm" iconOnly startIcon={Download} aria-label="下載" />} />
        </div>
      </div>

      <div>
        <H3>Progress bar 色彩</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Status</Th><Th>Progress bar 色</Th><Th>Status icon</Th></tr></thead>
            <tbody>
              <tr><Td mono>uploading</Td><Td mono>bg-primary</Td><Td>—</Td></tr>
              <tr><Td mono>completed</Td><Td mono>bg-success(100%)</Td><Td>CircleCheck(text-success)</Td></tr>
              <tr><Td mono>error</Td><Td mono>bg-error(失敗點位置)</Td><Td>XCircle(text-error)</Td></tr>
              <tr><Td>(無 status)</Td><Td>無 bar</Td><Td>—</Td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}
