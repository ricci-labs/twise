import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { Card } from '@web/components/display/card'
import { RichText } from '@web/components/display/rich-text'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { insightAction, insightText } from '@web/features/home/components/insight-text'
import { homeMessages } from '@web/features/home/home.messages'
import type { InsightItemProps, InsightsCardProps } from '@web/features/home/home.types'
import { useState } from 'react'

const messages = homeMessages.insights
const VISIBLE = 3
const WRITE_ACTIONS = new Set(['occurrence_overdue', 'contact_overdue', 'variable_income_to_split'])
const SEVERITY_ICON = {
  alert: { name: 'alert', tone: 'danger' },
  warning: { name: 'warn', tone: 'warning' },
  info: { name: 'info', tone: 'info' },
} as const

export function InsightsCard({
  workspaceId,
  overview,
  nameOf,
  canWrite,
  className,
}: InsightsCardProps) {
  const [isShowingAll, setIsShowingAll] = useState(false)
  const insights = overview.insights.filter((insight) => insightText(insight, nameOf) !== null)
  const shown = isShowingAll ? insights : insights.slice(0, VISIBLE)
  return (
    <Card
      title={messages.title}
      description={messages.description}
      layout={insights.length === 0 ? 'centered' : 'list'}
      className={className}
      footerAction={
        insights.length > VISIBLE && (
          <Button variant="tertiary" size="sm" onClick={() => setIsShowingAll((all) => !all)}>
            {isShowingAll ? messages.seeFewer : messages.seeAll(insights.length)}
          </Button>
        )
      }
    >
      {insights.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <TwiseIcon name="ok" tone="success" />
          <p className="text-body font-semibold">{messages.calm}</p>
          <p className="text-body-sm text-ink-muted">{messages.calmDetail}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {shown.map((insight) => (
            <InsightItem
              key={`${insight.code}-${insight.subject}`}
              workspaceId={workspaceId}
              insight={insight}
              nameOf={nameOf}
              canWrite={canWrite}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

function InsightItem({ workspaceId, insight, nameOf, canWrite }: InsightItemProps) {
  const text = insightText(insight, nameOf)
  const action = insightAction(insight)
  const icon = SEVERITY_ICON[insight.severity]
  const showsAction = action && (canWrite || !WRITE_ACTIONS.has(insight.code))
  if (!text) {
    return null
  }
  return (
    <li className="flex gap-3 rounded-lg border border-border px-3.5 py-3">
      <TwiseIcon name={icon.name} tone={icon.tone} size="md" className="mt-0.5" />
      <div className="flex flex-col items-start gap-1.5">
        <p className="text-body">
          <RichText text={text.template} values={text.values} />
        </p>
        {showsAction && (
          <TextLink
            render={
              action.hash ? (
                <Link
                  to="/w/$workspaceId"
                  params={{ workspaceId }}
                  search={(search) => search}
                  hash={action.hash}
                />
              ) : (
                <Link to="/w/$workspaceId/$area" params={{ workspaceId, area: action.area }} />
              )
            }
          >
            {action.label}
          </TextLink>
        )}
      </div>
    </li>
  )
}
