import { createFileRoute } from '@tanstack/react-router'
import { CommissionSplitPage } from '@web/features/planning'

export const Route = createFileRoute('/_app/w/$workspaceId/commission-split')({
  component: function CommissionSplitRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <CommissionSplitPage workspaceId={workspaceId} permissions={access.permissions} />
  },
})
