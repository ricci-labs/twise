import type { ContactBalance } from '@shared/contacts/contacts/contacts.types'
import type { IsoDate, Period } from '@shared/core/calendar/calendar.types'
import type {
  BudgetBase,
  InstallmentBudgetView,
} from '@shared/identity/workspaces/workspaces.constants'
import type { CardCycle } from '@shared/ledger/cards/cards.types'
import type {
  AccountClass,
  AccountKind,
  IncomeNature,
} from '@shared/ledger/ledger/ledger.constants'
import type {
  OccurrenceStatus,
  RecurringEntryType,
} from '@shared/planning/recurrence/recurrence.constants'

export type FactAccount = {
  id: string
  parentId: string | null
  kind: AccountKind
  class: AccountClass
  incomeNature: IncomeNature | null
}

export type FactPosting = {
  accountId: string
  amountCents: number
  effectiveOn: IsoDate
  occurredOn: IsoDate
}

export type FactOccurrence = {
  id: string
  description: string
  sourceAccountId: string
  dueOn: IsoDate
  amountCents: number
  entryType: RecurringEntryType
  status: OccurrenceStatus
  categoryAccountId: string
  paidOn: IsoDate | null
}

export type FactBudget = {
  categoryAccountId: string
  limitCents: number
}

export type FactCard = CardCycle & {
  accountId: string
  paymentAccountId: string | null
}

export type FactInvoice = {
  cardAccountId: string
  closingOn: IsoDate
  dueOn: IsoDate
  totalCents: number
  paidCents: number
  frontedCents: number
}

export type FactBalance = {
  accountId: string
  balanceCents: number
}

export type FactAllocation = {
  destinationAccountIds: readonly string[]
  coversOverspent: boolean
}

export type FactGoal = {
  goalId: string
  name: string
  accountId: string
  targetCents: number
  targetOn: IsoDate | null
  isReserve: boolean
  savedCents: number
}

export type PeriodFacts = {
  today: IsoDate
  period: Period
  recentPeriods: readonly Period[]
  upcomingPeriods: readonly Period[]
  installmentBudgetView: InstallmentBudgetView
  budgetBase: BudgetBase
  accounts: readonly FactAccount[]
  postings: readonly FactPosting[]
  occurrences: readonly FactOccurrence[]
  budgets: readonly FactBudget[]
  goals: readonly FactGoal[]
  cards: readonly FactCard[]
  invoices: readonly FactInvoice[]
  allocation: FactAllocation | null
  balances: readonly FactBalance[]
  contactBalances: readonly ContactBalance[]
}

export type BudgetPace = {
  categoryAccountId: string
  limitCents: number
  spentCents: number
  expectedCents: number
  overCents: number
  aheadPoints: number
  status: 'within' | 'ahead' | 'over'
}

export type PeriodDays = {
  total: number
  elapsed: number
  left: number
}

export type PeriodProgress = PeriodDays & {
  elapsedPercent: number
}

export type SpendingAverage = {
  monthlyCents: number
  periods: number
}

export type IncomeShare = {
  spentPercent: number
  committedPercent: number
  freePercent: number
}

export type PeriodPace = {
  usedPercent: number
  elapsedPercent: number
  pointsAhead: number
}

export type BillDue = {
  occurrenceId: string
  description: string
  dueOn: IsoDate
  amountCents: number
  daysFromToday: number
}

export type BillsDue = {
  until: IsoDate
  count: number
  totalCents: number
  overdueCount: number
  items: BillDue[]
}

export type NextReceivable = {
  contactId: string
  dueOn: IsoDate
  amountCents: number
}

export type Receivables = {
  owedCents: number
  overdueCents: number
  contactCount: number
  next: NextReceivable | null
}

export type GoalProgress = {
  goalId: string
  name: string
  savedCents: number
  targetCents: number
  targetOn: IsoDate
  percent: number
}

export type VariableVsAverage = {
  percent: number
}

export type GoalProgressChange = {
  goalId: string
  startPercent: number
  endPercent: number
}

export type PeriodSummary = {
  leftCents: number
  positiveStreak: number
  streakCapped: boolean
  budgetsWithin: number
  budgetsTotal: number
  billsOnTime: number
  billsTotal: number
  reserveAddedCents: number
  goals: GoalProgressChange[]
}

export type ReserveCoverage = {
  savedCents: number
  targetCents: number
  percent: number
  monthlySpendingCents: number
  months: number | null
}

export type CommittedPeriod = {
  label: string
  installmentsCents: number
  plannedCents: number
  committedCents: number
  fixedIncomeCents: number
  percentOfIncome: number | null
}

export type InvoiceForecast = {
  cardAccountId: string
  closingOn: IsoDate
  dueOn: IsoDate
  postedCents: number
  plannedCents: number
  forecastCents: number
  frontedCents: number
}

export type BalancePoint = {
  on: IsoDate
  balanceCents: number
}

export type BalanceForecast = {
  accountId: string
  until: IsoDate
  startCents: number
  endCents: number
  lowestCents: number
  lowestOn: IsoDate
  points: BalancePoint[]
}

export type BalanceMove = {
  on: IsoDate
  amountCents: number
}
