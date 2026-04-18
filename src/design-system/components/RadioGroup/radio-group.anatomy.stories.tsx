import type { Meta } from '@storybook/react'
import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { SelectionItem } from '@/design-system/components/SelectionControl/selection-item'

const meta: Meta = {
  title: 'Design System/Components/RadioGroup/設計規格',
  parameters: { layout: 'padded' },
}
export default meta

/* ═══════════════════════════════════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════════════════════════════════ */

type StateKey = 'default' | 'hover' | 'active' | 'disabled'
type CheckedKey = 'unchecked' | 'checked'
type SizeKey = 'sm' | 'md' | 'lg'
type ColorSpec = { border: string; bg: string; dot: string }

const STATES: StateKey[] = ['default', 'hover', 'active', 'disabled']
const CHECKED_STATES: CheckedKey[] = ['unchecked', 'checked']
const SIZES: SizeKey[] = ['sm', 'md', 'lg']

/** Radio color tokens per checked × state */
const TOKEN_MAP: Record<CheckedKey, Record<StateKey, ColorSpec>> = {
  unchecked: {
    default:  { border: '--border',      bg: '--surface',  dot: 'transparent' },
    hover:    { border: '--border-hover', bg: '--surface',  dot: 'transparent' },
    active:   { border: '--border-hover', bg: '--surface',  dot: 'transparent' },
    disabled: { border: 'transparent',   bg: '--bg-disabled', dot: 'transparent' },
  },
  checked: {
    default:  { border: '--primary',       bg: '--surface',     dot: '--primary' },
    hover:    { border: '--primary-hover',  bg: '--surface',     dot: '--primary-hover' },
    active:   { border: '--primary-active', bg: '--surface',     dot: '--primary-active' },
    disabled: { border: 'transparent',     bg: '--bg-disabled', dot: '--fg-disabled' },
  },
}

interface SizeSpec {
  controlPx: number
  dotPx: number
  controlToken: string
}

const SIZE_SPECS: Record<SizeKey, SizeSpec> = {
  sm: { controlPx: 16, dotPx: 8,  controlToken: 'h-4 w-4' },
  md: { controlPx: 16, dotPx: 8,  controlToken: 'h-4 w-4' },
  lg: { controlPx: 20, dotPx: 10, controlToken: 'h-5 w-5' },
}

/* ═══════════════════════════════════════════════════════════════════════════
   Shared UI Components
   ═══════════════════════════════════════════════════════════════════════════ */

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-h6 font-semibold text-foreground">{children}</h3>
)
const Desc = ({ children }: { children: React.ReactNode }) => (
  <p className="text-caption text-fg-muted max-w-[720px]">{children}</p>
)
const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="text-left p-2 border-b border-divider text-fg-muted font-medium text-caption whitespace-nowrap">{children}</th>
)
const Td = ({ children, mono }: { children: React.ReactNode; mono?: boolean }) => (
  <td className={`p-2 border-b border-divider align-top whitespace-nowrap text-caption ${mono ? 'font-mono' : ''}`}>{children}</td>
)

/** Token name (primary) + resolved value (secondary) */
const TkVal = ({ token, value }: { token: string; value?: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="font-mono text-[12px] text-fg-secondary">{token}</span>
    {value && <span className="font-mono text-[10px] text-fg-muted">{value}</span>}
  </div>
)

const Swatch = ({ value, size = 'md' }: { value: string; size?: 'sm' | 'md' }) => {
  const s = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  if (value === 'transparent') {
    return <span className={`${s} rounded-md shrink-0 border border-border`}
      style={{ backgroundImage: 'linear-gradient(45deg,#ddd 25%,transparent 25%,transparent 75%,#ddd 75%),linear-gradient(45deg,#ddd 25%,transparent 25%,transparent 75%,#ddd 75%)', backgroundSize: '6px 6px', backgroundPosition: '0 0,3px 3px' }} />
  }
  return <span className={`${s} rounded-md shrink-0 border border-black/10`} style={{ backgroundColor: `var(${value})` }} />
}

const TokenAnnotation = ({ colors }: { colors: ColorSpec }) => (
  <div className="flex flex-col gap-0.5 mt-2">
    {([['border', 'bdr'], ['bg', 'bg'], ['dot', 'dot']] as const).map(([key, label]) => (
      <span key={key} className="inline-flex items-center gap-1 text-[10px]">
        <Swatch value={colors[key]} size="sm" />
        <span className="text-fg-muted w-5 shrink-0">{label}</span>
        <span className="font-mono text-fg-secondary">{colors[key]}</span>
      </span>
    ))}
  </div>
)

const Tab = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick}
    className={`px-2.5 py-1 text-[12px] font-mono rounded-md cursor-pointer transition-colors ${
      active ? 'bg-primary text-white font-semibold' : 'bg-neutral-hover text-fg-secondary hover:bg-neutral-active'
    }`}>
    {children}
  </button>
)

