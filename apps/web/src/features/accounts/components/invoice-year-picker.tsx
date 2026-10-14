import { formatBrl, parseIsoDate } from '@financas/shared'
import { Link } from '@tanstack/react-router'
import { InvoiceYearSheet } from '@web/components/finance/invoice-year-sheet'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type { CardInvoice, InvoiceYearPickerProps } from '@web/features/accounts/accounts.types'
import { stateLabelOf, stateToneOf } from '@web/features/accounts/components/card-invoices'
import { formatShortMonthName } from '@web/lib/format/calendar'
import { useState } from 'react'

const messages = accountsMessages.invoicesPage

export function InvoiceYearPicker({
  workspaceId,
  card,
  invoices,
  chosen,
  isOpen,
  onOpenChange,
}: InvoiceYearPickerProps) {
  const [year, setYear] = useState(() => yearOf(chosen))
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setYear(yearOf(chosen))
    }
  }
  const years = invoices.map(yearOf)
  const first = invoices[0]
  return (
    <InvoiceYearSheet
      title={messages.strip(card.name)}
      year={String(year)}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onPrevious={year > Math.min(...years) ? () => setYear(year - 1) : undefined}
      onNext={year < Math.max(...years) ? () => setYear(year + 1) : undefined}
      note={messages.yearNote(
        first ? messages.since(formatShortMonthName(first.referenceMonth), yearOf(first)) : '',
      )}
      months={invoices
        .filter((invoice) => yearOf(invoice) === year)
        .map((invoice) => ({
          key: invoice.referenceMonth,
          month: formatShortMonthName(invoice.referenceMonth),
          status: { label: stateLabelOf(invoice.state), tone: stateToneOf(invoice.state) },
          total: formatBrl(invoice.totalCents),
          isCurrent: invoice.referenceMonth === chosen.referenceMonth,
          link: (
            <Link
              to="/w/$workspaceId/cards/$card"
              params={{ workspaceId, card: card.accountId }}
              search={{ month: invoice.referenceMonth }}
            />
          ),
        }))}
    />
  )
}

function yearOf(invoice: CardInvoice): number {
  return parseIsoDate(`${invoice.referenceMonth}-01`).year
}
