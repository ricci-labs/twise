import { formatBrl } from '@financas/shared'
import { IncomeBar } from '@web/components/charts/income-bar'
import { PaceRing } from '@web/components/charts/pace-ring'
import { Card } from '@web/components/display/card'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { homeMessages } from '@web/features/home/home.messages'
import type { PaceCardProps, PaceVerdictProps } from '@web/features/home/home.types'

const messages = homeMessages.pace

export function PaceCard({ overview, stage, className }: PaceCardProps) {
  const { metrics } = overview
  const share = metrics.incomeShare
  if (stage === 'future' || !share) {
    return null
  }
  if (stage === 'closed') {
    return (
      <Card
        className={className}
        title={messages.closedTitle}
        description={messages.closedDescription(formatBrl(metrics.budgetIncome))}
        footerStat={messages.leftToReserve}
      >
        <IncomeBar
          segments={[
            {
              key: 'spent',
              tone: 'spent',
              label: messages.spent,
              percent: share.spentPercent,
              percentLabel: `${share.spentPercent}%`,
              amountLabel: formatBrl(metrics.spent),
            },
            {
              key: 'left',
              tone: 'free',
              label: messages.left,
              percent: share.freePercent,
              percentLabel: `${share.freePercent}%`,
              amountLabel: formatBrl(Math.max(metrics.freeToSpend, 0)),
            },
          ]}
        />
      </Card>
    )
  }
  const pace = metrics.periodPace
  if (!pace) {
    return null
  }
  return (
    <Card
      className={className}
      layout="centered"
      title={messages.title}
      description={messages.description}
      footerStat={<PaceVerdict pointsAhead={pace.pointsAhead} />}
    >
      <PaceRing
        usedPercent={pace.usedPercent}
        elapsedPercent={pace.elapsedPercent}
        centerLabel={`${pace.usedPercent}%`}
        centerCaption={messages.ofIncome}
        description={messages.alternative(pace.usedPercent, pace.elapsedPercent)}
      />
      <dl className="mt-4 flex flex-col gap-1.5 text-body">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="h-0.75 w-4 rounded-full bg-chart-2" />
          <dt className="flex-1">{messages.used}</dt>
          <dd className="font-semibold tabular-nums">{pace.usedPercent}%</dd>
        </div>
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="h-0.75 w-4 rounded-full bg-ink-muted" />
          <dt className="flex-1">{messages.elapsed}</dt>
          <dd className="font-semibold tabular-nums">{pace.elapsedPercent}%</dd>
        </div>
      </dl>
    </Card>
  )
}

function PaceVerdict({ pointsAhead }: PaceVerdictProps) {
  if (pointsAhead > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-warning">
        <TwiseIcon name="warn" tone="warning" size="sm" />
        {messages.ahead(pointsAhead)}
      </span>
    )
  }
  return <span>{pointsAhead < 0 ? messages.behind(-pointsAhead) : messages.onPace}</span>
}
