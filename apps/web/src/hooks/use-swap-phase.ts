import { useState } from 'react'

export function useSwapPhase(value: string): 'a' | 'b' | undefined {
  const [seen, setSeen] = useState({ value, swaps: 0 })
  if (seen.value !== value) {
    setSeen({ value, swaps: seen.swaps + 1 })
  }
  if (seen.swaps === 0) {
    return undefined
  }
  return seen.swaps % 2 === 1 ? 'a' : 'b'
}