const PropRow = ({ label, dot, children }: { label: string; dot?: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-2 border-b border-divider last:border-b-0">
    <span className="text-[11px] text-fg-muted font-medium w-[72px] shrink-0 pt-0.5 flex items-center gap-1.5">
      {dot && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />}
      {label}
    </span>
    <div className="flex-1 text-[12px] font-mono text-fg-secondary">{children}</div>
  </div>
)

const TokenValue = ({ value }: { value: string }) => (
  <span className="inline-flex items-center gap-2"><Swatch value={value} /><span>{value}</span></span>
)

/* ═══════════════════════════════════════════════════════════════════════════
   Blueprint Zone Colors
   ═══════════════════════════════════════════════════════════════════════════ */

const Z = {
  control: { bg: 'rgba(166,208,245,0.6)', border: 'rgba(80,145,210,0.9)', text: '#2d6a9f' },
  dot:     { bg: 'rgba(253,218,158,0.6)', border: 'rgba(218,165,60,0.9)', text: '#8a6010' },
  gap:     { bg: 'rgba(194,225,154,0.6)', border: 'rgba(139,179,91,0.9)', text: '#5a7a2e' },
  label:   { bg: 'rgba(199,178,230,0.6)', border: 'rgba(138,103,190,0.9)', text: '#6035a8' },
  dim:     { text: '#d04040' },
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. 元件總覽
   ═══════════════════════════════════════════════════════════════════════════ */

export const Overview = {
  name: '1. 元件總覽',
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <H3>結構（Anatomy）</H3>
          <Desc>
            Radio 由兩個部分組成：圓形控件（indicator）和 Label。
            控件不內建 label，label 組合使用 SelectionItem 元件。
            Radio 必須在 RadioGroup 內使用（互斥選擇語意）。
          </Desc>
        </div>

        {/* Anatomy diagram */}
        <div className="flex gap-8">
          {/* RadioGroupItem standalone */}
          <div className="flex flex-col gap-2 items-start">
            <span className="text-[11px] text-fg-muted font-medium">RadioGroupItem（控件）</span>
            <div className="inline-flex items-center border-2 border-dashed border-primary/30 rounded-full px-3 py-2.5 gap-2">
              {[{ name: 'border', color: 'info' }, { name: 'dot (indicator)', color: 'warning' }].map((s) => (
                <span key={s.name} className="rounded px-2 py-1 text-[11px] font-mono border border-dashed"
                  style={{ borderColor: `var(--${s.color})`, backgroundColor: `var(--${s.color}-subtle)`, color: `var(--${s.color})` }}>{s.name}</span>
              ))}
            </div>
            <span className="text-[10px] text-fg-muted font-mono">rounded-full · grid place-content-center</span>
          </div>
          {/* With SelectionItem */}
          <div className="flex flex-col gap-2 items-start">
            <span className="text-[11px] text-fg-muted font-medium">搭配 SelectionItem</span>
            <div className="inline-flex items-center border-2 border-dashed border-primary/30 rounded-md px-3 py-2.5 gap-2">
              {[{ name: 'control', color: 'info' }, { name: 'label', color: 'success' }, { name: 'description', color: 'magenta' }].map((s) => (
                <span key={s.name} className="rounded px-2 py-1 text-[11px] font-mono border border-dashed"
                  style={{ borderColor: `var(--${s.color})`, backgroundColor: `var(--${s.color}-subtle)`, color: `var(--${s.color})` }}>{s.name}</span>
              ))}
            </div>
            <span className="text-[10px] text-fg-muted font-mono">flex items-start gap-2 · control 在一行文字高度的容器內置中</span>
          </div>
        </div>
      </div>

      {/* Props table */}
      <div className="flex flex-col gap-3">
        <H3>Props</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Prop</Th><Th>Type</Th><Th>Default</Th><Th>說明</Th></tr></thead>
            <tbody>
              {[
                ['value', 'string', '(required)', 'RadioGroup 內的唯一值'],
                ['size', "'sm'|'md'|'lg'", "'md'", '控件尺寸（sm/md = 16px, lg = 20px）'],
                ['disabled', 'boolean', 'false', '不可互動，移除品牌色'],
                ['id', 'string', '—', '搭配 SelectionItem 的 htmlFor'],
              ].map(([p, t, d, desc]) => (
                <tr key={p}><Td mono>{p}</Td><Td mono>{t}</Td><Td mono>{d}</Td><Td>{desc}</Td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkbox vs Radio comparison */}
      <div className="flex flex-col gap-3">
        <H3>Checkbox vs Radio</H3>
        <Desc>視覺語言完全一致，差異只有形狀、指示器、語意。</Desc>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th></Th><Th>Checkbox</Th><Th>Radio</Th></tr></thead>
            <tbody>
              {[
                ['形狀', 'rounded-md（方）', 'rounded-full（圓）'],
                ['指示器', 'Check icon（白色）', 'Filled dot（品牌色）'],
                ['語意', '獨立 toggle（多選）', '互斥選擇（單選）'],
                ['容器', '可獨立使用', '必須在 RadioGroup 內'],
              ].map(([label, cb, radio]) => (
                <tr key={label}><Td>{label}</Td><Td mono>{cb}</Td><Td mono>{radio}</Td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. 元件檢閱器 — Interactive Inspector
   ═══════════════════════════════════════════════════════════════════════════ */

const BpZone = ({ w, h, color, label, sub, round }: { w: number; h?: number; color: typeof Z.control; label: string; sub?: string; round?: boolean }) => (
  <div className={`flex flex-col items-center justify-center shrink-0 gap-0.5 ${round ? 'rounded-full' : ''}`}
    style={{ width: w, height: h ?? '100%', background: color.bg, border: `1.5px dashed ${color.border}` }}>
    <span className="text-[11px] font-mono font-bold leading-none" style={{ color: color.text }}>{label}</span>
    {sub && <span className="text-[9px] font-mono leading-none opacity-70" style={{ color: color.text }}>{sub}</span>}
  </div>
)

const InspectorInner = () => {
  const [checked, setChecked] = useState<CheckedKey>('checked')
  const [state, setState] = useState<StateKey>('default')
  const [size, setSize] = useState<SizeKey>('md')
  const [withDescription, setWithDescription] = useState(false)

  const colors = TOKEN_MAP[checked][state]
  const s = SIZE_SPECS[size]

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-fg-muted w-16 shrink-0">Checked</span>
          <div className="flex gap-1.5">
            {CHECKED_STATES.map((c) => <Tab key={c} active={checked === c} onClick={() => setChecked(c)}>{c}</Tab>)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-fg-muted w-16 shrink-0">State</span>
          <div className="flex gap-1.5">
            {STATES.map((st) => <Tab key={st} active={state === st} onClick={() => setState(st)}>{st}</Tab>)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-fg-muted w-16 shrink-0">Size</span>
          <div className="flex gap-1.5">
            {SIZES.map((sz) => <Tab key={sz} active={size === sz} onClick={() => setSize(sz)}>{sz}</Tab>)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-fg-muted w-16 shrink-0">Description</span>
          <div className="flex gap-1.5">
            <Tab active={!withDescription} onClick={() => setWithDescription(false)}>off</Tab>
            <Tab active={withDescription} onClick={() => setWithDescription(true)}>on</Tab>
          </div>
          <span className="text-[11px] text-fg-muted">label 下方的次要說明</span>
        </div>
      </div>

      {/* Preview + Panel */}
      <div className="flex gap-6 items-start">
        {/* Left: preview + blueprint */}
        <div className="flex flex-col gap-5 min-w-[300px]">
          {/* Live preview */}
          <div className="px-10 py-8 rounded-lg bg-canvas border border-divider flex items-center justify-center gap-6">
            <RadioGroup defaultValue={checked === 'checked' ? 'preview' : undefined} className="flex gap-4">
              <SelectionItem
                size={size}
                control={<RadioGroupItem value="preview" id="preview-radio" size={size} disabled={state === 'disabled'} />}
                label="選項 A"
                description={withDescription ? '次要說明文字,給使用者更多 context' : undefined}
                htmlFor="preview-radio"
                disabled={state === 'disabled'}
              />
              <SelectionItem
                size={size}
                control={<RadioGroupItem value="other" id="preview-other" size={size} disabled={state === 'disabled'} />}
                label="選項 B"
                description={withDescription ? '另一個選項的補充說明' : undefined}
                htmlFor="preview-other"
                disabled={state === 'disabled'}
              />
            </RadioGroup>
          </div>

          {/* Blueprint — control with label */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 text-[10px]">
              {[{ c: Z.control, l: 'Control' }, { c: Z.dot, l: 'Dot' }, { c: Z.gap, l: 'Gap' }, { c: Z.label, l: 'Label' }].map(({ c, l }) => (
                <span key={l} className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-md" style={{ background: c.bg, border: `1px dashed ${c.border}` }} />
                  <span className="font-medium" style={{ color: c.text }}>{l}</span>
                </span>
              ))}
            </div>
            <div className="flex items-center">
              <div className="flex items-center overflow-hidden" style={{ height: 48, outline: `2px solid ${Z.dim.text}22` }}>
                {/* Control zone */}
                <div className="flex items-center justify-center shrink-0"
                  style={{ width: 48, height: 48, background: Z.control.bg, border: `1.5px dashed ${Z.control.border}` }}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[11px] font-mono font-bold leading-none" style={{ color: Z.control.text }}>{s.controlToken.split(' ')[0]}</span>
                    <span className="text-[9px] font-mono leading-none opacity-70" style={{ color: Z.control.text }}>{s.controlPx}px</span>
                    {checked === 'checked' && (
                      <div className="mt-0.5 rounded-full" style={{ width: 10, height: 10, background: Z.dot.bg, border: `1px dashed ${Z.dot.border}` }}>
                        <span className="text-[7px] font-mono font-bold flex items-center justify-center h-full" style={{ color: Z.dot.text }}></span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Gap */}
                <BpZone w={32} color={Z.gap} label="gap-2" sub="8px" />
                {/* Label */}
                <BpZone w={80} color={Z.label} label="Label" sub={size === 'lg' ? 'text-body-lg' : 'text-body'} />
              </div>
              {/* Height annotation */}
              <div className="ml-3 flex items-center" style={{ height: 48 }}>
                <svg width="10" height="48" className="shrink-0">
                  <line x1="5" y1="2" x2="5" y2="46" stroke={Z.dim.text} strokeWidth="1" />
                  <line x1="1" y1="2" x2="9" y2="2" stroke={Z.dim.text} strokeWidth="1.5" />
                  <line x1="1" y1="46" x2="9" y2="46" stroke={Z.dim.text} strokeWidth="1.5" />
                </svg>
                <div className="ml-1.5"><TkVal token="一行文字高度" value="控件容器高度" /></div>
              </div>
            </div>
            <p className="text-[10px] text-fg-muted">控件包在一行文字高度的容器內，多行文字時對齊第一行。寬度為示意比例。</p>
          </div>
        </div>

        {/* Right: inspect panel */}
        <div className="w-[300px] shrink-0 border border-divider rounded-lg bg-surface overflow-hidden">
          <div className="px-4 py-2.5 border-b border-divider bg-neutral-hover">
            <span className="text-[12px] font-semibold text-foreground">Inspect</span>
          </div>

          {/* COLOR */}
          <div className="px-4 py-1">
            <div className="py-2 border-b border-divider"><span className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider">Color</span></div>
            <PropRow label="Border"><TokenValue value={colors.border} /></PropRow>
            <PropRow label="Fill"><TokenValue value={colors.bg} /></PropRow>
            <PropRow label="Dot"><TokenValue value={colors.dot} /></PropRow>
          </div>

          {/* LAYOUT */}
          <div className="px-4 py-1">
            <div className="py-2 border-b border-divider"><span className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider">Layout</span></div>
            <PropRow label="控件尺寸" dot={Z.control.text}><TkVal token={s.controlToken} value={`${s.controlPx}px`} /></PropRow>
            <PropRow label="Dot 尺寸" dot={Z.dot.text}><TkVal token={`${s.dotPx}px`} value={checked === 'unchecked' ? '(hidden)' : 'fill-current'} /></PropRow>
            <PropRow label="Item Gap" dot={Z.gap.text}><TkVal token="gap-2" value="8px" /></PropRow>
          </div>

          {/* STYLE */}
          <div className="px-4 py-1 pb-3">
            <div className="py-2 border-b border-divider"><span className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider">Style</span></div>
            <PropRow label="Radius"><TkVal token="rounded-full" value="9999px" /></PropRow>
            <PropRow label="Border"><TkVal token="border" value="1px solid" /></PropRow>
            <PropRow label="Focus"><TkVal token="ring-2 ring-ring ring-offset-1" /></PropRow>
            <PropRow label="Transition"><TkVal token="duration-150" value="colors" /></PropRow>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Inspector = {
  name: '2. 元件檢閱器',
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <H3>元件檢閱器</H3>
        <Desc>選擇任意 checked/state/size 組合，即時查看所有 token。色塊即時渲染，切 dark mode 自動更新。</Desc>
      </div>
      <InspectorInner />
    </div>
  ),
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. 色彩對照表 — Checked × State Token Matrix
   ═══════════════════════════════════════════════════════════════════════════ */

export const ColorMatrix = {
  name: '3. 色彩對照表',
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <H3>Checked × State 色彩對照</H3>
        <Desc>
          橫向看同一 checked 狀態的 state 變化，縱向比較 unchecked 和 checked 的設計邏輯。
          Radio 與 Checkbox 的關鍵差異：checked 時底色維持 surface，指示器用品牌色 dot（Checkbox 則是底色變 primary、指示器用白色 check）。
        </Desc>
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead><tr><Th>狀態</Th>{STATES.map((st) => <Th key={st}>{st}</Th>)}</tr></thead>
          <tbody>
            {CHECKED_STATES.map((c) => (
              <tr key={c}>
                <td className="p-3 border-b border-divider font-mono text-caption font-medium align-top">{c}</td>
                {STATES.map((st) => {
                  const isChecked = c === 'checked'
                  const isDisabled = st === 'disabled'
                  return (
                    <td key={st} className="p-3 border-b border-divider align-top min-w-[160px]">
                      <RadioGroup defaultValue={isChecked ? 'demo' : undefined}>
                        <RadioGroupItem value="demo" disabled={isDisabled} />
                      </RadioGroup>
                      <TokenAnnotation colors={TOKEN_MAP[c][st]} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Token summary */}
      <div className="flex flex-col gap-3">
        <span className="text-caption font-medium text-fg-secondary">Token 摘要</span>
        <div className="overflow-x-auto">
          <table className="border-collapse text-caption">
            <thead><tr><Th>屬性</Th><Th>Unchecked</Th><Th>Checked</Th><Th>Disabled（共用）</Th></tr></thead>
            <tbody>
              {[
                ['邊框', '--border', '--primary', 'transparent'],
                ['底色', '--surface', '--surface', '--bg-disabled'],
                ['Dot', '(hidden)', '--primary', '--fg-disabled / (hidden)'],
                ['Hover 邊框', '--border-hover', '--primary-hover', '—'],
              ].map(([label, unchk, chk, dis]) => (
                <tr key={label}>
                  <Td>{label}</Td>
                  <Td mono>{unchk}</Td>
                  <Td mono>{chk}</Td>
                  <Td mono>{dis}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. 尺寸對照表 — Size Token Comparison
   ═══════════════════════════════════════════════════════════════════════════ */

export const SizeMatrix = {
  name: '4. 尺寸對照表',
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <H3>Size Token 對照</H3>
        <Desc>
          三種尺寸（sm/md = 16px, lg = 20px）。sm 和 md 視覺相同，純粹是命名 mapping 讓消費者直接傳同一個 size prop。
          搭配 SelectionItem 時，item 高度自動對齊同 size 的 Input。
        </Desc>
      </div>

      {/* Token table */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-caption">
          <thead><tr>
            <Th>屬性</Th>
            {SIZES.map((sz) => <Th key={sz}>{sz}{sz === 'md' ? '（預設）' : ''}</Th>)}
          </tr></thead>
          <tbody>
            {([
              { label: '控件尺寸', fn: (s: SizeSpec) => ({ token: s.controlToken, sub: `${s.controlPx}px` }) },
              { label: 'Dot 尺寸', fn: (s: SizeSpec) => ({ token: `${s.dotPx}px`, sub: 'filled circle' }) },
              { label: '形狀', fn: () => ({ token: 'rounded-full', sub: '9999px' }) },
              { label: 'Item 字體', fn: (_: SizeSpec, sz: SizeKey) => ({ token: sz === 'lg' ? 'text-body-lg' : 'text-body', sub: sz === 'lg' ? '16px' : '14px' }) },
              { label: 'Item 間距', fn: () => ({ token: 'gap-2', sub: '8px (control-label)' }) },
            ]).map((row) => (
              <tr key={row.label}>
                <Td>{row.label}</Td>
                {SIZES.map((sz) => {
                  const spec = SIZE_SPECS[sz]
                  const { token, sub } = row.fn(spec, sz)
                  return (
                    <Td key={sz} mono>
                      <div className="text-fg-secondary">{token}</div>
                      <div className="text-fg-muted text-[10px]">{sub}</div>
                    </Td>
                  )
                })}
              </tr>
            ))}
            {/* SelectionItem padding formula */}
            <tr>
              <Td>Item padding</Td>
              {SIZES.map((sz) => (
                <Td key={sz} mono>
                  <div className="text-fg-secondary">py = (field-height − 一行文字高度) / 2</div>
                  <div className="text-fg-muted text-[10px]">單行 = field-height-{sz}</div>
                </Td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Visual preview */}
      <div className="flex flex-col gap-4">
        <span className="text-caption font-medium text-fg-secondary">預覽</span>
        <div className="flex gap-8">
          {SIZES.map((sz) => (
            <div key={sz} className="flex flex-col gap-2">
              <span className="text-[11px] text-fg-muted font-mono">size="{sz}" ({SIZE_SPECS[sz].controlPx}px)</span>
              <RadioGroup defaultValue="a">
                <SelectionItem
                  size={sz}
                  control={<RadioGroupItem value="a" id={`sz-${sz}-a`} size={sz} />}
                  label="選項 A"
                  htmlFor={`sz-${sz}-a`}
                />
                <SelectionItem
                  size={sz}
                  control={<RadioGroupItem value="b" id={`sz-${sz}-b`} size={sz} />}
                  label="選項 B"
                  description="附帶說明文字"
                  htmlFor={`sz-${sz}-b`}
                />
                <SelectionItem
                  size={sz}
                  control={<RadioGroupItem value="c" id={`sz-${sz}-c`} size={sz} disabled />}
                  label="不可用"
                  htmlFor={`sz-${sz}-c`}
                  disabled
                />
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}
