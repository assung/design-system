import React from 'react'
import { useChannel } from '@storybook/manager-api'
import { EVENTS, type InspectPayload, type DevmodeMode } from './constants'

const styles: Record<string, React.CSSProperties> = {
  root: {
    padding: '12px 16px',
    fontSize: 12,
    fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
    color: 'var(--sb-fg, #1F2532)',
    height: '100%',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--sb-fg-muted, #65727F)',
    margin: '12px 0 6px',
  },
  badge: {
    display: 'inline-block',
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: 3,
    background: 'rgba(0,101,234,0.12)',
    color: '#0065EA',
    fontWeight: 500,
  },
  anatomy: {
    position: 'relative',
    border: '1px solid rgba(128,128,128,0.25)',
    borderRadius: 6,
    padding: '36px 40px',
    background: 'var(--sb-bg-subtle, rgba(0,0,0,0.02))',
    marginTop: 4,
  },
  distance: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: 600,
    color: '#fff',
    background: '#EC4436',
    padding: '1px 5px',
    borderRadius: 3,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
  },
  borderBox: {
    position: 'relative',
    border: '1px dashed rgba(128,128,128,0.5)',
    padding: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paddingBox: {
    position: 'relative',
    border: '1px dashed rgba(0,101,234,0.55)',
    padding: 8,
    background: 'repeating-linear-gradient(-45deg, rgba(0,101,234,0.12) 0 3px, transparent 3px 6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--sb-fg-muted, #65727F)',
    fontSize: 11,
    minWidth: 120,
    minHeight: 40,
  },
  edgeLabel: {
    color: 'var(--sb-fg-muted, #65727F)',
    fontSize: 10,
    lineHeight: 1,
  },
  toggle: {
    display: 'inline-flex',
    border: '1px solid rgba(128,128,128,0.35)',
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 11,
  },
  toggleBtn: (active: boolean): React.CSSProperties => ({
    padding: '3px 10px',
    cursor: 'pointer',
    background: active ? 'rgba(0,101,234,0.15)' : 'transparent',
    color: active ? '#0065EA' : 'var(--sb-fg, #1F2532)',
    border: 0,
    fontWeight: active ? 600 : 400,
    fontFamily: 'inherit',
  }),
  code: {
    background: 'var(--sb-bg-subtle, rgba(0,0,0,0.04))',
    border: '1px solid rgba(128,128,128,0.2)',
    borderRadius: 4,
    padding: '8px 10px',
    fontFamily: '"SF Mono", Menlo, Consolas, monospace',
    fontSize: 11,
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    counterReset: 'ln',
  },
  codeRow: {
    display: 'grid',
    gridTemplateColumns: '18px 1fr',
    gap: 8,
  },
  codeLn: {
    color: 'var(--sb-fg-muted, #a0a0a0)',
    userSelect: 'none',
  },
  tokenChip: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: 2,
    verticalAlign: -1,
    marginRight: 4,
    border: '1px solid rgba(128,128,128,0.3)',
  },
  copy: {
    cursor: 'pointer',
    background: 'transparent',
    border: 0,
    color: 'var(--sb-fg-muted, #65727F)',
    padding: 2,
    borderRadius: 3,
    fontSize: 12,
  },
  empty: {
    color: 'var(--sb-fg-muted, #65727F)',
    fontSize: 12,
    padding: '24px 0',
    textAlign: 'center',
  },
  modeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottom: '1px solid rgba(128,128,128,0.2)',
    marginBottom: 8,
  },
}

type ViewMode = 'list' | 'code'

