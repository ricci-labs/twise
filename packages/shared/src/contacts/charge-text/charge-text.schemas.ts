import { z } from 'zod'

const CHARGE_TEXT_FIELD_HARD_MAX_LENGTH = 2_000

const chargeTextFieldSchema = z.string().trim().max(CHARGE_TEXT_FIELD_HARD_MAX_LENGTH)

export const chargeTextSchema = z.strictObject({
  subject: chargeTextFieldSchema,
  opening: chargeTextFieldSchema,
  closing: chargeTextFieldSchema.nullable(),
})

export type ChargeTextRequest = z.infer<typeof chargeTextSchema>
