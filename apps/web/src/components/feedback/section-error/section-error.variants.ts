import { cva } from 'class-variance-authority'

export const sectionErrorVariants = cva(
  'flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3.5',
)

export const sectionErrorIconVariants = cva(
  'grid size-10 shrink-0 place-items-center rounded-full bg-danger-soft',
)
