import { Link } from '@tanstack/react-router'
import { TextLink } from '@web/components/actions/text-link'
import { Card } from '@web/components/display/card'
import { RichText } from '@web/components/display/rich-text'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { insightAction, insightText } from '@web/features/home/components/insight-text'
import { homeMessages } from '@web/features/home/home.messages'
import type { InsightItemProps, InsightsCardProps } from '@web/features/home/home.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { cn } from '@web/lib/cn'
import { useId, useState } from 'react'

const messages = homeMessages.insights
const VISIBLE = 3
const DESKTOP = '(min-width: 64rem)'
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
  const isDesktop = useMediaQuery(DESKTOP)
  const titleId = useId()
  const insights = overview.insights.filter((insight) => insightText(insight, nameOf) !== null)
  const shown = isShowingAll ? insights : insights.slice(0, VISIBLE)
  const toggle = (label: string) =>
    insights.length > VISIBLE && (
      <TextLink
        render={<button type="button" onClick={() => setIsShowingAll((all) => !all)} />}
        className="text-body-sm"
      >
        {isShowingAll ? messages.seeFewer : label}
      </TextLink>
    )
  const list = (
    <ul className="flex flex-col gap-2">
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
  )
  if (isDesktop) {
    return (
      <Card
        title={messages.title}
        description={messages.description}
        layout={insights.length === 0 ? 'centered' : 'list'}
        className={className}
        footerAction={toggle(messages.seeAll(insights.length))}
      >
        {insights.length === 0 ? (
          <div className="flex flex-col items-center gap-1 p-3 text-center">
            <span className="mb-2.5 grid size-13 place-items-center rounded-full bg-success-soft">
              <TwiseIcon name="ok" className="text-success" />
            </span>
            <p className="text-title-sm">{messages.calm}</p>
            <p className="max-w-70 text-body-sm text-ink-muted">{messages.calmDetail}</p>
          </div>
        ) : (
          list
        )}
      </Card>
    )
  }
  return (
    <section aria-labelledby={titleId} className={cn('flex flex-col gap-2.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={titleId} className="font-display text-title">
          {messages.title}
        </h2>
        {toggle(messages.seeAllShort(insights.length))}
      </div>
      {insights.length === 0 ? (
        <p role="status" className="flex items-center gap-3 py-1 text-body">
          <span className="grid size-10 place-items-center rounded-full bg-success-soft">
            <TwiseIcon name="ok" size="md" className="text-success" />
          </span>
          {messages.calm}
        </p>
      ) : (
        list
      )}
    </section>
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
    <li className="flex items-start gap-3 rounded-lg border border-border bg-surface px-3.5 pt-3.5 pb-2.5">
      <TwiseIcon name={icon.name} tone={icon.tone} className="size-7" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <p className="text-body">
          <RichText text={text.template} values={text.values} />
        </p>
        {showsAction && (
          <TextLink
            data-write={WRITE_ACTIONS.has(insight.code) ? '' : undefined}
            render={
              action.hash ? (
                <Link to="." search={(search) => search} hash={action.hash} />
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
