import { cva } from 'class-variance-authority'

export const recurrenceRowVariants = cva('border-border not-first:border-t')

export const recurrenceRowMainVariants = cva(
  'flex min-h-16 w-full items-start gap-3 py-3 text-start text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
)

export const recurrenceTextVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const recurrenceTitleVariants = cva('line-clamp-2 text-row font-semibold break-words')

export const recurrenceDetailVariants = cva(
  'line-clamp-2 text-row-detail break-words text-ink-muted',
)

export const recurrenceNextVariants = cva(
  'mt-0.5 inline-flex items-center gap-1 text-caption font-semibold',
  {
    variants: {
      tone: {
        neutral: 'text-ink-muted',
        today: 'text-warning',
        overdue: 'text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export const recurrenceAmountVariants = cva(
  'shrink-0 pt-0.5 text-row font-emphasis whitespace-nowrap',
  {
    variants: {
      direction: {
        out: 'text-ink',
        in: 'text-mint-ink',
        neutral: 'font-semibold text-ink-muted',
      },
    },
    defaultVariants: { direction: 'out' },
  },
)

export const recurrenceEstimateVariants = cva('me-0.5 font-bold text-ink-muted')
