import { pageCursorSchema } from '@shared/core/paging/paging.schemas'
import {
  INVOICE_LINE_FILTERS,
  INVOICE_LINES_MAX_LIMIT,
  INVOICE_LINES_PAGE_SIZE,
} from '@shared/ledger/invoice-lines/invoice-lines.constants'
import { z } from 'zod'

const LINE_KEY = /^\d{4}-\d{2}-\d{2}\.\d{1,4}$/

export const invoiceLineCursorSchema = pageCursorSchema(z.string().regex(LINE_KEY))

export const invoiceLineQuerySchema = z.object({
  filter: z.enum(INVOICE_LINE_FILTERS).default('all'),
  cursor: z
    .string()
    .refine((cursor) => invoiceLineCursorSchema.safeParse(cursor).success, 'Invalid cursor')
    .optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(INVOICE_LINES_MAX_LIMIT)
    .default(INVOICE_LINES_PAGE_SIZE),
})

export type InvoiceLineQuery = z.infer<typeof invoiceLineQuerySchema>
