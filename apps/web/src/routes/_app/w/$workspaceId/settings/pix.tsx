import { createFileRoute } from '@tanstack/react-router'
import { PixPage } from '@web/features/settings'

export const Route = createFileRoute('/_app/w/$workspaceId/settings/pix')({
  component: function PixRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return (
      <PixPage
        workspaceId={workspaceId}
        workspaceName={access.workspace.name}
        permissions={access.permissions}
      />
    )
  },
})
