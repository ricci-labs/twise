import { cva } from 'class-variance-authority'

export const planSummaryTilesVariants = cva('flex flex-wrap gap-2.5')

export const planSummaryTileVariants = cva(
  'flex min-w-min grow basis-pair flex-col gap-0.5 rounded-xl border border-border bg-surface px-3 py-3',
)

export const planSummaryLabelVariants = cva('text-row-detail font-medium text-ink-muted')

export const planSummaryValueVariants = cva(
  'font-display text-amount-share font-extrabold whitespace-nowrap tabular-nums',
  {
    variants: {
      tone: {
        neutral: 'text-ink',
        income: 'text-mint-ink',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export const planSummaryNoteVariants = cva('text-caption text-ink-muted')
