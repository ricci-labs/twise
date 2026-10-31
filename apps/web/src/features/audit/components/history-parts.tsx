import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { AuditEventRow } from '@web/components/display/audit-event-row'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListEnd } from '@web/components/feedback/list-end'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { EntryDayGroup } from '@web/components/finance/entry-day-group'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { auditMessages as messages } from '@web/features/audit/audit.messages'
import type {
  HistoryDaysProps,
  HistoryEmptyProps,
  HistoryItemProps,
  HistoryMoreProps,
  HistorySearch,
} from '@web/features/audit/audit.types'
import {
  auditRowDetailOf,
  auditSentenceOf,
  isEntryEvent,
} from '@web/features/audit/components/audit-views'
import { cn } from '@web/lib/cn'
import { X } from 'lucide-react'

const NEXT_ROWS = 3

export const NO_FILTERS = { area: undefined, actor: undefined, item: undefined, event: undefined }

export function HistoryItem({ event, onClear, isFramed = true }: HistoryItemProps) {
  const isEntry = isEntryEvent(event)
  const overline = isEntry ? messages.item.entry : messages.item.other
  return (
    <section
      aria-label={overline}
      className={cn(
        'flex min-w-0 flex-1 items-center gap-3',
        isFramed && 'rounded-xl border border-border bg-surface py-2.5 pr-2 pl-4',
      )}
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

export function HistoryEmpty({ search, onSearchChange }: HistoryEmptyProps) {
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

export function HistoryDays({ days, selectedId }: HistoryDaysProps) {
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

export function HistoryMore({ list }: HistoryMoreProps) {
  if (!list.hasNextPage) {
    return <ListEnd message={messages.end} />
  }
  if (list.isFetchNextPageError) {
    return <HistoryMoreFailed list={list} />
  }
  return (
    <ShowMoreButton isLoading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()} />
  )
}

export function HistoryAutoMore({ list }: HistoryMoreProps) {
  if (!list.hasNextPage) {
    return <ListEnd message={messages.end} />
  }
  if (list.isFetchNextPageError) {
    return <HistoryMoreFailed list={list} />
  }
  if (!list.isFetchingNextPage) {
    return null
  }
  return (
    <div className="flex flex-col gap-2 pt-3.5" role="status">
      <ListSkeleton rows={NEXT_ROWS} art="circle" />
      <p className="text-center text-body-sm text-ink-muted">{messages.loadingMore}</p>
    </div>
  )
}

export function hasFilters(search: HistorySearch): boolean {
  return Boolean(search.area || search.actor || search.item)
}

function HistoryMoreFailed({ list }: HistoryMoreProps) {
  return (
    <div className="flex flex-col items-center gap-2 pt-3.5 text-body-sm text-ink-muted">
      <p>{messages.moreFailed}</p>
      <Button variant="secondary" size="sm" onClick={() => void list.fetchNextPage()}>
        {messages.retry}
      </Button>
    </div>
  )
}
