import { formatBrl } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import piggyBank from '@web/assets/illustrations/piggy-bank.svg'
import { TextLink } from '@web/components/actions/text-link'
import { ProgressBar } from '@web/components/charts/progress-bar'
import { Card } from '@web/components/display/card'
import { CategoryArt } from '@web/components/display/category-art'
import { ResponsiveText } from '@web/components/display/responsive-text'
import { EmptyState } from '@web/components/feedback/empty-state'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { homeMessages } from '@web/features/home/home.messages'
import type { BudgetLine, BudgetRowProps, BudgetsCardProps } from '@web/features/home/home.types'
import { cn } from '@web/lib/cn'
import { formatWholeReais } from '@web/lib/format/money'

const messages = homeMessages.budgets
const SHOWN = 5
const FULL = 100
const STATUS = {
  over: { icon: 'alert', tone: 'danger', text: 'text-danger' },
  ahead: { icon: 'warn', tone: 'warning', text: 'text-warning' },
  within: { icon: 'ok', tone: 'success', text: 'text-ink-muted' },
} as const

export function BudgetsCard({
  workspaceId,
  overview,
  nameOf,
  iconOf,
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
      description={<ResponsiveText short={messages.descriptionShort} long={messages.description} />}
      footerStat={
        <ResponsiveText
          short={
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-3 w-0.5 rounded-full bg-ink" />
              {messages.paceLegend}
            </span>
          }
          long={messages.paceNote(periodProgress.elapsedPercent)}
        />
      }
      footerAction={<TextLink render={planning}>{messages.seeAll}</TextLink>}
    >
      <div
        aria-hidden="true"
        className="hidden grid-cols-12 items-center gap-4 pb-2 text-caption text-ink-muted lg:grid"
      >
        <span className="col-span-3">{messages.columns.category}</span>
        <span className="col-span-4 inline-flex items-center gap-1.5">
          <span className="h-3 w-0.5 rounded-full bg-ink" />
          {messages.paceLegend}
        </span>
        <span className="col-span-3 text-right">{messages.columns.amount}</span>
        <span className="col-span-2">{messages.columns.status}</span>
      </div>
      <ul data-slot="budget-rows" className="flex flex-col gap-4 lg:gap-0">
        {lines.map((line) => (
          <BudgetRow
            key={line.categoryAccountId}
            line={line}
            name={nameOf(line.categoryAccountId)}
            icon={iconOf(line.categoryAccountId)}
            elapsedPercent={periodProgress.elapsedPercent}
          />
        ))}
      </ul>
    </Card>
  )
}

function BudgetRow({ line, name, icon, elapsedPercent }: BudgetRowProps) {
  const status = STATUS[line.status]
  return (
    <li className="flex items-start gap-3 lg:grid lg:min-h-12 lg:grid-cols-12 lg:items-center lg:gap-4 lg:border-t lg:border-border lg:first:border-t-0">
      <CategoryArt name={name} icon={icon} className="lg:size-8" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 lg:contents">
        <div className="flex items-baseline justify-between gap-2 lg:contents">
          <span
            data-slot="budget-name"
            className="text-body font-semibold lg:order-1 lg:col-span-2"
          >
            {name}
          </span>
          <span className="text-body-sm font-medium tabular-nums lg:order-3 lg:col-span-3 lg:text-right">
            {messages.of(formatWholeReais(line.spentCents), formatWholeReais(line.limitCents))}
          </span>
        </div>
        <ProgressBar
          className="lg:order-2 lg:col-span-4"
          percent={line.limitCents > 0 ? (line.spentCents / line.limitCents) * FULL : 0}
          markPercent={elapsedPercent}
          tone={line.status}
        />
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-body-sm font-semibold lg:order-4 lg:col-span-2',
            status.text,
          )}
        >
          <TwiseIcon name={status.icon} tone={status.tone} size="sm" />
          <ResponsiveText short={noteOf(line)} long={messages.status[line.status]} />
        </span>
      </div>
    </li>
  )
}

function noteOf(line: BudgetLine): string {
  if (line.status === 'over') {
    return messages.note.over(formatBrl(line.overCents))
  }
  return line.status === 'ahead' ? messages.note.ahead(line.aheadPoints) : messages.status.within
}

function byDistanceAhead(left: BudgetLine, right: BudgetLine): number {
  return right.spentCents - right.expectedCents - (left.spentCents - left.expectedCents)
}
