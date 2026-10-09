import type { IsoDate, Period } from '@shared/core/calendar/calendar.types'
import { isInPeriod } from '@shared/core/calendar/period'
import { budgetPace } from '@shared/reports/metrics/budget-pace'
import { progressPercent, recentActivePeriods, sumCents } from '@shared/reports/metrics/facts'
import { freeToSpend } from '@shared/reports/metrics/free-to-spend'
import type {
  FactGoal,
  GoalProgressChange,
  PeriodFacts,
  PeriodSummary,
} from '@shared/reports/metrics/metrics.types'

export function periodSummary(facts: PeriodFacts): PeriodSummary | null {
  if (facts.today <= facts.period.end) {
    return null
  }
  const leftCents = freeToSpend(facts)
  const previous = leftCents < 0 ? null : positiveRunBefore(facts)
  const budgets = budgetPace(facts)
  const bills = billsOf(facts)
  return {
    leftCents,
    positiveStreak: previous === null ? 0 : previous + 1,
    streakCapped: previous === facts.recentPeriods.length,
    budgetsWithin: budgets.filter((line) => line.status !== 'over').length,
    budgetsTotal: budgets.length,
    billsOnTime: bills.filter(
      (bill) => bill.status === 'matched' && bill.paidOn !== null && bill.paidOn <= bill.dueOn,
    ).length,
    billsTotal: bills.length,
    reserveAddedCents: reserveAdded(facts),
    goals: goalChanges(facts),
  }
}

function positiveRunBefore(facts: PeriodFacts): number {
  const active = new Set(recentActivePeriods(facts).map((period) => period.label))
  let run = 0
  for (const period of [...facts.recentPeriods].reverse()) {
    if (!active.has(period.label) || !closedPositive(facts, period)) {
      return run
    }
    run += 1
  }
  return run
}

function closedPositive(facts: PeriodFacts, period: Period): boolean {
  return freeToSpend({ ...facts, period }) >= 0
}

function billsOf(facts: PeriodFacts) {
  return facts.occurrences.filter(
    (occurrence) =>
      occurrence.entryType === 'expense' &&
      occurrence.status !== 'skipped' &&
      isInPeriod(occurrence.dueOn, facts.period),
  )
}

function reserveAdded(facts: PeriodFacts): number {
  const reserve = facts.goals.find((goal) => goal.isReserve)
  if (!reserve) {
    return 0
  }
  return sumCents(
    facts.postings
      .filter(
        (posting) =>
          posting.accountId === reserve.accountId && isInPeriod(posting.effectiveOn, facts.period),
      )
      .map((posting) => posting.amountCents),
  )
}

function goalChanges(facts: PeriodFacts): GoalProgressChange[] {
  const beforeStart = (date: IsoDate) => date < facts.period.start
  const byTheEnd = (date: IsoDate) => date <= facts.period.end
  return facts.goals
    .filter((goal) => !goal.isReserve)
    .map((goal) => ({
      goalId: goal.goalId,
      startPercent: progressPercent(savedWhen(facts, goal, beforeStart), goal.targetCents),
      endPercent: progressPercent(savedWhen(facts, goal, byTheEnd), goal.targetCents),
    }))
    .filter((change) => change.endPercent > change.startPercent)
    .sort(
      (left, right) =>
        right.endPercent - right.startPercent - (left.endPercent - left.startPercent),
    )
}

function savedWhen(
  facts: PeriodFacts,
  goal: FactGoal,
  isAlreadyIn: (date: IsoDate) => boolean,
): number {
  const later = facts.postings
    .filter((posting) => posting.accountId === goal.accountId && !isAlreadyIn(posting.effectiveOn))
    .map((posting) => posting.amountCents)
  return goal.savedCents - sumCents(later)
}
