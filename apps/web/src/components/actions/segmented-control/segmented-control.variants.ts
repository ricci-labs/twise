import { cva } from 'class-variance-authority'

export const segmentedControlVariants = cva(
  'max-w-full overflow-x-auto rounded-full bg-sunken scrollbar-none',
  {
    variants: {
      width: {
        auto: 'inline-flex gap-1 p-1',
        full: 'flex w-full p-0.75',
      },
    },
    defaultVariants: { width: 'auto' },
  },
)

export const segmentedOptionVariants = cva(
  'shrink-0 cursor-pointer rounded-full px-3.5 text-label whitespace-nowrap text-ink-muted outline-none focus-visible:ring-2 focus-visible:ring-focus-ring data-pressed:bg-surface data-pressed:text-ink data-pressed:shadow-raised',
  {
    variants: {
      width: {
        auto: 'min-h-9',
        full: 'min-h-9.5 flex-1 px-2',
      },
    },
    defaultVariants: { width: 'auto' },
  },
)
