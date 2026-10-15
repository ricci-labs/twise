import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { Breadcrumb } from '@web/components/navigation/breadcrumb'
import { TrashTabs } from '@web/components/navigation/trash-tabs'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { TrashPageProps } from '@web/features/accounts/accounts.types'
import {
  accountsQueryOptions,
  membersQueryOptions,
  trashedAccountsQueryOptions,
} from '@web/features/accounts/api/accounts.queries'
import { TrashList } from '@web/features/accounts/components/trash-list'
import { trashedItemsOf } from '@web/features/accounts/components/trashed-items'
import { useMediaQuery } from '@web/hooks/use-media-query'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { DESKTOP_QUERY } from '@web/lib/breakpoints'
import { hasPermission } from '@web/lib/permissions'

const messages = accountsMessages.trashPage

export function AccountsTrashPage({ workspaceId, permissions }: TrashPageProps) {
  usePageTitle(messages.pageTitle)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  if (isDesktop) {
    return (
      <PageFrame>
        <div className="mb-2">
          <Breadcrumb
            label={messages.crumb}
            items={[
              {
                label: accountsMessages.title,
                link: <Link to="/w/$workspaceId/accounts" params={{ workspaceId }} />,
              },
              { label: messages.crumbHere },
            ]}
          />
        </div>
        <PageHeader title={messages.title} description={messages.description} />
        <AccountsTrashTabs workspaceId={workspaceId} permissions={permissions} />
        <div className="mt-4 rounded-lg border border-border bg-surface px-6 pt-9 pb-5">
          <TrashBody workspaceId={workspaceId} permissions={permissions} />
        </div>
      </PageFrame>
    )
  }
  return (
    <PageFrame edge="bleed" className="gap-4">
      <SubPageHeader
        back={<Link to="/w/$workspaceId/accounts" params={{ workspaceId }} />}
        backLabel={messages.back}
        title={messages.title}
        description={messages.description}
      />
      <div className="flex flex-col gap-4 px-4">
        <AccountsTrashTabs workspaceId={workspaceId} permissions={permissions} />
        <TrashBody workspaceId={workspaceId} permissions={permissions} />
      </div>
    </PageFrame>
  )
}

function AccountsTrashTabs({ workspaceId, permissions }: TrashPageProps) {
  const navigate = useNavigate()
  if (!hasPermission(permissions, 'entries', 'delete')) {
    return null
  }
  return (
    <TrashTabs
      value="accounts"
      onChange={(tab) =>
        tab === 'entries' && void navigate({ to: '/w/$workspaceId/trash', params: { workspaceId } })
      }
    />
  )
}

function TrashBody({ workspaceId, permissions }: TrashPageProps) {
  const canSeeMembers = hasPermission(permissions, 'members', 'view')
  const trash = useQuery(trashedAccountsQueryOptions(workspaceId))
  const accounts = useQuery(accountsQueryOptions(workspaceId))
  const members = useQuery({ ...membersQueryOptions(workspaceId), enabled: canSeeMembers })
  const failed = [trash, accounts].find((query) => query.isError)

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
  if (!trash.data || !accounts.data || (canSeeMembers && !members.data)) {
    return <ListSkeleton rows={3} />
  }
  if (trash.data.length === 0) {
    return <EmptyBlock icon="receipt" title={messages.empty} />
  }
  return (
    <TrashList
      workspaceId={workspaceId}
      items={trashedItemsOf(trash.data, accounts.data, members.data ?? null)}
    />
  )
}
