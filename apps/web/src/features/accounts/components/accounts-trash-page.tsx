import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { EmptyBlock } from '@web/components/feedback/empty-block'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { SectionError } from '@web/components/feedback/section-error'
import { SubPageHeader } from '@web/components/layout/sub-page-header'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { TrashPageProps } from '@web/features/accounts/accounts.types'
import {
  accountsQueryOptions,
  membersQueryOptions,
  trashedAccountsQueryOptions,
} from '@web/features/accounts/api/accounts.queries'
import { TrashList } from '@web/features/accounts/components/trash-list'
import { trashedItemsOf } from '@web/features/accounts/components/trashed-items'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { hasPermission } from '@web/lib/permissions'

const messages = accountsMessages.trashPage

export function AccountsTrashPage({ workspaceId, permissions }: TrashPageProps) {
  usePageTitle(messages.pageTitle)
  return (
    <div className="mx-auto flex w-full max-w-160 flex-col gap-4 pb-6 lg:pt-7 lg:pb-12">
      <SubPageHeader
        back={<Link to="/w/$workspaceId/accounts" params={{ workspaceId }} />}
        backLabel={messages.back}
        title={messages.title}
        description={messages.description}
      />
      <div className="px-4 lg:px-8">
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
