import { createFileRoute } from '@tanstack/react-router'
import { SplitPage } from '@web/features/planning'

export const Route = createFileRoute('/_app/w/$workspaceId/planning/split')({
  component: function SplitRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <SplitPage workspaceId={workspaceId} permissions={access.permissions} />
  },
})
