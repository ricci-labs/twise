import type { IsoDate } from '@financas/shared'
import type { occurrenceRowMessages } from '@web/components/finance/occurrence-row/occurrence-row.messages'
import type { ReactElement, ReactNode } from 'react'

export type OccurrenceBadge = keyof typeof occurrenceRowMessages.badges

export type OccurrenceDirection = 'out' | 'in' | 'neutral'

export type OccurrenceRowLinkProps = {
  className?: string
  children?: ReactNode
}

export type OccurrenceRegister = {
  label: string
  onPress: () => void
}

export type OccurrenceRowProps = {
  dueOn: IsoDate
  description: string
  detail: string
  badge?: OccurrenceBadge
  amountCents: number
  direction: OccurrenceDirection
  isEstimate?: boolean
  isDone?: boolean
  isOverdue?: boolean
  link?: ReactElement<OccurrenceRowLinkProps>
  register?: OccurrenceRegister
}
