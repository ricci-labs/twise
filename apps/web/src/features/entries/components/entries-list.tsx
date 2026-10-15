import { addMonths, parseIsoDate, toYearMonthLabel } from '@financas/shared'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { ListSummary } from '@web/components/display/list-summary'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListEnd } from '@web/components/feedback/list-end'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { showToast } from '@web/components/feedback/toast'
import { EntryDayGroup } from '@web/components/finance/entry-day-group'
import { EntryRow } from '@web/components/finance/entry-row'
import {
  accountsQueryOptions,
  entriesListQueryOptions,
  entrySummaryQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { entryDaysOf } from '@web/features/entries/components/entry-days'
import { entryRowOf } from '@web/features/entries/components/entry-row-view'
import {
  hasFiltersIn,
  listFilterOf,
  searchTextOf,
} from '@web/features/entries/components/shown-range'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type {
  EntriesDaysProps,
  EntriesEmptyProps,
  EntriesHeadlineProps,
  EntriesListEndProps,
  EntriesListProps,
  EntriesMoreProps,
  EntriesResultsProps,
} from '@web/features/entries/entries.types'
import { ApiError } from '@web/lib/api/api-error'
import { formatMonthLabel } from '@web/lib/format/calendar'
import { hasPermission } from '@web/lib/permissions'
import { Plus } from 'lucide-react'
import { useEffect, useMemo } from 'react'

const messages = entriesMessages.list
const INVALID_QUERY = 'ENTRY_QUERY_INVALID'
const NO_FILTERS = {
  q: undefined,
  everywhere: undefined,
  types: undefined,
  accountId: undefined,
  categoryId: undefined,
  spentBy: undefined,
  shared: undefined,
}

export function EntriesList(props: EntriesListProps) {
  const { workspaceId, search, onSearchChange } = props
  const filter = listFilterOf(search, props.shown)
  const list = useInfiniteQuery(entriesListQueryOptions(workspaceId, filter))
  const summary = useQuery(entrySummaryQueryOptions(workspaceId, filter))
  const accounts = useQuery(accountsQueryOptions(workspaceId))
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
  if (!list.data || !accounts.data) {
    return <ListSkeleton rows={5} />
  }
  const entries = list.data.pages.flatMap((page) => page.items)
  const hasFilters = hasFiltersIn(search) || searchTextOf(search) !== undefined
  if (entries.length === 0) {
    return <EntriesEmpty {...props} hasFilters={hasFilters} />
  }
  return (
    <>
      {summary.data && <EntriesHeadline {...props} summary={summary.data} />}
      <EntriesDays {...props} entries={entries} accounts={accounts.data} />
      <EntriesMore {...props} list={list} hasFilters={hasFilters} />
    </>
  )
}

function EntriesEmpty({ permissions, onSearchChange, hasFilters }: EntriesEmptyProps) {
  if (hasFilters) {
    return (
      <EmptyBlock
        icon="receipt"
        title={messages.nothingFound}
        action={
          <Button variant="secondary" onClick={() => onSearchChange(NO_FILTERS)}>
            {messages.clearFilters}
          </Button>
        }
      />
    )
  }
  return (
    <EmptyBlock
      icon="calendar"
      title={messages.emptyPeriod}
      action={
        hasPermission(permissions, 'entries', 'create') && (
          <Button render={<Link to="." search={(previous) => ({ ...previous, entry: 'new' })} />}>
            <Plus aria-hidden="true" />
            {messages.newEntry}
          </Button>
        )
      }
    />
  )
}

function EntriesDays({
  workspaceId,
  entries,
  accounts,
  memberDirectory,
  currentUserId,
  search,
  today,
}: EntriesDaysProps) {
  const context = useMemo(
    () => ({
      accounts: new Map(accounts.map((account) => [account.id, account])),
      memberNames: new Map(memberDirectory.map((member) => [member.userId, member.displayName])),
      currentUserId,
    }),
    [accounts, memberDirectory, currentUserId],
  )
  return (
    <div className="flex flex-col gap-3.5">
      {entryDaysOf(entries, today).map((day) => (
        <EntryDayGroup key={day.date} title={day.title} detail={day.detail}>
          {day.entries.map((entry) => {
            const row = entryRowOf(entry, context)
            return (
              <EntryRow
                key={row.id}
                description={row.description}
                detail={row.detail}
                art={row.art}
                amountCents={row.amountCents}
                direction={row.direction}
                installmentCount={row.installmentCount}
                isShared={row.isShared}
                search={searchTextOf(search)}
                link={
                  <Link
                    to="/w/$workspaceId/entries/$entry"
                    params={{ workspaceId, entry: row.id }}
                  />
                }
              />
            )
          })}
        </EntryDayGroup>
      ))}
    </div>
  )
}

function EntriesMore(props: EntriesMoreProps) {
  const { list } = props
  if (!list.hasNextPage) {
    return <EntriesListEnd {...props} />
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

function EntriesHeadline({ summary, ...props }: EntriesHeadlineProps) {
  if (searchTextOf(props.search)) {
    return <EntriesResults {...props} count={summary.count} />
  }
  return <ListSummary {...summary} />
}

function EntriesResults({ search, onSearchChange, shown, count }: EntriesResultsProps) {
  const isEverywhere = search.everywhere === true
  const where = isEverywhere ? messages.everywhere : placeOf(shown)
  return (
    <p
      role="status"
      className="flex flex-wrap items-center gap-x-1 text-row-detail font-medium text-ink-muted"
    >
      {messages.results(count, where)}
      {!isEverywhere && (
        <Button
          variant="tertiary"
          size="xs"
          className="px-0"
          onClick={() => onSearchChange({ everywhere: true })}
        >
          {messages.searchEverywhere}
        </Button>
      )}
    </p>
  )
}

function placeOf(shown: EntriesResultsProps['shown']): string {
  return shown.kind === 'range' && shown.detail ? shown.detail : shown.title
}

function EntriesListEnd({ shown, search, hasFilters }: EntriesListEndProps) {
  if (search.everywhere && searchTextOf(search)) {
    return <ListEnd message={messages.endOfSearch} />
  }
  if (shown.kind === 'range') {
    return <ListEnd message={messages.endOfRange} />
  }
  const label = formatMonthLabel(shown.period.label)
  if (hasFilters) {
    return <ListEnd message={messages.endOfFiltered(label)} />
  }
  const previous = toYearMonthLabel(addMonths(parseIsoDate(`${shown.period.label}-01`), -1))
  return (
    <ListEnd
      message={messages.endOf(label)}
      previous={{
        label: messages.see(formatMonthLabel(previous)),
        link: (
          <Link
            to="."
            search={(current) => ({
              ...current,
              period: previous,
              from: undefined,
              to: undefined,
              preset: undefined,
            })}
          />
        ),
      }}
    />
  )
}
