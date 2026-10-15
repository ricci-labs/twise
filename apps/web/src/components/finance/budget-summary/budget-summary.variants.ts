import { cva } from 'class-variance-authority'

export const budgetSummaryVariants = cva(
  'flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3.5',
)

export const budgetSummaryTitleVariants = cva('text-row-detail font-medium text-ink-muted')

export const budgetSummaryAmountsVariants = cva(
  'flex flex-wrap items-baseline gap-x-1.5 text-body-sm text-ink-muted tabular-nums',
)

export const budgetSummarySpentVariants = cva(
  'font-display text-amount-card font-extrabold whitespace-nowrap text-ink',
)

export const budgetSummaryLimitVariants = cva('whitespace-nowrap')

export const budgetSummaryLegendVariants = cva(
  'inline-flex items-center gap-1.5 text-caption text-ink-muted',
)

export const budgetSummaryMarkVariants = cva('h-3 w-0.5 shrink-0 rounded-full bg-ink')
