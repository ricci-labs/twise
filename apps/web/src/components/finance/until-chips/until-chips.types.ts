import type { IsoDate } from '@financas/shared'

export type UntilNextDue = {
  dueOn: IsoDate
  installmentCount: number
}

export type UntilChoice = 'today' | 'next' | 'other'

export type UntilChipsProps = {
  today: IsoDate
  next?: UntilNextDue | null
  value: IsoDate
  onChange: (until: IsoDate) => void
  label?: string
  isDisabled?: boolean
}
