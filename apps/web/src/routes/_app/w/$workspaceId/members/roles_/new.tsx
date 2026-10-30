import { createFileRoute } from '@tanstack/react-router'
import { RoleEditorPage } from '@web/features/members'

export const Route = createFileRoute('/_app/w/$workspaceId/members/roles_/new')({
  component: function NewRoleRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return (
      <RoleEditorPage workspaceId={workspaceId} roleId={null} permissions={access.permissions} />
    )
  },
})
