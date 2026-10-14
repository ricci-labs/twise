import { cva } from 'class-variance-authority'

export const dataTableVariants = cva('block w-full [&>tbody]:block [&>thead]:block')

export const dataTableRowVariants = cva('relative grid items-center gap-3 border-t border-border', {
  variants: {
    layout: {
      accounts: 'grid-cols-table-accounts',
      cards: 'grid-cols-table-cards',
      invoices: 'grid-cols-table-invoices',
      lines: 'grid-cols-table-lines',
    },
    isHead: {
      true: 'min-h-9 border-t-0',
      false:
        'min-h-15 has-[[data-popup-open]]:-mx-3 has-[[data-popup-open]]:rounded-md has-[[data-popup-open]]:bg-page has-[[data-popup-open]]:px-3',
    },
  },
  defaultVariants: { isHead: false },
})

export const dataTableHeadCellVariants = cva('text-body-sm font-normal text-ink-muted', {
  variants: {
    align: {
      start: 'text-left',
      end: 'text-right',
    },
  },
  defaultVariants: { align: 'start' },
})

export const dataTableCellVariants = cva('min-w-0 text-body-sm text-ink-muted', {
  variants: {
    align: {
      start: 'text-left',
      end: 'text-right tabular-nums',
    },
  },
  defaultVariants: { align: 'start' },
})

export const dataTableNameVariants = cva(
  'flex min-w-0 items-center gap-3 pt-0.5 text-ink outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-focus-ring [&>[data-slot=category-art]]:-m-0.5',
)

export const dataTableNameTextVariants = cva('truncate text-choice font-semibold')

export const dataTableAmountVariants = cva('text-choice font-bold text-ink')
