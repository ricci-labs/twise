import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { FilterChips } from '@web/components/display/filter-chips'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { OccurrenceRow } from '@web/components/finance/occurrence-row'
import { PlanSummaryTiles } from '@web/components/finance/plan-summary-tiles'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import {
  accountsQueryOptions,
  occurrencesQueryOptions,
  periodsQueryOptions,
} from '@web/features/planning/api/planning.queries'
import {
  OccurrenceActions,
  recordLabelOf,
} from '@web/features/planning/components/occurrence-actions'
import {
  occurrenceGroupsOf,
  summaryTilesOf,
} from '@web/features/planning/components/occurrence-groups'
import { OccurrencesTable } from '@web/features/planning/components/occurrences-table'
import { PlanningPeriod, yearOf } from '@web/features/planning/components/planning-period'
import { planningMessages } from '@web/features/planning/planning.messages'
import { NEW_RECURRENCE } from '@web/features/planning/planning.schemas'
import type {
  GroupProps,
  OccurrenceContext,
  OccurrenceList,
  OccurrencesProps,
  OccurrencesTabProps,
  PlanningSearch,
} from '@web/features/planning/planning.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'
import { useMemo, useState } from 'react'

const messages = planningMessages.occurrences
const SHOWN_PER_GROUP = 5
const SKELETON_ROWS = 5

export function OccurrencesTab(props: OccurrencesTabProps) {
  usePageTitle(messages.pageTitle)
  const chosen = useChosenPeriod(props.workspaceId, props.search)
  if (chosen.failed) {
    return <Failure query={chosen.failed} />
  }
  if (!chosen.period || !chosen.today || !chosen.currentLabel) {
    return <ListSkeleton rows={SKELETON_ROWS} />
  }
  return (
    <>
      <PlanningPeriod
        workspaceId={props.workspaceId}
        label={chosen.period.label}
        start={chosen.period.start}
        end={chosen.period.end}
        currentLabel={chosen.currentLabel}
      />
      <OccurrencesBody
        {...props}
        today={chosen.today}
        from={chosen.period.start}
        to={chosen.period.end}
        periodLabel={chosen.period.label}
      />
    </>
  )
}

function OccurrencesBody({
  workspaceId,
  permissions,
  memberDirectory,
  search,
  today,
  from,
  to,
  periodLabel,
}: OccurrencesTabProps & { today: string; from: string; to: string; periodLabel: string }) {
  const occurrences = useQuery(occurrencesQueryOptions(workspaceId, from, to))
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const context = useMemo<OccurrenceContext>(
    () => ({
      today,
      accounts: new Map(accounts.data?.map((account) => [account.id, account])),
      memberNames: new Map(memberDirectory.map((member) => [member.userId, member.displayName])),
    }),
    [today, accounts.data, memberDirectory],
  )
  const failed = [occurrences, accounts].find((query) => query.isError)
  if (failed) {
    return <Failure query={failed} />
  }
  if (!occurrences.data || !accounts.data) {
    return <ListSkeleton rows={SKELETON_ROWS} />
  }
  const ruleFilter = ruleFilterOf(occurrences.data, search.rule)
  if (ruleFilter) {
    return (
      <>
        <RuleChip label={ruleFilter.label} />
        <Occurrences
          workspaceId={workspaceId}
          list={ruleFilter.list}
          context={context}
          accounts={new Map(accounts.data.map((account) => [account.id, account]))}
          canUpdate={hasPermission(permissions, 'planning', 'update')}
          canRecord={
            hasPermission(permissions, 'planning', 'update') &&
            hasPermission(permissions, 'entries', 'create')
          }
          isFiltered
        />
      </>
    )
  }
  if (occurrences.data.items.length === 0) {
    return (
      <Empty
        workspaceId={workspaceId}
        canCreate={hasPermission(permissions, 'planning', 'create')}
      />
    )
  }
  return (
    <Occurrences
      workspaceId={workspaceId}
      list={occurrences.data}
      context={context}
      periodLabel={periodLabel}
      accounts={new Map(accounts.data.map((account) => [account.id, account]))}
      canUpdate={hasPermission(permissions, 'planning', 'update')}
      canRecord={
        hasPermission(permissions, 'planning', 'update') &&
        hasPermission(permissions, 'entries', 'create')
      }
    />
  )
}

