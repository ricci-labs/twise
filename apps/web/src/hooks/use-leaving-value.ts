import { useEffect, useState } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export function useLeavingValue<Value>(
  value: Value,
  canLeave: (previous: Value) => boolean,
  leaveMs: number,
): Value | null {
  const [shown, setShown] = useState(value)
  const [leaving, setLeaving] = useState<Value | null>(null)
  if (value !== shown) {
    setShown(value)
    setLeaving(canLeave(shown) && !window.matchMedia(REDUCED_MOTION).matches ? shown : null)
  }

  useEffect(() => {
    if (leaving === null) {
      return
    }
    const timer = window.setTimeout(() => setLeaving(null), leaveMs)
    return () => window.clearTimeout(timer)
  }, [leaving, leaveMs])

  return leaving
}
