import { cva } from 'class-variance-authority'

export const accountRowVariants = cva(
  'flex items-center gap-1 border-border not-first:border-t transition-colors duration-slow',
  {
    variants: {
      isHighlighted: {
        true: '-mx-3 bg-mint-soft px-3',
        false: '',
      },
    },
    defaultVariants: { isHighlighted: false },
  },
)

export const accountRowMainVariants = cva(
  'flex min-w-0 flex-1 items-center gap-3 py-2.5 text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&>[data-slot=category-art]]:-m-0.5',
  {
    variants: {
      isArchived: {
        true: 'opacity-70',
        false: '',
      },
    },
    defaultVariants: { isArchived: false },
  },
)

export const accountRowTextVariants = cva('flex min-w-0 flex-1 flex-col gap-px')

export const accountRowFirstLineVariants = cva('flex min-w-0 items-center gap-3')

export const accountRowNameVariants = cva(
  'flex min-w-0 flex-1 items-center gap-2 text-choice font-semibold [&>span:first-child]:truncate',
)

export const accountRowValueVariants = cva(
  'shrink-0 text-right text-choice font-bold whitespace-nowrap tabular-nums',
)

export const accountRowDetailVariants = cva('truncate text-note text-ink-muted')

export const accountRowActionsVariants = cva('-mr-2 shrink-0')
