import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './textarea'

const meta: Meta = {
  title: 'Design System/Components/Textarea/設計規格',
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
        <Desc>Textarea 是多行 Input——native `&lt;textarea&gt;` + 橋接 DS token。不同於 Input:沒有 field-height(高度由 rows / min-h 決定)、沒有 startIcon / endAction。</Desc>
        <div className="border border-border rounded-lg p-4 max-w-md">
          <Textarea rows={3} placeholder="請輸入留言..." />
        </div>
      </div>

      <div>
        <H3>Props 速查</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Prop</Th><Th>Type</Th><Th>Default</Th><Th>說明</Th></tr></thead>
            <tbody>
              {[
                ['mode', "'edit' | 'readonly' | 'disabled'", "'edit'", 'Field mode(readonly 保留邊框 padding)'],
                ['size', "'sm' | 'md' | 'lg'", "'md'", 'sm/md text-body,lg text-body-lg'],
                ['rows', 'number', '3', '預設可見行數'],
                ['placeholder', 'string', '—', '空值提示'],
                ['error', 'boolean', 'false', 'error 視覺(border-error + aria-invalid)'],
                ['...props', 'HTMLTextareaAttributes', '—', 'spread 到 native textarea'],
              ].map(([p, t, d, desc]) => (
                <tr key={p}><Td mono>{p}</Td><Td mono>{t}</Td><Td mono>{d}</Td><Td>{desc}</Td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <H3>與 Input 的差異 table</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th></Th><Th>Input</Th><Th>Textarea</Th></tr></thead>
            <tbody>
              <tr><Td>行數</Td><Td>單行</Td><Td>多行(rows 控制)</Td></tr>
              <tr><Td>高度</Td><Td mono>固定 h-field-*</Td><Td>由 rows / min-h 決定 + resize-y</Td></tr>
              <tr><Td>Padding</Td><Td mono>items-center(垂直置中)</Td><Td mono>py-2(上下固定內距)</Td></tr>
              <tr><Td>startIcon / endAction</Td><Td>✓ 支援</Td><Td>❌ 不支援(textarea 慣例無 icon)</Td></tr>
              <tr><Td>Enter 鍵</Td><Td>觸發 form submit</Td><Td>換行</Td></tr>
              <tr><Td>Readonly 呈現</Td><Td>同高度、緊湊底色</Td><Td>保留邊框 + padding(多行需閱讀區)</Td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}

export const SizeMatrix: Story = {
  name: 'Size 對照',
  render: () => (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <H3>Size = sm / md</H3>
        <Desc>`text-body`(14px)。常見 form / comment 場景。</Desc>
        <Textarea size="sm" rows={3} placeholder="寫下您的意見..." />
      </div>
      <div>
        <H3>Size = lg</H3>
        <Desc>`text-body-lg`(16px)。長篇閱讀場景(bio editor、article body)。</Desc>
        <Textarea size="lg" rows={3} placeholder="介紹您自己..." />
      </div>
    </div>
  ),
}

export const ModeMatrix: Story = {
  name: 'Mode 對照(edit / readonly / disabled)',
  render: () => (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <H3>edit(預設)</H3>
        <Textarea
          rows={3}
          defaultValue="我覺得這個專案非常有潛力,建議加強 onboarding 的引導流程..."
        />
      </div>
      <div>
        <H3>readonly — 保留邊框 padding(多行需閱讀區邊界)</H3>
        <Desc>不同於 Input 的 readonly(同高度、緊湊底色)。多行內容扁平化會讓使用者誤以為可編輯或混入純文字內容——必須保留邊界。</Desc>
        <Textarea
          mode="readonly"
          rows={3}
          defaultValue="我覺得這個專案非常有潛力,建議加強 onboarding 的引導流程..."
        />
      </div>
      <div>
        <H3>disabled</H3>
        <Textarea
          mode="disabled"
          rows={3}
          defaultValue="尚未開放編輯"
        />
      </div>
      <div>
        <H3>Error state</H3>
        <Textarea
          error
          rows={3}
          defaultValue="留言內容不能為空"
        />
      </div>
    </div>
  ),
}

export const RowsResizeMatrix: Story = {
  name: 'Rows 與 Resize',
  render: () => (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <H3>rows 控制預設可見行數</H3>
        <Desc>`rows` 決定初始高度——使用者可透過右下角 `resize-y` handle 垂直拖拉調整。</Desc>
        <div className="flex flex-col gap-3">
          <div>
            <div className="text-caption text-fg-muted mb-1 font-mono">rows=2</div>
            <Textarea rows={2} placeholder="短留言..." />
          </div>
          <div>
            <div className="text-caption text-fg-muted mb-1 font-mono">rows=5(預設)</div>
            <Textarea rows={5} placeholder="詳細描述..." />
          </div>
        </div>
      </div>

      <div>
        <H3>resize-y 垂直可調,水平禁止</H3>
        <Desc>永遠 `resize-y`(使用者可垂直拖大 / 拖小)。**禁止** `resize-x` 或 `resize: both`——水平 resize 破壞 form 佈局。</Desc>
      </div>

      <div>
        <H3>min-h-* 覆寫最小高度</H3>
        <Desc>Consumer 可透過 Tailwind utility 覆寫最小高度(如 `min-h-[120px]`)。</Desc>
      </div>
    </div>
  ),
}
