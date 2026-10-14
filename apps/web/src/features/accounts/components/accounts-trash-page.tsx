import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { PageHeader } from '@web/components/layout/page-header'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { Breadcrumb } from '@web/components/navigation/breadcrumb'
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
      <div className="mx-auto flex w-full max-w-296 flex-col px-8 pt-7 pb-12">
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
        <div className="rounded-lg border border-border bg-surface px-6 pt-9 pb-5">
          <TrashBody workspaceId={workspaceId} permissions={permissions} />
        </div>
      </div>
    )
  }
  return (
    <div className="mx-auto flex w-full max-w-160 flex-col gap-4 pb-6">
      <SubPageHeader
        back={<Link to="/w/$workspaceId/accounts" params={{ workspaceId }} />}
        backLabel={messages.back}
        title={messages.title}
        description={messages.description}
      />
      <div className="px-4">
        <TrashBody workspaceId={workspaceId} permissions={permissions} />
      </div>
    </div>
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
