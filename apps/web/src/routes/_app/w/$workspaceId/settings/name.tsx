import { createFileRoute } from '@tanstack/react-router'
import { WorkspaceNamePage } from '@web/features/settings'

export const Route = createFileRoute('/_app/w/$workspaceId/settings/name')({
  component: function WorkspaceNameRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return (
      <WorkspaceNamePage
        workspaceId={workspaceId}
        workspaceName={access.workspace.name}
        permissions={access.permissions}
      />
    )
  },
})
