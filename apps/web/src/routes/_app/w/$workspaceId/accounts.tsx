import { createFileRoute } from '@tanstack/react-router'
import { AccountsPage } from '@web/features/accounts'

export const Route = createFileRoute('/_app/w/$workspaceId/accounts')({
  component: function AccountsRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <AccountsPage workspaceId={workspaceId} permissions={access.permissions} />
  },
})
