import { Amount } from '@web/components/display/amount'
import { CategoryArt } from '@web/components/display/category-art'
import type { InvoiceLineProps } from '@web/components/finance/invoice-line/invoice-line.types'
import {
  invoiceLineDateVariants,
  invoiceLineDetailVariants,
  invoiceLineInstallmentVariants,
  invoiceLineNameVariants,
  invoiceLineTextVariants,
  invoiceLineValueVariants,
  invoiceLineVariants,
} from '@web/components/finance/invoice-line/invoice-line.variants'

export function InvoiceLine({
  date,
  description,
  icon,
  installment,
  detail,
  amountCents,
  isPayment = false,
}: InvoiceLineProps) {
  return (
    <li data-slot="invoice-line" className={invoiceLineVariants()}>
      <span className={invoiceLineDateVariants()}>{date}</span>
      <CategoryArt name={description} icon={icon} size="row" />
      <span className={invoiceLineTextVariants()}>
        <span className={invoiceLineNameVariants()}>
          <span>{description}</span>
          {installment && <span className={invoiceLineInstallmentVariants()}>{installment}</span>}
        </span>
        {detail && <span className={invoiceLineDetailVariants()}>{detail}</span>}
      </span>
      <span className={invoiceLineValueVariants({ isPayment })}>
        <Amount cents={amountCents} size="inherit" />
      </span>
    </li>
  )
}
