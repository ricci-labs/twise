import type { Ref } from 'react'

export function assignRef<Value>(ref: Ref<Value> | undefined, value: Value | null): void {
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  if (ref) {
    ref.current = value
  }
}
