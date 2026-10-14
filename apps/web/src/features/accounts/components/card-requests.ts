import type { CardChange } from '@financas/shared'
import type {
  CardDirtyFields,
  CardFormMode,
  CardFormValues,
  CardNameChange,
  SaveCardRequest,
} from '@web/features/accounts/accounts.types'
import { centsOfTypedAmount } from '@web/lib/format/money'

export function requestOf(
  mode: CardFormMode,
  values: CardFormValues,
  dirty: CardDirtyFields,
): SaveCardRequest {
  if (mode.kind === 'create') {
    return {
      kind: 'create',
      input: { name: values.name, ...cycleOf(values), color: values.color || null },
    }
  }
  return {
    kind: 'edit',
    cardId: mode.card.accountId,
    rename: renameOf(values, dirty),
    cycle: cycleChangeOf(values, dirty),
  }
}

function cycleOf(values: CardFormValues) {
  return {
    closingDay: Number(values.closingDay),
    dueDay: Number(values.dueDay),
    purchaseOnClosingDayGoesNext: values.purchaseOnClosingDayGoesNext,
    limitCents: centsOfTypedAmount(values.limit),
    holderUserId: values.holderUserId || null,
    paymentAccountId: values.paymentAccountId || null,
  }
}

function renameOf(values: CardFormValues, dirty: CardDirtyFields): CardNameChange | null {
  const change: CardNameChange = {
    ...(dirty.name && { name: values.name }),
    ...(dirty.color && { color: values.color || null }),
  }
  return Object.keys(change).length > 0 ? change : null
}

function cycleChangeOf(values: CardFormValues, dirty: CardDirtyFields): CardChange | null {
  const cycle = cycleOf(values)
  const change: CardChange = {
    ...(dirty.closingDay && { closingDay: cycle.closingDay }),
    ...(dirty.dueDay && { dueDay: cycle.dueDay }),
    ...(dirty.purchaseOnClosingDayGoesNext && {
      purchaseOnClosingDayGoesNext: cycle.purchaseOnClosingDayGoesNext,
    }),
    ...(dirty.limit && { limitCents: cycle.limitCents }),
    ...(dirty.holderUserId && { holderUserId: cycle.holderUserId }),
    ...(dirty.paymentAccountId && { paymentAccountId: cycle.paymentAccountId }),
  }
  return Object.keys(change).length > 0 ? change : null
}
