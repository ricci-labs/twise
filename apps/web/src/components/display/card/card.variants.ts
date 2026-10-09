import { cva } from 'class-variance-authority'

export const cardVariants = cva(
  'flex min-w-0 flex-col rounded-lg border border-border bg-surface px-5 py-5 lg:px-6',
  {
    variants: {
      layout: {
        centered: '[&_[data-slot=card-body]]:justify-center',
        list: '[&_[data-slot=card-body]]:justify-start',
      },
    },
    defaultVariants: { layout: 'list' },
  },
)

export const cardHeadVariants = cva(
  'flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between lg:gap-4',
)

export const cardBodyVariants = cva('mt-4 flex min-w-0 flex-1 flex-col')

export const cardFootVariants = cva(
  'mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5 text-body-sm text-ink-muted',
)
