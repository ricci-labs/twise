import { useQuery } from '@tanstack/react-query'
import { cardInvoicesQueryOptions } from '@web/features/entries/api/entries.queries'
import type { EntryFormInput } from '@web/features/entries/entries.types'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { type Control, useWatch } from 'react-hook-form'

const INVOICE_PAYMENT = 'invoice_payment'

export function useInvoiceOverpaid(control: Control<EntryFormInput>, workspaceId: string): boolean {
  const [entryType, amount, cardAccountId, invoiceId] = useWatch<
    EntryFormInput,
    ['entryType', 'amount', 'cardAccountId', 'invoiceId']
  >({ control, name: ['entryType', 'amount', 'cardAccountId', 'invoiceId'] })
  const isPayment = entryType === INVOICE_PAYMENT
  const invoices = useQuery({
    ...cardInvoicesQueryOptions(workspaceId, cardAccountId),
    enabled: isPayment && cardAccountId !== '',
  }).data
  const invoice = invoices?.find((item) => item.invoiceId === invoiceId)
  const cents = centsOfTypedAmount(amount)
  return isPayment && invoice !== undefined && cents !== null && cents > invoice.dueCents
}
