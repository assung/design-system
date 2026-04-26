import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Design System/Internal/SelectMenu/設計原則',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const WhenToUse: Story = {
  name: '何時使用',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>SelectMenu 是 Select / Combobox / PeoplePicker 的 dropdown 內部 primitive — 提供搜尋 / 多選 / clear / sizes 共通行為。</p>
      <p>適用情境(對照「展示」頁):</p>
      <ul>
        <li><strong>SingleSelect / MultiSelect</strong> — 單選 / 多選</li>
        <li><strong>Searchable / MultiSearchable</strong> — 加搜尋的 single / multi</li>
        <li><strong>Clearable</strong> — 一鍵清空</li>
        <li><strong>States / AllSizes</strong> — 狀態 / 尺寸對照</li>
      </ul>
      <p className="text-fg-muted">consumer 通常不直接用 SelectMenu,而是用消費它的 Select / Combobox / PeoplePicker。</p>
    </div>
  ),
}

export const VsCommandRule: Story = {
  name: 'SelectMenu vs Command',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>兩者都 keyboard-navigable + 搜尋,但 mental model 不同:</p>
      <ul>
        <li><strong>SelectMenu(本元件)</strong>—form-input dropdown;結果寫回 form value(read selected)</li>
        <li><strong>Command</strong>—命令面板;結果是執行某 action(non-form)</li>
      </ul>
      <p className="text-fg-muted">判斷:結果回 form value → SelectMenu;結果觸發 action → Command。</p>
    </div>
  ),
}
