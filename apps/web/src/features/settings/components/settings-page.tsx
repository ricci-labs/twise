import { parseIsoDate } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { AccountGroup } from '@web/components/finance/account-group'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { SettingsRow } from '@web/components/navigation/settings-row'
import {
  holidaysQueryOptions,
  todayQueryOptions,
} from '@web/features/settings/api/settings.queries'
import { holidaySummaryText } from '@web/features/settings/components/holiday-views'
import { settingsMessages as messages } from '@web/features/settings/settings.messages'
import type { HolidaysRowProps, SettingsPageProps } from '@web/features/settings/settings.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { hasPermission } from '@web/lib/permissions'

const HOLIDAYS_ART = 'calendar'

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
