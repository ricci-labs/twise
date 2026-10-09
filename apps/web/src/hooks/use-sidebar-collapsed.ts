import { useEffect, useState } from 'react'

const STORAGE_KEY = 'sidebarCollapsed'
const SHORTCUT_KEY = 'b'

export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(readCollapsed)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === SHORTCUT_KEY) {
        event.preventDefault()
        setIsCollapsed((current) => !current)
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

  return { isCollapsed, toggle: () => setIsCollapsed((current) => !current) }
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}
