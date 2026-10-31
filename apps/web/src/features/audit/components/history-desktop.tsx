import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { TextLink } from '@web/components/actions/text-link'
import { AuditChange } from '@web/components/display/audit-change'
import { WorkScreen } from '@web/components/layout/work-screen'
import { auditQueryOptions } from '@web/features/audit/api/audit.queries'
import { auditMessages } from '@web/features/audit/audit.messages'
import type {
  HistoryDetailProps,
  HistoryShownProps,
  HistoryTrailProps,
} from '@web/features/audit/audit.types'
import {
  auditChangeDetailOf,
  auditChangeRowsOf,
  auditDaysOf,
  auditTitleOf,
  auditTrailTextOf,
  canOpenItem,
  isEntryEvent,
  referenceOf,
} from '@web/features/audit/components/audit-views'
import { HistoryFilters } from '@web/features/audit/components/history-filters'
import {
  HistoryAutoMore,
  HistoryDays,
  HistoryItem,
  HistoryMore,
} from '@web/features/audit/components/history-parts'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { TALL_QUERY } from '@web/lib/breakpoints'

const messages = auditMessages.desktop
const TRAIL_SIZE = 3

export function HistoryDesktop(props: HistoryShownProps) {
  const { workspaceId, search, onSearchChange, today, list, events } = props
  const isTall = useMediaQuery(TALL_QUERY)
  const shown = events.find((event) => event.id === search.event) ?? events[0]
  const [first] = events
  const canLoadMore = list.hasNextPage && !list.isFetchingNextPage && !list.isFetchNextPageError
  const loadMore = canLoadMore ? () => void list.fetchNextPage() : undefined
  return (
    <WorkScreen
      listLabel={messages.list}
      listHeader={
        search.item && first ? (
          <HistoryItem
            event={first}
            isFramed={false}
            onClear={() => onSearchChange({ item: undefined, event: undefined })}
          />
        ) : (
          <HistoryFilters {...props} />
        )
      }
      list={
        <>
          <HistoryDays days={auditDaysOf(events, today)} selectedId={shown?.id} />
          {isTall ? <HistoryAutoMore list={list} /> : <HistoryMore list={list} />}
        </>
      }
      detailLabel={auditMessages.change.title}
      detailHeader={
        <>
          <h2 className="flex-1 text-card-title">{auditMessages.change.title}</h2>
          {shown && canOpenItem(shown) && (
            <Button
              variant="secondary"
              size="sm"
              render={
                <Link
                  to="/w/$workspaceId/entries/$entry"
                  params={{ workspaceId, entry: shown.rowId }}
                />
              }
            >
              {auditMessages.change.openEntry}
            </Button>
          )}
        </>
      }
      detail={shown && <HistoryDetail {...props} event={shown} />}
      onNearEnd={loadMore}
    />
  )
}

function HistoryDetail({ workspaceId, search, event, today }: HistoryDetailProps) {
  return (
    <div className="flex flex-col gap-5">
      <AuditChange
        actorName={event.actor?.name ?? null}
        title={auditTitleOf(event)}
        detail={auditChangeDetailOf(event, today)}
        rows={auditChangeRowsOf(event)}
        reference={referenceOf(event)}
      />
      <HistoryTrail
        workspaceId={workspaceId}
        event={event}
        today={today}
        hasAllLink={search.item !== event.rowId}
      />
    </div>
  )
}

function HistoryTrail({ workspaceId, event, today, hasAllLink }: HistoryTrailProps) {
  const trail = useInfiniteQuery({
    ...auditQueryOptions(workspaceId, { rowId: event.rowId }),
    select: (data) => data.pages.flatMap((page) => page.items).slice(0, TRAIL_SIZE),
  })
  if (!trail.data || trail.data.length === 0) {
    return null
  }
  const isEntry = isEntryEvent(event)
  return (
    <section
      aria-label={isEntry ? messages.trailEntry : messages.trailOther}
      className="flex flex-col gap-3 border-t border-border pt-4"
    >
      <h3 className="text-title-sm">{isEntry ? messages.trailEntry : messages.trailOther}</h3>
      <ol className="flex flex-col gap-3 border-l border-border pl-4">
        {trail.data.map((step) => (
          <li
            key={step.id}
            aria-current={step.id === event.id ? 'true' : undefined}
            className="relative flex flex-col before:absolute before:top-1.5 before:-left-5.25 before:size-2 before:rounded-full before:bg-border-control aria-current:before:bg-ink"
          >
            <strong className="text-label">{auditTrailTextOf(step)}</strong>
            <span className="text-note text-ink-muted">{auditChangeDetailOf(step, today)}</span>
          </li>
        ))}
      </ol>
      {hasAllLink && (
        <TextLink
          className="self-start"
          render={<Link to="." search={{ item: event.rowId, event: event.id }} />}
        >
          {isEntry ? messages.allOfEntry : messages.allOfItem}
        </TextLink>
      )}
    </section>
  )
}
