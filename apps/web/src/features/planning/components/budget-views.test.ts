import {
  budgetLinesOf,
  budgetSheetOf,
  unbudgetedOf,
} from '@web/features/planning/components/budget-views'
import type { BudgetAccounts, PlanningOverview } from '@web/features/planning/planning.types'
import { budgetOverview } from '@web/testing/planning-api'
import { describe, expect, it } from 'vitest'

const GROCERIES = '00000000-0000-4000-8000-0000000000e1'
const MARKET = '00000000-0000-4000-8000-0000000000e2'
const BAKERY = '00000000-0000-4000-8000-0000000000e3'
const HOUSE = '00000000-0000-4000-8000-0000000000e4'
const TRAVEL = 'travel'
const OLD = 'old'

function category(
  id: string,
  name: string,
  parentId: string | null = null,
  archivedAt: string | null = null,
) {
  return { id, name, parentId, icon: null, kind: 'expense_category' as const, archivedAt }
}

const ACCOUNTS: BudgetAccounts = new Map(
  [
    category(GROCERIES, 'Mercado'),
    category(MARKET, 'Feira', GROCERIES),
    category(BAKERY, 'Padaria', GROCERIES),
    category(HOUSE, 'Casa'),
    category(TRAVEL, 'Viagem'),
    category(OLD, 'Antiga', null, '2026-09-01T12:00:00.000Z'),
  ].map((account) => [account.id, account]),
)

const OVERVIEW = budgetOverview() as unknown as PlanningOverview

describe('budgetLinesOf', () => {
  it('words each budget and names its subcategories, largest first', () => {
    const [market] = budgetLinesOf(OVERVIEW, ACCOUNTS)
    expect(market).toMatchObject({
      name: 'Mercado',
      statusText: 'Acima do ritmo: 16 pontos à frente',
      subcategories: [
        { label: 'Feira', amountCents: 21000 },
        { label: 'Padaria', amountCents: 9500 },
      ],
    })
  })
})

describe('unbudgetedOf', () => {
  it('lists the active top categories without a budget, those that spent first', () => {
    expect(unbudgetedOf(OVERVIEW, ACCOUNTS).map((line) => [line.name, line.spentCents])).toEqual([
      ['Casa', 14500],
      ['Viagem', 0],
    ])
  })
})

describe('budgetSheetOf', () => {
  it('splits the spending into the category itself and each subcategory, with the average', () => {
    expect(budgetSheetOf(GROCERIES, OVERVIEW, ACCOUNTS)).toMatchObject({
      childNames: ['Feira', 'Padaria'],
      limitCents: 120000,
      spending: [
        { label: 'Direto em Mercado', amountCents: 51500 },
        { label: 'Feira', amountCents: 21000 },
        { label: 'Padaria', amountCents: 9500 },
      ],
      totalCents: 82000,
      average: { periods: 3, amountCents: 115000 },
    })
  })

  it('opens a category without a budget empty, with its average', () => {
    expect(budgetSheetOf(HOUSE, OVERVIEW, ACCOUNTS)).toMatchObject({
      limitCents: null,
      spending: [],
      average: { periods: 3, amountCents: 9600 },
    })
  })
})
