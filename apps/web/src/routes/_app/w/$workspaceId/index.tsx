import { createFileRoute } from '@tanstack/react-router'
import { HomePage, homeSearchSchema } from '@web/features/home'

export const Route = createFileRoute('/_app/w/$workspaceId/')({
  validateSearch: homeSearchSchema,
  component: function WorkspaceHomeRoute() {
    const { workspaceId } = Route.useParams()
    const { period } = Route.useSearch()
    const { account, access } = Route.useRouteContext()
    return (
      <HomePage
        workspaceId={workspaceId}
        period={period}
        displayName={account.displayName}
        permissions={access.permissions}
        workspaceName={access.workspace.name}
        memberCount={access.memberNames.length}
      />
    )
  },
})
