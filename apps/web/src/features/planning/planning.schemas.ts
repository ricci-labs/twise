import { planningMessages } from '@web/features/planning/planning.messages'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { z } from 'zod'

export const PLANNING_TABS = ['occurrences', 'recurrences', 'budgets', 'goals'] as const

export const planningTabSchema = z.enum(PLANNING_TABS)

export const planningSearchSchema = z.object({
  period: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional()
    .catch(undefined),
})

export const occurrenceAmountFormSchema = z.object({
  amount: z
    .string()
    .refine(
      (text) => (centsOfTypedAmount(text) ?? 0) > 0,
      planningMessages.occurrences.amount.invalid,
    ),
})
