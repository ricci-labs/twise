import type { IsoDate, Period } from '@shared/core/calendar/calendar.types'
import { addMonths, parseIsoDate } from '@shared/core/calendar/dates'
import { periodSettingsOf, periodStartingIn } from '@shared/core/calendar/period'
import type { RecurringEntryType } from '@shared/planning/recurrence/recurrence.constants'
import {
  DEMO_IDS,
  DEMO_NAMES,
  DEMO_PERIOD_DAY,
  DEMO_PERIOD_LABELS,
  DEMO_TODAY,
  type DemoScenario,
} from '@shared/reports/demo/demo.constants'
import { computeInsights } from '@shared/reports/insights/insights'
import { computeMetrics } from '@shared/reports/metrics/metrics'
import type {
  FactAccount,
  FactOccurrence,
  FactPosting,
  PeriodFacts,
} from '@shared/reports/metrics/metrics.types'
import type { PeriodOverview } from '@shared/reports/reports/reports.types'

const RECENT_PERIODS = 6
const UPCOMING_PERIODS = 6
const SETTINGS = periodSettingsOf('day_of_month', DEMO_PERIOD_DAY)
const ids = DEMO_IDS

export function demoOverview(scenario: DemoScenario): PeriodOverview {
  const facts = demoFacts(scenario)
  const metrics = computeMetrics(facts)
  return {
    today: facts.today,
    period: facts.period,
    metrics,
    insights: computeInsights(facts, metrics),
  }
}

export function demoFacts(scenario: DemoScenario): PeriodFacts {
  const labelMonth = parseIsoDate(`${DEMO_PERIOD_LABELS[scenario]}-01`)
  const periodAt = (offset: number): Period =>
    periodStartingIn(addMonths(labelMonth, offset), SETTINGS)
  const overspent =
    scenario === 'overspent' ? spend(ids.car, ids.checkingA, 272_000, '2026-10-18') : []
  return {
    today: DEMO_TODAY,
    period: periodAt(0),
    recentPeriods: Array.from({ length: RECENT_PERIODS }, (_, index) =>
      periodAt(index - RECENT_PERIODS),
    ),
    upcomingPeriods: Array.from({ length: UPCOMING_PERIODS }, (_, index) => periodAt(index + 1)),
    installmentBudgetView: 'per_installment',
    budgetBase: 'fixed_income',
    accounts: ACCOUNTS,
    postings: [...pastMonths(), ...thisMonth(), ...cardInstallments(), ...overspent],
    occurrences: [...billsThisMonth(), ...plannedAhead()],
    budgets: [
      { categoryAccountId: ids.leisure, limitCents: 40_000 },
      { categoryAccountId: ids.groceries, limitCents: 120_000 },
      { categoryAccountId: ids.transport, limitCents: 50_000 },
      { categoryAccountId: ids.home, limitCents: 80_000 },
      { categoryAccountId: ids.health, limitCents: 30_000 },
    ],
    reserve: { targetCents: 2_250_000, savedCents: 1_512_000 },
    cards: [
      { accountId: ids.cardX, paymentAccountId: ids.checkingA, ...CARD_X_CYCLE },
      { accountId: ids.cardY, paymentAccountId: ids.checkingB, ...CARD_Y_CYCLE },
    ],
    invoices: [
      {
        cardAccountId: ids.cardX,
        closingOn: '2026-10-25',
        dueOn: '2026-11-04',
        totalCents: 184_000,
        paidCents: 0,
      },
      {
        cardAccountId: ids.cardY,
        closingOn: '2026-11-02',
        dueOn: '2026-11-10',
        totalCents: 62_000,
        paidCents: 0,
      },
    ],
    allocation: { destinationAccountIds: [ids.reserve], coversOverspent: false },
    balances: [
      { accountId: ids.checkingA, balanceCents: 420_000 },
      { accountId: ids.checkingB, balanceCents: 310_000 },
      { accountId: ids.reserve, balanceCents: 1_512_000 },
    ],
    contactBalances: [
      {
        contactId: ids.contactC,
        owedCents: 30_000,
        overdueCents: 0,
        nextDueOn: '2026-10-25',
        nextDueCents: 12_000,
      },
      {
        contactId: ids.contactD,
        owedCents: 34_000,
        overdueCents: 20_000,
        nextDueOn: '2026-11-04',
        nextDueCents: 14_000,
      },
      {
        contactId: ids.contactE,
        owedCents: 20_000,
        overdueCents: 0,
        nextDueOn: '2026-10-30',
        nextDueCents: 10_000,
      },
    ],
  }
}

const CARD_X_CYCLE = { closingDay: 25, dueDay: 4, purchaseOnClosingDayGoesNext: true }
const CARD_Y_CYCLE = { closingDay: 2, dueDay: 10, purchaseOnClosingDayGoesNext: true }

