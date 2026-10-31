import type { themeCardsVariants } from '@web/components/inputs/theme-cards/theme-cards.variants'
import type { ThemeChoice } from '@web/lib/theme.types'
import type { VariantProps } from 'class-variance-authority'

export type ThemeCardsProps = VariantProps<typeof themeCardsVariants> & {
  label: string
  value: ThemeChoice
  onChange: (choice: ThemeChoice) => void
  className?: string
}

export type ThemeMiniatureProps = Pick<ThemeCardsProps, 'size'> & {
  choice: ThemeChoice
}
