import type { BadgeProps } from '@web/components/display/badge'
import type { ReactElement, ReactNode } from 'react'

export type YearMonthLinkProps = {
  className?: string
  'aria-current'?: 'true'
  children?: ReactNode
}

export type InvoiceYearMonth = {
  key: string
  month: string
  status: { label: string; tone: BadgeProps['tone'] }
  total: string
  isCurrent: boolean
  link: ReactElement<YearMonthLinkProps>
}

export type InvoiceYearSheetProps = {
  title: string
  year: string
  months: readonly InvoiceYearMonth[]
  note: string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onPrevious?: () => void
  onNext?: () => void
}
