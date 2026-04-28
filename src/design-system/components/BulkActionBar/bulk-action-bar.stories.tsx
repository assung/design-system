import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Trash2, Archive, Tag as TagIcon, MoveRight, Download } from 'lucide-react'
import { BulkActionBar } from './bulk-action-bar'
import { Button } from '@/design-system/components/Button/button'

const meta: Meta<typeof BulkActionBar> = {
  title: 'Design System/Components/BulkActionBar/展示',
  component: BulkActionBar,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof BulkActionBar>

// 真實業務 scenario:Email inbox 多選後的批次操作
export const Default: Story = {
  name: '基本',
  render: () => {
    const [selection, setSelection] = useState<string[]>(['mail-1', 'mail-2', 'mail-3'])
    return (
      <BulkActionBar
        selection={selection}
        onClear={() => setSelection([])}
        actions={
          <>
            <Button variant="tertiary" size="sm" startIcon={Archive}>封存</Button>
            <Button variant="tertiary" size="sm" startIcon={TagIcon}>加標籤</Button>
            <Button variant="tertiary" size="sm" startIcon={MoveRight}>移動</Button>
            <Button variant="tertiary" size="sm" startIcon={Trash2} danger>刪除</Button>
          </>
        }
      />
    )
  },
}

// 大 dataset scenario:單頁看不完 5370 筆檔案,本頁全選後出現 hint
export const WithDatasetExtend: Story = {
  name: '大 dataset 擴充選取(hint banner state 1)',
  render: () => {
    const TOTAL = 5370
    const VISIBLE = 50
    const [selection, setSelection] = useState<string[]>(
      Array.from({ length: VISIBLE }, (_, i) => `file-${i}`)
    )
    const [allSelected, setAllSelected] = useState(false)
    return (
      <BulkActionBar
        selection={selection}
        onClear={() => { setSelection([]); setAllSelected(false) }}
        actions={
          <>
            <Button variant="tertiary" size="sm" startIcon={Download}>下載</Button>
            <Button variant="tertiary" size="sm" startIcon={Trash2} danger>刪除</Button>
          </>
        }
        dataset={{
          total: TOTAL,
          visibleCount: VISIBLE,
          isAllSelected: allSelected,
          onSelectAll: () => setAllSelected(true),
          onClearAll: () => { setSelection([]); setAllSelected(false) },
        }}
      />
    )
  },
}

// hint banner state 2:已點擊「擴充選取全部」之後
export const DatasetAllSelected: Story = {
  name: '大 dataset 已全選(hint banner state 2)',
  render: () => {
    const TOTAL = 5370
    const VISIBLE = 50
    const [selection, setSelection] = useState<string[]>(
      Array.from({ length: VISIBLE }, (_, i) => `file-${i}`)
    )
    return (
      <BulkActionBar
        selection={selection}
        onClear={() => setSelection([])}
        actions={
          <>
            <Button variant="tertiary" size="sm" startIcon={Download}>下載</Button>
            <Button variant="tertiary" size="sm" startIcon={Trash2} danger>刪除</Button>
          </>
        }
        dataset={{
          total: TOTAL,
          visibleCount: VISIBLE,
          isAllSelected: true,
          onSelectAll: () => {},
          onClearAll: () => setSelection([]),
        }}
      />
    )
  },
}

// Filter 模式:`preserveSelectionOnFilter=true` 時 hidden 數顯示在 count 區 inline
export const WithFilterHidden: Story = {
  name: 'Filter 隱藏 selected(inline 進 count 區)',
  render: () => {
    const [selection, setSelection] = useState<string[]>(['issue-1', 'issue-2', 'issue-3'])
    return (
      <BulkActionBar
        selection={selection}
        onClear={() => setSelection([])}
        hiddenByFilter={2}
        actions={
          <>
            <Button variant="tertiary" size="sm" startIcon={Archive}>封存</Button>
            <Button variant="tertiary" size="sm" startIcon={Trash2} danger>刪除</Button>
          </>
        }
      />
    )
  },
}

// Footer 模式:邊界 border-top + hint 在主 bar 上方(對齊 ref 圖)
export const PlacementBottom: Story = {
  name: 'Footer placement(table-in-form 場景)',
  render: () => {
    const TOTAL = 5370
    const VISIBLE = 3
    const [selection, setSelection] = useState<string[]>(['f-1', 'f-2', 'f-3'])
    const [allSelected, setAllSelected] = useState(false)
    return (
      <div className="flex flex-col gap-0 max-w-3xl border border-border rounded-md">
        <div className="p-8 text-fg-muted text-caption">(table content placeholder)</div>
        <BulkActionBar
          placement="bottom"
          selection={selection}
          onClear={() => { setSelection([]); setAllSelected(false) }}
          actions={
            <>
              <Button variant="tertiary" size="sm" startIcon={Download}>下載</Button>
              <Button variant="tertiary" size="sm" startIcon={Trash2} danger>移除</Button>
            </>
          }
          dataset={{
            total: TOTAL,
            visibleCount: VISIBLE,
            isAllSelected: allSelected,
            onSelectAll: () => setAllSelected(true),
            onClearAll: () => { setSelection([]); setAllSelected(false) },
          }}
        />
        {/* Page-level Submit consumer 自擺,不是 BulkActionBar 內建 */}
        <div className="flex justify-end px-3 py-2 border-t border-divider">
          <Button variant="primary" size="sm">送出</Button>
        </div>
      </div>
    )
  },
}

// 空 selection:回傳 null,不佔 layout
export const EmptySelectionHidden: Story = {
  name: '無選取時自動藏',
  render: () => (
    <div className="text-caption text-fg-muted">
      selection=[] → BulkActionBar 回傳 null,<strong>不佔 layout</strong>(對齊禁止事項 #3)
      <div className="mt-3 border border-dashed border-border-muted p-3">
        <BulkActionBar selection={[]} actions={<Button variant="tertiary" size="sm">Action</Button>} />
        ↑ 這裡 BulkActionBar 完全不渲染
      </div>
    </div>
  ),
}