const isColor = (v: string) => /^(#|rgba?\(|hsla?\()/i.test(v.trim())
const extractColor = (v: string) => {
  const m = v.match(/(rgba?\([^)]+\)|#[0-9a-f]{3,8}\b|hsla?\([^)]+\))/i)
  return m ? m[0] : null
}

const propsOrder = [
  'display', 'position',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'flex', 'flex-direction', 'gap',
  'justify-content', 'align-items',
  'color', 'background', 'background-color',
  'border', 'border-width', 'border-style', 'border-color', 'border-radius',
  'box-shadow', 'opacity',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
] as const

const sortEntries = (groups: Record<string, string>): [string, string][] =>
  Object.entries(groups).sort((a, b) => {
    const ai = propsOrder.indexOf(a[0] as (typeof propsOrder)[number])
    const bi = propsOrder.indexOf(b[0] as (typeof propsOrder)[number])
    if (ai === -1 && bi === -1) return a[0].localeCompare(b[0])
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

const layoutKeys = new Set([
  'display', 'position', 'width', 'height', 'min-width', 'min-height',
  'max-width', 'max-height',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'flex', 'flex-direction', 'flex-wrap', 'gap', 'row-gap', 'column-gap',
  'justify-content', 'align-items', 'align-self',
  'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row',
])

const splitByGroup = (cs: Record<string, string>) => {
  const layout: Record<string, string> = {}
  const style: Record<string, string> = {}
  for (const [k, v] of Object.entries(cs)) {
    ;(layoutKeys.has(k) ? layout : style)[k] = v
  }
  return { layout, style }
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* ignore */
  }
}

type TokenByPropEntry = { tokens: string[]; resolved: string; source: 'author' | 'speculative' }

const renderValue = (
  prop: string,
  v: string,
  tokenByProp: Map<string, TokenByPropEntry>,
): React.ReactNode => {
  const hit = tokenByProp.get(prop)
  const color = extractColor(v)

  // 'author' source = stylesheet 真實寫的 var(),顯示為 authoritative purple
  if (hit && hit.tokens.length && hit.source === 'author') {
    const token = hit.tokens[0]
    return (
      <>
        {color && isColor(color) && (
          <span style={{ ...styles.tokenChip, background: color }} />
        )}
        <span style={{ color: '#7A4EE8' }}>{`var(`}</span>
        <span title={`source:author,resolved:${hit.resolved}`} style={{ color: '#C4423A', textDecoration: 'underline', textDecorationStyle: 'solid' }}>
          {token}
        </span>
        <span style={{ color: '#7A4EE8' }}>{`, `}</span>
        <span>{hit.resolved}</span>
        <span style={{ color: '#7A4EE8' }}>{`)`}</span>
      </>
    )
  }

  // 'speculative' source = reverse-lookup 推測,作 hint 顯示為淡灰 + 註記 candidate
  if (hit && hit.tokens.length && hit.source === 'speculative') {
    const allTokens = hit.tokens.length > 1 ? `${hit.tokens.length} candidates` : hit.tokens[0]
    return (
      <>
        {color && isColor(color) && (
          <span style={{ ...styles.tokenChip, background: color }} />
        )}
        <span>{v}</span>
        <span
          title={`同值 token candidates(speculative,author 沒寫 var()):${hit.tokens.join(', ')}`}
          style={{ marginLeft: 6, fontSize: 10, color: 'var(--sb-fg-muted, #888)', fontStyle: 'italic' }}
        >
          ⓘ {allTokens}
        </span>
      </>
    )
  }

  // No token info — pure computed value
  return (
    <>
      {color && isColor(color) && (
        <span style={{ ...styles.tokenChip, background: color }} />
      )}
      <span>{v}</span>
    </>
  )
}

const Section: React.FC<{
  title: string
  entries: [string, string][]
  view: ViewMode
  tokenByProp: Map<string, TokenByPropEntry>
}> = ({ title, entries, view, tokenByProp }) => {
  if (!entries.length) return null
  const codeText = entries
    .map(([k, v]) => {
      const hit = tokenByProp.get(k)
      // Code view 只用 author source 顯示 var(),speculative 不顯示避免 misleading copy-paste
      const display =
        hit && hit.tokens.length && hit.source === 'author'
          ? `var(${hit.tokens[0]}, ${hit.resolved})`
          : v
      return `${k}: ${display};`
    })
    .join('\n')
  return (
    <section>
      <div style={styles.sectionHead}>
        <span>{title}</span>
        <button
          style={styles.copy}
          onClick={() => copyText(codeText)}
          title="Copy section"
          aria-label={`Copy ${title}`}
        >
          ⧉
        </button>
      </div>
      {view === 'list' ? (
        <div style={styles.code}>
          {entries.map(([k, v], i) => (
            <div key={k} style={styles.codeRow}>
              <span style={styles.codeLn}>{i + 1}</span>
              <span>
                <span style={{ color: 'var(--sb-fg-muted, #7A8896)' }}>{k}</span>
                {': '}
                {renderValue(k, v, tokenByProp)}
                {';'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <pre style={{ ...styles.code, margin: 0 }}>{codeText}</pre>
      )}
    </section>
  )
}

const AnatomyBox: React.FC<{ payload: InspectPayload }> = ({ payload }) => {
  const { distancesToParent, padding, rect } = payload
  const w = Math.round(rect.width)
  const h = Math.round(rect.height)
  const iw = Math.max(0, w - padding.left - padding.right)
  const ih = Math.max(0, h - padding.top - padding.bottom)
  return (
    <div style={styles.anatomy}>
      {distancesToParent && (
        <>
          <div style={{ ...styles.distance, top: 6, left: '50%', transform: 'translateX(-50%)' }}>
            {distancesToParent.top}
          </div>
          <div style={{ ...styles.distance, bottom: 6, left: '50%', transform: 'translateX(-50%)' }}>
            {distancesToParent.bottom}
          </div>
          <div style={{ ...styles.distance, left: 6, top: '50%', transform: 'translateY(-50%)' }}>
            {distancesToParent.left}
          </div>
          <div style={{ ...styles.distance, right: 6, top: '50%', transform: 'translateY(-50%)' }}>
            {distancesToParent.right}
          </div>
        </>
      )}
      <div style={styles.borderBox}>
        <span style={{ ...styles.edgeLabel, position: 'absolute', top: -9, left: 8, background: 'var(--sb-bg, #fff)', padding: '0 4px' }}>Border</span>
        <span style={styles.edgeLabel}>{padding.left}</span>
        <div style={styles.paddingBox}>
          <span style={{ ...styles.edgeLabel, position: 'absolute', top: -9, left: 8, background: 'var(--sb-bg, #fff)', padding: '0 4px', color: '#0065EA' }}>
            Padding
          </span>
          <span style={{ color: 'var(--sb-fg, #1F2532)', fontWeight: 500 }}>{`${iw} × ${ih}`}</span>
        </div>
        <span style={styles.edgeLabel}>{padding.right}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 6, right: 10, fontSize: 10, color: 'var(--sb-fg-muted, #65727F)' }}>
        border-box
      </div>
    </div>
  )
}

export const DsDevmodePanel: React.FC<{ active: boolean }> = ({ active }) => {
  const [payload, setPayload] = React.useState<InspectPayload | null>(null)
  const [view, setView] = React.useState<ViewMode>('list')
  const [mode, setMode] = React.useState<DevmodeMode>('off')

  const emit = useChannel({
    [EVENTS.INSPECT]: (p: InspectPayload) => setPayload(p),
    [EVENTS.TOGGLE]: (m: DevmodeMode) => setMode(m),
    [EVENTS.CLEAR]: () => setPayload(null),
  })

  if (!active) return null

  const tokenByProp = new Map<string, TokenByPropEntry>()
  payload?.tokenUsage.forEach(t => tokenByProp.set(t.property, { tokens: t.tokens, resolved: t.resolved, source: t.source }))
  const groups = payload ? splitByGroup(payload.computed) : { layout: {}, style: {} }

  const setModeAndBroadcast = (next: DevmodeMode) => {
    setMode(next)
    emit(EVENTS.TOGGLE, next)
    if (next === 'off') emit(EVENTS.CLEAR)
  }

  return (
    <div style={styles.root}>
      <div style={styles.modeRow}>
        <strong style={{ fontSize: 12 }}>DS Devmode</strong>
        <div style={styles.toggle} role="group" aria-label="Inspect mode">
          <button style={styles.toggleBtn(mode === 'off')} onClick={() => setModeAndBroadcast('off')}>Off</button>
          <button style={styles.toggleBtn(mode === 'live')} onClick={() => setModeAndBroadcast('live')}>Live</button>
          <button style={styles.toggleBtn(mode === 'pin')} onClick={() => setModeAndBroadcast('pin')} disabled={!payload}>Pin</button>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--sb-fg-muted, #65727F)' }}>Alt+I toggle · Esc unpin · Pin 後 hover 其他元素測距</span>
      </div>

      {!payload && (
        <div style={styles.empty}>
          {mode === 'off'
            ? 'Off. Toggle Live/Pin, click an element to inspect.'
            : mode === 'live'
              ? 'Hover any canvas element.'
              : 'Click a canvas element to pin — 之後 hover 其他元素自動測距(Figma-style)。'}
        </div>
      )}

      {payload && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={styles.badge}>{payload.tag}</span>
            {payload.id && <code style={{ fontSize: 11 }}>#{payload.id}</code>}
            {payload.className && (
              <code style={{ fontSize: 11, color: 'var(--sb-fg-muted, #65727F)', wordBreak: 'break-all' }}>
                .{String(payload.className).split(/\s+/).filter(Boolean).join(' .')}
              </code>
            )}
          </div>

          <div style={styles.sectionHead}>
            <span>Layer properties</span>
          </div>
          <AnatomyBox payload={payload} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            <div style={styles.toggle} role="group" aria-label="View">
              <button style={styles.toggleBtn(view === 'list')} onClick={() => setView('list')}>List</button>
              <button style={styles.toggleBtn(view === 'code')} onClick={() => setView('code')}>Code</button>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--sb-fg-muted, #65727F)' }}>CSS</span>
          </div>

          <Section title="Layout" entries={sortEntries(groups.layout)} view={view} tokenByProp={tokenByProp} />
          <Section title="Style" entries={sortEntries(groups.style)} view={view} tokenByProp={tokenByProp} />

          {payload.tokenUsage.length === 0 && Object.keys(payload.computed).length > 0 && (
            <div style={{ ...styles.empty, padding: '12px 0' }}>No DS tokens matched this element&rsquo;s computed values.</div>
          )}
        </>
      )}
    </div>
  )
}
