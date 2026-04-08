import type { Meta, StoryObj } from '@storybook/react'
import { Mail, Bell, Settings, Star, ChevronRight, ExternalLink, User } from 'lucide-react'
import { SelectMenuItem, SelectMenuGroup } from '@/design-system/components/SelectMenu/select-menu-item'
import { SelectionItem } from '@/design-system/components/SelectionControl/selection-item'
import { Checkbox } from '@/design-system/components/Checkbox/checkbox'
import { RadioGroup, RadioGroupItem } from '@/design-system/components/Radio/radio'

const meta: Meta = {
  title: 'Design System/Patterns/Item Layout',
  parameters: { layout: 'padded' },
}
export default meta

/* ═══════════════════════════════════════════════════════════════════════════
   Helper Components
   ═══════════════════════════════════════════════════════════════════════════ */

/** Annotation label for dimensions */
const Dim = ({ children }: { children: React.ReactNode }) => (
  <span className="text-footnote font-mono text-fg-muted whitespace-nowrap">{children}</span>
)

/** Section title */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-h5 font-semibold text-foreground">{children}</h3>
)

/** Section subtitle */
const SectionDesc = ({ children }: { children: React.ReactNode }) => (
  <p className="text-caption text-fg-muted max-w-[720px]">{children}</p>
)

/** A label under an example */
const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-footnote text-fg-muted mt-1">{children}</p>
)

/** Menu container to wrap SelectMenuItem examples */
const MenuFrame = ({ children, width = 320 }: { children: React.ReactNode; width?: number }) => (
  <div
    className="rounded-lg bg-surface-raised border border-border overflow-hidden"
    style={{ width, boxShadow: 'var(--elevation-200)' }}
  >
    {children}
  </div>
)

/** Avatar placeholder */
const AvatarImg = ({ bg = '#e0e7ff' }: { bg?: string }) => (
  <div
    className="w-full h-full rounded-full flex items-center justify-center text-[10px] font-medium"
    style={{ backgroundColor: bg }}
  >
    <User size={12} className="text-fg-muted" />
  </div>
)


/* ═══════════════════════════════════════════════════════════════════════════
   1. Padding 公式
   ═══════════════════════════════════════════════════════════════════════════ */

export const PaddingFormula: StoryObj = {
  name: '1. Padding 公式',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle>Padding 公式: py = (field-height - 1lh) / 2</SectionTitle>
        <SectionDesc>
          單行時 item 總高度等於 field-height，與同 size 的 Button、TextField 等高。
          多行時 padding 不變，高度自然撐開。density 切換時 field-height 自動調整。
        </SectionDesc>
      </div>

      <div className="flex flex-col gap-6">
        {(['sm', 'md', 'lg'] as const).map((sz) => {
          const fieldH = { sm: '28px', md: '32px', lg: '36px' }[sz]
          const font = sz === 'lg' ? '16px' : '14px'
          const lh = sz === 'lg' ? '16×1.5=24px' : '14×1.5=21px'
          const pyCalc = sz === 'lg' ? '(36-24)/2 = 6px' : sz === 'md' ? '(32-21)/2 = 5.5px' : '(28-21)/2 = 3.5px'

          return (
            <div key={sz} className="flex items-start gap-6">
              {/* Annotated dimension column */}
              <div className="w-[200px] shrink-0 flex flex-col gap-1">
                <Dim>size="{sz}"</Dim>
                <Dim>field-height: {fieldH}</Dim>
                <Dim>font: {font}, 1lh: {lh}</Dim>
                <Dim>py: {pyCalc}</Dim>
              </div>

              {/* Live example — SelectionItem (reading mode) */}
              <div className="flex flex-col gap-1">
                <div className="border border-dashed border-border rounded px-3 relative">
                  <SelectionItem
                    size={sz}
                    control={<Checkbox size={sz} />}
                    label="單行 — 高度 = field-height"
                  />
                  {/* Top/bottom padding indicators */}
                  <div className="absolute left-0 top-0 w-1 bg-primary/30" style={{ height: '100%' }} />
                </div>
                <Label>SelectionItem size="{sz}" — 閱讀模式</Label>
              </div>

              {/* Live example — SelectMenuItem (scanning mode) */}
              <div className="flex flex-col gap-1">
                <MenuFrame width={260}>
                  <SelectMenuGroup>
                    <SelectMenuItem size={sz} startIcon={Mail}>
                      單行 — 高度 = field-height
                    </SelectMenuItem>
                  </SelectMenuGroup>
                </MenuFrame>
                <Label>SelectMenuItem size="{sz}" — 掃描模式</Label>
              </div>
            </div>
          )
        })}
      </div>

      {/* Multi-line demo */}
      <div>
        <SectionDesc>多行時 padding 維持不變，item 高度自然撐開：</SectionDesc>
        <div className="flex items-start gap-6 mt-3">
          <div className="flex flex-col gap-1">
            <div className="border border-dashed border-border rounded px-3">
              <SelectionItem
                size="md"
                control={<Checkbox size="md" />}
                label="多行範例"
                description="描述文字讓 item 自然變高，但上下 padding 維持 (field-height-md - 1lh) / 2，與單行時一致"
              />
            </div>
            <Label>SelectionItem — padding 不因多行改變</Label>
          </div>

          <div className="flex flex-col gap-1">
            <MenuFrame width={320}>
              <SelectMenuGroup>
                <SelectMenuItem size="md" startIcon={Mail} description="描述文字讓 item 自然變高，但 padding 維持一致">
                  多行範例
                </SelectMenuItem>
              </SelectMenuGroup>
            </MenuFrame>
            <Label>SelectMenuItem — padding 不因多行改變</Label>
          </div>
        </div>
      </div>
    </div>
  ),
}


