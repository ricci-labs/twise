import {
  recurrenceGroupsOf,
  recurrenceTilesOf,
  scheduleWordsOf,
} from '@web/features/planning/components/recurrence-rows'
import type {
  ListedRecurrence,
  RecurrenceContext,
  RecurrenceList,
} from '@web/features/planning/planning.types'
import { describe, expect, it } from 'vitest'

const CONTEXT: RecurrenceContext = {
  today: '2026-10-20',
  accounts: new Map([
    ['checking-x', { name: 'Conta X', parentId: null, icon: 'wallet' }],
    ['savings', { name: 'Poupança', parentId: null, icon: 'piggy' }],
    ['home', { name: 'Casa', parentId: null, icon: 'home' }],
    ['rent', { name: 'Aluguel', parentId: 'home', icon: null }],
    ['commission', { name: 'Comissão', parentId: null, icon: 'salary' }],
  ]),
}

function schedule(
  overrides: Partial<ListedRecurrence['schedule']> = {},
): ListedRecurrence['schedule'] {
  return {
    frequency: 'monthly',
    interval: 1,
    dayOfMonth: 5,
    nthBusinessDay: null,
    weekendRule: 'keep',
    startsOn: '2026-10-05',
    endsOn: null,
    ...overrides,
  }
}

function recurrence(overrides: Partial<ListedRecurrence> = {}): ListedRecurrence {
  return {
    id: crypto.randomUUID(),
    description: 'Aluguel',
    entryType: 'expense',
    amountCents: 210_000,
    amountIsEstimate: false,
    sourceAccountId: 'checking-x',
    categoryAccountId: 'rent',
    schedule: schedule(),
    remindDaysBefore: null,
    autoRecord: false,
    nextOn: '2026-11-05',
    nextIsOverdue: false,
    monthlyCents: 210_000,
    ...overrides,
  }
}

function listOf(
  items: ListedRecurrence[],
  summary: Partial<RecurrenceList['summary']> = {},
): RecurrenceList {
  return {
    items,
    summary: {
      bills: { monthlyCents: 348_970, count: 8, includesEstimate: true, includesAveraged: true },
      income: {
        monthlyCents: 900_000,
        count: 3,
        leftOutEstimateCents: 200_000,
        leftOutEstimateCount: 1,
      },
      transfers: { monthlyCents: 60_000, count: 1 },
      ...summary,
    },
  }
}

describe('scheduleWordsOf', () => {
  it('words each kind of schedule as the design does', () => {
    expect(scheduleWordsOf(schedule())).toBe('Todo dia 5')
    expect(scheduleWordsOf(schedule({ dayOfMonth: null, nthBusinessDay: 1 }))).toBe(
      'No 1º dia útil',
    )
    expect(scheduleWordsOf(schedule({ frequency: 'weekly', startsOn: '2026-10-23' }))).toBe(
      'Toda sexta',
    )
    expect(scheduleWordsOf(schedule({ frequency: 'weekly', startsOn: '2026-10-24' }))).toBe(
      'Todo sábado',
    )
    expect(
      scheduleWordsOf(schedule({ frequency: 'weekly', interval: 2, startsOn: '2026-10-23' })),
    ).toBe('A cada 2 semanas, na sexta')
    expect(
      scheduleWordsOf(schedule({ frequency: 'yearly', dayOfMonth: 15, startsOn: '2027-03-15' })),
    ).toBe('Todo ano em 15 de março')
    expect(scheduleWordsOf(schedule({ interval: 3, dayOfMonth: 15 }))).toBe(
      'A cada 3 meses no dia 15',
    )
    expect(scheduleWordsOf(schedule({ dayOfMonth: null, startsOn: '2026-10-22' }))).toBe(
      'Todo dia 22',
    )
  })
})

describe('recurrenceGroupsOf', () => {
  it('groups bills, income and transfers, each row with its path and next date', () => {
    const groups = recurrenceGroupsOf(
      listOf([
        recurrence(),
        recurrence({
          description: 'Comissão',
          entryType: 'income',
          categoryAccountId: 'commission',
          amountIsEstimate: true,
          schedule: schedule({ dayOfMonth: 10 }),
          nextOn: '2026-11-10',
        }),
        recurrence({
          description: 'Reserva',
          entryType: 'transfer',
          categoryAccountId: 'savings',
          schedule: schedule({ dayOfMonth: 10 }),
          nextOn: '2026-11-10',
        }),
      ]),
      CONTEXT,
    )
    expect(groups.map((group) => [group.title, group.rows.map((row) => row.detail)])).toEqual([
      ['Contas e assinaturas', ['Todo dia 5 · Conta X · Casa › Aluguel']],
      ['Receitas', ['Todo dia 10 · Conta X · Comissão · variável']],
      ['Transferências programadas', ['Todo dia 10 · Conta X → Poupança']],
    ])
    expect(groups[0]?.rows[0]).toMatchObject({
      next: { label: 'Próxima 05/11', tone: 'neutral' },
      art: { name: 'Casa', icon: 'home' },
      direction: 'out',
    })
    expect(groups[1]?.rows[0]).toMatchObject({ direction: 'in', isEstimate: true })
  })

  it('says when the next one is today, overdue or next year', () => {
    const [group] = recurrenceGroupsOf(
      listOf([
        recurrence({ nextOn: '2026-10-20' }),
        recurrence({ nextOn: '2026-10-18', nextIsOverdue: true }),
        recurrence({ nextOn: '2027-03-15' }),
        recurrence({ nextOn: null }),
      ]),
      CONTEXT,
    )
    expect(group?.rows.map((row) => row.next)).toEqual([
      { label: 'Vence hoje', tone: 'today' },
      { label: 'Atrasada desde 18/10', tone: 'overdue' },
      { label: 'Próxima 15/03/27', tone: 'neutral' },
      undefined,
    ])
  })
})

describe('recurrenceTilesOf', () => {
  it('words the monthly totals from the API, naming the variable income left out', () => {
    const [bills, income] = recurrenceTilesOf(
      listOf([
        recurrence({ description: 'Comissão', entryType: 'income', amountIsEstimate: true }),
      ]),
    )
    expect(bills).toMatchObject({
      amountCents: 348_970,
      isEstimate: true,
      note: '8 contas; semanais e anuais pela média',
    })
    expect(income).toMatchObject({ amountCents: 900_000, note: 'Sem Comissão, que é variável' })
  })

  it('leaves the notes plain when nothing is averaged or left out', () => {
    const [bills, income] = recurrenceTilesOf(
      listOf([], {
        bills: { monthlyCents: 0, count: 1, includesEstimate: false, includesAveraged: false },
        income: { monthlyCents: 0, count: 0, leftOutEstimateCents: 0, leftOutEstimateCount: 0 },
      }),
    )
    expect(bills?.note).toBe('1 conta')
    expect(income?.note).toBeUndefined()
  })
})
