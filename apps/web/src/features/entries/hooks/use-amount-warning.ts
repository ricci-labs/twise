import { useQuery } from '@tanstack/react-query'
import {
  cardInvoicesQueryOptions,
  contactBalancesQueryOptions,
  contactsQueryOptions,
} from '@web/features/entries/api/entries.queries'
import { entriesMessages } from '@web/features/entries/entries.messages'
import type { EntryFormInput } from '@web/features/entries/entries.types'
import { centsOfTypedAmount } from '@web/lib/format/money'
import { type Control, useWatch } from 'react-hook-form'

const INVOICE_PAYMENT = 'invoice_payment'
const SETTLEMENT = 'settlement'

export function useAmountWarning(
  control: Control<EntryFormInput>,
  workspaceId: string,
): string | undefined {
  const [entryType, amount, cardAccountId, invoiceId, contactId] = useWatch<
    EntryFormInput,
    ['entryType', 'amount', 'cardAccountId', 'invoiceId', 'contactId']
  >({ control, name: ['entryType', 'amount', 'cardAccountId', 'invoiceId', 'contactId'] })
  const isPayment = entryType === INVOICE_PAYMENT
  const isSettlement = entryType === SETTLEMENT
  const invoice = useQuery({
    ...cardInvoicesQueryOptions(workspaceId, cardAccountId),
    enabled: isPayment && cardAccountId !== '',
  }).data?.find((item) => item.invoiceId === invoiceId)
  const balance = useQuery({
    ...contactBalancesQueryOptions(workspaceId),
    enabled: isSettlement,
  }).data?.find((item) => item.contactId === contactId)
  const contact = useQuery({
    ...contactsQueryOptions(workspaceId),
    enabled: isSettlement,
  }).data?.find((item) => item.id === contactId)
  const cents = centsOfTypedAmount(amount) ?? 0

  if (isPayment && invoice && cents > invoice.dueCents) {
    return entriesMessages.invoices.overpaid
  }
  if (isSettlement && contact && cents > (balance?.owedCents ?? 0)) {
    return entriesMessages.settlements.overpaid(contact.name)
  }
  return undefined
}
