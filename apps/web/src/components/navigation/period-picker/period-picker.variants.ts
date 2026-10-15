import { cva } from 'class-variance-authority'

export const periodBarVariants = cva(
  'flex h-12 items-center justify-between gap-1 rounded-full border border-border bg-surface px-0.5',
)

export const periodStepVariants = cva(
  'grid size-11 shrink-0 place-items-center rounded-full outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&>svg]:size-5',
)

export const periodLabelVariants = cva(
  'flex min-w-0 cursor-pointer items-center gap-2 rounded-full px-2 py-1.5 text-choice font-emphasis tabular-nums outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&>svg]:size-4 [&>svg]:shrink-0',
)

export const periodDetailVariants = cva('truncate font-medium text-ink-muted')

export const periodYearVariants = cva(
  'flex items-center justify-between pr-1 pl-1 text-choice font-emphasis text-ink',
)

export const periodMonthsVariants = cva('grid grid-cols-3 gap-2 pt-1 pb-2')

export const periodMonthVariants = cva(
  [
    'flex min-h-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md border border-border bg-surface text-choice font-emphasis text-ink outline-none',
    'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring',
    'aria-current:border-ink aria-current:font-bold aria-current:ring-1 aria-current:ring-ink aria-current:ring-inset',
  ],
  {
    variants: {
      isFuture: { true: 'border-dashed', false: '' },
    },
    defaultVariants: { isFuture: false },
  },
)

export const periodMonthRangeVariants = cva(
  'text-caption font-normal whitespace-nowrap text-ink-muted tabular-nums',
)

export const periodOthersVariants = cva('flex flex-col gap-2 pt-2')

export const periodOthersLabelVariants = cva('text-note text-ink-muted')

export const periodChipsVariants = cva('flex flex-wrap gap-2')

export const periodChipVariants = cva(
  'inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full border border-border-control bg-surface px-3.5 text-label text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&>svg]:size-4',
)

export const periodNoteVariants = cva('pt-3 text-note text-ink-muted')

export const periodDatesFooterVariants = cva(
  'flex items-center justify-between gap-3 border-t border-border pt-4',
)

export const periodFailedVariants = cva(
  'flex flex-col items-start gap-2 py-4 text-body-sm text-ink-muted',
)
