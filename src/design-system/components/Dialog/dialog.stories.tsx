import type { Meta } from '@storybook/react'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogClose,
} from './dialog'
import { Button } from '@/design-system/components/Button/button'
import { Field, FieldLabel, FieldDescription } from '@/design-system/components/Field/field'
import { Input } from '@/design-system/components/Input/input'

const meta: Meta = {
  title: 'Design System/Components/Dialog/展示',
  parameters: { layout: 'centered' },
}
export default meta

export const Basic = {
  name: '基本',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>開啟 Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-body">Modal 內容區域</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="tertiary">Cancel</Button>
          </DialogClose>
          <Button>Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const WithForm = {
  name: '表單',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>開啟 Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>建立專案</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-[var(--layout-space-loose)]">
            <Field>
              <FieldLabel>專案名稱</FieldLabel>
              <Input placeholder="輸入專案名稱" />
            </Field>
            <Field>
              <FieldLabel>描述</FieldLabel>
              <Input placeholder="輸入描述" />
              <FieldDescription>選填，簡述專案用途</FieldDescription>
            </Field>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="tertiary">取消</Button>
          </DialogClose>
          <Button>建立</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const LongContent = {
  name: '長內容（body 捲動）',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>開啟 Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>成員列表</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col">
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="py-2 border-b border-divider text-body">
                成員 {i + 1}
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="tertiary">關閉</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Destructive = {
  name: '危險操作',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" danger>刪除</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認刪除</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-body">此操作無法復原。確定要刪除嗎？</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="tertiary">取消</Button>
          </DialogClose>
          <Button variant="primary" danger>刪除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
