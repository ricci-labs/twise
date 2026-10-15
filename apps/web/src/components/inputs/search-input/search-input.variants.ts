import { cva } from 'class-variance-authority'

export const searchInputVariants = cva('min-h-touch')

export const searchClearVariants = cva(
  '-mr-2 grid size-9 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&>svg]:size-4.5',
)
