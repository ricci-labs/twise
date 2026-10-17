import type { ChargeTagSource, ChargeText } from '@shared/contacts/charge-text/charge-text.types'
import type { IsoDate } from '@shared/core/calendar/calendar.types'

export type ChargeableItem = {
  postingId: string
  description: string
  installmentNo: number | null
  installmentCount: number
  effectiveOn: IsoDate
  amountCents: number
}

export type OpenItem = ChargeableItem & {
  remainingCents: number
}

export type ChargeMessageInput = ChargeTagSource & {
  items: readonly OpenItem[]
  pixPayload: string | null
  text: Pick<ChargeText, 'opening' | 'closing'>
}
