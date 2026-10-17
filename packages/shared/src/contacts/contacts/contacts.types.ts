import type { IsoDate } from '@shared/core/calendar/calendar.types'

export type ContactPosting = {
  contactId: string
  amountCents: number
  effectiveOn: IsoDate
}

export type ContactBalance = {
  contactId: string
  owedCents: number
  overdueCents: number
  overdueSince: IsoDate | null
  nextDueOn: IsoDate | null
  nextDueCents: number
}
