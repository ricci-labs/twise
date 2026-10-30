import { createFileRoute } from '@tanstack/react-router'
import { AccountPasswordPage } from '@web/features/auth'

export const Route = createFileRoute('/_app/w/$workspaceId/account/password')({
  component: function AccountPasswordRoute() {
    const { workspaceId } = Route.useParams()
    return <AccountPasswordPage workspaceId={workspaceId} />
  },
})