function Occurrences({
  workspaceId,
  list,
  context,
  accounts,
  canUpdate,
  canRecord,
  isFiltered = false,
  periodLabel,
}: OccurrencesProps) {
  const navigate = useNavigate()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const byId = new Map(list.items.map((item) => [item.id, item]))
  const linkOf = (id: string) => {
    const occurrence = byId.get(id)
    if (!canUpdate || !occurrence) {
      return undefined
    }
    return (
      <OccurrenceActions
        workspaceId={workspaceId}
        occurrence={occurrence}
        accounts={accounts}
        canRecord={canRecord}
      />
    )
  }
  const registerOf = (id: string) => {
    const occurrence = byId.get(id)
    if (!canRecord || !occurrence?.isOverdue) {
      return undefined
    }
    return {
      label: recordLabelOf(occurrence),
      onPress: () =>
        void navigate({
          to: '.',
          search: (previous) => ({ ...previous, entry: 'new', entryOccurrence: occurrence.id }),
        }),
    }
  }
  if (isDesktop && !isFiltered) {
    return (
      <OccurrencesTable
        workspaceId={workspaceId}
        list={list}
        context={context}
        accounts={accounts}
        canUpdate={canUpdate}
        canRecord={canRecord}
        periodLabel={periodLabel ?? ''}
      />
    )
  }
  return (
    <>
      {!isFiltered && (
        <PlanSummaryTiles label={messages.summaryLabel} tiles={summaryTilesOf(list)} />
      )}
      {occurrenceGroupsOf(list, context).map((group) => (
        <Group
          key={group.key}
          group={isFiltered ? { ...group, count: group.rows.length } : group}
          linkOf={linkOf}
          registerOf={registerOf}
        />
      ))}
    </>
  )
}

function Group({ group, linkOf, registerOf }: GroupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const shown = isOpen ? group.rows : group.rows.slice(0, SHOWN_PER_GROUP)
  const hiddenCount = group.rows.length - shown.length
  return (
    <OccurrenceGroup
      title={group.title}
      count={group.count}
      tone={group.key === 'overdue' ? 'danger' : 'default'}
      footer={
        hiddenCount > 0 && (
          <ShowMoreButton hiddenCount={hiddenCount} onClick={() => setIsOpen(true)} />
        )
      }
    >
      {shown.map(({ id, ...row }) => (
        <OccurrenceRow key={id} {...row} link={linkOf(id)} register={registerOf(id)} />
      ))}
    </OccurrenceGroup>
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
          <Button
            render={
              <Link
                to="/w/$workspaceId/planning/$tab"
                params={{ workspaceId, tab: 'recurrences' }}
                search={(previous) => ({
                  ...previous,
                  recurrence: NEW_RECURRENCE,
                  recurrenceType: 'expense',
                })}
              />
            }
          >
            <TwiseIcon name="plus" size="sm" />
            {messages.newRecurrence}
          </Button>
        )
      }
    />
  )
}

function Failure({
  query,
}: {
  query: { error: unknown; isFetching: boolean; refetch: () => unknown }
}) {
  return (
    <SectionError
      message={messages.failed}
      errorRef={query.error instanceof ApiError ? query.error.ref : null}
      isRetrying={query.isFetching}
      onRetry={() => void query.refetch()}
    />
  )
}

function useChosenPeriod(workspaceId: string, search: PlanningSearch) {
  const current = useQuery(periodsQueryOptions(workspaceId, undefined))
  const label = search.period ?? current.data?.currentLabel
  const year = label ? yearOf(label) : undefined
  const currentYear = current.data ? yearOf(current.data.currentLabel) : undefined
  const isCurrentYear = year !== undefined && year === currentYear
  const other = useQuery({
    ...periodsQueryOptions(workspaceId, year),
    enabled: year !== undefined && currentYear !== undefined && !isCurrentYear,
  })
  const periods = isCurrentYear ? current.data : other.data
  return {
    failed: [current, other].find((query) => query.isError),
    today: current.data?.today,
    currentLabel: current.data?.currentLabel,
    period: periods?.periods.find((period) => period.label === label),
  }
}

function ruleFilterOf(list: OccurrenceList, rule: string | undefined) {
  if (!rule) {
    return undefined
  }
  const items = list.items.filter((item) => item.ruleId === rule)
  const [first] = items
  return { label: first?.description ?? '', list: { ...list, items } }
}

function RuleChip({ label }: { label: string }) {
  const navigate = useNavigate()
  const clear = () =>
    void navigate({ to: '.', search: (previous) => ({ ...previous, rule: undefined }) })
  return <FilterChips chips={[{ value: 'rule', label }]} onRemove={clear} onClear={clear} />
}
