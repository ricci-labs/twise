import type { dataTableRowVariants } from '@web/components/display/data-table/data-table.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

export type DataTableAlign = 'start' | 'end'

export type DataTableColumn = {
  key: string
  label: string
  align?: DataTableAlign
  isLabelHidden?: boolean
  isActions?: boolean
}

export type DataTableRow = {
  key: string
  cells: readonly ReactNode[]
  isOpen?: boolean
}

export type DataTableProps = Required<Pick<VariantProps<typeof dataTableRowVariants>, 'layout'>> & {
  label: string
  columns: readonly DataTableColumn[]
  rows: readonly DataTableRow[]
}

export type DataTableNameLinkProps = {
  'data-slot'?: string
  className?: string
  children?: ReactNode
}

export type DataTableNameProps = {
  name: string
  icon: string | null
  color?: string | null
  detail?: string
  link?: ReactElement<DataTableNameLinkProps>
}

export type DataTableAmountProps = {
  cents: number
}
