import { paintSystemBar } from '@web/lib/system-bar'
import type { ThemeChoice } from '@web/lib/theme.types'

const THEME_STORAGE_KEY = 'theme'
const DARK_CLASS = 'dark'
const SYSTEM_PREFERS_DARK = '(prefers-color-scheme: dark)'
const CHOICES: readonly ThemeChoice[] = ['light', 'dark', 'system']

export function storedTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return CHOICES.find((choice) => choice === stored) ?? 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(choice: ThemeChoice) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice)
  } catch {
    return paint(choice)
  }
  paint(choice)
}

function paint(choice: ThemeChoice) {
  const isDark =
    choice === 'dark' || (choice === 'system' && window.matchMedia(SYSTEM_PREFERS_DARK).matches)
  const root = document.documentElement
  root.classList.toggle(DARK_CLASS, isDark)
  root.style.colorScheme = isDark ? 'dark' : 'light'
  paintSystemBar()
}
