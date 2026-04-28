// @anatomy-rationale:
//   ColorMatrix N/A — BulkActionBar 無 contrast 底色 / 無顏色變體(spec「無底色 contrast,跟 page 同色」)。色彩繼承 placement 容器(toolbar / footer),內部僅文字色 fg-secondary / fg-muted / primary(hint CTA 連結)。集中在 Overview 已涵蓋。
//   SizeMatrix N/A — 高度繼承 placement 的 toolbar/footer 容器,元件本身無 size prop(spec「無 size prop」)。
//   StateBehavior 集中在 Overview 「selection state-driven 渲染」段(0 / >0 / dataset 狀態);獨立 StateBehavior story 會跟 Overview 重複。
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Trash2, Archive, Download } from 'lucide-react'
import { BulkActionBar } from './bulk-action-bar'
import { Button } from '@/design-system/components/Button/button'

const meta: Meta = {
  title: 'Design System/Components/BulkActionBar/設計規格',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-h6 font-semibold text-foreground mb-1">{children}</h3>
)
const Desc = ({ children }: { children: React.ReactNode }) => (
  <p className="text-caption text-fg-muted max-w-[720px] mb-3">{children}</p>
)

export const Overview: Story = {
  name: '元件總覽',
  render: () => (
    <div className="flex flex-col gap-8 max-w-3xl">
      <section>
        <H3>結構:左 actions / 右 count + clear</H3>
        <Desc>
          主 bar 兩段式 layout:左側 actions 區由 consumer 提供,右側 count + filter hidden status inline + clear icon。
          actions variant 採 `tertiary`(主)/ `tertiary danger`(destructive)— **不用 primary**(留給 dialog 確認最終 action)。
        </Desc>
        <div className="border border-divider rounded-md">
          <BulkActionBar
            selection={['a', 'b', 'c']}
            actions={
              <>
                <Button variant="tertiary" size="sm" startIcon={Archive}>封存</Button>
                <Button variant="tertiary" size="sm" startIcon={Download}>匯出</Button>
                <Button variant="tertiary" size="sm" startIcon={Trash2} danger>刪除</Button>
              </>
            }
            onClear={() => {}}
          />
        </div>
      </section>

      <section>
        <H3>Selection state-driven 渲染(0 / N / dataset)</H3>
        <Desc>
          {`selection.length === 0`} → null(不佔 layout)。length {`> 0`} → 主 bar 浮現。
          提供 `dataset` + 本頁全選 → hint banner 顯示「擴 dataset」CTA。dataset 全選 → hint 切「清除」CTA。
        </Desc>
        <div className="flex flex-col gap-4">
          <SelectionStateDemo />
        </div>
      </section>

      <section>
        <H3>Hint banner 位置(視 placement 切換)</H3>
        <Desc>
          Top placement(預設,table-as-page)→ hint 在主 bar **下方**。
          Bottom placement(footer form 場景)→ hint 在主 bar **上方**(對齊 ref 圖)。
        </Desc>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-caption text-fg-muted mb-2">placement="top"</div>
            <div className="border border-divider rounded-md">
              <BulkActionBar
                placement="top"
                selection={Array.from({ length: 50 }, (_, i) => `f-${i}`)}
                actions={<Button variant="tertiary" size="sm" startIcon={Download}>下載</Button>}
                onClear={() => {}}
                dataset={{ total: 5370, visibleCount: 50, isAllSelected: false, onSelectAll: () => {}, onClearAll: () => {} }}
              />
            </div>
          </div>
          <div>
            <div className="text-caption text-fg-muted mb-2">placement="bottom"</div>
            <div className="border border-divider rounded-md">
              <BulkActionBar
                placement="bottom"
                selection={Array.from({ length: 50 }, (_, i) => `f-${i}`)}
                actions={<Button variant="tertiary" size="sm" startIcon={Download}>下載</Button>}
                onClear={() => {}}
                dataset={{ total: 5370, visibleCount: 50, isAllSelected: false, onSelectAll: () => {}, onClearAll: () => {} }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
}

function SelectionStateDemo() {
  const [count, setCount] = useState(0)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-caption">
        <span className="text-fg-muted">selection.length:</span>
        <Button variant="tertiary" size="sm" onClick={() => setCount(0)}>0</Button>
        <Button variant="tertiary" size="sm" onClick={() => setCount(3)}>3</Button>
        <Button variant="tertiary" size="sm" onClick={() => setCount(15)}>15</Button>
      </div>
      <div className="border border-dashed border-border-muted p-2 min-h-[60px]">
        <BulkActionBar
          selection={Array.from({ length: count }, (_, i) => `x-${i}`)}
          actions={
            <>
              <Button variant="tertiary" size="sm" startIcon={Archive}>封存</Button>
              <Button variant="tertiary" size="sm" startIcon={Trash2} danger>刪除</Button>
            </>
          }
          onClear={() => setCount(0)}
        />
        {count === 0 && <span className="text-caption text-fg-muted italic">↑ count=0 → BulkActionBar 不渲染</span>}
      </div>
    </div>
  )
}

export const Inspector: Story = {
  name: '元件檢閱器',
  render: () => <InspectorInner />,
}

function InspectorInner() {
  const [selectionCount, setSelectionCount] = useState(3)
  const [hidden, setHidden] = useState(0)
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top')
  const [datasetMode, setDatasetMode] = useState<'none' | 'page' | 'all'>('none')
  const TOTAL = 5370
  const VISIBLE = 50

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6 max-w-4xl">
      {/* Controls */}
      <div className="flex flex-col gap-4 text-caption">
        <ControlGroup label="selection.length">
          {[0, 3, 15, 50].map(n => (
            <Button key={n} variant={selectionCount === n ? 'primary' : 'tertiary'} size="sm" onClick={() => setSelectionCount(n)}>
              {n}
            </Button>
          ))}
        </ControlGroup>

        <ControlGroup label="placement">
          {(['top', 'bottom'] as const).map(p => (
            <Button key={p} variant={placement === p ? 'primary' : 'tertiary'} size="sm" onClick={() => setPlacement(p)}>
              {p}
            </Button>
          ))}
        </ControlGroup>

        <ControlGroup label="hiddenByFilter">
          {[0, 2, 10].map(n => (
            <Button key={n} variant={hidden === n ? 'primary' : 'tertiary'} size="sm" onClick={() => setHidden(n)}>
              {n}
            </Button>
          ))}
        </ControlGroup>

        <ControlGroup label="dataset 模式">
          <Button variant={datasetMode === 'none' ? 'primary' : 'tertiary'} size="sm" onClick={() => setDatasetMode('none')}>無</Button>
          <Button variant={datasetMode === 'page' ? 'primary' : 'tertiary'} size="sm" onClick={() => setDatasetMode('page')}>本頁全選</Button>
          <Button variant={datasetMode === 'all' ? 'primary' : 'tertiary'} size="sm" onClick={() => setDatasetMode('all')}>已擴 dataset</Button>
        </ControlGroup>
      </div>

      {/* Preview */}
      <div className="border border-divider rounded-md p-3 bg-canvas">
        <BulkActionBar
          placement={placement}
          selection={Array.from({ length: selectionCount }, (_, i) => `r-${i}`)}
          hiddenByFilter={hidden || undefined}
          actions={
            <>
              <Button variant="tertiary" size="sm" startIcon={Archive}>封存</Button>
              <Button variant="tertiary" size="sm" startIcon={Trash2} danger>刪除</Button>
            </>
          }
          onClear={() => setSelectionCount(0)}
          dataset={
            datasetMode === 'none'
              ? undefined
              : {
                  total: TOTAL,
                  visibleCount: VISIBLE,
                  isAllSelected: datasetMode === 'all',
                  onSelectAll: () => setDatasetMode('all'),
                  onClearAll: () => { setSelectionCount(0); setDatasetMode('none') },
                }
          }
        />
        {selectionCount === 0 && <span className="text-caption text-fg-muted italic">selection=0 → 不渲染</span>}
      </div>
    </div>
  )
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-fg-muted">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  )
}

