import { cva } from 'class-variance-authority'

export const invoicePreviewVariants = cva(
  'flex items-start gap-3 rounded-lg bg-sunken px-3.5 py-3 text-body-sm text-ink',
)

export const invoicePreviewBodyVariants = cva('min-w-0 flex-1 pt-0.5')

export const invoicePreviewListVariants = cva('mt-2 flex flex-col')

export const invoicePreviewRowVariants = cva(
  'flex items-center gap-2 py-1.5 tabular-nums not-first:border-t not-first:border-border',
  {
    variants: {
      isClosed: {
        true: '[&>[data-slot=amount]]:text-ink-subtle [&>[data-slot=amount]]:line-through [&>[data-slot=number]]:text-ink-subtle [&>[data-slot=number]]:line-through',
        false: '',
      },
    },
    defaultVariants: { isClosed: false },
  },
)

export const invoicePreviewNumberVariants = cva('min-w-7.5 font-emphasis')

export const invoicePreviewDueVariants = cva(
  'flex flex-1 items-center gap-2 whitespace-nowrap text-ink-muted',
)

export const invoicePreviewMoreVariants = cva(
  'border-t border-border py-1.5 text-note leading-5 text-ink-muted',
)
