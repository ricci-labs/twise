import type { BadgeProps } from '@web/components/display/badge'

export type RadioCard = {
  value: string
  label: string
  detail?: string
  badge?: { label: string; tone: BadgeProps['tone'] }
}

export type RadioCardListProps = {
  label: string
  options: readonly RadioCard[]
  value: string | null
  onSelect: (value: string) => void
  onBlur?: () => void
  className?: string
}
