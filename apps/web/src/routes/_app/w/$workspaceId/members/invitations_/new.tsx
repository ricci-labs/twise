import { createFileRoute } from '@tanstack/react-router'
import { InvitePage } from '@web/features/members'

export const Route = createFileRoute('/_app/w/$workspaceId/members/invitations_/new')({
  component: function InviteRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return (
      <InvitePage
        workspaceId={workspaceId}
        workspaceName={access.workspace.name}
        membershipId={access.membershipId}
        permissions={access.permissions}
      />
    )
  },
})