export const Accessibility: Story = {
  name: '無障礙與鍵盤',
  render: () => (
    <div className="flex flex-col gap-6 max-w-3xl text-body">
      <section>
        <H3>ARIA roles</H3>
        <ul className="list-disc list-inside text-caption text-fg-secondary space-y-1">
          <li><code>role="toolbar"</code> on root + <code>aria-label="批次操作"</code>(可 i18n override)</li>
          <li>Hint banner:<code>role="status"</code> + <code>aria-live="polite"</code>(state 切換時 SR 通知)</li>
          <li>Clear icon:<code>aria-label="清除選取"</code></li>
          <li>actions slot 內各 button 由 consumer 提供 aria-label / 文字</li>
        </ul>
      </section>

      <section>
        <H3>鍵盤(預期 consumer 在 page 層級監聽)</H3>
        <ul className="list-disc list-inside text-caption text-fg-secondary space-y-1">
          <li><kbd>Esc</kbd> → 觸發 <code>onClear()</code>(consumer 在 page-level keydown 監聽)</li>
          <li>Tab 序:actions → count → clear</li>
          <li>Hint CTA(擴 dataset / 清除 link)是 <code>{`<button>`}</code>,鍵盤可達</li>
        </ul>
      </section>

      <section>
        <H3>Disabled action 處理</H3>
        <Desc>
          無權限的 batch action **顯示 disabled 不藏**(對齊禁止事項 #4)。
          User 看到 disabled 知道有此能力但目前不可用,優於藏起來造成困惑。
          tooltip 補充原因(consumer 自加)。
        </Desc>
        <div className="border border-divider rounded-md">
          <BulkActionBar
            selection={['a', 'b', 'c']}
            actions={
              <>
                <Button variant="tertiary" size="sm" startIcon={Archive}>封存</Button>
                <Button variant="tertiary" size="sm" startIcon={Trash2} danger disabled>刪除(無權限)</Button>
              </>
            }
            onClear={() => {}}
          />
        </div>
      </section>
    </div>
  ),
}
