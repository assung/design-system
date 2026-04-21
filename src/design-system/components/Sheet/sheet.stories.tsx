import type { Meta, StoryObj } from '@storybook/react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
} from './sheet'
import { Button } from '@/design-system/components/Button/button'
import { Field, FieldLabel, FieldDescription } from '@/design-system/components/Field/field'
import { Input } from '@/design-system/components/Input/input'
import { Textarea } from '@/design-system/components/Textarea/textarea'
import { Checkbox } from '@/design-system/components/Checkbox/checkbox'

const meta: Meta = {
  title: 'Design System/Components/Sheet/展示',
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

export const CreateProjectRight: Story = {
  name: '右側建立 project(Linear / Stripe style)',
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="primary">建立新專案</Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>建立新專案</SheetTitle>
          <SheetDescription>建立後可從專案列表開啟。所有欄位稍後都可修改。</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          <Field>
            <FieldLabel>專案名稱</FieldLabel>
            <Input placeholder="例:Q2 產品路線圖" />
          </Field>
          <Field>
            <FieldLabel>描述</FieldLabel>
            <Textarea placeholder="簡述此專案的目標與範圍" rows={4} />
            <FieldDescription>選填,可在建立後補上</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>預設通知</FieldLabel>
            <div className="grid">
              <Checkbox defaultChecked label="新任務指派給我" />
              <Checkbox defaultChecked label="我參與的任務有新評論" />
              <Checkbox label="每日摘要" />
            </div>
          </Field>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="tertiary">取消</Button>
          </SheetClose>
          <Button variant="primary">建立專案</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const EditUserRight: Story = {
  name: '右側編輯 user detail(Jira issue drawer)',
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="tertiary">檢視成員詳情</Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Ada Chen</SheetTitle>
          <SheetDescription>Design Engineer · 加入於 2024-08-12</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          <Field>
            <FieldLabel>顯示名稱</FieldLabel>
            <Input defaultValue="Ada Chen" />
          </Field>
          <Field>
            <FieldLabel>職稱</FieldLabel>
            <Input defaultValue="Design Engineer" />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input defaultValue="ada.chen@example.com" />
          </Field>
          <Field>
            <FieldLabel>權限</FieldLabel>
            <div className="grid">
              <Checkbox defaultChecked label="可管理成員" />
              <Checkbox defaultChecked label="可編輯設定" />
              <Checkbox label="可刪除專案" />
            </div>
          </Field>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="tertiary">取消</Button>
          </SheetClose>
          <Button variant="primary">儲存變更</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const LeftNavigation: Story = {
  name: '左側 navigation / filter(Slack mobile nav)',
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="tertiary">☰ 目錄</Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>專案</SheetTitle>
          <SheetDescription>選擇要前往的工作區</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col">
          {[
            { name: '產品路線圖', count: 12 },
            { name: '行銷活動', count: 5 },
            { name: '客戶研究', count: 8 },
            { name: '設計系統', count: 3 },
            { name: '財務報表', count: 0 },
          ].map(p => (
            <button
              key={p.name}
              type="button"
              className="flex items-center justify-between px-3 py-2 text-body text-left hover:bg-neutral-hover rounded-md"
            >
              <span>{p.name}</span>
              {p.count > 0 && (
                <span className="text-caption text-fg-muted">{p.count}</span>
              )}
            </button>
          ))}
        </SheetBody>
        <SheetFooter>
          <Button variant="tertiary" className="w-full">管理專案</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}
