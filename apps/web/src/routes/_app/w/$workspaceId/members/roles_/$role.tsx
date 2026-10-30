import { createFileRoute } from '@tanstack/react-router'
import { RoleEditorPage } from '@web/features/members'

export const Route = createFileRoute('/_app/w/$workspaceId/members/roles_/$role')({
  component: function RoleRoute() {
    const { workspaceId, role } = Route.useParams()
    const { access } = Route.useRouteContext()
    return (
      <RoleEditorPage workspaceId={workspaceId} roleId={role} permissions={access.permissions} />
    )
  },
})
