import { createFileRoute } from '@tanstack/react-router'
import { CalendarPage } from '@web/features/settings'

export const Route = createFileRoute('/_app/w/$workspaceId/settings/calendar')({
  component: function CalendarRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <CalendarPage workspaceId={workspaceId} permissions={access.permissions} />
  },
})
