import { cva } from 'class-variance-authority'

export const invoiceSummaryVariants = cva(
  'flex flex-col gap-1.5 rounded-xl border border-border bg-surface p-4.5',
)

export const invoiceSummaryHeadVariants = cva('flex items-center justify-between gap-2')

export const invoiceSummaryTitleVariants = cva('font-display text-bar-title')

export const invoiceSummaryDatesVariants = cva('text-chip font-normal text-ink-muted')

export const invoiceSummaryTotalVariants = cva('mt-1')

export const invoiceSummaryFactsVariants = cva('mt-1 flex flex-wrap gap-2')

export const invoiceSummaryFactVariants = cva(
  'min-w-min grow basis-pair rounded-md bg-page px-3 py-2.5',
)

export const invoiceSummaryFactLabelVariants = cva('text-fine font-medium text-ink-muted')

export const invoiceSummaryFactValueVariants = cva('mt-0.5 text-amount tabular-nums')

export const invoiceSummarySplitVariants = cva('mt-2 flex flex-col gap-2')

export const invoiceSummaryBarVariants = cva('h-2.5 w-full overflow-visible')

export const invoiceSummaryLegendVariants = cva(
  'flex flex-wrap gap-x-4 gap-y-1.5 text-note text-ink-muted [&_b]:font-emphasis [&_b]:text-ink',
)

export const invoiceSummarySwatchVariants = cva('inline-block size-2.5 shrink-0 rounded-swatch', {
  variants: {
    part: {
      own: 'bg-chart-4',
      fronted: 'bg-chart-3',
    },
  },
})

export const invoiceSummaryNoteVariants = cva(
  'mt-1.5 flex items-center gap-1.5 text-chip font-normal text-ink-muted',
  {
    variants: {
      tone: {
        muted: '',
        success: '[&>svg]:text-success',
      },
    },
    defaultVariants: { tone: 'muted' },
  },
)

export const invoiceSummaryActionVariants = cva('mt-2.5')
