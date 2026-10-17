import type { ChargeStatus } from '@shared/contacts/charges/charges.constants'
import type { ChargeableItem, OpenItem } from '@shared/contacts/charges/charges.types'
import type { IsoDate } from '@shared/core/calendar/calendar.types'

export type ChargeMark = {
  chargeId: string
  createdOn: IsoDate
}

export type ChargeSummary = {
  chargeId: string
  createdOn: IsoDate
  status: ChargeStatus
}

export type MarkedOpenItem = OpenItem & {
  inChargeId: string | null
  inChargeCreatedOn: IsoDate | null
}

export type MarkedOpenItemsOptions = {
  until: IsoDate
  marks: ReadonlyMap<string, ChargeMark>
  includeCharged: boolean
}

export type ContactChargeState = {
  dueNotChargedCents: number
  nextOpenDueOn: IsoDate | null
  lastCharge: ChargeSummary | null
}

export type ContactChargeStateOptions = {
  today: IsoDate
  marks: ReadonlyMap<string, ChargeMark>
  chargesNewestFirst: readonly ChargeSummary[]
}

export type ContactOpenItems = {
  contactId: string
  contactName: string
  items: readonly ChargeableItem[]
  paidCents: number
}

export type UpcomingItem = {
  contactId: string
  contactName: string
  postingId: string
  description: string
  installmentNo: number | null
  installmentCount: number
  dueOn: IsoDate
  remainingCents: number
}
