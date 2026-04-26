import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Design System/Internal/Command/設計原則',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const WhenToUse: Story = {
  name: '何時使用',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>Command 是 cmdk 的薄 wrapper,用於 keyboard-first 的命令搜尋面板。</p>
      <p>適用情境(對照「展示」頁):</p>
      <ul>
        <li><strong>CommandPalette</strong> — 全域 ⌘K 快速跳轉(Linear/Raycast/Slack idiom)</li>
        <li><strong>InlineCommand</strong> — embed 在 inline UI 的指令選擇</li>
        <li><strong>ThemeSwitcher</strong> — 設定面板的命令式切換</li>
      </ul>
      <p className="text-fg-muted">非 Command 適用:單純 select dropdown(改 SelectMenu)/ 結構性 menu(改 DropdownMenu)。</p>
    </div>
  ),
}

export const VsSelectMenuRule: Story = {
  name: 'Command vs SelectMenu',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>兩者皆 keyboard navigation 但 mental model 不同:</p>
      <ul>
        <li><strong>Command</strong> — keyboard-first 命令面板;搜尋為主、可執行 action(non-form)</li>
        <li><strong>SelectMenu</strong> — form-input 的選擇器;value 寫回 form,讀取 selected value</li>
      </ul>
      <p className="text-fg-muted">判斷:結果是「執行某 action」→ Command;結果是「設定欄位 value」→ SelectMenu。</p>
    </div>
  ),
}
