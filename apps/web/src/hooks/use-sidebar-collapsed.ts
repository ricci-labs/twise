import { useEffect, useEffectEvent, useState } from 'react'

const STORAGE_KEY = 'sidebarCollapsed'
const SHORTCUT_KEY = 'b'
const LABELS_FADE_MS = 120
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(readCollapsed)
  const [isFading, setIsFading] = useState(false)

  function toggle() {
    if (isFading) {
      return
    }
    if (isCollapsed || window.matchMedia(REDUCED_MOTION).matches) {
      setIsCollapsed(!isCollapsed)
      return
    }
    setIsFading(true)
    window.setTimeout(() => {
      setIsCollapsed(true)
      setIsFading(false)
    }, LABELS_FADE_MS)
  }

  const onShortcut = useEffectEvent(toggle)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === SHORTCUT_KEY) {
        event.preventDefault()
        onShortcut()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed))
    } catch {
      return
    }
  }, [isCollapsed])

  return { isCollapsed, isFading, toggle }
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}