const ACCOUNTS: readonly FactAccount[] = [
  money(ids.checkingA, 'checking'),
  money(ids.checkingB, 'checking'),
  money(ids.reserve, 'savings'),
  { id: ids.cardX, parentId: null, kind: 'credit_card', class: 'liability', incomeNature: null },
  { id: ids.cardY, parentId: null, kind: 'credit_card', class: 'liability', incomeNature: null },
  income(ids.salaryA, 'fixed'),
  income(ids.salaryB, 'fixed'),
  income(ids.commission, 'variable'),
  ...[
    ids.groceries,
    ids.leisure,
    ids.transport,
    ids.home,
    ids.health,
    ids.rent,
    ids.bills,
    ids.electronics,
    ids.car,
    ids.other,
  ].map(expense),
]

const PAST_MONTHS = [
  { start: '2026-04', commission: 90_000, other: 253_000 },
  { start: '2026-05', commission: 110_000, other: 253_000 },
  { start: '2026-06', commission: 130_000, other: 493_000 },
  { start: '2026-07', commission: 100_000, other: 68_500 },
  { start: '2026-08', commission: 140_000, other: 68_500 },
] as const

const SEPTEMBER_SPENDING = [
  { category: ids.groceries, cents: 115_000 },
  { category: ids.leisure, cents: 43_000 },
  { category: ids.transport, cents: 48_000 },
  { category: ids.home, cents: 70_000 },
  { category: ids.health, cents: 25_000 },
  { category: ids.car, cents: 386_000 },
] as const

function pastMonths(): FactPosting[] {
  const usual = PAST_MONTHS.flatMap(({ start, commission, other }) => [
    ...salaries(start),
    ...receive(ids.commission, ids.checkingB, commission, `${start}-15`),
    ...spend(ids.rent, ids.checkingA, 150_000, `${start}-05`),
    ...spend(ids.groceries, ids.checkingA, 110_000, `${start}-12`),
    ...spend(ids.leisure, ids.checkingB, 35_000, `${start}-13`),
    ...spend(ids.transport, ids.checkingB, 45_000, `${start}-14`),
    ...spend(ids.home, ids.checkingA, 65_000, `${start}-16`),
    ...spend(ids.health, ids.checkingA, 20_000, `${start}-17`),
    ...spend(ids.other, ids.checkingB, other, `${start}-20`),
  ])
  const september = [
    ...salaries('2026-09'),
    ...receive(ids.commission, ids.checkingB, 150_000, '2026-09-15'),
    ...spend(ids.rent, ids.checkingA, 150_000, '2026-09-05'),
    ...SEPTEMBER_SPENDING.flatMap(({ category, cents }) =>
      spend(category, ids.checkingA, cents, '2026-09-18'),
    ),
  ]
  return [...usual, ...september]
}

function thisMonth(): FactPosting[] {
  return [
    ...salaries('2026-10'),
    ...receive(ids.commission, ids.checkingB, 150_000, '2026-10-15'),
    ...spend(ids.rent, ids.checkingA, 150_000, '2026-10-05'),
    ...spend(ids.home, ids.checkingA, 38_000, '2026-10-12'),
    ...cardPurchase(ids.cardX, ids.groceries, [82_000], '2026-10-11', ['2026-11-04']),
    ...cardPurchase(ids.cardX, ids.leisure, [46_000], '2026-10-17', ['2026-11-04']),
    ...cardPurchase(ids.cardX, ids.transport, [25_000], '2026-10-08', ['2026-11-04']),
    ...cardPurchase(ids.cardX, ids.health, [9_000], '2026-10-09', ['2026-11-04']),
  ]
}

function cardInstallments(): FactPosting[] {
  const notebookDues = ['05', '06', '07', '08', '09', '10', '11', '12'].map(
    (month) => `2026-${month}-04`,
  )
  return [
    ...cardPurchase(ids.cardX, ids.electronics, Array(10).fill(22_000), '2026-04-20', [
      ...notebookDues,
      '2027-01-04',
      '2027-02-04',
    ]),
    ...cardPurchase(ids.cardY, ids.electronics, [14_000, 14_000, 14_000, 14_000], '2026-09-20', [
      '2026-10-10',
      '2026-11-10',
      '2026-12-10',
      '2027-01-10',
    ]),
    ...cardPurchase(ids.cardY, ids.home, [48_000, 48_000, 48_000], '2026-10-14', [
      '2026-11-10',
      '2026-12-10',
      '2027-01-10',
    ]),
  ]
}

