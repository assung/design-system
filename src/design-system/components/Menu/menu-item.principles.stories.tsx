import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Design System/Internal/MenuItem/設計原則',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const WhenToUse: Story = {
  name: '何時使用',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>MenuItem 是 Family 1(scanning menu item)的 row primitive,被 DropdownMenu / SelectMenu / Command 等 overlay menu 消費。</p>
      <p>適用情境(對照「展示」頁):</p>
      <ul>
        <li><strong>Default / WithStartIcon / WithDescription</strong> — 各種 slot 變體</li>
        <li><strong>AvatarInline / AvatarBlock</strong> — 含 avatar 的 row 結構</li>
        <li><strong>MultiSelect / Groups</strong> — checkbox / 群組 menu</li>
      </ul>
      <p className="text-fg-muted">consumer 直接消費 MenuItem 就用,不要自己 hand-craft row;若有 row 結構新需求 → 擴 MenuItem API,不另開元件(對齊 CLAUDE.md「既有 primitive 優先消費」)。</p>
    </div>
  ),
}

export const VsItemAnatomyRule: Story = {
  name: 'MenuItem vs item-anatomy',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>MenuItem 是 Family 1(menu)的具體實作;item-anatomy 是 Family 1+2 的 cross-element SSOT。</p>
      <ul>
        <li><strong>MenuItem(本元件)</strong>—runtime 元件,實裝 Family 1 row</li>
        <li><strong>item-anatomy.spec.md</strong>—canonical doc,跨 MenuItem / Row / FileItem 共通的 anatomy 規則</li>
      </ul>
      <p className="text-fg-muted">judgment 改:動 item-anatomy.spec(SSOT);實作改:動 menu-item.tsx。</p>
    </div>
  ),
}
