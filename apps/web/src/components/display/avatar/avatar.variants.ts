import { cva } from 'class-variance-authority'

export const avatarVariants = cva(
  'inline-grid shrink-0 place-items-center rounded-full font-bold select-none',
  {
    variants: {
      tone: {
        mint: 'bg-mint text-on-mint',
        paper: 'bg-sketch-paper text-ink',
      },
      size: {
        sm: 'size-8 text-caption',
        md: 'size-9 text-label',
      },
    },
    defaultVariants: { tone: 'mint', size: 'md' },
  },
)
