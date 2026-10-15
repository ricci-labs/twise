import { cva } from 'class-variance-authority'

export const occurrenceRowVariants = cva('flex items-center gap-3 border-border not-first:border-t')

export const occurrenceRowMainVariants = cva(
  'flex min-h-16 min-w-0 flex-1 items-center gap-3 py-2.5 text-start text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
)

export const occurrenceDateVariants = cva(
  'flex h-11.5 w-10.5 shrink-0 flex-col items-center justify-center rounded-md',
  {
    variants: {
      isOverdue: {
        true: 'bg-danger-soft text-danger',
        false: 'bg-sunken text-ink',
      },
    },
    defaultVariants: { isOverdue: false },
  },
)

export const occurrenceDayVariants = cva('font-display text-card-title font-bold tabular-nums')

export const occurrenceMonthVariants = cva(
  'text-badge-tiny font-semibold tracking-wide uppercase',
  {
    variants: {
      isOverdue: {
        true: 'text-danger',
        false: 'text-ink-muted',
      },
    },
    defaultVariants: { isOverdue: false },
  },
)

export const occurrenceTextVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const occurrenceTitleVariants = cva('line-clamp-2 text-row font-semibold break-words')

export const occurrenceDetailVariants = cva(
  'line-clamp-2 text-row-detail break-words text-ink-muted [&>[data-slot=badge]]:me-1.5 [&>[data-slot=badge]]:align-text-bottom',
)

export const occurrenceAmountVariants = cva('shrink-0 text-row font-emphasis whitespace-nowrap', {
  variants: {
    direction: {
      out: 'text-ink',
      in: 'text-mint-ink',
      neutral: 'font-semibold text-ink-muted',
      done: 'font-semibold text-ink-muted',
    },
  },
  defaultVariants: { direction: 'out' },
})

export const occurrenceEstimateVariants = cva('me-0.5 font-bold text-ink-muted')

export const occurrenceQuickVariants = cva('flex shrink-0 flex-col items-end gap-1.5 py-2.5')
