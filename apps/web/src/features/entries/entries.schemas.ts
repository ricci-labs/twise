import {
  ENTRY_DESCRIPTION_MAX_LENGTH,
  ENTRY_NOTES_MAX_LENGTH,
  isoDateSchema,
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

export const expenseFormSchema = z.object({
  amount: z
    .string()
    .refine((text) => (centsOfTypedAmount(text) ?? 0) > 0, entriesMessages.amountInvalid),
  description: z.string().trim().min(1).max(ENTRY_DESCRIPTION_MAX_LENGTH),
  paidFromAccountId: z.string().min(1),
  categoryId: z.string().min(1),
  occurredOn: isoDateSchema,
  paymentMethod: z.union([z.enum(PAYMENT_METHODS), z.literal(NO_CHOICE)]),
  spentByUserId: z.string(),
  notes: z.string().trim().max(ENTRY_NOTES_MAX_LENGTH),
})
