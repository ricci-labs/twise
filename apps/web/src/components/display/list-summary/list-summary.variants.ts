import { cva } from 'class-variance-authority'

export const listSummaryVariants = cva(
  'flex flex-wrap gap-x-3.5 gap-y-1 text-row-detail font-medium text-ink-muted',
)

export const listSummaryValueVariants = cva('font-emphasis text-ink')
