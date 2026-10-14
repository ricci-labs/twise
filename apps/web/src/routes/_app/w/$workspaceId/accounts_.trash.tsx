import { createFileRoute } from '@tanstack/react-router'
import { AccountsTrashPage } from '@web/features/accounts'

export const Route = createFileRoute('/_app/w/$workspaceId/accounts_/trash')({
  component: function AccountsTrashRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <AccountsTrashPage workspaceId={workspaceId} permissions={access.permissions} />
  },
})
