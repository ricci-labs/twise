import { type EntryInput, entryInputSchema } from '@financas/shared'
import type { EntryFormValues, EntryInputFields } from '@web/features/entries/entries.types'
import { centsOfTypedAmount } from '@web/lib/format/money'

const FIELDS_OF_TYPE: Readonly<Record<EntryFormValues['entryType'], EntryInputFields>> = {
  expense: (values) => ({ ...spendingOf(values), paidFromAccountId: values.accountId }),
  card_purchase: (values) => ({
    ...spendingOf(values),
    cardAccountId: values.cardAccountId,
    installmentCount: values.installmentCount,
    firstInstallment: values.isInProgress ? values.firstInstallment : 1,
  }),
  income: (values) => ({
    receivedInAccountId: values.accountId,
    categoryId: values.categoryId,
    paymentMethod: values.paymentMethod || null,
  }),
  transfer: (values) => ({ fromAccountId: values.accountId, toAccountId: values.toAccountId }),
  invoice_payment: (values) => ({
    cardAccountId: values.cardAccountId,
    invoiceId: values.invoiceId,
    paidFromAccountId: values.accountId,
  }),
  opening_balance: (values) => {
    const cents = centsOfTypedAmount(values.amount) ?? 0
    return { accountId: values.accountId, balanceCents: values.isNegative ? -cents : cents }
  },
}

export function toEntryInput(values: EntryFormValues): EntryInput {
  return entryInputSchema.parse({
    entryType: values.entryType,
    amountCents: centsOfTypedAmount(values.amount),
    description: values.description,
    occurredOn: values.occurredOn,
    notes: values.notes || null,
    ...FIELDS_OF_TYPE[values.entryType](values),
  })
}

function spendingOf(values: EntryFormValues) {
  return {
    categoryId: values.categoryId,
    paymentMethod: values.paymentMethod || null,
    spentByUserId: values.spentByUserId || null,
    shares: values.shares.map((share) => ({
      contactId: share.contactId,
      amountCents: centsOfTypedAmount(share.amount),
    })),
  }
}
