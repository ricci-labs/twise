import { APP_MODULES } from '@financas/shared'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { Badge } from '@web/components/display/badge'
import { Card } from '@web/components/display/card'
import { DataTable } from '@web/components/display/data-table'
import { SectionError } from '@web/components/feedback/section-error'
import { SectionSkeleton } from '@web/components/feedback/section-skeleton'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { rolesQueryOptions } from '@web/features/members/api/members.queries'
import {
  abilityText,
  roleSentence,
  roleTypeText,
  roleUsageText,
} from '@web/features/members/components/role-views'
import { membersMessages } from '@web/features/members/members.messages'
import type {
  AbilityMatrixProps,
  RoleOpenProps,
  RolesDesktopProps,
} from '@web/features/members/members.types'
import { ApiError } from '@web/lib/api/api-error'
import { ChevronRight } from 'lucide-react'

const messages = membersMessages.rolesDesktop
const matrix = membersMessages.matrix
const OWNER = 'owner'
const SKELETON_LINES = 8

export function RolesDesktop({ workspaceId, canEdit }: RolesDesktopProps) {
  const roles = useQuery(rolesQueryOptions(workspaceId))
  if (roles.isError) {
    return (
      <SectionError
        message={membersMessages.rolesFailed}
        errorRef={roles.error instanceof ApiError ? roles.error.ref : null}
        isRetrying={roles.isFetching}
        onRetry={() => void roles.refetch()}
      />
    )
  }
  if (!roles.data) {
    return <SectionSkeleton lines={SKELETON_LINES} />
  }
  return (
    <div className="flex flex-col gap-5">
      <Card title={messages.title(roles.data.length)} description={messages.note}>
        <DataTable
          label={membersMessages.tabs.roles}
          layout="roles"
          columns={[
            { key: 'role', label: messages.columns.role },
            { key: 'type', label: messages.columns.type },
            { key: 'usage', label: messages.columns.usage },
            { key: 'open', label: messages.columns.actions, isLabelHidden: true, isActions: true },
          ]}
          rows={roles.data.map((role) => ({
            key: role.roleId,
            cells: [
              <span key="role" className="flex min-w-0 flex-col">
                <span className="truncate text-row font-semibold text-ink">{role.name}</span>
                <span className="line-clamp-2 text-row-detail text-ink-muted">
                  {roleSentence(role)}
                </span>
              </span>,
              <Badge
                key="type"
                tone={role.systemKey === null ? 'partial' : 'neutral'}
                size="status"
                hasDot
              >
                {roleTypeText(role)}
              </Badge>,
              roleUsageText(role),
              <RoleOpen key="open" workspaceId={workspaceId} role={role} canEdit={canEdit} />,
            ],
          }))}
        />
      </Card>
      <Card title={matrix.title} description={matrix.note}>
        <AbilityMatrix roles={roles.data} />
      </Card>
    </div>
  )
}

function RoleOpen({ workspaceId, role, canEdit }: RoleOpenProps) {
  if (role.systemKey === OWNER) {
    return (
      <span
        role="img"
        aria-label={messages.locked}
        className="grid size-control place-items-center text-ink-muted"
      >
        <TwiseIcon name="lock" size="sm" />
      </span>
    )
  }
  if (!canEdit) {
    return null
  }
  return (
    <Button
      aria-label={membersMessages.openRole(role.name)}
      variant="quiet"
      size="icon"
      render={
        <Link
          to="/w/$workspaceId/members/roles/$role"
          params={{ workspaceId, role: role.roleId }}
        />
      }
    >
      <ChevronRight aria-hidden="true" />
    </Button>
  )
}

function AbilityMatrix({ roles }: AbilityMatrixProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-left text-body-sm">
        <thead>
          <tr className="text-ink-muted">
            <th scope="col" className="sticky left-0 bg-surface py-2 pr-4 font-normal">
              {matrix.area}
            </th>
            {roles.map((role) => (
              <th key={role.roleId} scope="col" className="min-w-28 py-2 pr-4 font-normal">
                {role.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {APP_MODULES.map((module) => (
            <tr key={module} className="border-t border-border">
              <th scope="row" className="sticky left-0 bg-surface py-3 pr-4 font-semibold text-ink">
                {membersMessages.areas[module]}
              </th>
              {roles.map((role) => {
                const text = abilityText(role, module)
                return (
                  <td
                    key={role.roleId}
                    className={
                      text === matrix.all
                        ? 'py-3 pr-4 font-semibold text-ink'
                        : 'py-3 pr-4 text-ink'
                    }
                  >
                    {text}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
