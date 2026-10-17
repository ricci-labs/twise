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
  todayQueryOptions,
  workspaceSettingsQueryOptions,
} from '@web/features/settings/api/settings.queries'
import { holidaySummaryText } from '@web/features/settings/components/holiday-views'
import { settingsMessages as messages } from '@web/features/settings/settings.messages'
import type {
  ChargeTextRowProps,
  HolidaysRowProps,
  PixRowProps,
  SettingsPageProps,
} from '@web/features/settings/settings.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { hasPermission } from '@web/lib/permissions'

const HOLIDAYS_ART = 'calendar'
const PIX_ART = 'coin'
const CHARGE_TEXT_ART = 'list'

export function SettingsPage({ workspaceId, permissions }: SettingsPageProps) {
  usePageTitle(messages.pageTitle)
  return (
    <PageFrame className="gap-4 lg:gap-6">
      <PageHeader title={messages.title} />
      <div className="flex flex-col gap-5 lg:max-w-160">
        {hasPermission(permissions, 'planning', 'view') && (
          <AccountGroup title={messages.groups.planning}>
            <HolidaysRow workspaceId={workspaceId} />
          </AccountGroup>
        )}
        {hasPermission(permissions, 'settings', 'view') && (
          <AccountGroup title={messages.groups.receiving}>
            <PixRow workspaceId={workspaceId} />
            <ChargeTextRow workspaceId={workspaceId} />
          </AccountGroup>
        )}
      </div>
    </PageFrame>
  )
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
      icon={HOLIDAYS_ART}
      link={<Link to="/w/$workspaceId/settings/holidays" params={{ workspaceId }} />}
    />
  )
}

function PixRow({ workspaceId }: PixRowProps) {
  const settings = useQuery(workspaceSettingsQueryOptions(workspaceId)).data
  return (
    <SettingsRow
      title={messages.pixRow.title}
      detail={settings ? pixRowDetail(settings.pixReceiverName) : undefined}
      icon={PIX_ART}
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
      icon={CHARGE_TEXT_ART}
      link={<Link to="/w/$workspaceId/settings/charge-text" params={{ workspaceId }} />}
    />
  )
}

function chargeTextRowDetail(isDefault: boolean): string {
  return isDefault ? messages.chargeTextRow.standard : messages.chargeTextRow.custom
}

function pixRowDetail(receiverName: string | null): string {
  return receiverName === null ? messages.pixRow.missing : messages.pixRow.configured(receiverName)
}
