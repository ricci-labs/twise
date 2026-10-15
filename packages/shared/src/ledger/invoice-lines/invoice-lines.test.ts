import { encodePageCursor } from '@shared/core/paging/paging'
import { invoiceLinePageOf } from '@shared/ledger/invoice-lines/invoice-lines'
import { invoiceLineQuerySchema } from '@shared/ledger/invoice-lines/invoice-lines.schemas'
import { describe, expect, it } from 'vitest'

const entryId = (n: number) => `01900000-0000-7000-8000-0000000000${String(n).padStart(2, '0')}`

const line = (
  n: number,
  occurredOn: string,
  extra: { entryType?: string; frontedCents?: number; installmentNo?: number } = {},
) => ({
  entryId: entryId(n),
  entryType: extra.entryType ?? 'card_purchase',
  occurredOn,
  installmentNo: extra.installmentNo ?? null,
  frontedCents: extra.frontedCents ?? 0,
})

const LINES = [
  line(3, '2026-10-03', { entryType: 'invoice_payment' }),
  line(1, '2026-10-01'),
  line(2, '2026-10-02', { frontedCents: 1000 }),
  line(4, '2026-10-04'),
  line(5, '2026-10-05', { installmentNo: 2 }),
]

const query = (raw: Record<string, string>) => invoiceLineQuerySchema.parse(raw)

describe('invoiceLinePageOf', () => {
  it('pages the lines newest first and counts each filter over the whole invoice', () => {
    const first = invoiceLinePageOf(LINES, query({ limit: '2' }))

    expect(first.items.map((item) => item.entryId)).toEqual([entryId(5), entryId(4)])
    expect(first.counts).toEqual({ all: 5, own: 3, fronted: 1 })
    expect(first.lastPayment?.entryId).toBe(entryId(3))
    expect(first.nextCursor).toBe(encodePageCursor({ key: '2026-10-04.0', id: entryId(4) }))

    const second = invoiceLinePageOf(LINES, query({ limit: '2', cursor: first.nextCursor ?? '' }))
    expect(second.items.map((item) => item.entryId)).toEqual([entryId(3), entryId(2)])

    const last = invoiceLinePageOf(LINES, query({ limit: '2', cursor: second.nextCursor ?? '' }))
    expect(last.items.map((item) => item.entryId)).toEqual([entryId(1)])
    expect(last.nextCursor).toBeNull()
  })

  it('keeps payments and lines with contacts out of "own", and only those with contacts in "fronted"', () => {
    const own = invoiceLinePageOf(LINES, query({ filter: 'own' }))
    const fronted = invoiceLinePageOf(LINES, query({ filter: 'fronted' }))

    expect(own.items.map((item) => item.entryId)).toEqual([entryId(5), entryId(4), entryId(1)])
    expect(fronted.items.map((item) => item.entryId)).toEqual([entryId(2)])
  })

  it('tells two installments of the same purchase apart in the cursor', () => {
    const twice = [
      line(7, '2026-10-07', { installmentNo: 1 }),
      line(7, '2026-10-07', { installmentNo: 2 }),
    ]
    const first = invoiceLinePageOf(twice, query({ limit: '1' }))
    const second = invoiceLinePageOf(twice, query({ limit: '1', cursor: first.nextCursor ?? '' }))

    expect([first.items, second.items]).toEqual([[twice[1]], [twice[0]]])
  })
})

describe('invoiceLineQuerySchema', () => {
  it('pages 50 at a time by default and refuses an unknown filter or a bad cursor', () => {
    expect(query({})).toEqual({ filter: 'all', limit: 50 })
    expect(invoiceLineQuerySchema.safeParse({ filter: 'mine' }).success).toBe(false)
    expect(invoiceLineQuerySchema.safeParse({ cursor: `2026-10-02_${entryId(1)}` }).success).toBe(
      false,
    )
  })
})
