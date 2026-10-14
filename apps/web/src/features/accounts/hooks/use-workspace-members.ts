import type { Permission } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import type { WorkspaceMember } from '@web/features/accounts/accounts.types'
import { membersQueryOptions } from '@web/features/accounts/api/accounts.queries'
import { hasPermission } from '@web/lib/permissions'

export function useWorkspaceMembers(
  workspaceId: string,
  permissions: readonly Permission[],
): readonly WorkspaceMember[] | null | undefined {
  const canSeeMembers = hasPermission(permissions, 'members', 'view')
  const members = useQuery({ ...membersQueryOptions(workspaceId), enabled: canSeeMembers }).data
  return canSeeMembers ? members : null
}
