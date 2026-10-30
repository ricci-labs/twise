import { todayIn } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { ShowMoreButton } from '@web/components/actions/show-more-button'
import { MemberRow } from '@web/components/display/member-row'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { AccountGroup } from '@web/components/finance/account-group'
import { PageFrame } from '@web/components/layout/page-frame'
import { PageHeader } from '@web/components/layout/page-header'
import { membersQueryOptions } from '@web/features/members/api/members.queries'
import { MemberActions } from '@web/features/members/components/member-actions'
import { membersMessages as messages } from '@web/features/members/members.messages'
import type { MembersListProps, MembersPageProps } from '@web/features/members/members.types'
import { usePageTitle } from '@web/hooks/use-page-title'
import { ApiError } from '@web/lib/api/api-error'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const PAGE_SIZE = 50
const SKELETON_LINES = 6
const TIME_ZONE = 'America/Sao_Paulo'

export function MembersPage({
  workspaceId,
  workspaceName,
  membershipId,
  permissions,
}: MembersPageProps) {
  usePageTitle(messages.pageTitle)
  return (
    <PageFrame className="gap-4 lg:gap-6">
      <PageHeader title={messages.title} />
      <MembersList
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        membershipId={membershipId}
        permissions={permissions}
      />
    </PageFrame>
  )
}

function MembersList({ workspaceId, workspaceName, membershipId, permissions }: MembersListProps) {
  const canRemove = hasPermission(permissions, 'members', 'delete')
  const members = useQuery(membersQueryOptions(workspaceId))
  const [shownCount, setShownCount] = useState(PAGE_SIZE)
  if (members.isError) {
    return (
      <SectionError
        message={messages.failed}
        errorRef={members.error instanceof ApiError ? members.error.ref : null}
        isRetrying={members.isFetching}
        onRetry={() => void members.refetch()}
      />
    )
  }
  if (!members.data) {
    return <SectionSkeleton lines={SKELETON_LINES} />
  }
  const hiddenCount = members.data.length - shownCount
  return (
    <div className="flex flex-col gap-3 lg:max-w-160">
      <AccountGroup title={messages.people(members.data.length)} note={messages.ownersRule}>
        {members.data.slice(0, shownCount).map((member) => (
          <MemberRow
            key={member.membershipId}
            name={member.displayName}
            email={member.email}
            roleName={member.role.name}
            joinedOn={todayIn(TIME_ZONE, new Date(member.joinedAt))}
            isYou={member.membershipId === membershipId}
            actions={
              <MemberActions
                workspaceId={workspaceId}
                workspaceName={workspaceName}
                member={member}
                members={members.data}
                isYou={member.membershipId === membershipId}
                canRemove={canRemove}
              />
            }
          />
        ))}
      </AccountGroup>
      {hiddenCount > 0 && (
        <ShowMoreButton
          hiddenCount={hiddenCount}
          onClick={() => setShownCount((count) => count + PAGE_SIZE)}
        />
      )}
    </div>
  )
}
