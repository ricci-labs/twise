import { createFileRoute } from '@tanstack/react-router'
import { InvoicePage } from '@web/features/accounts'

export const Route = createFileRoute('/_app/w/$workspaceId/cards_/$card_/invoices/$invoice')({
  component: function InvoiceRoute() {
    const { workspaceId, card, invoice } = Route.useParams()
    const { access } = Route.useRouteContext()
    return (
      <InvoicePage
        key={invoice}
        workspaceId={workspaceId}
        permissions={access.permissions}
        cardId={card}
        invoiceId={invoice}
      />
    )
  },
})
