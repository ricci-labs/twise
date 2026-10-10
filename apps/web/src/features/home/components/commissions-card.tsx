import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { ProgressBar } from '@web/components/charts/progress-bar'
import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { Card } from '@web/components/display/card'
import { homeMessages } from '@web/features/home/home.messages'
import type { CommissionsCardProps } from '@web/features/home/home.types'
import { Split } from 'lucide-react'

const messages = homeMessages.commissions
const FULL = 100

export function CommissionsCard({
  workspaceId,
  overview,
  canWrite,
  className,
}: CommissionsCardProps) {
  const { variableIncome, variableAverage, variableVsAverage } = overview.metrics
  if (variableIncome === 0 && variableAverage === null) {
    return null
  }
  const largest = Math.max(variableIncome, variableAverage ?? 0, 1)
  return (
    <Card
      className={className}
      title={messages.title}
      description={messages.description}
      footerStat={
        variableVsAverage && (
          <Badge tone={variableVsAverage.percent >= 0 ? 'success' : 'warning'}>
            {variableVsAverage.percent >= 0
              ? messages.above(variableVsAverage.percent)
              : messages.below(-variableVsAverage.percent)}
          </Badge>
        )
      }
      footerAction={
        canWrite &&
        variableIncome > 0 && (
          <Button
            variant="secondary"
            size="sm"
            data-write=""
            render={
              <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'commission-split' }} />
            }
          >
            <Split aria-hidden="true" />
            {messages.split}
          </Button>
        )
      }
    >
      <dl className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <dt className="text-body-sm text-ink-muted">{messages.thisPeriod}</dt>
          <dd className="flex flex-col gap-1">
            <ProgressBar percent={(variableIncome / largest) * FULL} tone="strong" />
            <Amount cents={variableIncome} />
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-body-sm text-ink-muted">{messages.average}</dt>
          <dd className="flex flex-col gap-1">
            {variableAverage === null ? (
              '—'
            ) : (
              <>
                <ProgressBar percent={(variableAverage / largest) * FULL} tone="muted" />
                <Amount cents={variableAverage} />
              </>
            )}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
