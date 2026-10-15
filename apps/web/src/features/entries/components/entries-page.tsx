import { type PeriodsOfYear, parseIsoDate } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { periodsQueryOptions } from '@web/features/entries/api/entries.queries'
import { EntriesFilterBar } from '@web/features/entries/components/entries-filter-bar'
import {
  EntriesFilterButton,
  EntriesFilterChips,
} from '@web/features/entries/components/entries-filters'
import { EntriesList } from '@web/features/entries/components/entries-list'
import { EntriesPeriod } from '@web/features/entries/components/entries-period'
import { EntriesSearch } from '@web/features/entries/components/entries-search'
import { shownLabelOf, shownRangeOf } from '@web/features/entries/components/shown-range'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { EntriesListSearch, EntriesPageProps } from '@web/features/entries/entries.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { hasPermission } from '@web/lib/permissions'

const messages = entriesMessages.list

export function EntriesPage(props: EntriesPageProps) {
  usePageTitle(messages.pageTitle)
  return (
    <PageFrame className="gap-3 lg:gap-4">
      <EntriesHeader {...props} />
      <EntriesBody {...props} />
    </PageFrame>
  )
}

function EntriesHeader({ workspaceId, permissions, search }: EntriesPageProps) {
  if (search.back) {
    return (
      <SubPageHeader
        title={messages.title}
        backLabel={messages.backTo[search.back]}
        back={
          <Link
            to={
              search.back === 'accounts' ? '/w/$workspaceId/accounts' : '/w/$workspaceId/categories'
            }
            params={{ workspaceId }}
          />
        }
      />
    )
  }
  return (
    <PageHeader
      title={messages.title}
      description={messages.description}
      actions={
        hasPermission(permissions, 'entries', 'delete') && (
          <Link
            to="/w/$workspaceId/trash"
            params={{ workspaceId }}
            aria-label={messages.trash}
            className="grid size-touch place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring lg:flex lg:w-auto lg:gap-1.5 lg:rounded-sm lg:px-3 lg:text-label lg:text-mint-ink"
          >
            <TwiseIcon name="trash" size="md" />
            <span className="hidden lg:inline">{messages.trashLink}</span>
          </Link>
        )
      }
    />
  )
}

function EntriesBody(props: EntriesPageProps) {
  const { failed, today, periods, shown } = useShownRange(props.workspaceId, props.search)
  if (failed) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={failed.error instanceof ApiError ? failed.error.ref : null}
        isRetrying={failed.isFetching}
        onRetry={() => void failed.refetch()}
      />
    )
  }
  if (!today || !periods || !shown) {
    return <ListSkeleton rows={5} />
  }
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 lg:gap-2.5">
        <EntriesPeriod {...props} shown={shown} periods={periods} className="w-full lg:w-82.5" />
        <div className="flex w-full gap-2 lg:contents">
          <EntriesSearch
            search={props.search}
            onSearchChange={props.onSearchChange}
            className="min-w-0 lg:min-w-64"
          />
          <EntriesFilterButton {...props} className="lg:hidden" />
        </div>
        <EntriesFilterBar {...props} className="hidden lg:flex" />
      </div>
      <EntriesFilterChips {...props} className="lg:hidden" />
      <EntriesList {...props} shown={shown} today={today} />
    </>
  )
}

function useShownRange(workspaceId: string, search: EntriesListSearch) {
  const current = useQuery(periodsQueryOptions(workspaceId, undefined))
  const label = current.data && shownLabelOf(search, current.data)
  const labelYear = label ? yearOf(label) : undefined
  const isCurrentYear = current.data !== undefined && labelYear === yearOfPeriods(current.data)
  const other = useQuery({
    ...periodsQueryOptions(workspaceId, labelYear),
    enabled: labelYear !== undefined && !isCurrentYear,
  })
  const periods = isCurrentYear ? current.data : other.data
  return {
    failed: [current, other].find((query) => query.isError),
    today: current.data?.today,
    periods,
    shown: periods && shownRangeOf(search, periods),
  }
}

function yearOf(label: string): number {
  return parseIsoDate(`${label}-01`).year
}

function yearOfPeriods(periods: PeriodsOfYear): number | undefined {
  const [first] = periods.periods
  return first && yearOf(first.label)
}
