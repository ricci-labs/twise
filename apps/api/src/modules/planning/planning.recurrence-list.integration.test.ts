import { withWorkspace } from '@api/core/db/tx'
import { ledgerAccounts } from '@api/modules/ledger/ledger.table'
import { createRecurrenceRule, listRecurrenceRules } from '@api/modules/planning'
import { connectTestDatabases } from '@api/testing/database'
import { createFixtures } from '@api/testing/fixtures'
import type { AccountKind } from '@financas/shared'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databases = connectTestDatabases()
const fixtures = createFixtures(databases.owner, databases.app)
const OCTOBER_FIRST = { now: () => new Date('2026-10-01T12:00:00Z') }
const OCTOBER_TWENTIETH = { now: () => new Date('2026-10-20T12:00:00Z') }

let userId: string

beforeAll(async () => {
  userId = await fixtures.createUser('recurrence-list')
})

afterAll(async () => {
  await fixtures.removeEverything()
  await databases.closeAll()
})

async function accountIn(workspaceId: string, kind: AccountKind, name: string) {
  const [account] = await withWorkspace(databases.app, workspaceId, (tx) =>
    tx
      .insert(ledgerAccounts)
      .values({
        workspaceId,
        kind,
        name,
        currency: 'BRL',
        incomeNature: kind === 'income_category' ? 'fixed' : null,
      })
      .returning({ id: ledgerAccounts.id }),
  )
  return account?.id ?? ''
}

async function householdWorkspace(name: string) {
  const { workspaceId } = await fixtures.createWorkspaceOwnedBy(userId, name)
  const accounts = {
    checking: await accountIn(workspaceId, 'checking', 'Conta X'),
    savings: await accountIn(workspaceId, 'savings', 'Poupança'),
    housing: await accountIn(workspaceId, 'expense_category', 'Casa'),
    salary: await accountIn(workspaceId, 'income_category', 'Salário'),
  }
  const create = async (
    description: string,
    overrides: Record<string, unknown>,
    schedule: Record<string, unknown>,
  ) =>
    (
      await createRecurrenceRule(
        databases.app,
        { workspaceId, userId },
        {
          description,
          entryType: 'expense',
          amountCents: 10_000,
          sourceAccountId: accounts.checking,
          categoryAccountId: accounts.housing,
          ...overrides,
          schedule: { weekendRule: 'keep', ...schedule },
        },
        OCTOBER_FIRST,
      )
    ).ruleId
  return { workspaceId, accounts, create }
}

describe('listRecurrenceRules', () => {
  it('gives each rule its next pending date, overdue only once that day has passed', async () => {
    const { workspaceId, create } = await householdWorkspace('Next dates')
    const internet = await create('Internet', {}, { frequency: 'monthly', startsOn: '2026-10-18' })
    const rent = await create('Aluguel', {}, { frequency: 'monthly', startsOn: '2026-10-25' })
    const phone = await create('Celular', {}, { frequency: 'monthly', startsOn: '2026-10-20' })
    const ended = await create(
      'Curso',
      {},
      { frequency: 'monthly', startsOn: '2026-10-05', endsOn: '2026-10-05' },
    )

    const { items } = await listRecurrenceRules(databases.app, workspaceId, OCTOBER_TWENTIETH)
    const byId = new Map(items.map((item) => [item.id, item]))

    expect(byId.get(internet)).toMatchObject({ nextOn: '2026-10-18', nextIsOverdue: true })
    expect(byId.get(rent)).toMatchObject({ nextOn: '2026-10-25', nextIsOverdue: false })
    expect(byId.get(phone)).toMatchObject({ nextOn: '2026-10-20', nextIsOverdue: false })
    expect(byId.get(ended)).toMatchObject({ nextOn: '2026-10-05', nextIsOverdue: true })
  })

  it('answers no next date once every occurrence is paid, skipped or gone', async () => {
    const { workspaceId, create } = await householdWorkspace('No next date')
    const ended = await create(
      'Curso',
      {},
      { frequency: 'monthly', startsOn: '2026-09-05', endsOn: '2026-09-30' },
    )

    const { items } = await listRecurrenceRules(databases.app, workspaceId, OCTOBER_TWENTIETH)

    expect(items.find((item) => item.id === ended)).toMatchObject({
      nextOn: null,
      nextIsOverdue: false,
    })
  })

  it('sums the monthly equivalents of bills, fixed income and transfers still running', async () => {
    const { workspaceId, accounts, create } = await householdWorkspace('Monthly totals')
    await create(
      'Aluguel',
      { amountCents: 210_000 },
      { frequency: 'monthly', startsOn: '2026-11-05' },
    )
    const cleaner = await create(
      'Diarista',
      { amountCents: 18_000 },
      { frequency: 'weekly', startsOn: '2026-10-23' },
    )
    await create(
      'Luz',
      { amountCents: 18_000, amountIsEstimate: true },
      { frequency: 'monthly', startsOn: '2026-10-22' },
    )
    await create(
      'Seguro',
      { amountCents: 120_000 },
      { frequency: 'yearly', startsOn: '2027-03-15' },
    )
    await create(
      'Curso',
      { amountCents: 50_000 },
      { frequency: 'monthly', startsOn: '2026-10-05', endsOn: '2026-10-05' },
    )
    const income = { entryType: 'income', categoryAccountId: accounts.salary }
    await create(
      'Salário',
      { ...income, amountCents: 620_000 },
      { frequency: 'monthly', startsOn: '2026-11-05' },
    )
    await create(
      'Comissão',
      { ...income, amountCents: 200_000, amountIsEstimate: true },
      { frequency: 'monthly', startsOn: '2026-11-10' },
    )
    await create(
      'Reserva',
      { entryType: 'transfer', amountCents: 60_000, categoryAccountId: accounts.savings },
      { frequency: 'monthly', startsOn: '2026-11-10' },
    )

    const { items, summary } = await listRecurrenceRules(
      databases.app,
      workspaceId,
      OCTOBER_TWENTIETH,
    )

    expect(items.find((item) => item.id === cleaner)?.monthlyCents).toBe(78_000)
    expect(summary).toEqual({
      bills: { monthlyCents: 316_000, count: 4, includesEstimate: true, includesAveraged: true },
      income: {
        monthlyCents: 620_000,
        count: 1,
        leftOutEstimateCents: 200_000,
        leftOutEstimateCount: 1,
      },
      transfers: { monthlyCents: 60_000, count: 1 },
    })
  })
})
