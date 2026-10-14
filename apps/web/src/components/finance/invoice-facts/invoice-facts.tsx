import type { InvoiceFactsProps } from '@web/components/finance/invoice-facts/invoice-facts.types'
import {
  invoiceFactLabelVariants,
  invoiceFactsVariants,
  invoiceFactValueVariants,
} from '@web/components/finance/invoice-facts/invoice-facts.variants'

export function InvoiceFacts({ label, facts }: InvoiceFactsProps) {
  return (
    <dl data-slot="invoice-facts" aria-label={label} className={invoiceFactsVariants()}>
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className={invoiceFactLabelVariants()}>{fact.label}</dt>
          <dd className={invoiceFactValueVariants()}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
