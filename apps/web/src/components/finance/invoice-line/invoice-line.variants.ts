import { cva } from 'class-variance-authority'

export const invoiceLineVariants = cva(
  'flex min-h-15 items-center gap-2.5 border-border py-2 not-first:border-t [&>[data-slot=category-art]]:-m-0.5',
)

export const invoiceLineDateVariants = cva(
  'w-10 shrink-0 text-fine font-semibold text-ink-muted tabular-nums',
)

export const invoiceLineTextVariants = cva('flex min-w-0 flex-1 flex-col')

export const invoiceLineNameVariants = cva(
  'flex min-w-0 items-center gap-1.5 text-choice font-semibold [&>span:first-child]:truncate',
)

export const invoiceLineInstallmentVariants = cva(
  'inline-flex h-5 shrink-0 items-center rounded-full bg-sunken px-1.75 text-tab font-semibold text-ink-muted tabular-nums',
)

export const invoiceLineDetailVariants = cva('text-fine text-ink-muted')

export const invoiceLineValueVariants = cva(
  'shrink-0 text-choice font-bold whitespace-nowrap tabular-nums',
  {
    variants: {
      isPayment: {
        true: 'text-success',
        false: '',
      },
    },
    defaultVariants: { isPayment: false },
  },
)
