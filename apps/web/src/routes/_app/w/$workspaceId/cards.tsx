import { createFileRoute } from '@tanstack/react-router'
import { CardsPage } from '@web/features/accounts'

export const Route = createFileRoute('/_app/w/$workspaceId/cards')({
  component: function CardsRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <CardsPage workspaceId={workspaceId} permissions={access.permissions} />
  },
})
