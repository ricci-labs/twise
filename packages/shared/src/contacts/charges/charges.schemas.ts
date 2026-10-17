import { isoDateSchema } from '@shared/ledger/ledger/ledger.schemas'
import { z } from 'zod'

export const newChargeSchema = z.strictObject({ until: isoDateSchema.optional() })

export type NewCharge = z.infer<typeof newChargeSchema>

export const chargeParamsSchema = z.object({ chargeId: z.uuid() })

export const chargeListQuerySchema = z.object({ contactId: z.uuid().optional() })

export const openItemsQuerySchema = z.object({
  until: isoDateSchema.optional(),
  includeCharged: z.stringbool().default(false),
})

export type OpenItemsQuery = z.infer<typeof openItemsQuerySchema>

export const UPCOMING_CONTACT_ITEMS_DEFAULT_LIMIT = 5

export const UPCOMING_CONTACT_ITEMS_MAX_LIMIT = 50

export const upcomingContactItemsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(UPCOMING_CONTACT_ITEMS_MAX_LIMIT)
    .default(UPCOMING_CONTACT_ITEMS_DEFAULT_LIMIT),
})

export const chargePaymentSchema = z.strictObject({
  amountCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  receivedInAccountId: z.uuid(),
  occurredOn: isoDateSchema,
})

export type ChargePayment = z.infer<typeof chargePaymentSchema>
