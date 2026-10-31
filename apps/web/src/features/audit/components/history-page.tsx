import { todayIn } from '@financas/shared'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { AuditEventRow } from '@web/components/display/audit-event-row'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListEnd } from '@web/components/feedback/list-end'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { showToast } from '@web/components/feedback/toast'
import { EntryDayGroup } from '@web/components/finance/entry-day-group'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { auditQueryOptions } from '@web/features/audit/api/audit.queries'
import { auditMessages as messages } from '@web/features/audit/audit.messages'
import type {
  HistoryDaysProps,
  HistoryEmptyProps,
  HistoryFilter,
  HistoryItemProps,
  HistoryListProps,
  HistoryMoreProps,
  HistoryPageProps,
  HistorySearch,
} from '@web/features/audit/audit.types'
import { AuditChangeSheet } from '@web/features/audit/components/audit-change-sheet'
import {
  auditDaysOf,
  auditRowDetailOf,
  auditSentenceOf,
} from '@web/features/audit/components/audit-views'
import { HistoryFilters } from '@web/features/audit/components/history-filters'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { X } from 'lucide-react'
import { useEffect } from 'react'

const TIME_ZONE = 'America/Sao_Paulo'
const INVALID_QUERY = 'AUDIT_QUERY_INVALID'
const ENTRIES = 'journal_entries'
const SKELETON_ROWS = 6
const NO_FILTERS = { area: undefined, actor: undefined, item: undefined, event: undefined }

export function HistoryPage(props: HistoryPageProps) {
  usePageTitle(messages.pageTitle)
  return (
    <PageFrame className="gap-4 lg:gap-6">
      <PageHeader
        title={messages.title}
        description={messages.lead(props.workspaceName)}
        descriptionOn="always"
      />
      {!props.search.item && <HistoryFilters {...props} />}
      <HistoryList {...props} today={todayIn(TIME_ZONE, new Date())} />
    </PageFrame>
  )
}

function HistoryList(props: HistoryListProps) {
  const { workspaceId, search, onSearchChange, today } = props
  const list = useInfiniteQuery(auditQueryOptions(workspaceId, filterOf(search)))
  const isInvalid = list.error instanceof ApiError && list.error.code === INVALID_QUERY
  useEffect(() => {
    if (isInvalid) {
      onSearchChange(NO_FILTERS)
      showToast(messages.invalidFilters)
    }
  }, [isInvalid, onSearchChange])

  if (list.isError && !isInvalid && !list.data) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={list.error instanceof ApiError ? list.error.ref : null}
        isRetrying={list.isFetching}
        onRetry={() => void list.refetch()}
      />
    )
  }
  if (!list.data) {
    return <ListSkeleton rows={SKELETON_ROWS} art="circle" />
  }
  const events = list.data.pages.flatMap((page) => page.items)
  if (events.length === 0) {
    return <HistoryEmpty search={search} onSearchChange={onSearchChange} />
  }
  const shown = events.find((event) => event.id === search.event)
  const [first] = events
  return (
    <>
      {search.item && first && (
        <HistoryItem
          event={first}
          onClear={() => onSearchChange({ item: undefined, event: undefined })}
        />
      )}
      <HistoryDays workspaceId={workspaceId} days={auditDaysOf(events, today)} />
      <HistoryMore list={list} />
      {shown && (
        <AuditChangeSheet
          workspaceId={workspaceId}
          event={shown}
          today={today}
          onClose={() => onSearchChange({ event: undefined })}
        />
      )}
    </>
  )
}

function HistoryItem({ event, onClear }: HistoryItemProps) {
  const isEntry = event.tableName === ENTRIES
  const overline = isEntry ? messages.item.entry : messages.item.other
  return (
    <section
      aria-label={overline}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface py-2.5 pr-2 pl-4"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sunken text-ink">
        <TwiseIcon name={isEntry ? 'list' : 'history'} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-note text-ink-muted">{overline}</span>
        <strong className="line-clamp-2 text-row break-words">{event.entityLabel}</strong>
      </span>
      <Button variant="quiet" size="icon" aria-label={messages.item.clear} onClick={onClear}>
        <X aria-hidden="true" />
      </Button>
    </section>
  )
}

function HistoryEmpty({ search, onSearchChange }: HistoryEmptyProps) {
  if (hasFilters(search)) {
    return (
      <EmptyBlock
        icon="history"
        title={messages.nothingFound}
        action={
          <Button variant="secondary" onClick={() => onSearchChange(NO_FILTERS)}>
            {messages.clearFilters}
          </Button>
        }
      />
    )
  }
  return <EmptyBlock icon="history" title={messages.empty} text={messages.emptyText} />
}

function HistoryDays({ days, selectedId }: HistoryDaysProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {days.map((day) => (
        <EntryDayGroup key={day.date} title={day.title}>
          {day.events.map((event) => (
            <AuditEventRow
              key={event.id}
              actorName={event.actor?.name ?? null}
              sentence={auditSentenceOf(event)}
              detail={auditRowDetailOf(event)}
              isWhatsApp={event.source === 'whatsapp'}
              isSelected={event.id === selectedId}
              link={<Link to="." search={(previous) => ({ ...previous, event: event.id })} />}
            />
          ))}
        </EntryDayGroup>
      ))}
    </div>
  )
}

function HistoryMore({ list }: HistoryMoreProps) {
  if (!list.hasNextPage) {
    return <ListEnd message={messages.end} />
  }
  if (list.isFetchNextPageError) {
    return (
      <div className="flex flex-col items-center gap-2 pt-2 text-body-sm text-ink-muted">
        <p>{messages.moreFailed}</p>
        <Button variant="secondary" size="sm" onClick={() => void list.fetchNextPage()}>
          {messages.retry}
        </Button>
      </div>
    )
  }
  return (
    <ShowMoreButton isLoading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
  )
}

function filterOf(search: HistorySearch): HistoryFilter {
  return {
    ...(search.area ? { area: search.area } : {}),
    ...(search.actor ? { actorId: search.actor } : {}),
    ...(search.item ? { rowId: search.item } : {}),
  }
}

function hasFilters(search: HistorySearch): boolean {
  return Boolean(search.area || search.actor || search.item)
}
