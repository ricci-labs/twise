import type { IsoDate } from '@shared/core/calendar/calendar.types'
import type { Cents } from '@shared/core/money/money.types'
import type { CardCycle, InvoiceRef } from '@shared/ledger/cards/cards.types'

export type ProportionalShare = {
  party: number
  cents: Cents
  remainder: bigint
}

export type InstallmentPlanInput = {
  purchaseDate: IsoDate
  card: CardCycle
  totalCents: Cents
  count: number
  firstInstallment: number
  today: IsoDate
}

export type PlannedInstallment = {
  installmentNo: number
  count: number
  invoice: InvoiceRef
  amountCents: Cents
  isInvoiceClosed: boolean
}
