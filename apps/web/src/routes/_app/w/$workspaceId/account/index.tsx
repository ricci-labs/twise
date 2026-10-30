import { createFileRoute } from '@tanstack/react-router'
import { AccountPage } from '@web/features/auth'

export const Route = createFileRoute('/_app/w/$workspaceId/account/')({
  component: function AccountRoute() {
    const { workspaceId } = Route.useParams()
    return <AccountPage workspaceId={workspaceId} />
  },
})
