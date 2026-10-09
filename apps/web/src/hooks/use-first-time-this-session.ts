import { useEffect, useState } from 'react'

const seenThisSession = new Set<string>()

export function useFirstTimeThisSession(key: string): boolean {
  const [isFirstTime] = useState(() => !seenThisSession.has(key))
  useEffect(() => {
    seenThisSession.add(key)
  }, [key])
  return isFirstTime
}
