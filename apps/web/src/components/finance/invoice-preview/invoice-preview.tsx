import { Amount } from '@web/components/display/amount'
import { Badge } from '@web/components/display/badge'
import { CategoryArt } from '@web/components/display/category-art'
import { RichText } from '@web/components/display/rich-text'
import { invoicePreviewMessages as messages } from '@web/components/finance/invoice-preview/invoice-preview.messages'
import type { InvoicePreviewProps } from '@web/components/finance/invoice-preview/invoice-preview.types'
import {
  invoicePreviewBodyVariants,
  invoicePreviewDueVariants,
  invoicePreviewListVariants,
  invoicePreviewMoreVariants,
  invoicePreviewNumberVariants,
  invoicePreviewRowVariants,
  invoicePreviewVariants,
} from '@web/components/finance/invoice-preview/invoice-preview.variants'
import { cn } from '@web/lib/cn'

const CALENDAR_ICON = 'calendar'

export function InvoicePreview({ title, rows, more, className }: InvoicePreviewProps) {
  const showsRows = rows.length > 1 || rows.some((row) => row.isClosed)
  return (
    <div
      data-slot="invoice-preview"
      role="status"
      className={cn(invoicePreviewVariants(), className)}
    >
      <CategoryArt name={title} icon={CALENDAR_ICON} size="lg" />
      <div className={invoicePreviewBodyVariants()}>
        <p>
          <RichText text={title} />
        </p>
        {showsRows && (
          <ol className={invoicePreviewListVariants()}>
            {rows.map((row) => (
              <li key={row.key} className={invoicePreviewRowVariants({ isClosed: row.isClosed })}>
                <span data-slot="number" className={invoicePreviewNumberVariants()}>
                  {row.number}
                </span>
                <span className={invoicePreviewDueVariants()}>
                  {row.due}
                  {row.isClosed && <Badge>{messages.closed}</Badge>}
                </span>
                <Amount cents={row.amountCents} size="sm" />
              </li>
            ))}
            {more && <li className={invoicePreviewMoreVariants()}>{more}</li>}
          </ol>
        )}
      </div>
    </div>
  )
}
