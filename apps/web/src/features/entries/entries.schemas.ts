import {
  ENTRY_DESCRIPTION_MAX_LENGTH,
  ENTRY_NOTES_MAX_LENGTH,
  isoDateSchema,
  MAX_INSTALLMENTS,
  MAX_SHARES_PER_ENTRY,
  PAYMENT_METHODS,
} from '@financas/shared'
import { hasCategory, isSpending } from '@web/features/entries/components/entry-kind'
import { entriesMessages } from '@web/features/entries/entries.messages'
import { centsOfTypedAmount, sumOfTypedAmounts } from '@web/lib/format/money'
import { z } from 'zod'

const NEW_ENTRY = 'new'

const NO_CHOICE = ''

const FORM_ENTRY_TYPES = [
  'expense',
  'card_purchase',
  'income',
  'transfer',
  'opening_balance',
] as const

export const newEntrySearchSchema = z.object({
  entry: z.literal(NEW_ENTRY).optional().catch(undefined),
  entryType: z.enum(FORM_ENTRY_TYPES).optional().catch(undefined),
  entryAccount: z.uuid().optional().catch(undefined),
})

const CARD_PURCHASE = 'card_purchase'

const TRANSFER = 'transfer'

const installmentSchema = z.number().int().min(1).max(MAX_INSTALLMENTS)

export const entryShareSchema = z.object({ contactId: z.string().min(1), amount: z.string() })

export const entryFormSchema = z
  .object({
    entryType: z.enum(FORM_ENTRY_TYPES),
    amount: z
      .string()
      .refine((text) => (centsOfTypedAmount(text) ?? 0) > 0, entriesMessages.amountInvalid),
    description: z.string().trim().min(1).max(ENTRY_DESCRIPTION_MAX_LENGTH),
    accountId: z.string(),
    toAccountId: z.string(),
    cardAccountId: z.string(),
    installmentCount: installmentSchema,
    isInProgress: z.boolean(),
    isNegative: z.boolean(),
    firstInstallment: installmentSchema,
    categoryId: z.string(),
    occurredOn: isoDateSchema,
    paymentMethod: z.union([z.enum(PAYMENT_METHODS), z.literal(NO_CHOICE)]),
    spentByUserId: z.string(),
    shares: z.array(entryShareSchema).max(MAX_SHARES_PER_ENTRY),
    notes: z.string().trim().max(ENTRY_NOTES_MAX_LENGTH),
  })
  .refine((values) => values.entryType === CARD_PURCHASE || Boolean(values.accountId), {
    path: ['accountId'],
    message: entriesMessages.required.accountId,
    when: () => true,
  })
  .refine((values) => values.entryType !== TRANSFER || Boolean(values.toAccountId), {
    path: ['toAccountId'],
    message: entriesMessages.required.toAccountId,
    when: () => true,
  })
  .refine((values) => values.entryType !== TRANSFER || values.toAccountId !== values.accountId, {
    path: ['toAccountId'],
    message: entriesMessages.transfers.sameAccount,
    when: () => true,
  })
  .refine((values) => !hasCategory(values.entryType) || Boolean(values.categoryId), {
    path: ['categoryId'],
    message: entriesMessages.required.categoryId,
    when: () => true,
  })
  .refine((values) => values.entryType !== CARD_PURCHASE || Boolean(values.cardAccountId), {
    path: ['cardAccountId'],
    message: entriesMessages.required.cardAccountId,
    when: () => true,
  })
  .refine(
    (values) =>
      values.entryType !== CARD_PURCHASE ||
      values.installmentCount <= (centsOfTypedAmount(values.amount) ?? Number.POSITIVE_INFINITY),
    {
      path: ['installmentCount'],
      message: entriesMessages.cards.tooManyInstallments,
      when: () => true,
    },
  )
  .refine(
    (values) =>
      values.entryType !== CARD_PURCHASE ||
      !values.isInProgress ||
      values.firstInstallment <= values.installmentCount,
    {
      path: ['firstInstallment'],
      message: entriesMessages.cards.firstAfterCount,
      when: () => true,
    },
  )
  .refine(
    (values) =>
      !isSpending(values.entryType) ||
      values.shares.every((share) => (centsOfTypedAmount(share.amount) ?? 0) > 0),
    {
      path: ['shares'],
      message: entriesMessages.shares.notPositive,
      when: () => true,
    },
  )
  .refine(
    (values) => {
      const totalCents = centsOfTypedAmount(values.amount)
      return (
        !isSpending(values.entryType) ||
        totalCents === null ||
        sumOfTypedAmounts(values.shares.map((share) => share.amount)) <= totalCents
      )
    },
    { path: ['shares'], message: entriesMessages.shares.exceed, when: () => true },
  )
