import type { Permission } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@web/components/actions/button'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { showToast } from '@web/components/feedback/toast'
import { RadioCardList } from '@web/components/inputs/radio-card-list'
import { Sheet } from '@web/components/layout/sheet'
import { rolesQueryOptions } from '@web/features/members/api/members.queries'
import { useChangeMemberRole } from '@web/features/members/api/use-change-member-role'
import { membersMessages } from '@web/features/members/members.messages'
import type { Role, RoleSheetProps } from '@web/features/members/members.types'
import { ApiError } from '@web/lib/api/api-error'
import { errorMessageFor } from '@web/lib/errors/error-message'
import { hasPermission } from '@web/lib/permissions'
import { useState } from 'react'

const messages = membersMessages
const OWNER = 'owner'
const SKELETON_LINES = 5

export function RoleSheet({
  workspaceId,
  member,
  actorPermissions,
  isActorOwner,
  isOpen,
  onOpenChange,
}: RoleSheetProps) {
  const roles = useQuery({ ...rolesQueryOptions(workspaceId), enabled: isOpen })
  const changeRole = useChangeMemberRole(workspaceId)
  const [chosen, setChosen] = useState(member.role.roleId)
  const copy = messages.roleSheet

  async function save() {
    const role = roles.data?.find((candidate) => candidate.roleId === chosen)
    if (!role) {
      return
    }
    try {
      await changeRole.mutateAsync({ membershipId: member.membershipId, roleId: role.roleId })
      onOpenChange(false)
      showToast(copy.done(member.displayName, role.name), { tone: 'success' })
    } catch (error) {
      showToast(errorMessageFor(error), { tone: 'danger' })
    }
  }

  return (
    <Sheet
      title={copy.title(member.displayName)}
      closeLabel={copy.cancel}
      isOpen={isOpen}
      onOpenChange={(open) => {
        setChosen(member.role.roleId)
        onOpenChange(open)
      }}
    >
      <div className="flex flex-col gap-4">
        {roles.isError && (
          <SectionError
            message={copy.failed}
            errorRef={roles.error instanceof ApiError ? roles.error.ref : null}
            isRetrying={roles.isFetching}
            onRetry={() => void roles.refetch()}
          />
        )}
        {!roles.data && !roles.isError && <SectionSkeleton lines={SKELETON_LINES} />}
        {roles.data && (
          <RadioCardList
            label={copy.label}
            value={chosen}
            onSelect={setChosen}
            options={roles.data.map((role) => ({
              value: role.roleId,
              label: role.name,
              detail: roleSentence(role),
              isDisabled: !canGive(role, actorPermissions, isActorOwner),
            }))}
          />
        )}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {copy.cancel}
          </Button>
          <Button
            isDisabled={chosen === member.role.roleId || !roles.data}
            isLoading={changeRole.isPending}
            onClick={() => void save()}
          >
            {copy.confirm}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

export function roleSentence(role: Role): string {
  return role.systemKey ? messages.systemRoles[role.systemKey] : (role.description ?? '')
}

function canGive(role: Role, actorPermissions: readonly Permission[], isActorOwner: boolean) {
  if (role.systemKey === OWNER) {
    return isActorOwner
  }
  return role.permissions.every((permission) =>
    hasPermission(actorPermissions, permission.module, permission.action),
  )
}
