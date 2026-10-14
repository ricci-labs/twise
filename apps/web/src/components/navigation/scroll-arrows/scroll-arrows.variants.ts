import { cva } from 'class-variance-authority'

export const scrollArrowsVariants = cva('relative')

export const scrollArrowVariants = cva(
  [
    'absolute top-1/2 hidden size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-border bg-surface text-ink shadow-raised outline-none lg:grid',
    'hover:bg-sunken focus-visible:ring-2 focus-visible:ring-focus-ring [&_svg]:size-5',
  ],
  {
    variants: {
      direction: {
        previous: 'left-1',
        next: 'right-1',
      },
    },
  },
)
