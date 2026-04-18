import type { Meta } from '@storybook/react'
import { Trash2 } from 'lucide-react'
import { FileItem } from './file-item'
import { Button } from '@/design-system/components/Button/button'

const meta: Meta<typeof FileItem> = {
  title: 'Design System/Components/FileItem/展示',
  component: FileItem,
  parameters: { layout: 'padded' },
}
export default meta

const noop = () => {}

// FileItem 不用 field-height，24px/37px = 65% ≤ 75% → Button
// rich 用 sm，compact 用 xs
const deleteBtn = <Button variant="text" size="sm" iconOnly startIcon={Trash2} aria-label="刪除" onClick={noop} />
const deleteBtnXs = <Button variant="text" size="xs" iconOnly startIcon={Trash2} aria-label="刪除" onClick={noop} />

export const Rich = {
  name: 'Rich（上傳狀態）',
  render: () => (
    <div className="flex flex-col max-w-md">
      <FileItem mode="rich" name="Alan Profile.png" status="uploading" progress={40}
        description="5.7 MB of 7.5MB" thumbnailSrc="https://i.pravatar.cc/80?u=alan" actions={deleteBtn} />
      <FileItem mode="rich" name="Alan Profile.png" status="completed"
        description="5.7 MB" thumbnailSrc="https://i.pravatar.cc/80?u=alan" actions={deleteBtn} />
      <FileItem mode="rich" name="Alan Profile.png" status="error" progress={65}
        description="There's something wrong" thumbnailSrc="https://i.pravatar.cc/80?u=alan" actions={deleteBtn} />
    </div>
  ),
}

export const Compact = {
  name: 'Compact（上傳狀態）',
  render: () => (
    <div className="flex flex-col max-w-md">
      <FileItem mode="compact" name="UXP T-Phone.csv" status="uploading" progress={60} actions={deleteBtnXs} />
      <FileItem mode="compact" name="UXP T-Phone.csv" status="error" description="There's something wrong" actions={deleteBtnXs} />
      <FileItem mode="compact" name="UXP T-Phone.csv" status="completed" actions={deleteBtnXs} />
    </div>
  ),
}

export const Clickable = {
  name: '已上傳（點擊下載）',
  render: () => (
    <div className="flex flex-col max-w-md border border-divider rounded-lg overflow-hidden">
      <FileItem mode="rich" name="報告.pdf" description="2.3 MB"
        thumbnailSrc="https://i.pravatar.cc/80?u=doc" onClick={noop} actions={deleteBtn} />
      <FileItem mode="rich" name="合約附件.docx" description="1.1 MB"
        thumbnailSrc="https://i.pravatar.cc/80?u=contract" onClick={noop} actions={deleteBtn} />
      <FileItem mode="compact" name="data.csv" onClick={noop} actions={deleteBtnXs} />
      <FileItem mode="compact" name="backup.json" onClick={noop} actions={deleteBtnXs} />
    </div>
  ),
}
