import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import piggyBank from '@web/assets/illustrations/piggy-bank.svg'
import { TextLink } from '@web/components/actions/text-link'
import { PaceRing } from '@web/components/charts/pace-ring'
import { ProgressBar } from '@web/components/charts/progress-bar'
import { Card } from '@web/components/display/card'
import { EmptyState } from '@web/components/feedback/empty-state'
import { homeMessages } from '@web/features/home/home.messages'
import type { ReserveGoalsCardProps } from '@web/features/home/home.types'
import { formatMonthLabel } from '@web/lib/format/calendar'

const messages = homeMessages.reserve
const MONTHS = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})

export function ReserveGoalsCard({
  workspaceId,
  overview,
  canPlan,
  className,
}: ReserveGoalsCardProps) {
  const { reserveCoverage: reserve, goalProgress: goals } = overview.metrics
  const planning = <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'planning' }} />
  if (!reserve && goals.length === 0) {
    return (
      <Card className={className} title={messages.title} layout="centered">
        <EmptyState
          illustration={piggyBank}
          action={canPlan && <TextLink render={planning}>{messages.create}</TextLink>}
        >
          {messages.empty}
        </EmptyState>
      </Card>
    )
  }
  return (
    <Card
      className={className}
      title={messages.title}
      description={messages.description}
      footerAction={<TextLink render={planning}>{messages.seeGoals}</TextLink>}
    >
      {reserve && (
        <div className="flex items-center gap-4">
          <PaceRing
            className="mx-0"
            size="sm"
            usedPercent={reserve.percent}
            centerLabel={`${reserve.percent}%`}
            description={messages.reserveAlternative(
              reserve.percent,
              formatBrl(reserve.savedCents),
              formatBrl(reserve.targetCents),
            )}
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-body font-semibold">
              {messages.of(formatBrl(reserve.savedCents), formatBrl(reserve.targetCents))}
            </p>
            <p className="text-body-sm text-ink-muted">
              {reserve.months === null
                ? messages.noHistory
                : messages.covers(MONTHS.format(reserve.months))}
            </p>
          </div>
        </div>
      )}
      <ul className="mt-3 flex flex-col gap-3">
        {goals.map((goal) => (
          <li key={goal.goalId} className="flex flex-col gap-1">
            <p className="flex items-baseline justify-between gap-2 text-body">
              <span className="font-semibold">{goal.name}</span>
              <span className="text-body-sm text-ink-muted tabular-nums">
                {messages.of(formatBrl(goal.savedCents), formatBrl(goal.targetCents))}
              </span>
            </p>
            <ProgressBar percent={goal.percent} />
            <p className="text-body-sm text-ink-muted">
              {messages.goal(goal.percent, formatMonthLabel(goal.targetOn.slice(0, 7)))}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
