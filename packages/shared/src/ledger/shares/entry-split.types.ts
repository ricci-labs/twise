import type { Cents } from '@shared/core/money/money.types'
import type { ShareablePosting } from '@shared/ledger/ledger/ledger.types'

export type SplitPosting = ShareablePosting & {
  accountName: string
}

export type EntrySplit = {
  paidFrom: string | null
  entryAmountCents: Cents
  partCount: number
  isEvenSplit: boolean
}
