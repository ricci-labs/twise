import { isoDateSchema } from '@shared/ledger/ledger/ledger.schemas'
import { z } from 'zod'

export const billReminderPayloadSchema = z.object({
  description: z.string().min(1),
  amountCents: z.number().int().positive(),
  isEstimate: z.boolean(),
  dueOn: isoDateSchema,
})

export type BillReminderPayload = z.infer<typeof billReminderPayloadSchema>

export const invoiceReminderPayloadSchema = z.object({
  cardName: z.string().min(1),
  amountCents: z.number().int().nonnegative(),
  dueOn: isoDateSchema,
})

export type InvoiceReminderPayload = z.infer<typeof invoiceReminderPayloadSchema>

const MAX_INLINE_IMAGES = 4

export const inlineImageSchema = z.object({
  cid: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  base64: z.string().min(1),
})

export const preparedEmailPayloadSchema = z.object({
  email: z.object({
    to: z.email(),
    subject: z.string().min(1),
    text: z.string().min(1),
    html: z.string().min(1),
    fromName: z.string().min(1).optional(),
    replyTo: z.email().optional(),
    inlineImages: z.array(inlineImageSchema).max(MAX_INLINE_IMAGES).optional(),
  }),
})

export type PreparedEmailPayload = z.infer<typeof preparedEmailPayloadSchema>
