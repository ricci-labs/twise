import { type PeriodsOfYear, parseIsoDate } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { periodsQueryOptions } from '@web/features/entries/api/entries.queries'
import { EntriesList } from '@web/features/entries/components/entries-list'
import { EntriesPeriod } from '@web/features/entries/components/entries-period'
import { shownLabelOf, shownRangeOf } from '@web/features/entries/components/shown-range'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { EntriesListSearch, EntriesPageProps } from '@web/features/entries/entries.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { hasPermission } from '@web/lib/permissions'

const messages = entriesMessages.list

export function EntriesPage(props: EntriesPageProps) {
  usePageTitle(messages.pageTitle)
  const { workspaceId, permissions } = props
  return (
    <PageFrame className="gap-3 lg:gap-4">
      <PageHeader
        title={messages.title}
        actions={
          hasPermission(permissions, 'entries', 'delete') && (
            <Link
              to="/w/$workspaceId/$area"
              params={{ workspaceId, area: 'trash' }}
              aria-label={messages.trash}
              className="grid size-touch place-items-center rounded-full text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <TwiseIcon name="trash" size="md" />
            </Link>
          )
        }
      />
      <EntriesBody {...props} />
    </PageFrame>
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
      <EntriesPeriod {...props} shown={shown} periods={periods} />
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
