import type { ReactElement, ReactNode } from 'react'

export type MonthLinkProps = {
  className?: string
  'aria-label'?: string
  'aria-current'?: 'true'
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

export type InvoiceMonthStripProps = {
  label: string
  months: readonly InvoiceMonth[]
  allLabel: string
  onAll: () => void
}