/* ═══════════════════════════════════════════════════════════════════════════
   2. 兩種閱讀模式對比
   ═══════════════════════════════════════════════════════════════════════════ */

export const ReadingModes: StoryObj = {
  name: '2. 兩種閱讀模式對比',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle>兩種閱讀模式：掃描 vs 閱讀</SectionTitle>
        <SectionDesc>
          同一套佈局公式，typography 策略根據使用者的閱讀行為調整。
          判斷標準：「使用者會仔細讀，還是一掃而過？」
        </SectionDesc>
      </div>

      {(['sm', 'md', 'lg'] as const).map((sz) => {
        const scanFont = sz === 'lg' ? 'text-body-lg leading-compact (16px, lh 1.3)' : 'text-body leading-compact (14px, lh 1.3)'
        const scanDesc = sz === 'lg' ? 'text-body leading-compact (14px, lh 1.3)' : 'text-caption (12px, lh 1.3)'
        const readFont = sz === 'lg' ? 'text-body-lg (16px, lh 1.5)' : 'text-body (14px, lh 1.5)'

        return (
          <div key={sz} className="flex flex-col gap-3">
            <Dim>size="{sz}"</Dim>
            <div className="flex items-start gap-8">
              {/* Scanning mode */}
              <div className="flex flex-col gap-1">
                <div className="text-caption text-fg-muted font-medium mb-1">掃描模式（浮層 / overlay）</div>
                <MenuFrame width={340}>
                  <SelectMenuGroup>
                    <SelectMenuItem size={sz} startIcon={Mail} description="每日寄送摘要信件">
                      電子郵件通知
                    </SelectMenuItem>
                    <SelectMenuItem size={sz} startIcon={Bell} description="即時推播到裝置">
                      推播通知
                    </SelectMenuItem>
                    <SelectMenuItem size={sz} startIcon={Settings} description="自訂通知偏好">
                      進階設定
                    </SelectMenuItem>
                  </SelectMenuGroup>
                </MenuFrame>
                <Label>label: {scanFont}</Label>
                <Label>description: {scanDesc} + fg-secondary</Label>
                <Label>層級靠「字體大小差 + 顏色差 + 2px gap」建立</Label>
              </div>

              {/* Reading mode */}
              <div className="flex flex-col gap-1">
                <div className="text-caption text-fg-muted font-medium mb-1">閱讀模式（頁面 / 表單）</div>
                <RadioGroup defaultValue="email" className="max-w-[340px]">
                  <SelectionItem
                    size={sz}
                    control={<RadioGroupItem value="email" id={`read-${sz}-email`} size={sz} />}
                    label="電子郵件通知"
                    description="每日寄送摘要信件"
                    htmlFor={`read-${sz}-email`}
                  />
                  <SelectionItem
                    size={sz}
                    control={<RadioGroupItem value="push" id={`read-${sz}-push`} size={sz} />}
                    label="推播通知"
                    description="即時推播到裝置"
                    htmlFor={`read-${sz}-push`}
                  />
                  <SelectionItem
                    size={sz}
                    control={<RadioGroupItem value="settings" id={`read-${sz}-settings`} size={sz} />}
                    label="進階設定"
                    description="自訂通知偏好"
                    htmlFor={`read-${sz}-settings`}
                  />
                </RadioGroup>
                <Label>label: {readFont}</Label>
                <Label>description: {readFont} + fg-secondary（同字體）</Label>
                <Label>層級僅靠「顏色差 + 2px gap」，保持段落韻律</Label>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  ),
}


/* ═══════════════════════════════════════════════════════════════════════════
   3. 24px 閾值
   ═══════════════════════════════════════════════════════════════════════════ */

export const PrefixThreshold: StoryObj = {
  name: '3. 24px 閾值',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle>Prefix 對齊——24px 閾值</SectionTitle>
        <SectionDesc>
          prefix 內容物 ≤ 24px 時，容器設 h-[1lh] 對齊第一行 label 的垂直中心。
          prefix 內容物 {'>'} 24px（且有 description）時，容器拉高對齊整個文字塊。
          無 description 時 prefix 上限 24px，強制 inline。
        </SectionDesc>
      </div>

      <div className="flex flex-col gap-6">
        {/* Inline: icon 16px ≤ 24px */}
        <div className="flex flex-col gap-1">
          <Dim>{'<='} 24px — icon 16px, prefix 容器 h-[1lh], 對齊第一行</Dim>
          <MenuFrame width={360}>
            <SelectMenuGroup>
              <SelectMenuItem startIcon={Mail} description="每日寄送摘要信件">
                電子郵件通知
              </SelectMenuItem>
            </SelectMenuGroup>
          </MenuFrame>
          <Label>icon (16px) {'<='} 24px — prefix 對齊第一行 label 中心</Label>
        </div>

        {/* Inline: checkbox 16px ≤ 24px */}
        <div className="flex flex-col gap-1">
          <Dim>{'<='} 24px — checkbox 16px, prefix 容器 h-[1lh], 對齊第一行</Dim>
          <MenuFrame width={360}>
            <SelectMenuGroup>
              <SelectMenuItem checkbox checked={true} startIcon={Mail} description="每日寄送摘要信件">
                電子郵件通知
              </SelectMenuItem>
            </SelectMenuGroup>
          </MenuFrame>
          <Label>checkbox (16px) + icon (16px) 都 {'<='} 24px — 全部 inline 對齊</Label>
        </div>

        {/* Inline: avatar 20/24px ≤ 24px, no description */}
        <div className="flex flex-col gap-1">
          <Dim>{'<='} 24px — avatar inline (24px), 無 description, 強制 inline</Dim>
          <MenuFrame width={360}>
            <SelectMenuGroup>
              <SelectMenuItem avatar={<AvatarImg />}>
                Alice Chen
              </SelectMenuItem>
            </SelectMenuGroup>
          </MenuFrame>
          <Label>avatar 無 description — 使用 inline 尺寸 (20/24px), h-[1lh] 對齊</Label>
        </div>

        {/* Block: avatar 32px > 24px */}
        <div className="flex flex-col gap-1">
          <Dim>{'>'} 24px — avatar block (32px), 有 description, block 對齊</Dim>
          <MenuFrame width={360}>
            <SelectMenuGroup>
              <SelectMenuItem avatar={<AvatarImg />} description="設計部門">
                Alice Chen
              </SelectMenuItem>
            </SelectMenuGroup>
          </MenuFrame>
          <Label>avatar + description — 使用 block 尺寸 (32px), 對齊 label+gap+desc 文字塊</Label>
        </div>

        {/* SelectionItem: control always ≤ 24px */}
        <div className="flex flex-col gap-1">
          <Dim>SelectionItem — control 永遠 {'<='} 24px (16/20px), 不需 block 對齊</Dim>
          <div className="max-w-[360px]">
            <SelectionItem
              size="md"
              control={<Checkbox size="md" />}
              label="接受使用條款"
              description="勾選表示您同意我們的服務條款與隱私權政策，包括資料收集與使用方式"
            />
          </div>
          <Label>checkbox (16px) 永遠 inline — 即使有多行 description，prefix 也只對齊第一行</Label>
        </div>
      </div>
    </div>
  ),
}


/* ═══════════════════════════════════════════════════════════════════════════
   4. Prefix / Suffix 對稱對齊
   ═══════════════════════════════════════════════════════════════════════════ */

export const PrefixSuffixSymmetry: StoryObj = {
  name: '4. Prefix/Suffix 對稱',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle>Prefix / Suffix 對稱對齊</SectionTitle>
        <SectionDesc>
          prefix 和 suffix 使用完全相同的對齊邏輯（h-ref），不管另一方是否存在。
          suffix 通常 {'<='} 24px（icon + badge），幾乎總是 h-[1lh]。
        </SectionDesc>
      </div>

      <div className="flex flex-col gap-6">
        {/* Neither */}
        <div className="flex flex-col gap-1">
          <Dim>兩者都沒有：[content]</Dim>
          <MenuFrame width={360}>
            <SelectMenuGroup>
              <SelectMenuItem>純文字選項，無 prefix 也無 suffix</SelectMenuItem>
            </SelectMenuGroup>
          </MenuFrame>
        </div>

        {/* Prefix only */}
        <div className="flex flex-col gap-1">
          <Dim>只有 prefix：[prefix h-ref] [content flex-1]</Dim>
          <MenuFrame width={360}>
            <SelectMenuGroup>
              <SelectMenuItem startIcon={Mail} description="每日摘要信件">
                電子郵件通知
              </SelectMenuItem>
            </SelectMenuGroup>
          </MenuFrame>
          <Label>prefix icon 對齊第一行 label 中心，content 佔滿剩餘空間</Label>
        </div>

        {/* Suffix only — using a custom render to show suffix concept */}
        <div className="flex flex-col gap-1">
          <Dim>只有 suffix：[content flex-1] [suffix h-ref ml-auto]</Dim>
          <MenuFrame width={360}>
            <SelectMenuGroup>
              {/* Simulate suffix with custom layout */}
              <div className="flex items-start gap-2 px-3 w-full text-body leading-compact py-[calc((var(--field-height-md)-1lh)/2)] cursor-pointer hover:bg-neutral-hover">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate">外觀主題</span>
                  <span className="mt-0.5 text-caption text-fg-secondary">切換介面顏色主題</span>
                </div>
                <div className="h-[1lh] flex items-center gap-1 ml-auto shrink-0">
                  <span className="text-caption text-fg-muted">深色</span>
                  <ChevronRight size={16} className="text-fg-muted" />
                </div>
              </div>
            </SelectMenuGroup>
          </MenuFrame>
          <Label>suffix 靠 ml-auto 推到右邊，h-[1lh] 對齊第一行</Label>
        </div>

        {/* Both */}
        <div className="flex flex-col gap-1">
          <Dim>兩者皆有：[prefix h-ref] [content flex-1] [suffix h-ref ml-auto]</Dim>
          <MenuFrame width={360}>
            <SelectMenuGroup>
              <div className="flex items-start gap-2 px-3 w-full text-body leading-compact py-[calc((var(--field-height-md)-1lh)/2)] cursor-pointer hover:bg-neutral-hover">
                <div className="h-[1lh] flex items-center shrink-0">
                  <Settings size={16} className="text-fg-muted" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate">進階設定</span>
                  <span className="mt-0.5 text-caption text-fg-secondary">設定通知偏好和頻率</span>
                </div>
                <div className="h-[1lh] flex items-center gap-2 ml-auto shrink-0">
                  <ExternalLink size={16} className="text-fg-muted" />
                </div>
              </div>
            </SelectMenuGroup>
          </MenuFrame>
          <Label>prefix 和 suffix 各自 h-[1lh]，都對齊第一行 label 中心</Label>
        </div>
      </div>
    </div>
  ),
}


/* ═══════════════════════════════════════════════════════════════════════════
   5. Gap 慣例
   ═══════════════════════════════════════════════════════════════════════════ */

export const GapConventions: StoryObj = {
  name: '5. Gap 慣例',
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle>Gap 慣例</SectionTitle>
        <SectionDesc>
          所有 gap 值都固定，不隨 size 變化。統一的間距讓不同元件組合時視覺節奏一致。
        </SectionDesc>
      </div>

      {/* Gap reference table */}
      <div className="border border-border rounded-lg overflow-hidden max-w-[600px]">
        <table className="w-full text-body">
          <thead>
            <tr className="bg-surface-raised">
              <th className="text-left px-4 py-2 text-caption font-medium text-fg-muted">位置</th>
              <th className="text-left px-4 py-2 text-caption font-medium text-fg-muted">Gap</th>
              <th className="text-left px-4 py-2 text-caption font-medium text-fg-muted">Token</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-4 py-2">prefix 內部元素之間</td><td className="px-4 py-2 font-mono text-caption">8px</td><td className="px-4 py-2 font-mono text-caption">gap-2</td></tr>
            <tr><td className="px-4 py-2">prefix ↔ content</td><td className="px-4 py-2 font-mono text-caption">8px</td><td className="px-4 py-2 font-mono text-caption">gap-2</td></tr>
            <tr><td className="px-4 py-2">content ↔ suffix</td><td className="px-4 py-2 font-mono text-caption">auto</td><td className="px-4 py-2 font-mono text-caption">ml-auto</td></tr>
            <tr><td className="px-4 py-2">label ↔ description</td><td className="px-4 py-2 font-mono text-caption">2px</td><td className="px-4 py-2 font-mono text-caption">mt-0.5</td></tr>
            <tr><td className="px-4 py-2">suffix 獨立後綴內部</td><td className="px-4 py-2 font-mono text-caption">8px</td><td className="px-4 py-2 font-mono text-caption">gap-2</td></tr>
            <tr><td className="px-4 py-2">suffix 子選單指示內部</td><td className="px-4 py-2 font-mono text-caption">4px</td><td className="px-4 py-2 font-mono text-caption">gap-1</td></tr>
          </tbody>
        </table>
      </div>

      {/* Annotated live example — SelectMenuItem with checkbox + icon + description */}
      <div className="flex flex-col gap-3">
        <Dim>prefix 內部 gap (8px) + prefix↔content gap (8px)</Dim>
        <MenuFrame width={400}>
          <SelectMenuGroup>
            <SelectMenuItem checkbox checked={true} startIcon={Mail} description="每日寄送摘要信件">
              電子郵件通知
            </SelectMenuItem>
          </SelectMenuGroup>
        </MenuFrame>
        <Label>[checkbox] --8px-- [icon] --8px-- [label / desc(2px gap)]</Label>
      </div>

      {/* Annotated live example — suffix patterns */}
      <div className="flex flex-col gap-3">
        <Dim>獨立後綴 (gap-2, 8px)</Dim>
        <MenuFrame width={400}>
          <SelectMenuGroup>
            <div className="flex items-start gap-2 px-3 w-full text-body leading-compact py-[calc((var(--field-height-md)-1lh)/2)] cursor-pointer hover:bg-neutral-hover">
              <div className="h-[1lh] flex items-center shrink-0">
                <Star size={16} className="text-fg-muted" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate">收藏項目</span>
              </div>
              <div className="h-[1lh] flex items-center gap-2 ml-auto shrink-0">
                <div className="bg-error text-white text-footnote font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">3</div>
                <ExternalLink size={16} className="text-fg-muted" />
              </div>
            </div>
          </SelectMenuGroup>
        </MenuFrame>
        <Label>[prefix icon] --8px-- [label] --ml-auto-- [badge] --8px-- [endIcon]</Label>
      </div>

      <div className="flex flex-col gap-3">
        <Dim>子選單指示 (gap-1, 4px)</Dim>
        <MenuFrame width={400}>
          <SelectMenuGroup>
            <div className="flex items-start gap-2 px-3 w-full text-body leading-compact py-[calc((var(--field-height-md)-1lh)/2)] cursor-pointer hover:bg-neutral-hover">
              <div className="h-[1lh] flex items-center shrink-0">
                <Settings size={16} className="text-fg-muted" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate">外觀主題</span>
              </div>
              <div className="h-[1lh] flex items-center gap-1 ml-auto shrink-0">
                <span className="text-caption text-fg-muted">深色</span>
                <ChevronRight size={16} className="text-fg-muted" />
              </div>
            </div>
          </SelectMenuGroup>
        </MenuFrame>
        <Label>[prefix icon] --8px-- [label] --ml-auto-- [value] --4px-- [ChevronRight]</Label>
      </div>

      {/* label ↔ description gap */}
      <div className="flex flex-col gap-3">
        <Dim>label ↔ description gap (2px, mt-0.5) — 兩種模式統一</Dim>
        <div className="flex items-start gap-8">
          <div className="flex flex-col gap-1">
            <MenuFrame width={340}>
              <SelectMenuGroup>
                <SelectMenuItem startIcon={Bell} description="即時推播到裝置">
                  推播通知
                </SelectMenuItem>
              </SelectMenuGroup>
            </MenuFrame>
            <Label>掃描模式 — label 和 desc 間 2px</Label>
          </div>
          <div className="flex flex-col gap-1">
            <div className="max-w-[340px]">
              <SelectionItem
                size="md"
                control={<Checkbox size="md" />}
                label="推播通知"
                description="即時推播到裝置"
              />
            </div>
            <Label>閱讀模式 — label 和 desc 間 2px</Label>
          </div>
        </div>
      </div>
    </div>
  ),
}
