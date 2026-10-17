import type { RecurringEntryType } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { PlanSummaryTiles } from '@web/components/finance/plan-summary-tiles'
import { RecurrenceRow } from '@web/components/finance/recurrence-row'
import { TwiseIcon } from '@web/components/icons/twise-icon'
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
import { RecurrencesDesktop } from '@web/features/planning/components/recurrences-desktop'
import { planningMessages } from '@web/features/planning/planning.messages'
import { NEW_RECURRENCE } from '@web/features/planning/planning.schemas'
import type { RecurrenceGroupKey, RecurrencesTabProps } from '@web/features/planning/planning.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'

const messages = planningMessages.recurrences
const SKELETON_ROWS = 5
const TYPE_OF_GROUP: Record<RecurrenceGroupKey, RecurringEntryType> = {
  bills: 'expense',
  income: 'income',
  transfers: 'transfer',
}

export function RecurrencesTab({ workspaceId, permissions }: RecurrencesTabProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
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
  const canCreate = hasPermission(permissions, 'planning', 'create')
  if (recurrences.data.items.length === 0) {
    return <Empty workspaceId={workspaceId} canCreate={canCreate} />
  }
  const canUpdate = hasPermission(permissions, 'planning', 'update')
  const canDelete = hasPermission(permissions, 'planning', 'delete')
  const byId = new Map(recurrences.data.items.map((item) => [item.id, item]))
  const context = {
    today: periods.data.today,
    accounts: new Map(accounts.data.map((account) => [account.id, account])),
  }
  if (isDesktop) {
    return (
      <RecurrencesDesktop
        workspaceId={workspaceId}
        list={recurrences.data}
        context={context}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        addLinkOf={(key) => newRecurrenceLink(workspaceId, TYPE_OF_GROUP[key])}
      />
    )
  }
  const groups = recurrenceGroupsOf(recurrences.data, context)
  return (
    <>
      <PlanSummaryTiles label={messages.summaryLabel} tiles={recurrenceTilesOf(recurrences.data)} />
      {groups.map((group) => (
        <OccurrenceGroup
          key={group.key}
          title={group.title}
          count={group.rows.length}
          add={
            canCreate
              ? {
                  label: messages.add[group.key],
                  link: newRecurrenceLink(workspaceId, TYPE_OF_GROUP[group.key]),
                }
              : undefined
          }
        >
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

function Empty({ workspaceId, canCreate }: { workspaceId: string; canCreate: boolean }) {
  return (
    <EmptyBlock
      icon="calendar"
      title={messages.empty}
      text={messages.emptyText}
      action={
        canCreate && (
          <div className="grid justify-center gap-4">
            <Button render={newRecurrenceLink(workspaceId, 'expense')}>
              <TwiseIcon name="plus" size="sm" />
              {messages.add.bills}
            </Button>
            <Button variant="secondary" render={newRecurrenceLink(workspaceId, 'income')}>
              <TwiseIcon name="plus" size="sm" />
              {messages.add.income}
            </Button>
          </div>
        )
      }
    />
  )
}

function newRecurrenceLink(workspaceId: string, recurrenceType: RecurringEntryType) {
  return (
    <Link
      to="/w/$workspaceId/planning/$tab"
      params={{ workspaceId, tab: 'recurrences' }}
      search={(previous) => ({ ...previous, recurrence: NEW_RECURRENCE, recurrenceType })}
    />
  )
}
