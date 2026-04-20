import type { Meta, StoryObj } from '@storybook/react'
import { Steps, StepItem, StepLabel, StepDescription } from './steps'
import { H3, Desc, Td, Th, TokenCell, Swatch } from '@/design-system/stories-helpers/anatomy/anatomy-utils'

const meta: Meta = {
  title: 'Design System/Components/Steps/設計規格',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const Overview: Story = {
  name: '元件總覽',
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <H3>Anatomy</H3>
        <Desc>Steps 是有序步驟序列——Indicator(圓形)+ Label + 可選 Description + Connector(連接線)。每個 StepItem 有三種狀態:completed / current / upcoming。</Desc>
        <div className="border border-border rounded-lg p-4 max-w-2xl">
          <Steps value="shipping" completedValues={['cart', 'payment']}>
            <StepItem value="cart"><StepLabel>購物車</StepLabel></StepItem>
            <StepItem value="payment"><StepLabel>付款資訊</StepLabel></StepItem>
            <StepItem value="shipping"><StepLabel>配送方式</StepLabel><StepDescription>當前步驟</StepDescription></StepItem>
            <StepItem value="review"><StepLabel>確認訂單</StepLabel></StepItem>
            <StepItem value="done"><StepLabel>完成</StepLabel></StepItem>
          </Steps>
        </div>
      </div>

      <div>
        <H3>三種狀態</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>狀態</Th><Th>Indicator</Th><Th>Label</Th><Th>Connector(右側)</Th></tr></thead>
            <tbody>
              <tr><Td>completed</Td><Td><span className="inline-flex items-center gap-1.5"><Swatch value="--primary" size="sm" /><span>filled primary + white check icon</span></span></Td><Td><TokenCell token="--foreground" display="foreground" /></Td><Td><TokenCell token="--primary" display="bg-primary" /></Td></tr>
              <tr><Td>current(= value)</Td><Td><span className="inline-flex items-center gap-1.5"><Swatch value="--primary" size="sm" /><span>hollow + primary border + ring</span></span></Td><Td><TokenCell token="--foreground" display="foreground" /></Td><Td><TokenCell token="--divider" display="bg-divider" /></Td></tr>
              <tr><Td>upcoming</Td><Td><span className="inline-flex items-center gap-1.5"><Swatch value="--border" size="sm" /><span>hollow + border</span></span></Td><Td><TokenCell token="--fg-secondary" display="fg-secondary" /></Td><Td><TokenCell token="--divider" display="bg-divider" /></Td></tr>
              <tr><Td>error</Td><Td><span className="inline-flex items-center gap-1.5"><Swatch value="--error" size="sm" /><span>bg-error + white icon</span></span></Td><Td><TokenCell token="--error" display="error" /></Td><Td>—</Td></tr>
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
                ['Steps', '', '', ''],
                ['  value', 'string', '—', '當前步驟 value'],
                ['  completedValues', 'string[]', '[]', '已完成的步驟 values'],
                ['  errorValues', 'string[]', '[]', '錯誤的步驟 values'],
                ['  size', "'sm' | 'md' | 'lg'", "'md'", 'indicator / 字體 tier'],
                ['  orientation', "'horizontal' | 'vertical'", "'vertical'", '步驟排列方向'],
                ['  onStepClick', '(value: string) => void', '—', '點擊 completed step 的 callback(linear 流程可回查)'],
                ['StepItem', '', '', ''],
                ['  value', 'string', '必填', '唯一識別碼'],
                ['  label', 'ReactNode', '必填', '步驟名稱'],
                ['  description', 'ReactNode', '—', '描述(vertical 模式常用)'],
                ['  icon', 'LucideIcon', '—', '替代 indicator 的 icon(default:數字 1,2,3)'],
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

export const OrientationMatrix: Story = {
  name: 'Orientation(horizontal / vertical)',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <H3>Horizontal</H3>
        <Desc>步驟水平排列,常見於結帳流程 / wizard 頂部。Indicator 之間有橫向 connector。</Desc>
        <div className="border border-border rounded-lg p-4 max-w-2xl">
          <Steps value="payment" completedValues={['cart']}>
            <StepItem value="cart"><StepLabel>購物車</StepLabel></StepItem>
            <StepItem value="payment"><StepLabel>付款</StepLabel></StepItem>
            <StepItem value="shipping"><StepLabel>配送</StepLabel></StepItem>
            <StepItem value="done"><StepLabel>完成</StepLabel></StepItem>
          </Steps>
        </div>
      </div>

      <div>
        <H3>Vertical(預設)</H3>
        <Desc>步驟垂直排列,支援 description(多行描述)。常見於 onboarding / 安裝引導 / 複雜流程。</Desc>
        <div className="border border-border rounded-lg p-4 max-w-md">
          <Steps orientation="vertical" value="config" completedValues={['install']}>
            <StepItem value="install"><StepLabel>安裝套件</StepLabel><StepDescription>npm install @acme/cli</StepDescription></StepItem>
            <StepItem value="config"><StepLabel>設定環境</StepLabel><StepDescription>修改 .env.local 加入 API key</StepDescription></StepItem>
            <StepItem value="deploy"><StepLabel>部署上線</StepLabel><StepDescription>執行 acme deploy</StepDescription></StepItem>
          </Steps>
        </div>
      </div>
    </div>
  ),
}

export const ColorMatrix: Story = {
  name: '色彩對照(indicator / label / connector)',
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <H3>四種狀態 × 三個視覺區域的色彩 Token</H3>
        <Desc>
          Steps 的色彩由三個視覺區域組成:Indicator(圓形)、Label(文字)、Connector(連接線)。
          每個區域的色彩隨狀態變化,傳達「已完成 / 進行中 / 尚未到達 / 出錯」的進度階段。
        </Desc>
        <div className="overflow-x-auto mb-4">
          <table className="text-caption border-collapse">
            <thead>
              <tr>
                <Th>狀態</Th>
                <Th>Indicator bg</Th>
                <Th>Indicator border</Th>
                <Th>Indicator icon/text</Th>
                <Th>Label</Th>
                <Th>右側 Connector</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td mono>completed</Td>
                <Td><TokenCell token="--primary" /></Td>
                <Td>—(同 bg)</Td>
                <Td><TokenCell token="white" display="白色 Check icon" /></Td>
                <Td><TokenCell token="--foreground" /></Td>
                <Td><TokenCell token="--primary" display="bg-primary" /></Td>
              </tr>
              <tr>
                <Td mono>current(= value)</Td>
                <Td><TokenCell token="--surface" display="hollow" /></Td>
                <Td><TokenCell token="--primary" /></Td>
                <Td><TokenCell token="--primary" display="primary 數字" /></Td>
                <Td><TokenCell token="--foreground" /></Td>
                <Td><TokenCell token="--divider" display="bg-divider" /></Td>
              </tr>
              <tr>
                <Td mono>upcoming</Td>
                <Td><TokenCell token="--surface" display="hollow" /></Td>
                <Td><TokenCell token="--border" /></Td>
                <Td><TokenCell token="--fg-secondary" display="fg-secondary 數字" /></Td>
                <Td><TokenCell token="--fg-secondary" /></Td>
                <Td><TokenCell token="--divider" display="bg-divider" /></Td>
              </tr>
              <tr>
                <Td mono>error</Td>
                <Td><TokenCell token="--error" /></Td>
                <Td>—(同 bg)</Td>
                <Td><TokenCell token="white" display="白色 X icon" /></Td>
                <Td><TokenCell token="--error" /></Td>
                <Td>—</Td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-footnote text-fg-muted mt-3">
          設計 rationale:completed connector 填 primary、upcoming connector 填 divider——
          讓「已走過的路」視覺上連續實在,「未走過的路」保持輕量。current step 的 connector 屬於「未走過」,
          所以也用 divider。
        </p>
      </div>

      <div>
        <H3>完整四態實際渲染</H3>
        <Desc>包含 error state 的結帳流程(例如付款失敗)。error 取代原本的 completed 指示。</Desc>
        <div className="border border-border rounded-lg p-4 max-w-2xl">
          <Steps value="shipping" completedValues={['cart']} errorValues={['payment']}>
            <StepItem value="cart"><StepLabel>購物車</StepLabel></StepItem>
            <StepItem value="payment"><StepLabel>付款失敗</StepLabel><StepDescription>信用卡驗證未通過</StepDescription></StepItem>
            <StepItem value="shipping"><StepLabel>配送方式</StepLabel><StepDescription>當前步驟</StepDescription></StepItem>
            <StepItem value="review"><StepLabel>確認訂單</StepLabel></StepItem>
          </Steps>
        </div>
      </div>
    </div>
  ),
}

