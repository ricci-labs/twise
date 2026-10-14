import { cva } from 'class-variance-authority'

export const subcategoryChipVariants = cva(
  'inline-flex h-7.5 items-center rounded-full px-3 text-chip whitespace-nowrap',
  {
    variants: {
      tone: {
        action: [
          'cursor-pointer bg-sunken text-ink outline-none hover:bg-border',
          'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
          'data-popup-open:bg-surface data-popup-open:font-emphasis data-popup-open:inset-ring-2 data-popup-open:inset-ring-ink',
        ],
        plain: 'bg-sunken text-ink',
        archived: 'border-stroke border-border text-ink-muted',
      },
    },
    defaultVariants: { tone: 'action' },
  },
)
