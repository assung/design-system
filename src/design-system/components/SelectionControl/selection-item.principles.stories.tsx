import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Design System/Components/SelectionControl/設計原則',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const WhenToUse: Story = {
  name: '何時使用',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>SelectionControl(SelectionItem)是 row-style 選擇器,用於 list / settings panel 多選或單選 row(對齊 Notion / Linear / Slack settings idiom)。</p>
      <p>適用情境(對照「展示」頁):</p>
      <ul>
        <li><strong>NotificationPreferences</strong> — Slack-style 通知設定 row</li>
        <li><strong>PlanPicker</strong> — 訂閱方案 selectable list</li>
        <li><strong>WithPrefixIcon / WithPrefixAvatarBlock</strong> — 含 icon / avatar prefix 的 row</li>
      </ul>
      <p className="text-fg-muted">非 SelectionControl 適用:form 欄位多選(用 Checkbox + Field)/ menu 內 toggle(用 DropdownMenu CheckboxItem)/ overlay 多選(用 SelectMenu MultiSelect)。</p>
    </div>
  ),
}

export const VsCheckboxRule: Story = {
  name: 'SelectionControl vs Checkbox in Field',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>兩者表達 selectable state,但結構與場景不同:</p>
      <ul>
        <li><strong>SelectionControl(本元件)</strong>—大塊 row(含 icon / avatar / multi-line description),適合 settings / list-as-page;Notion/Slack idiom</li>
        <li><strong>Checkbox + Field</strong>—緊湊 form 欄位;適合 form group 多選</li>
      </ul>
      <p className="text-fg-muted">判斷:row 是 page content(讀取/設定)→ SelectionControl;row 是 form input(submit value)→ Checkbox + Field。</p>
    </div>
  ),
}
