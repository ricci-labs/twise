import { cva } from 'class-variance-authority'

export const segmentedControlVariants = cva(
  'max-w-full overflow-x-auto rounded-full bg-sunken scrollbar-none data-disabled:opacity-60',
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
  'cursor-pointer rounded-full text-label whitespace-nowrap text-ink-muted outline-none focus-visible:ring-2 focus-visible:ring-focus-ring data-pressed:bg-surface data-pressed:text-ink',
  {
    variants: {
      width: {
        auto: 'min-h-9 shrink-0 px-3.5',
        full: 'min-h-9.5 flex-auto px-1.5',
      },
      selection: {
        raised: 'data-pressed:shadow-raised',
        outline: 'data-pressed:font-bold data-pressed:inset-ring-2 data-pressed:inset-ring-ink',
      },
    },
    defaultVariants: { width: 'auto', selection: 'raised' },
  },
)

export const segmentedBadgeVariants = cva(
  'ml-1.5 inline-grid min-w-5 place-items-center rounded-full bg-ink px-1.5 text-badge-tiny font-semibold text-on-action-primary',
)
