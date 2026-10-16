import {
  isoDateSchema,
  MAX_RECURRENCE_INTERVAL,
  RECURRENCE_DESCRIPTION_MAX_LENGTH,
  RECURRENCE_FREQUENCIES,
  RECURRING_ENTRY_TYPES,
  WEEKEND_RULES,
} from '@financas/shared'
import { planningMessages } from '@web/features/planning/planning.messages'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { z } from 'zod'

export const PLANNING_TABS = ['occurrences', 'recurrences', 'budgets', 'goals'] as const

export const NEW_RECURRENCE = 'new'

export const DAY_RULES = ['day', 'businessDay', 'sameDay'] as const

const CARD_PURCHASE = 'card_purchase'

const TRANSFER = 'transfer'

const form = planningMessages.form

export const planningTabSchema = z.enum(PLANNING_TABS)

export const planningSearchSchema = z.object({
  rule: z.uuid().optional().catch(undefined),
  period: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional()
    .catch(undefined),
  recurrence: z.literal(NEW_RECURRENCE).optional().catch(undefined),
  recurrenceType: z.enum(RECURRING_ENTRY_TYPES).optional().catch(undefined),
})

export const occurrenceAmountFormSchema = z.object({
  amount: z
    .string()
    .refine(
      (text) => (centsOfTypedAmount(text) ?? 0) > 0,
      planningMessages.occurrences.amount.invalid,
    ),
})

export const budgetFormSchema = z.object({
  amount: z
    .string()
    .refine((text) => (centsOfTypedAmount(text) ?? 0) > 0, planningMessages.budgets.sheet.invalid),
  fromPeriod: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
})
export const recurrenceFormSchema = z
  .object({
    entryType: z.enum(RECURRING_ENTRY_TYPES),
    description: z.string().trim().min(1).max(RECURRENCE_DESCRIPTION_MAX_LENGTH),
    amount: z.string().refine((text) => (centsOfTypedAmount(text) ?? 0) > 0, form.amountInvalid),
    amountIsEstimate: z.boolean(),
    sourceAccountId: z.string(),
    categoryAccountId: z.string(),
    frequency: z.enum(RECURRENCE_FREQUENCIES),
    interval: z.number().int().min(1).max(MAX_RECURRENCE_INTERVAL),
    dayRule: z.enum(DAY_RULES),
    dayOfMonth: z.string(),
    nthBusinessDay: z.string(),
    weekendRule: z.enum(WEEKEND_RULES),
    startsOn: isoDateSchema,
    hasEnd: z.boolean(),
    endsOn: z.string(),
  })
  .refine((values) => values.entryType === CARD_PURCHASE || values.sourceAccountId !== '', {
    path: ['sourceAccountId'],
    message: form.chooseAccount,
    when: () => true,
  })
  .refine((values) => values.entryType !== CARD_PURCHASE || values.sourceAccountId !== '', {
    path: ['sourceAccountId'],
    message: form.chooseCard,
    when: () => true,
  })
  .refine((values) => values.entryType === TRANSFER || values.categoryAccountId !== '', {
    path: ['categoryAccountId'],
    message: form.chooseCategory,
    when: () => true,
  })
  .refine((values) => values.entryType !== TRANSFER || values.categoryAccountId !== '', {
    path: ['categoryAccountId'],
    message: form.chooseAccount,
    when: () => true,
  })
  .refine(
    (values) =>
      values.entryType !== TRANSFER ||
      values.categoryAccountId === '' ||
      values.categoryAccountId !== values.sourceAccountId,
    { path: ['categoryAccountId'], message: form.sameAccount, when: () => true },
  )
  .refine((values) => !values.hasEnd || values.endsOn !== '', {
    path: ['endsOn'],
    message: form.required.endsOn,
    when: () => true,
  })
  .refine((values) => !values.hasEnd || values.endsOn === '' || values.endsOn >= values.startsOn, {
    path: ['endsOn'],
    message: form.endsBeforeStart,
    when: () => true,
  })
