import { createFileRoute } from '@tanstack/react-router'
import { CardInvoicesPage, cardInvoicesSearchSchema } from '@web/features/accounts'

export const Route = createFileRoute('/_app/w/$workspaceId/cards_/$card')({
  validateSearch: cardInvoicesSearchSchema,
  component: function CardInvoicesRoute() {
    const { workspaceId, card } = Route.useParams()
    const { month } = Route.useSearch()
    const { access } = Route.useRouteContext()
    return (
      <CardInvoicesPage
        key={card}
        workspaceId={workspaceId}
        permissions={access.permissions}
        cardId={card}
        month={month}
      />
    )
  },
})
