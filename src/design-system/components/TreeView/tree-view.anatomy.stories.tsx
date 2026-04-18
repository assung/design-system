import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Folder, FileText, Image, Users, User, Settings } from 'lucide-react'
import { TreeView, TreeItem } from './tree-view'
import { Badge } from '@/design-system/components/Badge/badge'

const meta: Meta = {
  title: 'Design System/Components/TreeView/設計規格',
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
        <Desc>TreeView 是**階層結構的遞迴元件**——一個 TreeItem 就是一個 node,有 children 就可展開,沒有就是 leaf。基於 Radix Collapsible 實作展開/收合,自建 tree 結構 + ARIA tree 鍵盤導覽(Radix 沒有 Tree primitive)。</Desc>
        <div className="border border-border rounded-lg p-4 max-w-md">
          <TreeView>
            <TreeItem label="Documents" icon={Folder} defaultExpanded>
              <TreeItem label="Resume.pdf" icon={FileText} />
              <TreeItem label="Photos" icon={Folder} defaultExpanded>
                <TreeItem label="beach.jpg" icon={Image} />
                <TreeItem label="trip.jpg" icon={Image} />
              </TreeItem>
            </TreeItem>
            <TreeItem label="Downloads" icon={Folder}>
              <TreeItem label="installer.dmg" icon={FileText} />
            </TreeItem>
          </TreeView>
        </div>
      </div>

      <div>
        <H3>TreeItem 內部結構</H3>
        <Desc>[chevron placeholder] [icon?] [label] [suffix? (hover inline action / badge)] ——遵循 item-layout pattern。葉節點(無 children)自動填入透明 chevron placeholder 保持 column 對齊。</Desc>
      </div>

      <div>
        <H3>TreeView 的三項職責(不超出此範圍)</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>職責</Th><Th>說明</Th></tr></thead>
            <tbody>
              <tr><Td>1. 遞迴渲染 + indent</Td><Td mono>indentStep = chevronSize + gap-2(跟 item-layout 一致)</Td></tr>
              <tr><Td>2. 展開 / 收合狀態管理</Td><Td>Radix Collapsible(controlled / uncontrolled)</Td></tr>
              <tr><Td>3. 鍵盤導覽 + ARIA tree</Td><Td>↑↓ 移動 / → 展開 / ← 收合 / Enter 選取</Td></tr>
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
                ['TreeView', '', '', ''],
                ['  value', 'string', '—', '當前選取的 node value(受控)'],
                ['  onValueChange', '(value: string) => void', '—', '選取 callback'],
                ['  size', "'sm' | 'md' | 'lg'", "'md'", 'font-size tier'],
                ['TreeItem', '', '', ''],
                ['  value', 'string', '必填', '唯一識別碼'],
                ['  label', 'ReactNode', '必填', 'node 名稱'],
                ['  icon', 'LucideIcon', '—', 'Prefix icon(資料夾 / 檔案類型)'],
                ['  defaultExpanded', 'boolean', 'false', '初始展開狀態(uncontrolled)'],
                ['  expanded / onExpandedChange', 'boolean / handler', '—', '展開狀態受控'],
                ['  actions', 'ReactNode', '—', 'hover 時 suffix 顯示的 inline actions'],
                ['  badge', 'ReactNode', '—', 'suffix 固定 badge(計數等)'],
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

export const IndentMatrix: Story = {
  name: 'Indent 與 Tree Guide',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <H3>indentStep = chevronSize + gap-2</H3>
        <Desc>每層 indent 剛好是 chevron(16 / 20px)+ gap-2(8px)的距離——跟 item-layout 的 prefix-content gap 一致。讓 tree indent 視覺跟 item-layout 融為一體,不是獨立數字系統。</Desc>
        <div className="border border-border rounded-lg p-4 max-w-md">
          <TreeView>
            <TreeItem label="L1 (depth 0)" icon={Folder} defaultExpanded>
              <TreeItem label="L2 (depth 1)" icon={Folder} defaultExpanded>
                <TreeItem label="L3 (depth 2)" icon={Folder} defaultExpanded>
                  <TreeItem label="L4 (depth 3)" icon={FileText} />
                </TreeItem>
              </TreeItem>
            </TreeItem>
          </TreeView>
        </div>
      </div>

      <div>
        <H3>葉節點 chevron placeholder</H3>
        <Desc>同層有展開 icon、有的沒有 → label 不會對齊。TreeView 自動給葉節點留透明 chevron placeholder,label 永遠對齊 column。</Desc>
        <div className="border border-border rounded-lg p-4 max-w-md">
          <TreeView>
            <TreeItem label="Folder(可展開)" icon={Folder} defaultExpanded>
              <TreeItem label="Leaf 1(無 children)" icon={FileText} />
              <TreeItem label="Folder 2(可展開)" icon={Folder} />
              <TreeItem label="Leaf 3(無 children)" icon={FileText} />
            </TreeItem>
          </TreeView>
        </div>
        <p className="text-footnote text-fg-muted mt-3">↑ 葉 / 資料夾 label 左側對齊 — 不會因有無 chevron 位移</p>
      </div>
    </div>
  ),
}

