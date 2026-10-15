import { cva } from 'class-variance-authority'

export const toggleChipsVariants = cva('flex flex-wrap gap-2')

export const toggleChipVariants = cva([
  'inline-flex min-h-10 cursor-pointer items-center rounded-full border border-border-control bg-surface px-3.5 text-label whitespace-nowrap text-ink outline-none',
  'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  'data-pressed:border-ink data-pressed:font-emphasis data-pressed:ring-1 data-pressed:ring-ink data-pressed:ring-inset',
])
