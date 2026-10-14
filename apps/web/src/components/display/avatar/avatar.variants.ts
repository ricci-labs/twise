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
        xs: 'size-6.5 text-caption [&_svg]:size-3.75',
        sm: 'size-7.5 text-button-sm [&_svg]:size-4',
        md: 'size-9 text-label',
        lg: 'size-10 text-choice',
        stacked: 'size-9 border-2 border-page text-button-sm',
      },
    },
    defaultVariants: { tone: 'mint', size: 'md' },
  },
)
