import type { Page } from '@shared/core/paging/paging.types'
import type { INVOICE_LINE_FILTERS } from '@shared/ledger/invoice-lines/invoice-lines.constants'

export type InvoiceLineFilter = (typeof INVOICE_LINE_FILTERS)[number]

export type InvoiceLineFacts = {
  entryId: string
  entryType: string
  occurredOn: string
  installmentNo: number | null
  frontedCents: number
}

export type InvoiceLineCounts = Record<InvoiceLineFilter, number>

export type InvoiceLinePosition = {
  occurredOn: string
  entryId: string
  installmentNo: number
}

export type InvoiceLinePage<Line> = Page<Line> & {
  counts: InvoiceLineCounts
  lastPayment: Line | null
}
