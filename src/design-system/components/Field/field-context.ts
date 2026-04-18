import * as React from 'react'
import type { FieldMode } from './field-types'

// ── Types ──
export type { FieldMode }
export type FieldOrientation = 'vertical' | 'horizontal'
export type FieldSize = 'sm' | 'md' | 'lg'
export type FieldControlLayout = 'inline' | 'block'

// ── Context ──
export interface FieldContextValue {
  id: string
  descriptionId: string
  errorId: string
  mode: FieldMode
  disabled: boolean
  required: boolean
  invalid: boolean
  size: FieldSize
  orientation: FieldOrientation
  controlLayout: FieldControlLayout
  hasFieldWrapper: true
}

export const FieldContext = React.createContext<FieldContextValue | null>(null)

/** 讓 primitive（Checkbox/Switch/Radio/Button/Input 等）讀 Field context */
export function useFieldContext(): FieldContextValue | null {
  return React.useContext(FieldContext)
}
