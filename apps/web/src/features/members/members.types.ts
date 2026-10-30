import type { Permission } from '@financas/shared'
import type { fetchMembers } from '@web/features/members/api/members.queries'

export type Member = Awaited<ReturnType<typeof fetchMembers>>[number]

export type MembersPageProps = {
  workspaceId: string
  membershipId: string
  permissions: readonly Permission[]
}

export type MembersListProps = {
  workspaceId: string
  membershipId: string
}
