import { progressPercent } from '@shared/reports/metrics/facts'
import type { FactGoal, GoalProgress, PeriodFacts } from '@shared/reports/metrics/metrics.types'

export function goalProgress(facts: PeriodFacts): GoalProgress[] {
  return facts.goals
    .filter((goal): goal is FactGoal & { targetOn: string } => !goal.isReserve && !!goal.targetOn)
    .sort((left, right) => left.targetOn.localeCompare(right.targetOn))
    .map(({ goalId, name, savedCents, targetCents, targetOn }) => ({
      goalId,
      name,
      savedCents,
      targetCents,
      targetOn,
      percent: progressPercent(savedCents, targetCents),
    }))
}
