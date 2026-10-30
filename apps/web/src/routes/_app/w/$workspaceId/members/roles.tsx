import { createFileRoute } from '@tanstack/react-router'
import { MembersPage } from '@web/features/members'

export const Route = createFileRoute('/_app/w/$workspaceId/members/roles')({
  component: function RolesRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return (
      <MembersPage
        tab="roles"
        workspaceId={workspaceId}
        workspaceName={access.workspace.name}
        membershipId={access.membershipId}
        permissions={access.permissions}
      />
    )
  },
})
