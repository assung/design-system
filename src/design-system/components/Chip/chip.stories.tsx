import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Star, ChevronDown } from 'lucide-react'
import { Chip, ChipGroup } from './chip'
import { Badge } from '@/design-system/components/Badge/badge'

const meta: Meta<typeof ChipGroup> = {
  title: 'Design System/Components/Chip/展示',
  component: ChipGroup,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof ChipGroup>

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go',
  'Ruby', 'Java', 'C++', 'Swift', 'Kotlin',
  'PHP', 'Elixir', 'Haskell', 'Scala', 'Clojure',
]

// ── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['TypeScript'])
    return (
      <ChipGroup type="multiple" value={value} onValueChange={setValue}>
        <Chip value="JavaScript">JavaScript</Chip>
        <Chip value="TypeScript">TypeScript</Chip>
        <Chip value="Python">Python</Chip>
        <Chip value="Rust">Rust</Chip>
        <Chip value="Go">Go</Chip>
      </ChipGroup>
    )
  },
}

// ── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-caption text-fg-muted mb-2">Default / hover / selected / disabled</div>
        <ChipGroup type="multiple" defaultValue={['typescript']}>
          <Chip value="react">React</Chip>
          <Chip value="typescript">TypeScript</Chip>
          <Chip value="deprecated" disabled>Deprecated</Chip>
        </ChipGroup>
      </div>
    </div>
  ),
}

// ── With icon ────────────────────────────────────────────────────────────────

export const WithStartIcon: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['react'])
    return (
      <ChipGroup type="multiple" value={value} onValueChange={setValue}>
        <Chip value="react" startIcon={Star}>React</Chip>
        <Chip value="vue" startIcon={Star}>Vue</Chip>
        <Chip value="svelte" startIcon={Star}>Svelte</Chip>
      </ChipGroup>
    )
  },
}

// ── With badge ──────────────────────────────────────────────────────────────

export const WithBadge: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['all'])
    return (
      <ChipGroup type="multiple" value={value} onValueChange={setValue}>
        <Chip value="all" badge={<Badge count={24} />}>全部</Chip>
        <Chip value="active" badge={<Badge count={3} />}>進行中</Chip>
        <Chip value="done" badge={<Badge count={21} />}>已完成</Chip>
      </ChipGroup>
    )
  },
}

// ── With endIcon ────────────────────────────────────────────────────────────

export const WithEndIcon: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([])
    return (
      <ChipGroup type="multiple" value={value} onValueChange={setValue}>
        <Chip value="sort" endIcon={ChevronDown}>Sort</Chip>
        <Chip value="filter" endIcon={ChevronDown}>Filter</Chip>
        <Chip value="group" endIcon={ChevronDown}>Group</Chip>
      </ChipGroup>
    )
  },
}

// ── Single type ─────────────────────────────────────────────────────────────

export const SingleSelection: Story = {
  render: () => {
    const [value, setValue] = useState('typescript')
    return (
      <ChipGroup type="single" value={value} onValueChange={(v) => v && setValue(v as string)}>
        <Chip value="javascript">JavaScript</Chip>
        <Chip value="typescript">TypeScript</Chip>
        <Chip value="python">Python</Chip>
      </ChipGroup>
    )
  },
}

// ── Layout: wrap (default) ──────────────────────────────────────────────────

export const LayoutWrap: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['TypeScript', 'Rust'])
    return (
      <div className="max-w-[480px]">
        <div className="text-caption text-fg-muted mb-2">layout="wrap"（預設）— 塞不下自動換行</div>
        <ChipGroup type="multiple" layout="wrap" value={value} onValueChange={setValue}>
          {LANGUAGES.map((lang) => (
            <Chip key={lang} value={lang}>{lang}</Chip>
          ))}
        </ChipGroup>
      </div>
    )
  },
}

// ── Layout: scroll ──────────────────────────────────────────────────────────

export const LayoutScroll: Story = {
  name: 'Layout: scroll（拖拉右下角調整寬度）',
  render: () => {
    const [value, setValue] = useState<string[]>(['TypeScript'])
    return (
      <div className="flex flex-col gap-4">
        <div className="text-caption text-fg-muted max-w-xl">
          <strong>layout="scroll"</strong> — 單行橫向滾動 + 邊緣 fade mask + 左右 scroll arrow buttons。
          拖拉容器右下角調整寬度，觀察 arrows 依滾動位置出現 / 消失。
        </div>
        <div
          className="resize-x overflow-hidden border border-dashed border-border p-4 min-w-[240px] max-w-full"
          style={{ width: '480px' }}
        >
          <ChipGroup type="multiple" layout="scroll" value={value} onValueChange={setValue}>
            {LANGUAGES.map((lang) => (
              <Chip key={lang} value={lang}>{lang}</Chip>
            ))}
          </ChipGroup>
        </div>
      </div>
    )
  },
}

// ── Layout: menu ────────────────────────────────────────────────────────────

export const LayoutMenu: Story = {
  name: 'Layout: menu（拖拉右下角調整寬度）',
  render: () => {
    const [value, setValue] = useState<string[]>(['TypeScript', 'Rust'])
    return (
      <div className="flex flex-col gap-4">
        <div className="text-caption text-fg-muted max-w-xl">
          <strong>layout="menu"</strong> — 塞不下收進 "⋯" dropdown，menu items 透過 ChipGroup 的
          onValueChange proxy checkbox 狀態（因此 menu 模式必須 controlled）。
          拖拉容器右下角調整寬度，觀察 chips 即時進 / 出 dropdown。
        </div>
        <div
          className="resize-x overflow-hidden border border-dashed border-border p-4 min-w-[240px] max-w-full"
          style={{ width: '480px' }}
        >
          <ChipGroup type="multiple" layout="menu" value={value} onValueChange={setValue}>
            {LANGUAGES.map((lang) => (
              <Chip key={lang} value={lang}>{lang}</Chip>
            ))}
          </ChipGroup>
        </div>
      </div>
    )
  },
}