export const SizeMatrix: Story = {
  name: 'Size 對照',
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <H3>三種 Size</H3>
        <Desc>Indicator 尺寸對齊 Avatar.block tier(sm 24、md 32、lg 40)。字體跟 MenuItem / TreeItem 同 tier。</Desc>
        <div className="flex flex-col gap-4">
          {(['sm', 'md', 'lg'] as const).map(size => (
            <div key={size} className="border border-dashed border-divider rounded-md p-4">
              <div className="text-caption text-fg-muted mb-2 font-mono">size="{size}"</div>
              <Steps size={size} value="b" completedValues={['a']}>
                <StepItem value="a"><StepLabel>第一步</StepLabel></StepItem>
                <StepItem value="b"><StepLabel>第二步</StepLabel></StepItem>
                <StepItem value="c"><StepLabel>第三步</StepLabel></StepItem>
              </Steps>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

export const IndentAlignment: Story = {
  name: 'Column Rhythm(indicator inline 對齊)',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <H3>Indicator 永遠 inline 對齊 label 第一行</H3>
        <Desc>**刻意打破 item-layout 的 24px 閾值規則**——不管 indicator 尺寸、不管有無 description,一律 inline 對齊。Column rhythm 優先於「大 prefix 視覺重量平衡文字塊」。這是 Steps 跟其他 row primitive 的本質差異——Steps 是「一條有連接關係的進度路徑」,column rhythm 是元件本身。</Desc>
        <div className="border border-border rounded-lg p-4 max-w-md">
          <Steps orientation="vertical" value="b" completedValues={['a']}>
            <StepItem value="a"><StepLabel>簡短 label</StepLabel></StepItem>
            <StepItem value="b">
              <StepLabel>帶有描述的 label</StepLabel>
              <StepDescription>即使有多行 description,indicator 仍然對齊 label 第一行,保持 column rhythm</StepDescription>
            </StepItem>
            <StepItem value="c"><StepLabel>另一個 label</StepLabel></StepItem>
          </Steps>
        </div>
        <p className="text-footnote text-fg-muted mt-3">業界共識:Apple HIG、Material 3、Linear、GitHub Actions 的 steps 都是 indicator 對齊 label 第一行</p>
      </div>
    </div>
  ),
}
