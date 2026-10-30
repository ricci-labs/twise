import { createFileRoute } from '@tanstack/react-router'
import { MembersPage } from '@web/features/members'

export const Route = createFileRoute('/_app/w/$workspaceId/members/invitations')({
  component: function InvitationsRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return (
      <MembersPage
        tab="invitations"
        workspaceId={workspaceId}
        workspaceName={access.workspace.name}
        membershipId={access.membershipId}
        permissions={access.permissions}
      />
    )
  },
})
