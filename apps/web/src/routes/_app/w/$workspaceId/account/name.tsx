import { createFileRoute } from '@tanstack/react-router'
import { AccountNamePage } from '@web/features/auth'

export const Route = createFileRoute('/_app/w/$workspaceId/account/name')({
  component: function AccountNameRoute() {
    const { workspaceId } = Route.useParams()
    return <AccountNamePage workspaceId={workspaceId} />
  },
})
