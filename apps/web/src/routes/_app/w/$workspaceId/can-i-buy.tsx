import { createFileRoute } from '@tanstack/react-router'
import { PurchasePage } from '@web/features/purchase'

export const Route = createFileRoute('/_app/w/$workspaceId/can-i-buy')({
  component: function CanIBuyRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <PurchasePage workspaceId={workspaceId} permissions={access.permissions} />
  },
})
