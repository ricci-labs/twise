import { createFileRoute } from '@tanstack/react-router'
import { CommissionSplitPage, commissionSplitSearchSchema } from '@web/features/planning'

export const Route = createFileRoute('/_app/w/$workspaceId/commission-split')({
  validateSearch: commissionSplitSearchSchema,
  component: function CommissionSplitRoute() {
    const { workspaceId } = Route.useParams()
    const { access } = Route.useRouteContext()
    const { amount } = Route.useSearch()
    return (
      <CommissionSplitPage
        workspaceId={workspaceId}
        permissions={access.permissions}
        amountCents={amount}
      />
    )
  },
})
