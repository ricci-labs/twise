import { cva } from 'class-variance-authority'

export const budgetRowVariants = cva(
  'flex items-start gap-3 py-3 not-first:border-t not-first:border-border',
)

export const budgetRowBodyVariants = cva('flex min-w-0 flex-1 flex-col gap-1.5')

export const budgetRowHeadVariants = cva('flex flex-wrap items-baseline justify-between gap-x-2')

export const budgetRowNameVariants = cva('min-w-0 truncate text-row font-semibold')

export const budgetRowAmountVariants = cva(
  'text-body-sm whitespace-nowrap text-ink-muted tabular-nums [&>strong]:font-emphasis [&>strong]:text-ink',
)

export const budgetRowStatusVariants = cva(
  'inline-flex items-center gap-1.5 text-body-sm font-semibold',
  {
    variants: {
      status: {
        within: 'text-ink-muted',
        ahead: 'text-warning',
        over: 'text-danger',
      },
    },
    defaultVariants: { status: 'within' },
  },
)

export const budgetChildrenVariants = cva(
  'flex min-w-0 items-center gap-1.5 text-row-detail whitespace-nowrap text-ink-muted [&_strong]:font-emphasis [&_strong]:text-ink',
)

export const budgetChildVariants = cva('min-w-0 truncate tabular-nums')

export const budgetMoreVariants = cva(
  'inline-grid h-5 shrink-0 cursor-pointer place-items-center rounded-sm bg-sunken px-1.5 text-caption font-emphasis text-ink-muted outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
)
