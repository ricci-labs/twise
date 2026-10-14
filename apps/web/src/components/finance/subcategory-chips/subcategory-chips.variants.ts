import { cva } from 'class-variance-authority'

export const subcategoryChipsVariants = cva('relative flex min-w-0 flex-wrap gap-1.5 py-1.5')

export const subcategoryChipsMeasureVariants = cva('invisible absolute inset-0 overflow-hidden')

export const subcategoryChipsMeasureRowVariants = cva('flex w-max gap-1.5')

export const subcategoryChipsToggleVariants = cva(
  [
    'inline-flex h-7.5 cursor-pointer items-center gap-1 rounded-full px-3 text-chip font-emphasis whitespace-nowrap outline-none',
    'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 [&_svg]:size-3.75',
  ],
  {
    variants: {
      intent: {
        more: 'bg-surface text-ink inset-stroke',
        less: 'text-mint-ink underline underline-offset-3',
      },
    },
  },
)
