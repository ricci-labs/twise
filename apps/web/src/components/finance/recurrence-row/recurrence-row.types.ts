import type { recurrenceNextVariants } from '@web/components/finance/recurrence-row/recurrence-row.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

export type RecurrenceNextTone = NonNullable<VariantProps<typeof recurrenceNextVariants>['tone']>

export type RecurrenceNext = {
  label: string
  tone: RecurrenceNextTone
}

export type RecurrenceDirection = 'out' | 'in' | 'neutral'

export type RecurrenceRowLinkProps = {
  className?: string
  children?: ReactNode
}

export type RecurrenceRowProps = {
  description: string
  detail: string
  next?: RecurrenceNext
  art: { name: string; icon: string | null }
  amountCents: number
  direction: RecurrenceDirection
  isEstimate?: boolean
  link?: ReactElement<RecurrenceRowLinkProps>
}
