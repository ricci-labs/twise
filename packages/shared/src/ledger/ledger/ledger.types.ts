import type { AccountKind } from '@shared/ledger/ledger/ledger.constants'

export type ShareablePosting = {
  accountKind: AccountKind
  amountCents: number
  contactId: string | null
}

export type EntryShare = {
  contactId: string
  amountCents: number
}
