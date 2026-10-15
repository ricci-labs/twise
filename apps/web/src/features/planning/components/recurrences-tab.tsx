import { useQuery } from '@tanstack/react-query'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { PlanSummaryTiles } from '@web/components/finance/plan-summary-tiles'
import { RecurrenceRow } from '@web/components/finance/recurrence-row'
import {
  accountsQueryOptions,
  periodsQueryOptions,
  recurrencesQueryOptions,
} from '@web/features/planning/api/planning.queries'
import { RecurrenceActions } from '@web/features/planning/components/recurrence-actions'
import {
  recurrenceGroupsOf,
  recurrenceTilesOf,
} from '@web/features/planning/components/recurrence-rows'
import { planningMessages } from '@web/features/planning/planning.messages'
import type { RecurrencesTabProps } from '@web/features/planning/planning.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { hasPermission } from '@web/lib/permissions'

const messages = planningMessages.recurrences
const SKELETON_ROWS = 5

export function RecurrencesTab({ workspaceId, permissions }: RecurrencesTabProps) {
  usePageTitle(messages.pageTitle)
  const recurrences = useQuery(recurrencesQueryOptions(workspaceId))
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const periods = useQuery(periodsQueryOptions(workspaceId, undefined))
  const failed = [recurrences, accounts, periods].find((query) => query.isError)
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
  if (!recurrences.data || !accounts.data || !periods.data) {
    return <ListSkeleton rows={SKELETON_ROWS} />
  }
  if (recurrences.data.items.length === 0) {
    return <EmptyBlock icon="calendar" title={messages.empty} text={messages.emptyText} />
  }
  const canUpdate = hasPermission(permissions, 'planning', 'update')
  const canDelete = hasPermission(permissions, 'planning', 'delete')
  const byId = new Map(recurrences.data.items.map((item) => [item.id, item]))
  const groups = recurrenceGroupsOf(recurrences.data, {
    today: periods.data.today,
    accounts: new Map(accounts.data.map((account) => [account.id, account])),
  })
  return (
    <>
      <PlanSummaryTiles label={messages.summaryLabel} tiles={recurrenceTilesOf(recurrences.data)} />
      {groups.map((group) => (
        <OccurrenceGroup key={group.key} title={group.title} count={group.rows.length}>
          {group.rows.map(({ id, ...row }) => {
            const recurrence = byId.get(id)
            return (
              <RecurrenceRow
                key={id}
                {...row}
                link={
                  canUpdate && recurrence ? (
                    <RecurrenceActions
                      workspaceId={workspaceId}
                      recurrence={recurrence}
                      canDelete={canDelete}
                    />
                  ) : undefined
                }
              />
            )
          })}
        </OccurrenceGroup>
      ))}
    </>
  )
}
