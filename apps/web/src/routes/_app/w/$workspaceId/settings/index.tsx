import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@web/features/settings'

export const Route = createFileRoute('/_app/w/$workspaceId/settings/')({
  component: function SettingsRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <SettingsPage workspaceId={workspaceId} permissions={access.permissions} />
  },
})
