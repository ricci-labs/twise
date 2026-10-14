import { cva } from 'class-variance-authority'

export const sectionErrorVariants = cva(
  'flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3.5',
)

export const sectionErrorIconVariants = cva('grid size-7.5 shrink-0 place-items-center')

export const sectionErrorMessageVariants = cva('text-message')

export const sectionErrorCodeVariants = cva('mt-0.5 text-note text-ink-muted tabular-nums')

export const sectionErrorRetryVariants = cva('mt-2.5')
