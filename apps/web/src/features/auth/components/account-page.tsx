import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { Avatar } from '@web/components/display/avatar'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { AccountGroup } from '@web/components/finance/account-group'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { SettingsRow } from '@web/components/navigation/settings-row'
import {
  memberPreferencesQueryOptions,
  meQueryOptions,
  userPreferencesQueryOptions,
} from '@web/features/auth/api/auth.queries'
import { useLogOut } from '@web/features/auth/api/use-log-out'
import { authMessages } from '@web/features/auth/auth.messages'
import type { AccountHeaderProps, AccountHubProps } from '@web/features/auth/auth.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { Bell, KeyRound, LogOut, Mail, Moon, User } from 'lucide-react'

const messages = authMessages.myAccount
const SKELETON_LINES = 8

export function AccountPage({ workspaceId, workspaceName }: AccountHubProps) {
  usePageTitle(messages.pageTitle)
  const me = useQuery(meQueryOptions())
  const logOut = useLogOut()
  return (
    <PageFrame className="gap-4 lg:gap-6">
      <PageHeader title={messages.title} />
      {me.isError && (
        <SectionError
          message={messages.readFailed}
          errorRef={me.error instanceof ApiError ? me.error.ref : null}
          isRetrying={me.isFetching}
          onRetry={() => void me.refetch()}
        />
      )}
      {!me.data && !me.isError && <SectionSkeleton lines={SKELETON_LINES} />}
      {me.data && (
        <div className="flex flex-col gap-5 lg:max-w-160">
          <AccountHeader name={me.data.displayName} email={me.data.email} />
          <AccountGroup title={messages.groups.you}>
            <SettingsRow
              title={messages.nameRow}
              detail={me.data.displayName}
              icon={<User />}
              link={<Link to="/w/$workspaceId/account/name" params={{ workspaceId }} />}
            />
            <SettingsRow
              title={messages.emailRow}
              detail={`${me.data.email} · ${messages.emailLocked}`}
              icon={<Mail />}
              isLocked
              link={<div />}
            />
            <SettingsRow
              title={messages.passwordRow}
              detail={messages.passwordRowDetail}
              icon={<KeyRound />}
              link={<Link to="/w/$workspaceId/account/password" params={{ workspaceId }} />}
            />
          </AccountGroup>
          <AccountNoticesGroup workspaceId={workspaceId} workspaceName={workspaceName} />
          <Button variant="secondary" width="full" onClick={() => logOut.mutate()}>
            <LogOut aria-hidden="true" />
            {messages.logOut}
          </Button>
        </div>
      )}
    </PageFrame>
  )
}

function AccountHeader({ name, email }: AccountHeaderProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-5 py-4">
      <div className="flex items-center gap-4">
        <Avatar name={name} size="2xl" />
        <div className="flex min-w-0 flex-col">
          <span className="text-note text-ink-muted">{messages.overline}</span>
          <h2 className="line-clamp-2 text-section-title font-semibold break-words text-ink">
            {name}
          </h2>
        </div>
      </div>
      <p className="text-body-sm wrap-anywhere text-ink-muted">{email}</p>
    </section>
  )
}

function AccountNoticesGroup({ workspaceId, workspaceName }: AccountHubProps) {
  const quiet = useQuery(userPreferencesQueryOptions()).data
  const notices = useQuery(memberPreferencesQueryOptions(workspaceId)).data
  return (
    <AccountGroup title={messages.groups.notices} note={messages.noticesNote}>
      <SettingsRow
        title={messages.quietRow}
        detail={quiet && quietDetailOf(quiet.quietHoursStart, quiet.quietHoursEnd)}
        icon={<Moon />}
        link={<Link to="/w/$workspaceId/account/quiet-hours" params={{ workspaceId }} />}
      />
      <SettingsRow
        title={messages.noticesRow(workspaceName)}
        detail={notices && messages.noticesRowDetail(notices.notifyBillsDaysBefore)}
        icon={<Bell />}
        link={<Link to="/w/$workspaceId/account/notices" params={{ workspaceId }} />}
      />
    </AccountGroup>
  )
}

function quietDetailOf(start: string | null, end: string | null): string {
  return start && end ? messages.quietRowOn(start, end) : messages.quietRowOff
}
