import { formatBrl } from '@financas/shared'
import {
  occurrenceGroupsOf,
  summaryTilesOf,
} from '@web/features/planning/components/occurrence-groups'
import type {
  ListedOccurrence,
  OccurrenceContext,
  OccurrenceList,
} from '@web/features/planning/planning.types'
import { describe, expect, it } from 'vitest'

const CONTEXT: OccurrenceContext = {
  today: '2026-10-20',
  accounts: new Map([
    ['checking-x', { name: 'Conta X', parentId: null }],
    ['checking-y', { name: 'Conta Y', parentId: null }],
    ['savings', { name: 'Poupança', parentId: null }],
    ['card-x', { name: 'Cartão X', parentId: null }],
    ['home', { name: 'Casa', parentId: null }],
    ['internet', { name: 'Internet', parentId: 'home' }],
    ['commission', { name: 'Comissão', parentId: null }],
  ]),
  memberNames: new Map([['member-a', 'Member A']]),
}

function occurrence(overrides: Partial<ListedOccurrence>): ListedOccurrence {
  return {
    id: crypto.randomUUID(),
    ruleId: 'rule',
    description: 'Internet',
    entryType: 'expense',
    sourceAccountId: 'checking-x',
    categoryAccountId: 'internet',
    dueOn: '2026-10-25',
    amountCents: 12_000,
    amountIsEstimate: false,
    status: 'pending',
    matchedEntryId: null,
    skippedByUserId: null,
    frequency: 'monthly',
    interval: 1,
    isOverdue: false,
    paidOn: null,
    paidCents: null,
    ...overrides,
  }
}

function listOf(items: ListedOccurrence[]): OccurrenceList {
  return {
    items,
    totals: {
      toPay: { amountCents: 54_990, count: 4, overdueCount: 1 },
      toReceive: { amountCents: 80_000, count: 1, overdueCount: 0 },
      groups: { overdue: 1, upcoming: 4, matched: 9, skipped: 1 },
    },
  }
}

describe('occurrenceGroupsOf', () => {
  it('groups overdue, upcoming, done and skipped, with the counts from the API', () => {
    const groups = occurrenceGroupsOf(
      listOf([
        occurrence({ dueOn: '2026-10-18', isOverdue: true }),
        occurrence({ dueOn: '2026-10-23' }),
        occurrence({ dueOn: '2026-10-20', description: 'Celular' }),
        occurrence({ dueOn: '2026-10-14', status: 'matched', paidOn: '2026-10-14' }),
        occurrence({ dueOn: '2026-10-16', status: 'matched', paidOn: '2026-10-16' }),
        occurrence({ dueOn: '2026-10-30', status: 'skipped' }),
      ]),
      CONTEXT,
    )
    expect(groups.map((group) => [group.title, group.count])).toEqual([
      ['Atrasados', 1],
      ['A vencer', 4],
      ['Pagos e recebidos', 9],
      ['Pulados', 1],
    ])
    expect(groups[1]?.rows.map((row) => [row.dueOn, row.badge])).toEqual([
      ['2026-10-20', 'today'],
      ['2026-10-23', undefined],
    ])
    expect(groups[2]?.rows.map((row) => row.dueOn)).toEqual(['2026-10-16', '2026-10-14'])
  })

  it('words a pending row with its account and category path', () => {
    const [group] = occurrenceGroupsOf(listOf([occurrence({ isOverdue: true })]), CONTEXT)
    expect(group?.rows[0]).toMatchObject({
      detail: 'Conta X · Casa › Internet',
      badge: 'overdue',
      direction: 'out',
      isOverdue: true,
      isDone: false,
    })
  })

  it('shows a received estimate at its real amount with the planned one beside the date', () => {
    const [group] = occurrenceGroupsOf(
      listOf([
        occurrence({
          description: 'Comissão',
          entryType: 'income',
          categoryAccountId: 'commission',
          amountCents: 200_000,
          amountIsEstimate: true,
          status: 'matched',
          paidOn: '2026-10-10',
          paidCents: 280_000,
        }),
      ]),
      CONTEXT,
    )
    expect(group?.rows[0]).toMatchObject({
      detail: `Conta X · recebido em 10/10 (previsto ≈ ${formatBrl(200_000)})`,
      badge: 'received',
      amountCents: 280_000,
      direction: 'in',
      isEstimate: false,
      isDone: true,
    })
  })

  it('names who skipped, and a transfer by its two accounts', () => {
    const groups = occurrenceGroupsOf(
      listOf([
        occurrence({ status: 'skipped', skippedByUserId: 'member-a' }),
        occurrence({ entryType: 'transfer', categoryAccountId: 'savings', description: 'Reserva' }),
      ]),
      CONTEXT,
    )
    expect(groups.find((group) => group.key === 'skipped')?.rows[0]?.detail).toBe(
      'Conta X · pulado por Member A',
    )
    expect(groups.find((group) => group.key === 'upcoming')?.rows[0]).toMatchObject({
      detail: 'Conta X → Poupança',
      direction: 'neutral',
    })
  })

  it('leaves out empty groups', () => {
    expect(occurrenceGroupsOf(listOf([occurrence({})]), CONTEXT).map((group) => group.key)).toEqual(
      ['upcoming'],
    )
  })
})

describe('summaryTilesOf', () => {
  it('words what is left to pay and to receive, with how many are overdue', () => {
    const [toPay, toReceive] = summaryTilesOf(listOf([]))
    expect(toPay).toMatchObject({ amountCents: 54_990, note: '4 contas, 1 atrasada' })
    expect(toReceive).toMatchObject({ amountCents: 80_000, note: '1 receita', tone: 'income' })
  })
})
