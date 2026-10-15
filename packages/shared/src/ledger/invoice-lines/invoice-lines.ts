import { pageOf } from '@shared/core/paging/paging'
import type { PageCursor } from '@shared/core/paging/paging.types'
import { INVOICE_PAYMENT_ENTRY_TYPE } from '@shared/ledger/invoice-lines/invoice-lines.constants'
import {
  type InvoiceLineQuery,
  invoiceLineCursorSchema,
} from '@shared/ledger/invoice-lines/invoice-lines.schemas'
import type {
  InvoiceLineCounts,
  InvoiceLineFacts,
  InvoiceLineFilter,
  InvoiceLinePage,
  InvoiceLinePosition,
} from '@shared/ledger/invoice-lines/invoice-lines.types'

const KEY_SEPARATOR = '.'

export function invoiceLinePageOf<Line extends InvoiceLineFacts>(
  lines: readonly Line[],
  query: InvoiceLineQuery,
): InvoiceLinePage<Line> {
  const ordered = [...lines].sort(newestFirst)
  const matching = ordered.filter((line) => isInFilter(line, query.filter))
  const after = query.cursor ? positionOfCursor(invoiceLineCursorSchema.parse(query.cursor)) : null
  const rest = after
    ? matching.filter((line) => comparePositions(positionOf(line), after) < 0)
    : matching
  return {
    ...pageOf(rest, query.limit, invoiceLineCursorOf),
    counts: invoiceLineCounts(ordered),
    lastPayment: ordered.find(isPayment) ?? null,
  }
}

export function isInFilter(line: InvoiceLineFacts, filter: InvoiceLineFilter): boolean {
  if (filter === 'own') {
    return !isPayment(line) && line.frontedCents === 0
  }
  if (filter === 'fronted') {
    return line.frontedCents > 0
  }
  return true
}

export function invoiceLineCounts(lines: readonly InvoiceLineFacts[]): InvoiceLineCounts {
  return {
    all: lines.length,
    own: lines.filter((line) => isInFilter(line, 'own')).length,
    fronted: lines.filter((line) => isInFilter(line, 'fronted')).length,
  }
}

export function invoiceLineCursorOf(line: InvoiceLineFacts): PageCursor {
  const { occurredOn, installmentNo } = positionOf(line)
  return { key: `${occurredOn}${KEY_SEPARATOR}${installmentNo}`, id: line.entryId }
}

function isPayment(line: InvoiceLineFacts): boolean {
  return line.entryType === INVOICE_PAYMENT_ENTRY_TYPE
}

function newestFirst(first: InvoiceLineFacts, second: InvoiceLineFacts): number {
  return comparePositions(positionOf(second), positionOf(first))
}

function positionOf(line: InvoiceLineFacts): InvoiceLinePosition {
  return {
    occurredOn: line.occurredOn,
    entryId: line.entryId,
    installmentNo: line.installmentNo ?? 0,
  }
}

function positionOfCursor(cursor: PageCursor): InvoiceLinePosition {
  const [occurredOn = '', installmentNo = '0'] = cursor.key.split(KEY_SEPARATOR)
  return { occurredOn, entryId: cursor.id, installmentNo: Number(installmentNo) }
}

function comparePositions(first: InvoiceLinePosition, second: InvoiceLinePosition): number {
  return (
    first.occurredOn.localeCompare(second.occurredOn) ||
    first.entryId.localeCompare(second.entryId) ||
    first.installmentNo - second.installmentNo
  )
}
