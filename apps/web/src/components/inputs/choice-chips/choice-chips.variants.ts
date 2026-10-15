import { cva } from 'class-variance-authority'

export const choiceChipsVariants = cva('', {
  variants: {
    variant: {
      pill: 'flex flex-wrap gap-2',
      pillOutline: 'flex flex-wrap gap-2',
      outline: 'flex flex-wrap gap-2',
      card: 'grid grid-cols-2 gap-2',
      member: 'flex flex-wrap gap-2',
    },
  },
  defaultVariants: { variant: 'pill' },
})

export const choiceChipVariants = cva(
  [
    'inline-flex cursor-pointer items-center whitespace-nowrap border border-border-control bg-surface text-ink outline-none',
    'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
    'data-disabled:cursor-not-allowed data-disabled:text-ink-muted',
    '[&_[data-slot=chip-icon]]:size-4 [&_[data-slot=chip-icon]]:shrink-0',
  ],
  {
    variants: {
      variant: {
        pill: [
          'min-h-10 gap-1 rounded-full px-3.5 text-label',
          'data-checked:border-mint data-checked:bg-mint data-checked:text-on-mint',
        ],
        pillOutline: [
          'min-h-10 gap-1 rounded-full px-3.5 text-label',
          'data-checked:border-ink data-checked:font-emphasis data-checked:ring-1 data-checked:ring-ink data-checked:ring-inset',
        ],
        outline: [
          'min-h-touch gap-1.5 rounded-md px-3.5 text-choice lg:min-h-control',
          '[&_[data-slot=chip-icon]]:text-ink-muted',
          'data-checked:border-ink data-checked:font-emphasis data-checked:ring-1 data-checked:ring-ink data-checked:ring-inset',
        ],
        card: [
          'min-h-control min-w-0 gap-2.5 rounded-md px-3 text-choice',
          'data-checked:border-ink data-checked:font-emphasis data-checked:ring-1 data-checked:ring-ink data-checked:ring-inset',
        ],
        member: [
          'min-h-touch min-w-0 gap-2 rounded-md pr-3.5 pl-2 text-body-sm font-medium',
          'data-checked:border-ink data-checked:font-emphasis data-checked:ring-1 data-checked:ring-ink data-checked:ring-inset',
        ],
      },
    },
    defaultVariants: { variant: 'pill' },
  },
)

export const choiceChipLabelVariants = cva('min-w-0 truncate')
