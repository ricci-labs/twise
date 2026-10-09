import { formatBrl } from '@financas/shared'
import piggyBank from '@web/assets/illustrations/piggy-bank.svg'
import { Amount } from '@web/components/display/amount'
import { Card } from '@web/components/display/card'
import { TwiseIcon, type TwiseIconName } from '@web/components/icons/twise-icon'
import { homeMessages } from '@web/features/home/home.messages'
import type {
  AchievementsCardProps,
  AchievementTile,
  Overview,
} from '@web/features/home/home.types'
import { formatMonthName } from '@web/lib/format/calendar'

const messages = homeMessages.achievements
const MONTHS = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})
const FIRST_STREAK_WORTH_SAYING = 2

export function AchievementsCard({ overview, className }: AchievementsCardProps) {
  const summary = overview.metrics.periodSummary
  if (!summary) {
    return null
  }
  const month = formatMonthName(overview.period.label)
  const tiles = tilesOf(overview)
  return (
    <Card className={className} title={messages.title(month)} description={messages.description}>
      {summary.leftCents >= 0 && (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-mint px-5 py-4.5 text-on-mint">
          <div className="flex flex-col items-start">
            <p className="text-label">{messages.closedPositive(month)}</p>
            <p className="mt-0.5 mb-2 flex items-baseline gap-2 font-display text-amount-kpi whitespace-nowrap">
              {messages.left} <Amount cents={summary.leftCents} size="kpi" isCentsRaised />
            </p>
            {summary.positiveStreak >= FIRST_STREAK_WORTH_SAYING && (
              <span className="inline-flex h-6.5 items-center gap-1.5 rounded-full bg-on-mint px-2.5 text-caption font-semibold text-mint">
                {messages.streak(summary.positiveStreak, summary.streakCapped)}
              </span>
            )}
          </div>
          <img src={piggyBank} alt="" className="size-18 shrink-0 rounded-full lg:size-24" />
        </div>
      )}
      {tiles.length > 0 && (
        <ul className="mt-3.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
          {tiles.map((tile) => (
            <li key={tile.key} className="flex flex-col gap-1 rounded-md bg-page p-3.5">
              <span className="mb-1 grid size-8.5 place-items-center rounded-full bg-mint-soft">
                <TwiseIcon name={tile.icon} tone="accent" size="md" />
              </span>
              <span className="font-display text-title whitespace-nowrap">{tile.value}</span>
              <span className="text-body-sm text-ink-muted">{tile.label}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function tilesOf({ metrics }: Overview): AchievementTile[] {
  const summary = metrics.periodSummary
  if (!summary) {
    return []
  }
  const goalNames = new Map(metrics.goalProgress.map((goal) => [goal.goalId, goal.name]))
  const [movedGoal] = summary.goals.filter((goal) => goalNames.has(goal.goalId))
  const months = metrics.reserveCoverage?.months
  const tiles: (AchievementTile | null)[] = [
    summary.budgetsTotal > 0
      ? tile(
          'budgets',
          'shield',
          messages.budgets(summary.budgetsWithin, summary.budgetsTotal),
          messages.budgetsLabel,
        )
      : null,
    summary.billsTotal > 0
      ? tile(
          'bills',
          'plan',
          messages.bills(summary.billsOnTime, summary.billsTotal),
          messages.billsLabel,
        )
      : null,
    summary.reserveAddedCents > 0
      ? tile(
          'reserve',
          'wallet',
          messages.reserve(formatBrl(summary.reserveAddedCents)),
          messages.reserveLabel(months ? MONTHS.format(months) : null),
        )
      : null,
    movedGoal
      ? tile(
          'goal',
          'bag',
          messages.goal(movedGoal.startPercent, movedGoal.endPercent),
          messages.goalLabel(goalNames.get(movedGoal.goalId) ?? ''),
        )
      : null,
  ]
  return tiles.filter((candidate): candidate is AchievementTile => candidate !== null)
}

function tile(key: string, icon: TwiseIconName, value: string, label: string): AchievementTile {
  return { key, icon, value, label }
}
