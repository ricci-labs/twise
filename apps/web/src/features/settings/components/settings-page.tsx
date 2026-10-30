import { parseIsoDate } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { AccountGroup } from '@web/components/finance/account-group'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { SettingsRow } from '@web/components/navigation/settings-row'
import {
  chargeTextQueryOptions,
  holidaysQueryOptions,
  periodPreviewQueryOptions,
  todayQueryOptions,
  workspaceSettingsQueryOptions,
} from '@web/features/settings/api/settings.queries'
import { holidaySummaryText } from '@web/features/settings/components/holiday-views'
import { timezoneText } from '@web/features/settings/components/timezone-views'
import { settingsMessages as messages } from '@web/features/settings/settings.messages'
import type {
  BudgetRowProps,
  CalendarRowProps,
  ChargeTextRowProps,
  HolidaysRowProps,
  NameRowProps,
  PeriodAnchorChoice,
  PeriodRowProps,
  PixRowProps,
  SettingsPageProps,
} from '@web/features/settings/settings.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { formatRange } from '@web/lib/format/calendar'
import { hasPermission } from '@web/lib/permissions'
import { CalendarDays, Flag, Globe, House, MessageCircle, QrCode, Target } from 'lucide-react'

export function SettingsPage({ workspaceId, workspaceName, permissions }: SettingsPageProps) {
  usePageTitle(messages.pageTitle)
  const canView = hasPermission(permissions, 'settings', 'view')
  const canUpdate = hasPermission(permissions, 'settings', 'update')
  return (
    <PageFrame className="gap-4 lg:gap-6">
      <PageHeader
        title={messages.title}
        description={messages.lead(workspaceName)}
        descriptionOn="always"
      />
      <div className="flex flex-col gap-5 lg:max-w-160">
        {canView && (
          <AccountGroup
            title={messages.groups.workspace}
            note={canUpdate ? undefined : messages.hubReadOnly}
          >
            <NameRow workspaceId={workspaceId} workspaceName={workspaceName} />
            <PeriodRow workspaceId={workspaceId} />
            <BudgetRow workspaceId={workspaceId} />
            <CalendarRow workspaceId={workspaceId} />
          </AccountGroup>
        )}
        {canView && (
          <AccountGroup title={messages.groups.receiving}>
            <PixRow workspaceId={workspaceId} />
            <ChargeTextRow workspaceId={workspaceId} />
          </AccountGroup>
        )}
        {hasPermission(permissions, 'planning', 'view') && (
          <AccountGroup title={messages.groups.planning}>
            <HolidaysRow workspaceId={workspaceId} />
          </AccountGroup>
        )}
      </div>
    </PageFrame>
  )
}

function NameRow({ workspaceId, workspaceName }: NameRowProps) {
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId)).data
  const currency = settings && (messages.currencyNames[settings.currency] ?? settings.currency)
  return (
    <SettingsRow
      title={messages.nameRow.title}
      detail={currency ? messages.nameRow.detail(workspaceName, currency) : undefined}
      icon={<House />}
      link={<Link to="/w/$workspaceId/settings/name" params={{ workspaceId }} />}
    />
  )
}

function PeriodRow({ workspaceId }: PeriodRowProps) {
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId)).data
  const choice = settings && { anchor: settings.periodAnchor, value: settings.periodAnchorValue }
  const preview = useQuery({
    ...periodPreviewQueryOptions(
      workspaceId,
      choice?.anchor ?? 'calendar_month',
      choice?.value ?? null,
    ),
    enabled: choice !== undefined,
  }).data
  return (
    <SettingsRow
      title={messages.periodRow.title}
      detail={
        choice && preview
          ? messages.periodRow.detail(
              periodAnchorText(choice),
              formatRange(preview.current.start, preview.current.end),
            )
          : undefined
      }
      icon={<CalendarDays />}
      link={<Link to="/w/$workspaceId/settings/period" params={{ workspaceId }} />}
    />
  )
}

function BudgetRow({ workspaceId }: BudgetRowProps) {
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId)).data
  const row = messages.budgetRow
  return (
    <SettingsRow
      title={row.title}
      detail={
        settings &&
        row.detail(row.bases[settings.budgetBase], row.views[settings.installmentBudgetView])
      }
      icon={<Target />}
      link={<Link to="/w/$workspaceId/settings/budget" params={{ workspaceId }} />}
    />
  )
}

function CalendarRow({ workspaceId }: CalendarRowProps) {
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId)).data
  const row = messages.calendarRow
  const week = settings && row.weekStarts[settings.weekStartsOn]
  return (
    <SettingsRow
      title={row.title}
      detail={
        settings && week
          ? row.detail(week, timezoneText(settings.timezone, new Date()).label)
          : undefined
      }
      icon={<Globe />}
      link={<Link to="/w/$workspaceId/settings/calendar" params={{ workspaceId }} />}
    />
  )
}

function periodAnchorText({ anchor, value }: PeriodAnchorChoice): string {
  if (anchor === 'day_of_month' && value !== null) {
    return messages.periodRow.dayOfMonth(value)
  }
  if (anchor === 'nth_business_day' && value !== null) {
    return messages.periodRow.businessDay(value)
  }
  return messages.periodRow.calendarMonth
}

function HolidaysRow({ workspaceId }: HolidaysRowProps) {
  const today = useQuery(todayQueryOptions(workspaceId)).data
  const year = today ? parseIsoDate(today).year : null
  const holidays = useQuery({
    ...holidaysQueryOptions(workspaceId, year ?? 0),
    enabled: year !== null,
  })
  return (
    <SettingsRow
      title={messages.holidaysRow.title}
      detail={
        holidays.data && year !== null ? holidaySummaryText(holidays.data.summary, year) : undefined
      }
      icon={<Flag />}
      link={<Link to="/w/$workspaceId/settings/holidays" params={{ workspaceId }} />}
    />
  )
}

function PixRow({ workspaceId }: PixRowProps) {
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId)).data
  return (
    <SettingsRow
      title={messages.pixRow.title}
      detail={
        settings ? pixRowDetail(settings.pixReceiverName, settings.pixReceiverCity) : undefined
      }
      icon={<QrCode />}
      link={<Link to="/w/$workspaceId/settings/pix" params={{ workspaceId }} />}
    />
  )
}

function ChargeTextRow({ workspaceId }: ChargeTextRowProps) {
  const text = useQuery(chargeTextQueryOptions(workspaceId)).data
  const row = messages.chargeTextRow
  return (
    <SettingsRow
      title={row.title}
      detail={text && chargeTextRowDetail(text.isDefault)}
      icon={<MessageCircle />}
      link={<Link to="/w/$workspaceId/settings/charge-text" params={{ workspaceId }} />}
    />
  )
}

function chargeTextRowDetail(isDefault: boolean): string {
  return isDefault ? messages.chargeTextRow.standard : messages.chargeTextRow.custom
}

function pixRowDetail(receiverName: string | null, receiverCity: string | null): string {
  return receiverName === null || receiverCity === null
    ? messages.pixRow.missing
    : messages.pixRow.configured(receiverName, receiverCity)
}
