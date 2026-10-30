import { useQuery } from '@tanstack/react-query'
import { Button } from '@web/components/actions/button'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { PairedCardGrid } from '@web/components/layout/paired-card-grid'
import {
  memberPreferencesQueryOptions,
  meQueryOptions,
  userPreferencesQueryOptions,
} from '@web/features/auth/api/auth.queries'
import { useLogOut } from '@web/features/auth/api/use-log-out'
import { authMessages } from '@web/features/auth/auth.messages'
import type { AccountHubProps } from '@web/features/auth/auth.types'
import { AccountNameForm } from '@web/features/auth/components/account-name-page'
import { NoticesForm } from '@web/features/auth/components/account-notices-page'
import { PasswordForm } from '@web/features/auth/components/account-password-page'
import { QuietHoursForm } from '@web/features/auth/components/account-quiet-page'
import { ThemeChooser } from '@web/features/auth/components/account-theme-page'
import { LogOut } from 'lucide-react'

const messages = authMessages.myAccount
const SKELETON_LINES = 10

export function AccountDesktop({ workspaceId, workspaceName }: AccountHubProps) {
  const logOut = useLogOut()
  const me = useQuery(meQueryOptions()).data
  const quiet = useQuery(userPreferencesQueryOptions()).data
  const notices = useQuery(memberPreferencesQueryOptions(workspaceId)).data
  return (
    <PageFrame className="gap-6">
      <PageHeader
        title={messages.title}
        description={messages.desktopLead}
        actions={
          <Button variant="secondary" onClick={() => logOut.mutate()}>
            <LogOut aria-hidden="true" />
            {messages.logOut}
          </Button>
        }
      />
      {me && quiet && notices ? (
        <PairedCardGrid>
          <AccountNameForm
            workspaceId={workspaceId}
            displayName={me.displayName}
            email={me.email}
            layout="card"
          />
          <ThemeChooser workspaceId={workspaceId} layout="card" />
          <QuietHoursForm
            workspaceId={workspaceId}
            start={quiet.quietHoursStart}
            end={quiet.quietHoursEnd}
            layout="card"
          />
          <NoticesForm
            workspaceId={workspaceId}
            workspaceName={workspaceName}
            daysBefore={notices.notifyBillsDaysBefore}
            layout="card"
          />
          <div className="lg:col-span-2">
            <PasswordForm workspaceId={workspaceId} layout="card" />
          </div>
        </PairedCardGrid>
      ) : (
        <SectionSkeleton lines={SKELETON_LINES} />
      )}
    </PageFrame>
  )
}
