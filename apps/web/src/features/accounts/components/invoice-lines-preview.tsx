import { Link } from '@tanstack/react-router'
import { TextLink } from '@web/components/actions/text-link'
import { ListSkeleton } from '@web/components/feedback/list-skeleton'
import { accountsMessages } from '@web/features/accounts/accounts.messages'
import type {
  InvoiceLinesPreviewProps,
  PreviewBodyProps,
} from '@web/features/accounts/accounts.types'
import { InvoiceLineList } from '@web/features/accounts/components/invoice-line-list'

const messages = accountsMessages.invoicesPage

const PREVIEW_LINES = 5

export function InvoiceLinesPreview({
  workspaceId,
  card,
  invoice,
  lines,
  counts,
}: InvoiceLinesPreviewProps) {
  return (
    <section aria-labelledby="invoice-lines-title" className="flex flex-col gap-1.5">
      <div className="flex min-h-7 items-center justify-between gap-3">
        <h2 id="invoice-lines-title" className="font-display text-section-title">
          {messages.lines}
        </h2>
        {invoice.invoiceId && counts && counts.all > 0 && (
          <TextLink
            className="text-label"
            render={
              <Link
                to="/w/$workspaceId/cards/$card/invoices/$invoice"
                params={{ workspaceId, card: card.accountId, invoice: invoice.invoiceId }}
              />
            }
          >
            {messages.seeAll(counts.all)}
          </TextLink>
        )}
      </div>
      <PreviewBody hasInvoice={invoice.invoiceId !== null} lines={lines} />
    </section>
  )
}

function PreviewBody({ hasInvoice, lines }: PreviewBodyProps) {
  if (hasInvoice && !lines) {
    return <ListSkeleton rows={3} />
  }
  if (!lines || lines.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface px-4 py-5 text-note text-ink-muted">
        {messages.noLines}
      </p>
    )
  }
  return <InvoiceLineList lines={lines.slice(0, PREVIEW_LINES)} />
}
