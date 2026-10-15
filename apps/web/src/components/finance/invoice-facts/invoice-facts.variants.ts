import { cva } from 'class-variance-authority'

export const invoiceFactsVariants = cva(
  'grid grid-cols-2 gap-2 md:grid-cols-3 rounded-xl border border-border bg-surface p-3.5',
)

export const invoiceFactLabelVariants = cva('text-caption font-medium text-ink-muted')

export const invoiceFactValueVariants = cva('mt-0.5 text-choice font-bold tabular-nums')
