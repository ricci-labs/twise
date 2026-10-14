import type { EntryFormInput, ShareTotals } from '@web/features/entries/entries.types'
import { centsOfTypedAmount, sumOfTypedAmounts } from '@web/lib/format/money'
import { type Control, useWatch } from 'react-hook-form'

export function useShareTotals(control: Control<EntryFormInput>): ShareTotals {
  const [amount, shares] = useWatch<EntryFormInput, ['amount', 'shares']>({
    control,
    name: ['amount', 'shares'],
  })
  const totalCents = centsOfTypedAmount(amount)
  const sharedCents = sumOfTypedAmounts(shares.map((share) => share.amount))
  const isOver = totalCents !== null && sharedCents > totalCents
  return {
    totalCents,
    isOver,
    yoursCents: totalCents === null || isOver ? null : totalCents - sharedCents,
  }
}
