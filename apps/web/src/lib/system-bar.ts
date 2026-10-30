import type { SystemBarColor } from '@web/lib/system-bar.types'

const THEME_COLOR_META = 'meta[name="theme-color"]'
const PAGE_COLOR = 'bg-page'
const SYSTEM_BAR_PROPERTY = '--system-bar'
const TOPMOST_FIRST: readonly SystemBarColor[] = ['ink', 'mint', 'sketch-paper']
const requestCounts = new Map<SystemBarColor, number>()

export function requestSystemBarColor(color: SystemBarColor): () => void {
  requestCounts.set(color, (requestCounts.get(color) ?? 0) + 1)
  paintSystemBar()
  return () => {
    requestCounts.set(color, (requestCounts.get(color) ?? 1) - 1)
    paintSystemBar()
  }
}

export function paintSystemBar() {
  const meta = document.querySelector<HTMLMetaElement>(THEME_COLOR_META)
  const color = TOPMOST_FIRST.find((candidate) => requestCounts.get(candidate)) ?? PAGE_COLOR
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--${color}`).trim()
  if (!value) {
    return
  }
  document.documentElement.style.setProperty(SYSTEM_BAR_PROPERTY, value)
  if (meta) {
    meta.content = value
  }
}
