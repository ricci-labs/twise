import { createFileRoute } from '@tanstack/react-router'
import { BudgetPage } from '@web/features/settings'

export const Route = createFileRoute('/_app/w/$workspaceId/settings/budget')({
  component: function BudgetRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    return <BudgetPage workspaceId={workspaceId} permissions={access.permissions} />
  },
})
