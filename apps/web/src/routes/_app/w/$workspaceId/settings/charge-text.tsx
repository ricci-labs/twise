import { createFileRoute } from '@tanstack/react-router'
import { ChargeTextPage } from '@web/features/settings'

export const Route = createFileRoute('/_app/w/$workspaceId/settings/charge-text')({
  component: function ChargeTextRoute() {
    const { workspaceId } = Route.useParams()
    const { access, account } = Route.useRouteContext()
    return (
      <ChargeTextPage
        workspaceId={workspaceId}
        workspaceName={access.workspace.name}
        requesterName={account.displayName}
        requesterEmail={account.email}
        permissions={access.permissions}
      />
    )
  },
})
