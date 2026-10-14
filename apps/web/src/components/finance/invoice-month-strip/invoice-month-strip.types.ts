import type { invoiceMonthStripVariants } from '@web/components/finance/invoice-month-strip/invoice-month-strip.variants'
import type { VariantProps } from 'class-variance-authority'
import type { MouseEvent, ReactElement, ReactNode } from 'react'

export type MonthLinkProps = {
  className?: string
  'aria-label'?: string
  'aria-current'?: 'true'
  'data-slot'?: string
  'data-month'?: string
  children?: ReactNode
}

export type InvoiceMonth = {
  key: string
  month: string
  status: string
  accessibleLabel: string
  yearBefore?: string
  isCurrent: boolean
  link: ReactElement<MonthLinkProps>
}

export type InvoiceMonthStripProps = VariantProps<typeof invoiceMonthStripVariants> & {
  label: string
  months: readonly InvoiceMonth[]
  anchor?: string
  allLabel: string
  onAll: (event: MouseEvent<HTMLButtonElement>) => void
}
