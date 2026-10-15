import type { BadgeProps } from '@web/components/display/badge'
import type { ReactElement, ReactNode } from 'react'

export type InstallmentRowLinkProps = {
  className?: string
  children?: ReactNode
}

export type InstallmentRow = {
  key: string
  number: string
  month: string
  due: string
  status: { label: string; tone: BadgeProps['tone'] }
  amountCents: number
  link?: ReactElement<InstallmentRowLinkProps>
}

export type InstallmentRowsProps = {
  rows: readonly InstallmentRow[]
  start?: number
  showMoreLabel?: (hidden: number) => string
}

export type InstallmentRowViewProps = {
  row: InstallmentRow
}
