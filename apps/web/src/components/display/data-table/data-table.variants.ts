import { cva } from 'class-variance-authority'

export const dataTableVariants = cva('block w-full [&>tbody]:block [&>thead]:block')

export const dataTableRowVariants = cva('relative grid border-t border-border', {
  variants: {
    layout: {
      accounts: 'grid-cols-table-accounts gap-3',
      cards: 'grid-cols-table-cards gap-3',
      invoices: 'grid-cols-table-invoices gap-3',
      lines: 'grid-cols-table-lines gap-3',
      categories: 'grid-cols-table-categories gap-4',
      incomes: 'grid-cols-table-incomes gap-4',
    },
    isHead: {
      true: 'min-h-9 items-center border-t-0',
      false: '',
    },
    isOpen: {
      true: '-mx-3 items-start rounded-md bg-page p-3 [&>td:first-child]:pt-0.5 [&>td:last-child]:pt-0.5',
      false:
        'items-center has-[>td:last-child_[data-popup-open]]:-mx-3 has-[>td:last-child_[data-popup-open]]:rounded-md has-[>td:last-child_[data-popup-open]]:bg-page has-[>td:last-child_[data-popup-open]]:px-3',
    },
  },
  compoundVariants: [
    {
      isHead: false,
      layout: ['accounts', 'cards', 'invoices', 'lines'],
      className: 'min-h-15 [&_[data-slot=data-table-name]]:pt-0.5',
    },
    { isHead: false, layout: ['categories', 'incomes'], className: 'min-h-16' },
  ],
  defaultVariants: { isHead: false, isOpen: false },
})

export const dataTableHeadCellVariants = cva('text-ink-muted', {
  variants: {
    layout: {
      accounts: 'text-body-sm font-normal',
      cards: 'text-body-sm font-normal',
      invoices: 'text-body-sm font-normal',
      lines: 'text-body-sm font-normal',
      categories: 'text-toggle',
      incomes: 'text-toggle',
    },
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
    isActions: {
      true: '-mr-2 flex justify-end',
      false: '',
    },
  },
  defaultVariants: { align: 'start', isActions: false },
})

export const dataTableNameVariants = cva(
  'flex min-w-0 items-center gap-3 text-ink outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-focus-ring [&>[data-slot=category-art]]:-m-0.5',
)

export const dataTableNameTextVariants = cva('flex min-w-0 flex-col')

export const dataTableNameLabelVariants = cva('truncate text-choice font-semibold')

export const dataTableNameDetailVariants = cva('truncate text-fine text-ink-muted')

export const dataTableAmountVariants = cva('text-choice font-bold text-ink')