export const StateMatrix: Story = {
  name: '狀態(selected / expanded / hover)',
  render: () => {
    const [selected, setSelected] = React.useState('beach.jpg')
    return (
      <div className="flex flex-col gap-8">
        <div>
          <H3>Selected vs Expanded 語意分離</H3>
          <Desc>Chevron 負責展開/收合,label 負責選取——兩者獨立(除非 consumer 顯式 opt-in `expandOnSelect`)。世界級 tree 的共識(VS Code / Finder / Linear)。</Desc>
          <div className="border border-border rounded-lg p-4 max-w-md">
            <TreeView value={selected} onValueChange={setSelected}>
              <TreeItem value="docs" label="Documents(可點展開)" icon={Folder} defaultExpanded>
                <TreeItem value="resume" label="Resume.pdf(選取中)" icon={FileText} />
                <TreeItem value="photos" label="Photos(可點展開)" icon={Folder} defaultExpanded>
                  <TreeItem value="beach.jpg" label="beach.jpg" icon={Image} />
                </TreeItem>
              </TreeItem>
            </TreeView>
          </div>
          <p className="text-footnote text-fg-muted mt-3">↑ 點 chevron 只展開 / 點 label 只選取,兩個獨立互動區</p>
        </div>

        <div>
          <H3>Hover inline actions(suffix)</H3>
          <Desc>hover node 時 suffix 顯示 inline action(重新命名、刪除等)。non-hover 時 suffix 隱藏或顯示固定 badge。</Desc>
          <div className="border border-border rounded-lg p-4 max-w-md">
            <TreeView>
              <TreeItem
                label="Engineering"
                icon={Users}
                badge={<Badge count={12} variant="low" />}
                defaultExpanded
              >
                <TreeItem label="Frontend" icon={Users} badge={<Badge count={5} variant="low" />}>
                  <TreeItem label="Alice" icon={User} />
                  <TreeItem label="Bob" icon={User} />
                </TreeItem>
              </TreeItem>
            </TreeView>
          </div>
        </div>
      </div>
    )
  },
}

export const KeyboardMatrix: Story = {
  name: '鍵盤導覽(ARIA tree)',
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <H3>鍵盤操作對照</H3>
        <Desc>TreeView 的 ARIA tree 鍵盤導覽是自建實作(Radix 沒有 Tree primitive)。</Desc>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>按鍵</Th><Th>行為</Th></tr></thead>
            <tbody>
              <tr><Td mono>↑ / ↓</Td><Td>在可見 nodes 之間移動焦點(跳過已收合的 children)</Td></tr>
              <tr><Td mono>→</Td><Td>若 collapsed 則展開;若 expanded 則移到第一個 child</Td></tr>
              <tr><Td mono>←</Td><Td>若 expanded 則收合;若 collapsed 或 leaf 則移到 parent</Td></tr>
              <tr><Td mono>Enter / Space</Td><Td>選取當前 focus 的 node</Td></tr>
              <tr><Td mono>Home / End</Td><Td>跳到第一個 / 最後一個可見 node</Td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}
