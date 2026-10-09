import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { Card } from '@web/components/display/card'
import { homeMessages } from '@web/features/home/home.messages'
import type { CommissionsCardProps } from '@web/features/home/home.types'

const messages = homeMessages.commissions

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
  return (
    <Card
      className={className}
      title={messages.title}
      description={messages.description}
      footerAction={
        canWrite &&
        variableIncome > 0 && (
          <Button
            variant="outline"
            size="sm"
            data-write=""
            render={
              <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: 'commission-split' }} />
            }
          >
            {messages.split}
          </Button>
        )
      }
    >
      <dl className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <dt className="text-body-sm text-ink-muted">{messages.thisPeriod}</dt>
          <dd>
            <Amount cents={variableIncome} size="lg" />
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-body-sm text-ink-muted">{messages.average}</dt>
          <dd>{variableAverage === null ? '—' : <Amount cents={variableAverage} size="lg" />}</dd>
        </div>
      </dl>
      {variableVsAverage && (
        <Badge
          tone={variableVsAverage.percent >= 0 ? 'success' : 'warning'}
          className="mt-3 self-start"
        >
          {variableVsAverage.percent >= 0
            ? messages.above(variableVsAverage.percent)
            : messages.below(-variableVsAverage.percent)}
        </Badge>
      )}
    </Card>
  )
}
