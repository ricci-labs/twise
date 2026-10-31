import { todayIn } from '@financas/shared'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { showToast } from '@web/components/feedback/toast'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { auditQueryOptions } from '@web/features/audit/api/audit.queries'
import { auditMessages as messages } from '@web/features/audit/audit.messages'
import type {
  HistoryFilter,
  HistoryListProps,
  HistoryPageProps,
  HistorySearch,
  HistoryShownProps,
} from '@web/features/audit/audit.types'
import { AuditChangeSheet } from '@web/features/audit/components/audit-change-sheet'
import { auditDaysOf } from '@web/features/audit/components/audit-views'
import { HistoryDesktop } from '@web/features/audit/components/history-desktop'
import { HistoryFilters } from '@web/features/audit/components/history-filters'
import {
  HistoryDays,
  HistoryEmpty,
  HistoryItem,
  HistoryMore,
  NO_FILTERS,
} from '@web/features/audit/components/history-parts'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { useEffect } from 'react'

const TIME_ZONE = 'America/Sao_Paulo'
const INVALID_QUERY = 'AUDIT_QUERY_INVALID'
const SKELETON_ROWS = 6

export function HistoryPage(props: HistoryPageProps) {
  usePageTitle(messages.pageTitle)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  return (
    <PageFrame className="gap-4 lg:gap-6 lg:tall:h-screen-safe">
      <PageHeader
        title={messages.title}
        description={messages.lead(props.workspaceName)}
        descriptionOn="always"
      />
      {!(isDesktop || props.search.item) && <HistoryFilters {...props} />}
      <HistoryList {...props} isDesktop={isDesktop} today={todayIn(TIME_ZONE, new Date())} />
    </PageFrame>
  )
}

function HistoryList(props: HistoryListProps) {
  const { workspaceId, search, onSearchChange } = props
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
  if (props.isDesktop) {
    return <HistoryDesktop {...props} list={list} events={events} />
  }
  return <HistoryPhone {...props} list={list} events={events} />
}

function HistoryPhone({
  workspaceId,
  search,
  onSearchChange,
  today,
  list,
  events,
}: HistoryShownProps) {
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
      <HistoryDays days={auditDaysOf(events, today)} />
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

function filterOf(search: HistorySearch): HistoryFilter {
  return {
    ...(search.area ? { area: search.area } : {}),
    ...(search.actor ? { actorId: search.actor } : {}),
    ...(search.item ? { rowId: search.item } : {}),
  }
}
