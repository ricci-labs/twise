import { createFileRoute } from '@tanstack/react-router'
import { AccountQuietPage } from '@web/features/auth'

export const Route = createFileRoute('/_app/w/$workspaceId/account/quiet-hours')({
  component: function AccountQuietRoute() {
    const { workspaceId } = Route.useParams()
    return <AccountQuietPage workspaceId={workspaceId} />
  },
})
