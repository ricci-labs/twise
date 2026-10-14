import { ACCOUNT_NAME_MAX_LENGTH, INCOME_NATURES, MONEY_ACCOUNT_KINDS } from '@financas/shared'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { z } from 'zod'

const NEW_ACCOUNT = 'new'

export const accountSearchSchema = z.object({
  account: z
    .union([z.literal(NEW_ACCOUNT), z.uuid()])
    .optional()
    .catch(undefined),
})

export const accountsPageSearchSchema = z.object({
  created: z.uuid().optional().catch(undefined),
})

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

export const cardInvoicesSearchSchema = z.object({
  month: z.string().regex(YEAR_MONTH).optional().catch(undefined),
})

export const accountFormSchema = z.object({
  kind: z.enum(MONEY_ACCOUNT_KINDS),
  name: z.string().trim().min(1).max(ACCOUNT_NAME_MAX_LENGTH),
  ownerUserId: z.string(),
  icon: z.string(),
  color: z.string(),
})

const CATEGORY_KINDS = ['expense', 'income'] as const

export const categoriesSearchSchema = z.object({
  kind: z.enum(CATEGORY_KINDS).optional().catch(undefined),
  created: z.uuid().optional().catch(undefined),
})

export const categorySearchSchema = z.object({
  category: z
    .union([z.literal(NEW_ACCOUNT), z.uuid()])
    .optional()
    .catch(undefined),
  parent: z.uuid().optional().catch(undefined),
  kind: z.enum(CATEGORY_KINDS).optional().catch(undefined),
})

export const categoryFormSchema = z
  .object({
    kind: z.enum(CATEGORY_KINDS),
    name: z.string().trim().min(1).max(ACCOUNT_NAME_MAX_LENGTH),
    incomeNature: z.union([z.enum(INCOME_NATURES), z.literal('')]),
    parentId: z.string(),
    icon: z.string(),
    color: z.string(),
  })
  .superRefine((values, context) => {
    if (values.kind === 'income' && !values.incomeNature) {
      context.addIssue({ code: 'custom', path: ['incomeNature'], input: values.incomeNature })
    }
  })

const CARD_PARTS = ['cycle', 'name'] as const

const DAY_OF_MONTH = /^([1-9]|[12]\d|3[01])$/

export const cardSearchSchema = z.object({
  card: z
    .union([z.literal(NEW_ACCOUNT), z.uuid()])
    .optional()
    .catch(undefined),
  part: z.enum(CARD_PARTS).optional().catch(undefined),
})

export const cardFormSchema = z.object({
  name: z.string().trim().min(1).max(ACCOUNT_NAME_MAX_LENGTH),
  closingDay: z.string().regex(DAY_OF_MONTH),
  dueDay: z.string().regex(DAY_OF_MONTH),
  purchaseOnClosingDayGoesNext: z.boolean(),
  limit: z
    .string()
    .refine(
      (text) => text.trim() === '' || (centsOfTypedAmount(text) ?? 0) > 0,
      accountsMessages.cardForm.limitInvalid,
    ),
  paymentAccountId: z.string(),
  holderUserId: z.string(),
  color: z.string(),
})
