import { cva } from 'class-variance-authority'

export const detailSectionVariants = cva('rounded-xl border border-border bg-surface px-4 py-3.5')

export const detailSectionHeadVariants = cva('mb-2 flex items-center justify-between gap-3')

export const detailSectionTitleVariants = cva('text-title-sm font-bold text-ink')

export const detailRowsVariants = cva('m-0')

export const detailRowVariants = cva(
  'flex min-h-10 items-center justify-between gap-3 border-border py-1.5 not-first:border-t',
)

export const detailLabelVariants = cva('text-body-sm text-ink-muted')

export const detailValueVariants = cva(
  'm-0 flex items-center justify-end gap-1.5 text-right text-body-sm font-semibold text-ink [&>[data-slot=category-art]]:size-6.5',
)
