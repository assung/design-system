export const ADDON_ID = 'ds-devmode'
export const PANEL_ID = `${ADDON_ID}/panel`
export const TOOL_ID = `${ADDON_ID}/tool`
export const PARAM_KEY = 'dsDevmode'

export const EVENTS = {
  TOGGLE: `${ADDON_ID}/toggle`,
  INSPECT: `${ADDON_ID}/inspect`,
  CLEAR: `${ADDON_ID}/clear`,
} as const

export type DevmodeMode = 'off' | 'live' | 'pin'

export interface InspectPayload {
  tag: string
  className: string
  id: string
  rect: { x: number; y: number; width: number; height: number }
  parentRect: { x: number; y: number; width: number; height: number } | null
  distancesToParent: { top: number; right: number; bottom: number; left: number } | null
  padding: { top: number; right: number; bottom: number; left: number }
  margin: { top: number; right: number; bottom: number; left: number }
  border: { top: number; right: number; bottom: number; left: number }
  computed: Record<string, string>
  tokenUsage: Array<{
    property: string
    raw: string
    tokens: string[]
    resolved: string
    /** 'author' = 從 source stylesheet/inline 抓的(可信);'speculative' = reverse-lookup 候選(同值多 token 推測,可能 misleading) */
    source: 'author' | 'speculative'
  }>
  /** Element ancestor chain(html → body → ... → element)。Click 任一 breadcrumb 可 pin parent。Chrome DevTools idiom。 */
  breadcrumb: Array<{
    tag: string
    id: string
    className: string
  }>
}
