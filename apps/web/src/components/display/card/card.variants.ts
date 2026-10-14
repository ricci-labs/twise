import { cva } from 'class-variance-authority'

export const cardVariants = cva(
  'flex h-full min-w-0 flex-col rounded-lg border border-border bg-surface p-4 lg:px-6 lg:py-5',
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

export const cardBodyVariants = cva('mt-3 flex min-w-0 flex-1 flex-col lg:mt-4')

export const cardFootVariants = cva(
  'mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-body-sm text-ink-muted lg:mt-4 lg:pt-3.5',
)

export const cardTitleVariants = cva('font-display text-section-title lg:text-card-title')

export const cardDescriptionVariants = cva('mt-0.5 text-note text-ink-muted')
