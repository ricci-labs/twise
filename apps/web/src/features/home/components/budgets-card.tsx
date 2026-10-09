import { Link } from '@tanstack/react-router'
import piggyBank from '@web/assets/illustrations/piggy-bank.svg'
import { TextLink } from '@web/components/actions/text-link'
import { ProgressBar } from '@web/components/charts/progress-bar'
import { Badge } from '@web/components/display/badge'
import { Card } from '@web/components/display/card'
import { EmptyState } from '@web/components/feedback/empty-state'
import { homeMessages } from '@web/features/home/home.messages'
import type { BudgetLine, BudgetsCardProps } from '@web/features/home/home.types'
import { formatWholeReais } from '@web/lib/format/money'

const messages = homeMessages.budgets
const SHOWN = 5
const FULL = 100
const STATUS_TONE = { over: 'danger', ahead: 'warning', within: 'success' } as const

export function BudgetsCard({
  workspaceId,
  overview,
  nameOf,
  canPlan,
  className,
}: BudgetsCardProps) {
  const { budgetPace, periodProgress } = overview.metrics
  const planning = <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'planning' }} />
  const lines = [...budgetPace].sort(byDistanceAhead).slice(0, SHOWN)
  if (lines.length === 0) {
    return (
      <Card className={className} title={messages.title} layout="centered">
        <EmptyState
          illustration={piggyBank}
          action={canPlan && <TextLink render={planning}>{messages.define}</TextLink>}
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
      footerStat={messages.paceNote(periodProgress.elapsedPercent)}
      footerAction={<TextLink render={planning}>{messages.seeAll}</TextLink>}
    >
      <ul data-slot="budget-rows" className="flex flex-col">
        {lines.map((line) => (
          <li
            key={line.categoryAccountId}
            className="grid grid-cols-2 items-center gap-x-4 gap-y-1.5 border-b border-border py-2.5 last:border-b-0 lg:grid-cols-12"
          >
            <span className="text-body font-semibold lg:col-span-3">
              {nameOf(line.categoryAccountId)}
            </span>
            <span className="justify-self-end lg:order-last lg:col-span-2 lg:justify-self-start">
              <Badge tone={STATUS_TONE[line.status]}>{messages.status[line.status]}</Badge>
            </span>
            <ProgressBar
              className="col-span-2 lg:col-span-4"
              percent={line.limitCents > 0 ? (line.spentCents / line.limitCents) * FULL : 0}
              markPercent={periodProgress.elapsedPercent}
              tone={line.status}
            />
            <span className="col-span-2 text-body-sm text-ink-muted tabular-nums lg:col-span-3 lg:text-right">
              {messages.of(formatWholeReais(line.spentCents), formatWholeReais(line.limitCents))}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function byDistanceAhead(left: BudgetLine, right: BudgetLine): number {
  return right.spentCents - right.expectedCents - (left.spentCents - left.expectedCents)
}
