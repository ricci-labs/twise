import { cva } from 'class-variance-authority'

export const segmentedControlVariants = cva(
  'inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-sunken p-1 scrollbar-none',
)

export const segmentedOptionVariants = cva(
  'min-h-9 shrink-0 cursor-pointer rounded-full px-3.5 text-label whitespace-nowrap text-ink-muted outline-none focus-visible:ring-2 focus-visible:ring-focus-ring data-pressed:bg-surface data-pressed:text-ink data-pressed:shadow-float',
)
