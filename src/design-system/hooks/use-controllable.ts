import { useCallback, useRef, useState } from 'react'

/**
 * Controlled / Uncontrolled dual-mode state hook。
 *
 * 對齊 Radix `useControllableState` 慣例:
 * - 提供 `value` → controlled,setter 純 callback,內部不存 state
 * - 不提供 `value`(or undefined)→ uncontrolled,內部 state + callback 同步
 *
 * 使用情境:Field / Switch / Checkbox / DataTable selection / DropdownMenu open 等
 * 雙模式 prop。
 */
export function useControllable<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (next: T) => void
}): [T, (next: T | ((prev: T) => T)) => void] {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState<T>(defaultValue)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const current = isControlled ? (value as T) : internal

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const computed =
        typeof next === 'function' ? (next as (prev: T) => T)(current) : next
      if (!isControlled) setInternal(computed)
      onChangeRef.current?.(computed)
    },
    [isControlled, current]
  )

  return [current, setValue]
}
