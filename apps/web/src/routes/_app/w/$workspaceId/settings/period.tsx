import { createFileRoute } from '@tanstack/react-router'
import { PeriodPage } from '@web/features/settings'

export const Route = createFileRoute('/_app/w/$workspaceId/settings/period')({
  component: function PeriodRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <PeriodPage workspaceId={workspaceId} permissions={access.permissions} />
  },
})
