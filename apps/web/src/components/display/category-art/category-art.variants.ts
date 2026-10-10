import { cva } from 'class-variance-authority'

export const categoryArtVariants = cva(
  'inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-sketch-paper font-bold text-ink',
  {
    variants: {
      size: {
        sm: 'size-8 text-caption',
        md: 'size-10 text-label',
      },
    },
    defaultVariants: { size: 'md' },
  },
)
