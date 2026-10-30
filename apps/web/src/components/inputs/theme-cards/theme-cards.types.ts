import type { ThemeChoice } from '@web/lib/theme.types'

export type ThemeCardsProps = {
  label: string
  value: ThemeChoice
  onChange: (choice: ThemeChoice) => void
  className?: string
}

export type ThemeMiniatureProps = {
  choice: ThemeChoice
}
