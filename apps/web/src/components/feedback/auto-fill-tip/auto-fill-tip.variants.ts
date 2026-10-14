import { cva } from 'class-variance-authority'

export const autoFillTipVariants = cva(
  'mt-0.5 flex items-center gap-1.5 text-note text-ink-muted [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-mint-ink',
)

export const autoFillTipTextVariants = cva('flex-1')

export const autoFillUndoVariants = cva(
  'relative cursor-pointer rounded-sm font-semibold text-mint-ink underline underline-stroke underline-offset-4 outline-none after:absolute after:-inset-x-2 after:-inset-y-3.25 focus-visible:ring-2 focus-visible:ring-focus-ring',
)
