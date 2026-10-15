import { cva } from 'class-variance-authority'

export const filterButtonVariants = cva([
  'inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border-control bg-surface pr-3 pl-3.5 text-body-sm font-medium whitespace-nowrap text-ink outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring',
  'data-active:border-ink data-active:ring-1 data-active:ring-ink data-active:ring-inset',
  'aria-expanded:border-ink aria-expanded:ring-1 aria-expanded:ring-ink aria-expanded:ring-inset',
  '[&>svg]:size-4 [&>svg]:text-ink-muted',
])

export const filterButtonValueVariants = cva('font-semibold')
