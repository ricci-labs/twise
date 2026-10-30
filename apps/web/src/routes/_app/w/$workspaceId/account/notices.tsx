import { createFileRoute } from '@tanstack/react-router'
import { AccountNoticesPage } from '@web/features/auth'

export const Route = createFileRoute('/_app/w/$workspaceId/account/notices')({
  component: function AccountNoticesRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <AccountNoticesPage workspaceId={workspaceId} workspaceName={access.workspace.name} />
  },
})
