/**
 * Canvas-side entry. Runs inside the Storybook iframe.
 * Listens for mode changes, binds DOM listeners, emits inspect payload,
 * renders redline overlay.
 */
import { addons } from '@storybook/preview-api'
import { measureElement } from './utils/dom-geometry'
import { extractComputed } from './utils/computed-style'
import { annotateWithTokens, extractSourceVars } from './utils/token-reverse-lookup'
import { drawOverlay, clearOverlay } from './utils/overlay'
import { EVENTS, type DevmodeMode, type InspectPayload } from './constants'

let mode: DevmodeMode = 'off'
let pinnedEl: Element | null = null
let hoverEl: Element | null = null
/** pin 模式下的 sibling hover target(Figma-style distance measurement) */
let siblingHoverEl: Element | null = null

const channel = addons.getChannel()

const isInspectableTarget = (t: EventTarget | null): t is Element => {
  if (!(t instanceof Element)) return false
  if (t.closest('#__ds_devmode_overlay__')) return false
  // skip storybook root wrappers
  if (t.id === 'storybook-root') return false
  return true
}

const build = (el: Element): InspectPayload => {
  const geom = measureElement(el)
  const computed = extractComputed(el)
  const merged: Record<string, string> = { ...computed.layout, ...computed.style }
  // Source-first(2026-04-25):author 在 stylesheet / inline style 寫的 var() 直接抓
  const sourceVars = extractSourceVars(el)
  // Reverse-lookup 降為 fallback hint(只在無 source var 時 candidates 用)
  const candidates = annotateWithTokens(merged)
  // Merge:source(authoritative)優先,reverse-lookup 補無 source 的 property
  const tokenUsage = Object.keys(merged).map(prop => {
    const src = sourceVars.get(prop)
    if (src) {
      // Author 寫了 token(可信)
      return {
        property: prop,
        raw: src.rawValue,
        tokens: src.tokens,
        resolved: src.resolved,
        source: 'author' as const,
      }
    }
    const cand = candidates.find(c => c.property === prop)
    if (cand) {
      // Reverse-lookup candidates(speculative,標明)
      return {
        property: prop,
        raw: cand.raw,
        tokens: cand.tokens,
        resolved: cand.resolved,
        source: 'speculative' as const,
      }
    }
    return null
  }).filter((x): x is NonNullable<typeof x> => x !== null)

  return {
    ...geom,
    computed: merged,
    tokenUsage,
  }
}

const emit = (el: Element, sibling: Element | null = null) => {
  const payload = build(el)
  channel.emit(EVENTS.INSPECT, payload)
  drawOverlay({
    element: el,
    mode: mode === 'pin' ? 'pin' : 'live',
    label: payload.id ? `#${payload.id}` : payload.className ? `.${String(payload.className).split(/\s+/)[0]}` : payload.tag,
    sibling,
  })
}

const onMouseOver = (e: MouseEvent) => {
  if (!isInspectableTarget(e.target)) return
  const target = e.target as Element

  if (mode === 'live') {
    if (hoverEl === target) return
    hoverEl = target
    emit(hoverEl)
    return
  }

  // Pin mode:hover 其他元素時畫 sibling distance(Figma-style)
  if (mode === 'pin' && pinnedEl) {
    // Skip self / 不是 document body 層的 target 才畫
    if (target === pinnedEl) return
    // 避免 sibling 是 pinned 的祖先 / 後代(overlap 情況 Figma 也不畫 distance)
    if (pinnedEl.contains(target) || target.contains(pinnedEl)) {
      if (siblingHoverEl) {
        siblingHoverEl = null
        emit(pinnedEl)
      }
      return
    }
    if (siblingHoverEl === target) return
    siblingHoverEl = target
    emit(pinnedEl, siblingHoverEl)
  }
}

const onClick = (e: MouseEvent) => {
  if (mode === 'off') return
  if (!isInspectableTarget(e.target)) return
  e.preventDefault()
  e.stopPropagation()
  pinnedEl = e.target as Element
  mode = 'pin'
  channel.emit(EVENTS.TOGGLE, mode)
  emit(pinnedEl)
}

const onKey = (e: KeyboardEvent) => {
  // Alt+I toggles inspect
  if (e.altKey && (e.key === 'i' || e.key === 'I')) {
    e.preventDefault()
    const next: DevmodeMode = mode === 'off' ? 'live' : 'off'
    setMode(next)
  }
  // Esc clears pin
  if (e.key === 'Escape' && mode === 'pin') {
    pinnedEl = null
    setMode('live')
  }
}

const bind = () => {
  document.addEventListener('mouseover', onMouseOver, true)
  document.addEventListener('click', onClick, true)
  document.addEventListener('keydown', onKey, true)
}

const unbind = () => {
  document.removeEventListener('mouseover', onMouseOver, true)
  document.removeEventListener('click', onClick, true)
  document.removeEventListener('keydown', onKey, true)
}

const setMode = (next: DevmodeMode) => {
  mode = next
  channel.emit(EVENTS.TOGGLE, next)
  if (next === 'off') {
    clearOverlay()
    pinnedEl = null
    hoverEl = null
    siblingHoverEl = null
    channel.emit(EVENTS.CLEAR)
    unbind()
  } else {
    bind()
    siblingHoverEl = null
    if (next === 'live' && hoverEl) emit(hoverEl)
    if (next === 'pin' && pinnedEl) emit(pinnedEl)
  }
}

// Listen to manager → preview mode changes
channel.on(EVENTS.TOGGLE, (next: DevmodeMode) => {
  if (next !== mode) setMode(next)
})

channel.on(EVENTS.CLEAR, () => {
  pinnedEl = null
  hoverEl = null
  siblingHoverEl = null
  clearOverlay()
})

// Keep overlay accurate on scroll / resize(含 sibling distance 同步)
window.addEventListener('scroll', () => {
  if (mode === 'pin' && pinnedEl) emit(pinnedEl, siblingHoverEl)
  else if (mode === 'live' && hoverEl) emit(hoverEl)
}, true)
window.addEventListener('resize', () => {
  if (mode === 'pin' && pinnedEl) emit(pinnedEl, siblingHoverEl)
  else if (mode === 'live' && hoverEl) emit(hoverEl)
})
