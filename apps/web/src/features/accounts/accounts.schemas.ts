import { ACCOUNT_NAME_MAX_LENGTH, MONEY_ACCOUNT_KINDS } from '@financas/shared'
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

export const accountFormSchema = z.object({
  kind: z.enum(MONEY_ACCOUNT_KINDS),
  name: z.string().trim().min(1).max(ACCOUNT_NAME_MAX_LENGTH),
  ownerUserId: z.string(),
  icon: z.string(),
  color: z.string(),
})

export const categoriesSearchSchema = z.object({
  kind: z.enum(['expense', 'income']).optional().catch(undefined),
})
