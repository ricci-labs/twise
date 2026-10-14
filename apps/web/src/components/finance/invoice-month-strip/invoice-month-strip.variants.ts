import { cva } from 'class-variance-authority'

export const invoiceMonthStripVariants = cva(
  'relative -my-0.5 flex items-stretch gap-2 overflow-x-auto py-0.5 scrollbar-none',
  {
    variants: {
      size: {
        compact: 'px-4',
        wide: 'px-0',
      },
    },
    defaultVariants: { size: 'compact' },
  },
)

export const invoiceMonthVariants = cva(
  [
    'flex shrink-0 flex-col items-center rounded-md border border-border-control bg-surface px-2.5 py-2 text-ink outline-none',
    'focus-visible:ring-2 focus-visible:ring-focus-ring',
  ],
  {
    variants: {
      size: {
        compact: 'min-w-16',
        wide: 'min-w-24',
      },
      isCurrent: {
        true: 'border-ink inset-stroke',
        false: '',
      },
    },
    defaultVariants: { size: 'compact', isCurrent: false },
  },
)

export const invoiceMonthNameVariants = cva('text-choice font-bold')

export const invoiceMonthStatusVariants = cva('text-status text-ink-muted')

export const invoiceYearVariants = cva(
  'shrink-0 self-center border-l-stroke border-dashed border-border-control pl-1.5 text-caption font-bold tracking-wide text-ink-muted text-vertical',
)

export const invoiceAllVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border-stroke border-dashed border-border-control px-3.5 text-chip font-semibold text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-4',
)
