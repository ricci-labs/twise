import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { PayInvoiceButtonProps } from '@web/features/accounts/accounts.types'
import { hasPermission } from '@web/lib/permissions'

export function PayInvoiceButton({ permissions, card, invoice, width }: PayInvoiceButtonProps) {
  const { invoiceId } = invoice
  const canPay = hasPermission(permissions, 'entries', 'create') && card.archivedAt === null
  if (!canPay || !invoiceId || invoice.dueCents <= 0) {
    return null
  }
  return (
    <Button
      variant={invoice.state === 'future' ? 'secondary' : 'primary'}
      width={width}
      render={payInvoiceLink(card.accountId, invoiceId)}
    >
      {accountsMessages.invoicesPage.pay}
    </Button>
  )
}

export function payInvoiceLink(cardAccountId: string, invoiceId: string) {
  return (
    <Link
      to="."
      search={(previous) => ({
        ...previous,
        entry: 'new',
        entryType: 'invoice_payment',
        entryCard: cardAccountId,
        entryInvoice: invoiceId,
      })}
    />
  )
}