function billsThisMonth(): FactOccurrence[] {
  return [
    bill(ids.rentBill, ids.checkingA, '2026-10-05', 150_000, 'matched', ids.rent),
    bill(ids.internet, ids.checkingA, '2026-10-18', 12_000),
    bill(ids.power, ids.checkingA, '2026-10-22', 24_000),
    bill(ids.condo, ids.checkingA, '2026-10-25', 48_000),
    bill(ids.gym, ids.checkingA, '2026-10-26', 10_000),
    bill(ids.cleaning, ids.checkingB, '2026-10-28', 40_000),
    bill(ids.healthPlan, ids.checkingA, '2026-11-01', 90_000),
    bill(ids.carInsurance, ids.checkingB, '2026-11-03', 45_000),
    planned(ids.streaming, 'card_purchase', ids.cardX, ids.other, '2026-10-23', 11_000),
    planned(
      ids.salaryAPlan,
      'income',
      ids.checkingA,
      ids.salaryA,
      '2026-10-05',
      500_000,
      'matched',
    ),
    planned(
      ids.salaryBPlan,
      'income',
      ids.checkingB,
      ids.salaryB,
      '2026-10-06',
      400_000,
      'matched',
    ),
  ]
}

function plannedAhead(): FactOccurrence[] {
  const months = ['2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04', '2027-05']
  const monthly = months.flatMap((month) => {
    const next = nextMonthOf(month)
    return [
      planned(ids.salaryAPlan, 'income', ids.checkingA, ids.salaryA, `${month}-05`, 500_000),
      planned(ids.salaryBPlan, 'income', ids.checkingB, ids.salaryB, `${month}-06`, 400_000),
      bill(ids.rentBill, ids.checkingA, `${month}-05`, 150_000, 'pending', ids.rent),
      bill(ids.internet, ids.checkingA, `${month}-18`, 12_000),
      bill(ids.power, ids.checkingA, `${month}-22`, 24_000),
      bill(ids.condo, ids.checkingA, `${month}-25`, 48_000),
      bill(ids.gym, ids.checkingA, `${month}-26`, 10_000),
      bill(ids.cleaning, ids.checkingB, `${month}-28`, 40_000),
      bill(ids.healthPlan, ids.checkingA, `${next}-01`, 90_000),
      planned(ids.streaming, 'card_purchase', ids.cardX, ids.other, `${month}-23`, 11_000),
    ]
  })
  return [...monthly, bill(ids.carTax, ids.checkingA, '2027-01-15', 180_000)]
}

function nextMonthOf(month: string): string {
  const next = addMonths(parseIsoDate(`${month}-01`), 1)
  return `${next.year}-${String(next.month).padStart(2, '0')}`
}

function salaries(month: string): FactPosting[] {
  return [
    ...receive(ids.salaryA, ids.checkingA, 500_000, `${month}-05`),
    ...receive(ids.salaryB, ids.checkingB, 400_000, `${month}-06`),
  ]
}

function spend(category: string, from: string, cents: number, on: IsoDate): FactPosting[] {
  return [moved(category, cents, on), moved(from, -cents, on)]
}

function receive(category: string, to: string, cents: number, on: IsoDate): FactPosting[] {
  return [moved(category, -cents, on), moved(to, cents, on)]
}

function cardPurchase(
  card: string,
  category: string,
  installments: readonly number[],
  boughtOn: IsoDate,
  dues: readonly IsoDate[],
): FactPosting[] {
  return installments.flatMap((cents, index) => {
    const due = dues[index] ?? boughtOn
    return [moved(category, cents, due, boughtOn), moved(card, -cents, due, boughtOn)]
  })
}

function moved(
  accountId: string,
  amountCents: number,
  effectiveOn: IsoDate,
  occurredOn: IsoDate = effectiveOn,
): FactPosting {
  return { accountId, amountCents, effectiveOn, occurredOn }
}

function bill(
  ruleId: string,
  from: string,
  dueOn: IsoDate,
  amountCents: number,
  status: FactOccurrence['status'] = 'pending',
  category: string = ids.bills,
): FactOccurrence {
  return planned(ruleId, 'expense', from, category, dueOn, amountCents, status)
}

function planned(
  ruleId: string,
  entryType: RecurringEntryType,
  sourceAccountId: string,
  categoryAccountId: string,
  dueOn: IsoDate,
  amountCents: number,
  status: FactOccurrence['status'] = 'pending',
): FactOccurrence {
  return {
    id: occurrenceId(ruleId, dueOn),
    description: DEMO_NAMES[ruleId] ?? ruleId,
    sourceAccountId,
    dueOn,
    amountCents,
    entryType,
    status,
    categoryAccountId,
  }
}

function occurrenceId(ruleId: string, dueOn: IsoDate): string {
  const { year, month, day } = parseIsoDate(dueOn)
  const monthDay = `${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`
  return `${ruleId.slice(0, 9)}${monthDay}-4${String(year).slice(1)}${ruleId.slice(18)}`
}

function money(id: string, kind: 'checking' | 'savings'): FactAccount {
  return { id, parentId: null, kind, class: 'asset', incomeNature: null }
}

function income(id: string, incomeNature: 'fixed' | 'variable'): FactAccount {
  return { id, parentId: null, kind: 'income_category', class: 'income', incomeNature }
}

function expense(id: string): FactAccount {
  return { id, parentId: null, kind: 'expense_category', class: 'expense', incomeNature: null }
}
