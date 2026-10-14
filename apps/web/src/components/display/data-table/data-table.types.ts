import type { dataTableRowVariants } from '@web/components/display/data-table/data-table.variants'
import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

export type DataTableAlign = 'start' | 'end'

export type DataTableColumn = {
  key: string
  label: string
  align?: DataTableAlign
  isLabelHidden?: boolean
}

export type DataTableRow = {
  key: string
  cells: readonly ReactNode[]
}

export type DataTableProps = Required<Pick<VariantProps<typeof dataTableRowVariants>, 'layout'>> & {
  label: string
  columns: readonly DataTableColumn[]
  rows: readonly DataTableRow[]
}

export type DataTableNameLinkProps = {
  className?: string
  children?: ReactNode
}

export type DataTableNameProps = {
  name: string
  icon: string | null
  color?: string | null
  link?: ReactElement<DataTableNameLinkProps>
}

export type DataTableAmountProps = {
  cents: number
}
