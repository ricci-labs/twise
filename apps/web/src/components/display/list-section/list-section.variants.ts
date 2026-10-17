import { cva } from 'class-variance-authority'

export const listSectionVariants = cva('flex flex-col gap-1.5')

export const listSectionTitleVariants = cva(
  'flex min-h-7 items-baseline gap-2 font-display text-section-title text-ink',
)

export const listSectionAsideVariants = cva(
  'font-sans text-row-detail font-medium whitespace-nowrap text-ink-muted tabular-nums',
)

export const listSectionEmptyVariants = cva(
  'rounded-xl border border-dashed border-border-control bg-surface p-4 text-body-sm text-ink-muted',
)
