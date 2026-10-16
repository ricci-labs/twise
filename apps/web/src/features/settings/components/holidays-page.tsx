import { HOLIDAY_YEAR_MAX, HOLIDAY_YEAR_MIN, type IsoDate, parseIsoDate } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Alert } from '@web/components/feedback/alert'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { HolidayRow } from '@web/components/finance/holiday-row'
import { OccurrenceGroup } from '@web/components/finance/occurrence-group'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { Breadcrumb } from '@web/components/navigation/breadcrumb'
import { YearStepper } from '@web/components/navigation/year-stepper'
import {
  holidaysQueryOptions,
  todayQueryOptions,
} from '@web/features/settings/api/settings.queries'
import { HolidayActions } from '@web/features/settings/components/holiday-actions'
import { HolidaySheet } from '@web/features/settings/components/holiday-sheet'
import { holidayListsOf } from '@web/features/settings/components/holiday-views'
import { settingsMessages } from '@web/features/settings/settings.messages'
import type {
  HolidayListsProps,
  HolidaysBodyProps,
  HolidaysContentProps,
  HolidaysOfYearProps,
  HolidaysPageProps,
} from '@web/features/settings/settings.types'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = settingsMessages.holidays
const SKELETON_ROWS = 6

export function HolidaysPage({ workspaceId, permissions, search }: HolidaysPageProps) {
  usePageTitle(messages.pageTitle)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const navigate = useNavigate()
  const changeYear = (year: number) =>
    void navigate({ to: '.', search: (previous) => ({ ...previous, year }), replace: true })
  const settingsLink = <Link to="/w/$workspaceId/settings" params={{ workspaceId }} />
  const body = (
    <HolidaysContent
      workspaceId={workspaceId}
      permissions={permissions}
      search={search}
      onYearChange={changeYear}
    />
  )
  if (isDesktop) {
    return (
      <PageFrame>
        <div className="mb-2">
          <Breadcrumb
            label={messages.crumb}
            items={[
              { label: settingsMessages.title, link: settingsLink },
              { label: messages.title },
            ]}
          />
        </div>
        <PageHeader title={messages.title} description={messages.description} />
        <div className="mt-4 flex max-w-160 flex-col gap-4">{body}</div>
      </PageFrame>
    )
  }
  return (
    <PageFrame edge="bleed" className="gap-4">
      <SubPageHeader
        back={settingsLink}
        backLabel={messages.back}
        title={messages.title}
        description={messages.description}
      />
      <div className="flex flex-col gap-4 px-4">{body}</div>
    </PageFrame>
  )
}

function HolidaysContent({ workspaceId, permissions, search, onYearChange }: HolidaysContentProps) {
  const today = useQuery(todayQueryOptions(workspaceId))
  if (today.isError) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={today.error instanceof ApiError ? today.error.ref : null}
        isRetrying={today.isFetching}
        onRetry={() => void today.refetch()}
      />
    )
  }
  if (!today.data) {
    return <ListSkeleton rows={SKELETON_ROWS} />
  }
  return (
    <HolidaysBody
      workspaceId={workspaceId}
      permissions={permissions}
      year={search.year ?? parseIsoDate(today.data).year}
      today={today.data}
      onYearChange={onYearChange}
    />
  )
}

function HolidaysBody({ workspaceId, permissions, year, today, onYearChange }: HolidaysBodyProps) {
  const [isAdding, setIsAdding] = useState(false)
  const canCreate = hasPermission(permissions, 'planning', 'create')
  const showYearOf = (onDate: IsoDate) => {
    const added = parseIsoDate(onDate).year
    if (added !== year) {
      onYearChange(added)
    }
  }
  return (
    <>
      <YearStepper
        value={year}
        min={HOLIDAY_YEAR_MIN}
        max={HOLIDAY_YEAR_MAX}
        onChange={onYearChange}
        label={messages.yearLabel}
      />
      <Alert tone="info">{messages.note}</Alert>
      <HolidaysOfYear
        workspaceId={workspaceId}
        permissions={permissions}
        year={year}
        today={today}
        onAdd={canCreate ? () => setIsAdding(true) : null}
      />
      {canCreate && (
        <HolidaySheet
          workspaceId={workspaceId}
          year={year}
          today={today}
          isOpen={isAdding}
          onOpenChange={setIsAdding}
          onAdded={showYearOf}
        />
      )}
    </>
  )
}

function HolidaysOfYear({ workspaceId, permissions, year, today, onAdd }: HolidaysOfYearProps) {
  const holidays = useQuery(holidaysQueryOptions(workspaceId, year))
  if (holidays.isError) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={holidays.error instanceof ApiError ? holidays.error.ref : null}
        isRetrying={holidays.isFetching}
        onRetry={() => void holidays.refetch()}
      />
    )
  }
  if (!holidays.data) {
    return <ListSkeleton rows={SKELETON_ROWS} />
  }
  return (
    <HolidayLists
      workspaceId={workspaceId}
      permissions={permissions}
      lists={holidayListsOf(holidays.data, today)}
      onAdd={onAdd}
    />
  )
}

function HolidayLists({ workspaceId, permissions, lists, onAdd }: HolidayListsProps) {
  const canDelete = hasPermission(permissions, 'planning', 'delete')
  return (
    <>
      <OccurrenceGroup
        title={messages.workspace}
        count={lists.workspace.length}
        add={onAdd ? { label: messages.add, onPress: onAdd } : undefined}
        empty={messages.empty}
      >
        {lists.workspace.map((holiday) => (
          <HolidayRow
            key={holiday.key}
            onDate={holiday.onDate}
            name={holiday.name}
            status={holiday.status}
            actions={
              canDelete ? <HolidayActions workspaceId={workspaceId} holiday={holiday} /> : null
            }
          />
        ))}
      </OccurrenceGroup>
      <OccurrenceGroup
        title={messages.national}
        count={lists.national.length}
        note={messages.nationalNote}
      >
        {lists.national.map((holiday) => (
          <HolidayRow
            key={holiday.key}
            onDate={holiday.onDate}
            name={holiday.name}
            status={holiday.status}
          />
        ))}
      </OccurrenceGroup>
    </>
  )
}
