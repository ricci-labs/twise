import { cva } from 'class-variance-authority'

export const reserveCardVariants = cva('flex flex-col rounded-xl border p-4.5 pb-4', {
  variants: {
    isEmpty: {
      false: 'gap-2.5 border-mint/45 bg-mint-soft',
      true: 'flex-row items-start gap-3.5 border-dashed border-border-control bg-surface',
    },
  },
  defaultVariants: { isEmpty: false },
})

export const reserveCardTopVariants = cva('flex items-start gap-3')

export const reserveCardTextVariants = cva('flex min-w-0 flex-1 flex-col gap-0.5')

export const reserveCardLabelVariants = cva('text-label font-emphasis', {
  variants: {
    isEmpty: {
      false: 'text-mint-ink',
      true: 'text-choice font-emphasis text-ink',
    },
  },
  defaultVariants: { isEmpty: false },
})

export const reserveCardValueVariants = cva(
  'font-display text-amount-kpi whitespace-nowrap text-ink tabular-nums lg:text-amount-total',
)

export const reserveCardTargetVariants = cva('line-clamp-2 text-note break-words text-ink-muted')

export const reserveCardActionsVariants = cva('-me-2 -mt-1.5 shrink-0')

export const reserveCardFootVariants = cva(
  'flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1.5 text-note font-medium text-ink-muted tabular-nums',
)

export const reserveCardPillVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-note font-medium whitespace-nowrap text-ink [&_svg]:text-mint-ink',
)

export const reserveCardProgressVariants = cva('ms-auto whitespace-nowrap')

export const reserveCardEmptyBodyVariants = cva('flex min-w-0 flex-1 flex-col items-start gap-1.5')

export const reserveCardEmptyTextVariants = cva('text-body-sm text-ink-muted')
