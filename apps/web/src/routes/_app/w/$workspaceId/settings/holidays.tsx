import { createFileRoute } from '@tanstack/react-router'
import { HolidaysPage, holidaysSearchSchema } from '@web/features/settings'

export const Route = createFileRoute('/_app/w/$workspaceId/settings/holidays')({
  validateSearch: holidaysSearchSchema,
  component: function HolidaysRoute() {
    const { workspaceId } = Route.useParams()
    const search = Route.useSearch()
    const { access } = Route.useRouteContext()
    return (
      <HolidaysPage workspaceId={workspaceId} permissions={access.permissions} search={search} />
    )
  },
})
