import type { BadgeProps } from '@web/components/display/badge'
import type { radioCardListVariants } from '@web/components/inputs/radio-card-list/radio-card-list.variants'
import type { VariantProps } from 'class-variance-authority'

export type RadioCard = {
  value: string
  label: string
  detail?: string
  badge?: { label: string; tone: BadgeProps['tone'] }
}

export type RadioCardListProps = VariantProps<typeof radioCardListVariants> & {
  label: string
  options: readonly RadioCard[]
  value: string | null
  onSelect: (value: string) => void
  onBlur?: () => void
  searchLabel?: string
  className?: string
}
