import {
  firstOpenInstallment,
  type IsoDate,
  installmentPlan,
  isoDateSchema,
} from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { cardsQueryOptions } from '@web/features/entries/api/entries.queries'
import type { CardPlan, EntryFormInput } from '@web/features/entries/entries.types'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { type Control, useWatch } from 'react-hook-form'

const CARD_PURCHASE = 'card_purchase'

export function useCardPlan(
  control: Control<EntryFormInput>,
  workspaceId: string,
  today: IsoDate,
): CardPlan | undefined {
  const [entryType, amount, cardAccountId, occurredOn, count, isInProgress, first] = useWatch<
    EntryFormInput,
    [
      'entryType',
      'amount',
      'cardAccountId',
      'occurredOn',
      'installmentCount',
      'isInProgress',
      'firstInstallment',
    ]
  >({
    control,
    name: [
      'entryType',
      'amount',
      'cardAccountId',
      'occurredOn',
      'installmentCount',
      'isInProgress',
      'firstInstallment',
    ],
  })
  const cards = useQuery(cardsQueryOptions(workspaceId)).data
  const card = cards?.find((candidate) => candidate.accountId === cardAccountId)
  const totalCents = centsOfTypedAmount(amount) ?? 0
  const firstInstallment = isInProgress ? first : 1
  const canPlan =
    entryType === CARD_PURCHASE &&
    card !== undefined &&
    totalCents >= count &&
    firstInstallment <= count &&
    isoDateSchema.safeParse(occurredOn).success
  if (!(canPlan && card)) {
    return undefined
  }
  const input = { purchaseDate: occurredOn, card, totalCents, count, today }
  const plan = installmentPlan({ ...input, firstInstallment })
  const firstOpen = firstOpenInstallment(installmentPlan({ ...input, firstInstallment: 1 }))
  return {
    count,
    installments: plan,
    eachCents: plan[0]?.amountCents ?? 0,
    isInProgress,
    closedAt: plan[0]?.isInvoiceClosed ? plan[0] : undefined,
    firstOpen,
  }
}
