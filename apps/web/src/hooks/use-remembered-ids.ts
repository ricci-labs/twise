import { useCallback, useEffect, useState } from 'react'

export function useRememberedIds(storageKey: string) {
  const [ids, setIds] = useState(() => readIds(storageKey))

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...ids]))
    } catch {
      return
    }
  }, [storageKey, ids])

  const setRemembered = useCallback((id: string, isRemembered: boolean) => {
    setIds((current) => {
      const next = new Set(current)
      if (isRemembered) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  return { ids, setRemembered }
}

function readIds(storageKey: string): ReadonlySet<string> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    return new Set(Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}
