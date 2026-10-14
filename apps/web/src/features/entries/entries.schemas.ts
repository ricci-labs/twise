import {
  ENTRY_DESCRIPTION_MAX_LENGTH,
  ENTRY_NOTES_MAX_LENGTH,
  isoDateSchema,
  MAX_INSTALLMENTS,
  PAYMENT_METHODS,
} from '@financas/shared'
import { entriesMessages } from '@web/features/entries/entries.messages'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { z } from 'zod'

const NEW_ENTRY = 'new'

const NO_CHOICE = ''

export const newEntrySearchSchema = z.object({
  entry: z.literal(NEW_ENTRY).optional().catch(undefined),
})

const FORM_ENTRY_TYPES = ['expense', 'card_purchase'] as const

const CARD_PURCHASE = 'card_purchase'

const installmentSchema = z.number().int().min(1).max(MAX_INSTALLMENTS)

export const entryFormSchema = z
  .object({
    entryType: z.enum(FORM_ENTRY_TYPES),
    amount: z
      .string()
      .refine((text) => (centsOfTypedAmount(text) ?? 0) > 0, entriesMessages.amountInvalid),
    description: z.string().trim().min(1).max(ENTRY_DESCRIPTION_MAX_LENGTH),
    paidFromAccountId: z.string(),
    cardAccountId: z.string(),
    installmentCount: installmentSchema,
    isInProgress: z.boolean(),
    firstInstallment: installmentSchema,
    categoryId: z.string().min(1),
    occurredOn: isoDateSchema,
    paymentMethod: z.union([z.enum(PAYMENT_METHODS), z.literal(NO_CHOICE)]),
    spentByUserId: z.string(),
    notes: z.string().trim().max(ENTRY_NOTES_MAX_LENGTH),
  })
  .refine((values) => values.entryType === CARD_PURCHASE || Boolean(values.paidFromAccountId), {
    path: ['paidFromAccountId'],
    message: entriesMessages.required.paidFromAccountId,
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
