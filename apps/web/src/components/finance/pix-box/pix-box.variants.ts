import { cva } from 'class-variance-authority'

export const pixBoxVariants = cva(
  'flex flex-col items-start gap-2 rounded-md border border-border bg-surface px-3.5 py-3',
)

export const pixBoxTitleVariants = cva(
  'm-0 flex items-center gap-1.5 text-label font-emphasis text-ink [&_svg]:size-4 [&_svg]:shrink-0',
)

export const pixBoxCodeVariants = cva(
  'self-stretch font-mono text-code wrap-anywhere text-ink-muted',
)
